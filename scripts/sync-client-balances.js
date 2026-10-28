const mongoose = require('mongoose');
const { Types } = mongoose;
require('dotenv').config();

// Mongoose Models (Minimal for script)
const ClientSchema = new mongoose.Schema({
  name: String,
  presentBalance: Number,
  companyId: Types.ObjectId,
}, { collection: 'clients' });

const ClientTransactionSchema = new mongoose.Schema({
  clientId: Types.ObjectId,
  amount: Number,
  direction: String,
  isDeleted: Boolean,
}, { collection: 'client_transactions' });

const Client = mongoose.models.Client || mongoose.model('Client', ClientSchema);
const ClientTransaction = mongoose.models.ClientTransaction || mongoose.model('ClientTransaction', ClientTransactionSchema);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/travel_pro';

async function syncBalances() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.');

    const clients = await Client.find({}).lean();
    console.log(`Found ${clients.length} clients. Processing...`);

    for (const client of clients) {
      const clientId = client._id;
      
      // Calculate balance from transactions
      // Ledger logic: 
      // direction: "credit" -> Credit (Increases Advance/Decreases Due) -> +amount in presentBalance
      // direction: "debit" -> Debit (Decreases Advance/Increases Due) -> -amount in presentBalance
      
      const transactions = await ClientTransaction.find({ 
        clientId: clientId,
        isDeleted: { $ne: true }
      }).lean();

      let calculatedBalance = 0;
      for (const txn of transactions) {
        const amount = Number(txn.amount || 0);
        if (txn.direction === 'credit') {
          calculatedBalance += amount;
        } else {
          calculatedBalance -= amount;
        }
      }

      calculatedBalance = Math.round((calculatedBalance + Number.EPSILON) * 100) / 100;

      if (client.presentBalance !== calculatedBalance) {
        console.log(`[FIX] Client: ${client.name} (${clientId})`);
        console.log(`      Old Balance: ${client.presentBalance}`);
        console.log(`      New Balance: ${calculatedBalance}`);
        
        await Client.updateOne(
          { _id: clientId },
          { $set: { presentBalance: calculatedBalance } }
        );
      }
    }

    console.log('\nBalance synchronization completed.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

syncBalances();
