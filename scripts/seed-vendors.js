try { require('dotenv').config(); } catch (e) {}
const mongoose = require('mongoose');

// Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://manage_agency:Ri11559988@cluster0.oq5xc.mongodb.net/dorjay?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = process.env.MONGODB_DB || 'dorjay';

// Define Schemas
const VendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  mobilePrefix: { type: String, default: "880" },
  mobile: { type: String },
  registrationDate: { type: Date, default: Date.now },
  openingBalanceType: { type: String, enum: ["due", "advance", ""], default: "" },
  openingBalance: { type: Number, default: 0 },
  fixedAdvance: { type: Number, default: 0 },
  address: { type: String },
  creditLimit: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  presentBalance: { type: Number, default: 0 },
  fixedBalance: { type: Number, default: 0 },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", default: null },
  commission: { type: Number, default: 0 },
}, { collection: "vendors" });

const ProductSchema = new mongoose.Schema({
  product_name: { type: String, required: true },
}, { collection: "products" });

const Vendor = mongoose.models.Vendor || mongoose.model("Vendor", VendorSchema);
const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, { dbName: DB_NAME });
    console.log('Connected successfully to database:', DB_NAME);

    // Fetch existing products
    const products = await Product.find({}).lean();
    console.log(`Found ${products.length} products in database for vendor mapping.`);

    const getProdId = (nameQuery) => {
      const found = products.find(p => p.product_name.toLowerCase().includes(nameQuery.toLowerCase()));
      return found ? found._id : null;
    };

    // Clean up existing global vendors
    console.log('Cleaning up existing global vendors...');
    await Vendor.deleteMany({ companyId: null });

    const foodProd = getProdId("Food Delivery");
    const cateringProd = getProdId("Catering");
    const medProd = getProdId("Prescription Medicine");
    const coldMedProd = getProdId("Cold-Chain");
    const groceryProd = getProdId("Grocery");
    const parcelProd = getProdId("Same-Day Parcel");
    const docProd = getProdId("Document Express");
    const packProd = getProdId("Packaging Box");

    const vendorDocs = [
      {
        name: "Food Express Logistics Vendor",
        email: "foodexpress@dorjay.com",
        mobilePrefix: "880",
        mobile: "880-01711000001",
        address: "Gulshan 1, Dhaka",
        active: true,
        products: [foodProd, cateringProd].filter(Boolean),
        openingBalanceType: "",
        openingBalance: 0,
        companyId: null,
      },
      {
        name: "MedPharma Delivery Vendor",
        email: "pharma@dorjay.com",
        mobilePrefix: "880",
        mobile: "880-01811000002",
        address: "Dhanmondi, Dhaka",
        active: true,
        products: [medProd, coldMedProd].filter(Boolean),
        openingBalanceType: "",
        openingBalance: 0,
        companyId: null,
      },
      {
        name: "Fresh Mart Supply Vendor",
        email: "grocery@dorjay.com",
        mobilePrefix: "880",
        mobile: "880-01911000003",
        address: "Banani, Dhaka",
        active: true,
        products: [groceryProd].filter(Boolean),
        openingBalanceType: "",
        openingBalance: 0,
        companyId: null,
      },
      {
        name: "FastTrack Courier Services",
        email: "fasttrack@dorjay.com",
        mobilePrefix: "880",
        mobile: "880-01511000004",
        address: "Uttara, Dhaka",
        active: true,
        products: [parcelProd, docProd].filter(Boolean),
        openingBalanceType: "",
        openingBalance: 0,
        companyId: null,
      },
      {
        name: "EcoPack Packaging Supplies Ltd.",
        email: "ecopack@dorjay.com",
        mobilePrefix: "880",
        mobile: "880-01611000005",
        address: "Tejgaon Industrial Area, Dhaka",
        active: true,
        products: [packProd].filter(Boolean),
        openingBalanceType: "",
        openingBalance: 0,
        companyId: null,
      }
    ];

    const insertedVendors = await Vendor.insertMany(vendorDocs);
    console.log(`Successfully inserted ${insertedVendors.length} Dorjay vendors.`);

  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit();
  }
}

seed();
