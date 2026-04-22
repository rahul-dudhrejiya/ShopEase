// backend/utils/seedProducts.js
// WHAT: Adds sample products to database automatically
// WHY: Instead of adding one by one in Postman
// HOW: Run once → 20 products added instantly

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';

dotenv.config();

const sampleProducts = [
  {
    name: 'iPhone 15 Pro',
    description: 'Latest Apple flagship with A17 Pro chip, titanium design',
    price: 134900,
    discountPrice: 124900,
    category: 'Electronics',
    brand: 'Apple',
    stock: 50,
    isFeatured: true,
    images: [{ public_id: 'sample1', url: 'https://images.unsplash.com/photo-1573148195900-7845dcb9b127?q=80&w=1340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }],
  },
  {
    name: 'Samsung Galaxy S24',
    description: 'AI-powered Android flagship with 200MP camera',
    price: 79999,
    discountPrice: 69999,
    category: 'Electronics',
    brand: 'Samsung',
    stock: 30,
    isFeatured: true,
    images: [{ public_id: 'sample2', url: 'https://images.unsplash.com/photo-1705585174953-9b2aa8afc174?q=80&w=732&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }],
  },
  {
    name: 'Sony WH-1000XM5',
    description: 'Industry leading noise canceling headphones',
    price: 29990,
    discountPrice: 24990,
    category: 'Electronics',
    brand: 'Sony',
    stock: 40,
    isFeatured: true,
    images: [{ public_id: 'sample3', url: 'https://images.unsplash.com/photo-1612858249816-5a91a9fb9886?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }],
  },
  {
    name: 'Nike Air Max 270',
    description: 'Premium running shoes with air cushion technology',
    price: 12999,
    discountPrice: 9999,
    category: 'Footwear',
    brand: 'Nike',
    stock: 60,
    isFeatured: true,
    images: [{ public_id: 'sample4', url: 'https://images.unsplash.com/photo-1580902215262-9b941bc6eab3?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }],
  },
  {
    name: 'Levi\'s 511 Slim Jeans',
    description: 'Classic slim fit jeans in stretch denim',
    price: 3999,
    discountPrice: 2999,
    category: 'Clothing',
    brand: 'Levis',
    stock: 100,
    images: [{ public_id: 'sample5', url: 'https://media.istockphoto.com/id/1327306021/photo/jeans-of-various-fabrics-lie-in-a-pile-on-a-white-background-isolate.jpg?s=1024x1024&w=is&k=20&c=XGaZbh4v8F76TLliqKVrZHWZkLKADEwmANxcfnb3uOA=' }],
  },
  {
    name: 'The Alchemist',
    description: 'Paulo Coelho\'s masterpiece about following your dreams',
    price: 399,
    discountPrice: 299,
    category: 'Books',
    brand: 'HarperCollins',
    stock: 200,
    images: [{ public_id: 'sample6', url: 'https://images.unsplash.com/photo-1559228003-13eb390bf5e5?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }],
  },
  {
    name: 'MacBook Air M2',
    description: 'Supercharged by M2 chip, all day battery life',
    price: 114900,
    discountPrice: 104900,
    category: 'Electronics',
    brand: 'Apple',
    stock: 25,
    isFeatured: true,
    images: [{ public_id: 'sample7', url: 'https://images.unsplash.com/photo-1659135890084-930731031f40?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }],
  },
  {
    name: 'Instant Pot Duo 7-in-1',
    description: 'Multi-use pressure cooker, slow cooker, rice cooker',
    price: 8999,
    discountPrice: 6999,
    category: 'Home & Kitchen',
    brand: 'Instant Pot',
    stock: 45,
    images: [{ public_id: 'sample8', url: 'https://images.unsplash.com/photo-1627380561422-d2c23d938b83?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }],
  },
  {
    name: 'Yoga Mat Premium',
    description: 'Non-slip, eco-friendly yoga mat with carrying strap',
    price: 1999,
    discountPrice: 1499,
    category: 'Sports',
    brand: 'Liforme',
    stock: 80,
    images: [{ public_id: 'sample9', url: 'https://plus.unsplash.com/premium_photo-1716025656382-cc9dfe8714a7?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }],
  },
  {
    name: 'LEGO Star Wars Set',
    description: 'Build the Millennium Falcon with 1353 pieces',
    price: 14999,
    discountPrice: 12999,
    category: 'Toys',
    brand: 'LEGO',
    stock: 35,
    images: [{ public_id: 'sample10', url: 'https://images.unsplash.com/photo-1711536889139-b7f76c604a44?q=80&w=1443&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }],
  },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    // Clear existing products
    await Product.deleteMany({});
    console.log('🗑️ Cleared existing products');

    // Add sample products
    await Product.insertMany(sampleProducts);
    console.log(`✅ Added ${sampleProducts.length} products successfully!`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedDatabase();