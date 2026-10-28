const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

function loadEnvFile(filePath) {
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      content.split(/\r?\n/).forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      });
    } catch (e) {
      console.warn("Could not read " + filePath, e.message);
    }
  }
}

loadEnvFile(path.resolve(__dirname, '../.env.local'));
loadEnvFile(path.resolve(__dirname, '../.env'));

const args = process.argv.slice(2);
const isProdRequested = args.includes("--prod");

let MONGODB_URI = process.env.MONGODB_URI;
if (isProdRequested) {
  MONGODB_URI = process.env.MONGODB_URI_PROD || process.env.MONGODB_URI;
  console.log("Using PRODUCTION database (--prod flag detected)");
} else {
  MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_URI_PROD;
  console.log("Using default database from environment / .env");
}

const DB_NAME = process.env.MONGODB_DB || 'manage_agency';

if (!MONGODB_URI) {
  console.error("ERROR: MONGODB_URI is not defined in .env, .env.local, or environment.");
  process.exit(1);
}

function getRedactedUri(uri) {
  if (!uri) return "undefined";
  return uri.replace(/:([^:@]+)@/, ":******@");
}

async function runMigration() {
  try {
    console.log(`Connecting to: ${getRedactedUri(MONGODB_URI)} (Database: ${DB_NAME})`);
    await mongoose.connect(MONGODB_URI, { dbName: DB_NAME });
    console.log("Connected successfully.\n");

    const db = mongoose.connection.db;
    const companiesColl = db.collection('non_invoice_companies');
    const incomeColl = db.collection('non_invoice_incomes');
    const investmentColl = db.collection('investments');
    const withdrawalColl = db.collection('withdrawals');

    const allCompanies = await companiesColl.find({}).toArray();
    console.log(`Total Financial Authorities in database: ${allCompanies.length}`);

    let updatedCount = 0;
    let alreadyTypedCount = 0;

    for (const comp of allCompanies) {
      if (comp.type) {
        alreadyTypedCount++;
        continue;
      }

      const compId = comp._id;
      const compIdStr = String(comp._id);

      // Check usage in Non-Invoice Income
      const hasIncome = await incomeColl.findOne({
        $or: [
          { nonInvoiceCompanyId: compId },
          { nonInvoiceCompanyId: compIdStr },
          { "nonInvoiceCompany.id": compIdStr },
          { "nonInvoiceCompany._id": compId }
        ]
      });

      // Check usage in Investments
      const hasInvestment = await investmentColl.findOne({
        $or: [
          { targetCompanyId: compId },
          { targetCompanyId: compIdStr },
          { companyId: compId },
          { companyId: compIdStr }
        ]
      });

      // Check usage in Withdrawals
      const hasWithdrawal = await withdrawalColl.findOne({
        $or: [
          { targetCompanyId: compId },
          { targetCompanyId: compIdStr },
          { companyId: compId },
          { companyId: compIdStr }
        ]
      });

      let assignedType = "INVESTOR";
      if (hasIncome && !hasInvestment && !hasWithdrawal) {
        assignedType = "INCOME_SOURCE";
      } else if (hasInvestment || hasWithdrawal) {
        assignedType = "INVESTOR";
      } else {
        assignedType = "INVESTOR"; // default
      }

      await companiesColl.updateOne(
        { _id: comp._id },
        { $set: { type: assignedType } }
      );

      console.log(`[UPDATED] ${comp.name || comp._id} => type: ${assignedType} (hasIncome: ${!!hasIncome}, hasInvest: ${!!hasInvestment}, hasWithdrawal: ${!!hasWithdrawal})`);
      updatedCount++;
    }

    console.log(`\n================================`);
    console.log(`Migration Complete:`);
    console.log(`- Already typed: ${alreadyTypedCount}`);
    console.log(`- Newly categorized: ${updatedCount}`);
    console.log(`================================\n`);

  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

runMigration();
