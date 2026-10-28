const mongoose = require('mongoose');
const { Types } = mongoose;
require('dotenv').config();

// Mongoose Models (Minimal for script)
const VendorSchema = new mongoose.Schema({
  name: String,
  presentBalance: Number, // New single number format
  companyId: Types.ObjectId,
}, { collection: 'vendors' });

const ClientTransactionSchema = new mongoose.Schema({
  vendorId: Types.ObjectId,
  amount: Number,
  direction: String,
  isDeleted: Boolean,
}, { collection: 'client_transactions' });

const InvoiceItemSchema = new mongoose.Schema({
  vendorId: Types.ObjectId,
  totalCost: Number,
  isDeleted: Boolean,
}, { collection: 'invoice_items' });

const Vendor = mongoose.models.Vendor || mongoose.model('Vendor', VendorSchema);
const ClientTransaction = mongoose.models.ClientTransaction || mongoose.model('ClientTransaction', ClientTransactionSchema);
const InvoiceItem = mongoose.models.InvoiceItem || mongoose.model('InvoiceItem', InvoiceItemSchema);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/travel_pro';

async function syncVendorBalances() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.');

    const vendors = await Vendor.find({}).lean();
    console.log(`Found ${vendors.length} vendors. Processing...`);

    for (const vendor of vendors) {
      const vendorId = vendor._id;
      
      // Calculate balance from:
      // 1. Transactions (Payments, Advance Returns, Opening Balances)
      const transactions = await ClientTransaction.find({ 
        vendorId: vendorId,
        isDeleted: { $ne: true }
      }).lean();

      let calculatedBalance = 0;
      for (const txn of transactions) {
        const amount = Number(txn.amount || 0);
        // NEW Standard (Consistent with Client):
        // direction: "credit" (Payment / Advance adjustment) -> +amount (Increases our advance)
        // direction: "debit" (Return / Due adjustment / Invoice) -> -amount (Decreases our advance)
        if (txn.direction === 'credit') {
          calculatedBalance += amount;
        } else {
          calculatedBalance -= amount;
        }
      }

      // 2. Invoice Costs (Invoice Items)
      const invoiceItems = await InvoiceItem.find({
        vendorId: vendorId,
        isDeleted: { $ne: true }
      }).lean();

      for (const item of invoiceItems) {
        // Invoice cost decreases our advance
        calculatedBalance -= Number(item.totalCost || 0);
      }

      calculatedBalance = Math.round((calculatedBalance + Number.EPSILON) * 100) / 100;

      // Handle old structure if still present
      const currentBalance = typeof vendor.presentBalance === 'object' 
        ? (vendor.presentBalance.type === 'advance' ? vendor.presentBalance.amount : -vendor.presentBalance.amount)
        : Number(vendor.presentBalance || 0);

      if (currentBalance !== calculatedBalance) {
        console.log(`[FIX] Vendor: ${vendor.name} (${vendorId})`);
        console.log(`      Old Balance: ${JSON.stringify(vendor.presentBalance)}`);
        console.log(`      New Balance: ${calculatedBalance}`);
        
        await Vendor.updateOne(
          { _id: vendorId },
          { $set: { presentBalance: calculatedBalance } }
        );
      }
    }

    console.log('\nVendor balance synchronization completed.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

syncVendorBalances();
