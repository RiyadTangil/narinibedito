try { require('dotenv').config(); } catch (e) {}
const mongoose = require('mongoose');

// Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://manage_agency:Ri11559988@cluster0.oq5xc.mongodb.net/dorjay?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = process.env.MONGODB_DB || 'dorjay';

// Define Schema
const AccountTypeSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", index: true, default: null },
  createdAt: { type: String },
  updatedAt: { type: String },
  __v: { type: Number, default: 0 }
}, { collection: "account_types" });

const AccountType = mongoose.models.AccountType || mongoose.model("AccountType", AccountTypeSchema);

const accountTypesToSeed = [
  {
    _id: new mongoose.Types.ObjectId('6a04073c73601487f0db2133'),
    name: "Cash",
    createdAt: "2026-05-13T05:08:12.093Z",
    updatedAt: "2026-05-13T05:08:12.093Z",
    __v: 0
  },
  {
    _id: new mongoose.Types.ObjectId('6a0407a373601487f0db213e'),
    name: "Bank",
    createdAt: "2026-05-13T05:09:55.686Z",
    updatedAt: "2026-05-13T05:09:55.686Z",
    __v: 0
  },
  {
    _id: new mongoose.Types.ObjectId('6a0407b173601487f0db2144'),
    name: "Credit Card",
    createdAt: "2026-05-13T05:10:09.904Z",
    updatedAt: "2026-05-13T05:10:09.904Z",
    __v: 0
  },
  {
    _id: new mongoose.Types.ObjectId('6a0407a873601487f0db2141'),
    name: "Mobile banking",
    createdAt: "2026-05-13T05:10:00.996Z",
    updatedAt: "2026-05-13T05:10:00.996Z",
    __v: 0
  }
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, { dbName: DB_NAME });
    console.log('Connected successfully.');

    for (const item of accountTypesToSeed) {
      const existing = await AccountType.findById(item._id);
      if (existing) {
        await AccountType.updateOne({ _id: item._id }, { $set: item });
        console.log(`Updated account type: ${item.name} (${item._id})`);
      } else {
        await AccountType.create(item);
        console.log(`Inserted account type: ${item.name} (${item._id})`);
      }
    }

    const all = await AccountType.find({}).lean();
    console.log('\n--- Current account_types collection ---');
    console.log(JSON.stringify(all, null, 2));
    console.log(`Total count: ${all.length}`);

  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit();
  }
}

seed();
