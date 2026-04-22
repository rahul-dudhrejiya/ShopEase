import Product from '../models/Product.js';

// ========================
// AI Feature 1 — Product Search
// ========================
export const aiProductSearch = async (req, res, next) => {
  try {
    const { message } = req.body;

    // Get products for smart matching
    const products = await Product.find({ stock: { $gt: 0 } })
      .select('name description price discountPrice category brand stock ratings')
      .limit(50);

    // SMART KEYWORD MATCHING (No API needed!)
    // WHY? Works offline, no cost, fast!
    const msgLower = message.toLowerCase();

    // Find matching products by keyword
    const matched = products.filter(p => {
      const searchText = `${p.name} ${p.brand} ${p.category} ${p.description}`.toLowerCase();
      const keywords = msgLower.split(' ').filter(w => w.length > 2);
      return keywords.some(keyword => searchText.includes(keyword));
    });

    // Sort by ratings
    matched.sort((a, b) => b.ratings - a.ratings);

    // Build smart response
    let response = '';

    if (matched.length > 0) {
      response = `I found ${matched.length} product(s) for you! 🎉\n\n`;
      matched.slice(0, 3).forEach((p, i) => {
        const price = p.discountPrice > 0 ? p.discountPrice : p.price;
        response += `${i + 1}. **${p.name}** by ${p.brand}\n`;
        response += `   💰 ₹${price.toLocaleString('en-IN')}`;
        if (p.discountPrice > 0) {
          response += ` ~~₹${p.price.toLocaleString('en-IN')}~~`;
        }
        response += `\n   ⭐ Rating: ${p.ratings > 0 ? p.ratings : 'New'}\n\n`;
      });
      response += `Click any product to view details!`;
    } else {
      // Category suggestions
      const categories = [...new Set(products.map(p => p.category))];

      // Price-based search
      const priceMatch = msgLower.match(/(\d+)/g);
      if (priceMatch) {
        const budget = parseInt(priceMatch[priceMatch.length - 1]);
        const affordable = products
          .filter(p => (p.discountPrice || p.price) <= budget)
          .sort((a, b) => b.ratings - a.ratings)
          .slice(0, 3);

        if (affordable.length > 0) {
          response = `Here are products under ₹${budget.toLocaleString('en-IN')}! 💰\n\n`;
          affordable.forEach((p, i) => {
            const price = p.discountPrice > 0 ? p.discountPrice : p.price;
            response += `${i + 1}. **${p.name}** - ₹${price.toLocaleString('en-IN')}\n`;
          });
        } else {
          response = `Sorry, I couldn't find products under ₹${budget.toLocaleString('en-IN')}. Try a higher budget! 😊`;
        }
      } else {
        response = `I couldn't find exact matches. We have products in these categories:\n\n`;
        categories.slice(0, 5).forEach(cat => {
          response += `• ${cat}\n`;
        });
        response += `\nTry searching by category name or product name!`;
      }
    }

    res.status(200).json({
      success: true,
      message: response,
    });

  } catch (error) {
    console.error('AI Search error:', error.message);
    next(error);
  }
};
// ========================
// AI Feature 3 — Generate Product Description
// ========================
export const generateProductDescription = async (req, res, next) => {
  try {
    const { name, category, brand, price } = req.body;

    if (!name || !category || !brand) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, category and brand',
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

// ========================
// AI Feature 4 — Smart Recommendations
// ========================
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

    const recommendations = await Product.find({
      category: currentProduct.category,
      _id: { $ne: productId },
      stock: { $gt: 0 },
    })
      .sort({ ratings: -1 })
      .limit(4)
      .select('name price discountPrice images ratings numReviews brand');

    res.status(200).json({
      success: true,
      recommendations,
    });

  } catch (error) {
    next(error);
  }
};
