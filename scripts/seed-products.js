const mongoose = require('mongoose');
const axios = require('axios');
const { EXTERNAL_AUTH_TOKEN, HEADERS_EXTERNAL } = require('./migration-helpers');

// Configuration
const MONGODB_URI = 'mongodb+srv://agency_book:Ri11559988@cluster0.fmh8nwc.mongodb.net/manage_agency?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = 'manage_agency';

// Define Schemas
const ProductSchema = new mongoose.Schema({
  product_name: { type: String, required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "ProductCategory", index: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", index: true },
  isDeleted: { type: Boolean, default: false },
  dataEntryId: { type: String, index: true },
  status: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { collection: "products" });

const ProductCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  prefix: { type: String },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", index: true },
}, { collection: "product_categories" });

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);
const ProductCategory = mongoose.models.ProductCategory || mongoose.model("ProductCategory", ProductCategorySchema);

async function fetchExternalProducts() {
  let allProducts = [];
  let page = 1;
  const size = 100;
  
  while (true) {
    const url = `https://trabill.m360ictapi.com/api/v1/configuration/products?page=${page}&size=${size}&search=`;
    console.log(`Fetching page ${page}...`);
    try {
      const res = await axios.get(url, { headers: HEADERS_EXTERNAL });
      const data = res.data.data || [];
      allProducts = allProducts.concat(data);
      if (data.length < size) break;
      page++;
    } catch (err) {
      console.error(`Error fetching products at page ${page}:`, err.message);
      break;
    }
  }
  return allProducts;
}

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, { dbName: DB_NAME });
    console.log('Connected successfully.');

    // Load local categories for mapping
    const localCategories = await ProductCategory.find({}).lean();
    console.log(`Loaded ${localCategories.length} local product categories for mapping.`);

    console.log('Fetching external products...');
    const products = await fetchExternalProducts();
    console.log(`Found ${products.length} products on external API.`);

    // Filter for global products (agency_id is null)
    const globalProducts = products.filter(p => p.agency_id === null);
    console.log(`Found ${globalProducts.length} global products (agency_id is null).`);

    const now = new Date();
    const docsToInsert = globalProducts.map(p => {
      // Find matching category
      const matchedCat = localCategories.find(c => 
        c.name.toUpperCase() === (p.category_title || "").toUpperCase()
      );

      return {
        product_name: p.product_name,
        categoryId: matchedCat ? matchedCat._id : null,
        companyId: null, // Global product
        isDeleted: p.products_is_deleted === 1,
        dataEntryId: String(p.product_id),
        status: p.product_status,
        createdAt: now,
        updatedAt: now
      };
    });

    console.log('Cleaning up existing global products with dataEntryId...');
    await Product.deleteMany({ dataEntryId: { $in: globalProducts.map(p => String(p.product_id)) } });

    console.log('Inserting global products...');
    const result = await Product.insertMany(docsToInsert);
    console.log(`Successfully inserted ${result.length} global products.`);

  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit();
  }
}

seed();
