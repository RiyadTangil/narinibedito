try { require('dotenv').config(); } catch (e) {}
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://manage_agency:Ri11559988@cluster0.oq5xc.mongodb.net/dorjay?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = process.env.MONGODB_DB || 'dorjay';

// Define Schemas
const ProductCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  prefix: { type: String },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", index: true, default: null },
}, { collection: "product_categories" });

const ProductSchema = new mongoose.Schema({
  product_name: { type: String, required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "ProductCategory", index: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", index: true, default: null },
  isDeleted: { type: Boolean, default: false },
  dataEntryId: { type: String, index: true },
  status: { type: mongoose.Schema.Types.Mixed, default: 1 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { collection: "products" });

const ProductCategory = mongoose.models.ProductCategory || mongoose.model("ProductCategory", ProductCategorySchema);
const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

const CATEGORY_PREFIX_MAP = {
  "Food Delivery": "FD",
  "Medicine Delivery": "MD",
  "Grocery Delivery": "GD",
  "Parcel & Courier": "PC",
  "Express Dispatch": "ED",
  "Packaging Supplies": "PS"
};

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, { dbName: DB_NAME });
    console.log('Connected successfully to database:', DB_NAME);

    // Read products.json
    const jsonPath = path.join(__dirname, '..', 'products.json');
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const productsData = JSON.parse(rawData);

    console.log(`Found ${productsData.length} products in JSON.`);

    // Extract unique product categories
    const categoryTitles = Array.from(new Set(productsData.map(p => p.category_title).filter(Boolean)));
    console.log(`Extracted ${categoryTitles.length} product categories:`, categoryTitles);

    // Clean up existing global categories & products
    console.log('Cleaning up existing global product categories and products...');
    await ProductCategory.deleteMany({ companyId: null });
    await Product.deleteMany({ companyId: null });

    // Seed product categories
    const catDocs = categoryTitles.map(title => ({
      name: title,
      prefix: CATEGORY_PREFIX_MAP[title] || title.slice(0, 3).toUpperCase(),
      companyId: null
    }));

    const insertedCats = await ProductCategory.insertMany(catDocs);
    console.log(`Successfully inserted ${insertedCats.length} product categories.`);

    // Map category name -> _id
    const catMap = {};
    insertedCats.forEach(cat => {
      catMap[cat.name] = cat._id;
    });

    // Seed products
    const now = new Date();
    const productDocs = productsData.map(p => ({
      product_name: p.product_name,
      categoryId: catMap[p.category_title] || null,
      companyId: null,
      isDeleted: p.products_is_deleted === 1,
      dataEntryId: String(p.product_id),
      status: p.product_status || 1,
      createdAt: now,
      updatedAt: now
    }));

    const insertedProducts = await Product.insertMany(productDocs);
    console.log(`Successfully inserted ${insertedProducts.length} products.`);

  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit();
  }
}

seed();
