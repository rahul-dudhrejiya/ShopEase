import Product from '../models/Product.js';

/**
 * @desc    AI-Powered Natural Language Product Search & Assistant
 * @route   POST /api/ai/search
 * @access  Public
 */
export const aiProductSearch = async (req, res, next) => {
    try {
        const { message } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a search message',
            });
        }

        const msgLower = message.toLowerCase();
        let aiExtracted = null;

        // 1. If Claude API Key is configured, perform Natural Language Understanding (NLU)
        if (process.env.CLAUDE_API_KEY) {
            try {
                const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': process.env.CLAUDE_API_KEY,
                        'anthropic-version': '2023-06-01',
                    },
                    body: JSON.stringify({
                        model: 'claude-3-haiku-20240307',
                        max_tokens: 300,
                        messages: [{
                            role: 'user',
                            content: `You are an e-commerce shopping assistant. Analyze this user query: "${message}"
Return ONLY a valid JSON object (no markdown, no backticks, no extra text) with these fields:
{
  "keywords": ["array", "of", "search", "terms"],
  "category": "Electronics or Fashion or Home or Footwear or null",
  "maxPrice": number or null,
  "minPrice": number or null,
  "summaryAdvice": "brief friendly 1-sentence shopping advice for the customer"
}`
                        }],
                    }),
                });

                if (claudeResponse.ok) {
                    const data = await claudeResponse.json();
                    const text = data.content?.[0]?.text?.trim() || '';
                    const cleanedJson = text.replace(/```json|```/g, '').trim();
                    aiExtracted = JSON.parse(cleanedJson);
                }
            } catch (err) {
                console.log('Claude NLU fallback to rule engine:', err.message);
            }
        }

        // 2. Query MongoDB based on extracted intent or intelligent regex
        const query = { stock: { $gt: 0 } };

        if (aiExtracted?.maxPrice) {
            query.price = { $lte: aiExtracted.maxPrice };
        } else {
            const priceMatch = msgLower.match(/under\s*₹?\s*(\d+)|below\s*₹?\s*(\d+)|less than\s*₹?\s*(\d+)/i);
            if (priceMatch) {
                const budget = parseInt(priceMatch[1] || priceMatch[2] || priceMatch[3]);
                query.price = { $lte: budget };
            }
        }

        if (aiExtracted?.category) {
            query.category = new RegExp(aiExtracted.category, 'i');
        }

        const keywords = aiExtracted?.keywords?.length
            ? aiExtracted.keywords
            : msgLower.split(' ').filter(w => w.length > 2 && !['want', 'need', 'show', 'under', 'find', 'best', 'good'].includes(w));

        if (keywords.length > 0) {
            const regexList = keywords.map(k => new RegExp(k, 'i'));
            query.$or = [
                { name: { $in: regexList } },
                { description: { $in: regexList } },
                { brand: { $in: regexList } },
                { category: { $in: regexList } }
            ];
        }

        let products = await Product.find(query)
            .select('name description price discountPrice category brand stock ratings images')
            .sort({ ratings: -1 })
            .limit(6)
            .lean();

        // Fallback: If strict query yielded 0, fetch top rated in stock
        if (products.length === 0) {
            products = await Product.find({ stock: { $gt: 0 } })
                .select('name description price discountPrice category brand stock ratings images')
                .sort({ ratings: -1 })
                .limit(3)
                .lean();
        }

        let response = '';
        if (aiExtracted?.summaryAdvice) {
            response += `${aiExtracted.summaryAdvice}\n\n`;
        }

        if (products.length > 0) {
            response += `Here are the top matches I found for you:\n\n`;
            products.forEach((p, i) => {
                const price = p.discountPrice > 0 ? p.discountPrice : p.price;
                response += `${i + 1}. **${p.name}** (${p.brand})\n`;
                response += `   💰 ₹${price.toLocaleString('en-IN')}`;
                if (p.discountPrice > 0) {
                    response += ` ~~₹${p.price.toLocaleString('en-IN')}~~`;
                }
                response += ` | ⭐ Rating: ${p.ratings || 'New'}\n\n`;
            });
            response += `Click any product above to explore specifications and place an order!`;
        } else {
            response += `I couldn't find exact matches for your request. Try browsing by category or adjusting your budget!`;
        }

        res.status(200).json({
            success: true,
            message: response,
            products,
        });

    } catch (error) {
        console.error('AI Search error:', error.message);
        next(error);
    }
};

/**
 * @desc    Generate AI Product Description (Claude API)
 * @route   POST /api/ai/generate-description
 * @access  Admin only
 */
export const generateProductDescription = async (req, res, next) => {
    try {
        const { name, category, brand, price } = req.body;

        if (!name || !category || !brand) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, category, and brand',
            });
        }

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: 'claude-3-haiku-20240307',
                max_tokens: 200,
                messages: [{
                    role: 'user',
                    content: `Write a compelling 2-3 sentence product description for:
Product: ${name}
Category: ${category}
Brand: ${brand}
Price: ₹${price || 'not specified'}

Make it exciting and highlight key benefits. Keep under 100 words.`
                }],
            }),
        });

        const rawText = await response.text();
        const data = JSON.parse(rawText);

        if (data.error) {
            return res.status(500).json({
                success: false,
                message: data.error.message,
            });
        }

        res.status(200).json({
            success: true,
            description: data.content[0].text,
        });

    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Smart Scored Product Recommendations
 * @route   GET /api/ai/recommendations/:productId
 * @access  Public
 */
export const getRecommendations = async (req, res, next) => {
    try {
        const { productId } = req.params;

        const currentProduct = await Product.findById(productId);

        if (!currentProduct) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        // Fetch candidate products from same category or brand
        const candidates = await Product.find({
            _id: { $ne: productId },
            stock: { $gt: 0 },
            $or: [
                { category: currentProduct.category },
                { brand: currentProduct.brand }
            ]
        })
            .select('name price discountPrice images ratings numReviews brand category')
            .limit(12)
            .lean();

        // Calculate relevance score: category match + ratings weight + price similarity
        const scored = candidates.map(p => {
            let score = 0;
            if (p.category === currentProduct.category) score += 5;
            if (p.brand === currentProduct.brand) score += 3;
            score += (p.ratings || 0) * 1.5;

            const currentPrice = currentProduct.discountPrice || currentProduct.price;
            const pPrice = p.discountPrice || p.price;
            const priceDiffRatio = Math.abs(currentPrice - pPrice) / Math.max(currentPrice, 1);
            if (priceDiffRatio < 0.3) score += 2; // within 30% price band

            return { ...p, relevanceScore: score };
        });

        scored.sort((a, b) => b.relevanceScore - a.relevanceScore);

        res.status(200).json({
            success: true,
            recommendations: scored.slice(0, 4),
        });

    } catch (error) {
        next(error);
    }
};
