try { require('dotenv').config(); } catch (e) {}
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://manage_agency:Ri11559988@cluster0.oq5xc.mongodb.net/dorjay?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = process.env.MONGODB_DB || 'dorjay';

// Define Schema (simplified for script)
const ClientCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  prefix: { type: String, required: true },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", index: true, default: null },
  isDeleted: { type: Boolean, default: false },
  createdAt: { type: String },
  updatedAt: { type: String },
}, { collection: "client_categories" });

const ClientCategory = mongoose.models.ClientCategory || mongoose.model("ClientCategory", ClientCategorySchema);

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, { dbName: DB_NAME });
    console.log('Connected successfully.');

    const jsonPath = path.join(__dirname, '..', 'client_category.json');
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const categories = JSON.parse(rawData);

    console.log(`Found ${categories.length} categories in JSON.`);

    const now = new Date().toISOString();
    const docsToInsert = categories.map(cat => ({
      name: cat.category_title,
      prefix: cat.category_prefix,
      status: "active",
      companyId: null,
      isDeleted: cat.category_is_deleted === 1,
      createdAt: now,
      updatedAt: now
    }));

    // Clear existing global categories (where companyId is null)
    console.log('Cleaning up existing global categories...');
    await ClientCategory.deleteMany({ companyId: null });

    console.log('Inserting categories...');
    const result = await ClientCategory.insertMany(docsToInsert);
    console.log(`Successfully inserted ${result.length} categories.`);

  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit();
  }
}

seed();
