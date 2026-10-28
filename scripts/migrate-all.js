const { spawnSync } = require('child_process');
const path = require('path');

/**
 * MASTER MIGRATION SCRIPT
 * 
 * Runs all migration scripts in the correct order to ensure data integrity.
 * 
 * Order:
 * 1. Company wise product
 * 2. Employees
 * 3. Agents
 * 4. Transport Types
 * 5. Vendors
 * 6. Clients
 * 7.passport
 * 8. Invoices (Other, Visa, Non-Commission)
 * 9. Accounts
 * 9. Money Receipts
 * 10. Vendor Payments
 * 11. Advance Returns (Client & Vendor)
 * 12. Expenses
 * 13. Balance Transfers
 * 15. Non-Invoice Income
 */

const scripts = [
  // { name: 'Company wise product', path: 'migrate-products-by-company.js' },
  { name: 'Employees', path: 'migrate-employees.js' },
  { name: 'Agents', path: 'migrate-agents.js' },
  { name: 'Transport Types', path: 'migrate-transport-types.js' },
  { name: 'Vendors', path: 'migrate-vendors.js' },
  { name: 'Clients', path: 'migrate-clients.js'},
  { name: 'Passport', path: 'migrate-passports.js'},
  { name: 'Invoices (Other)', path: 'migrate-invoices-other.js' },
  { name: 'Invoices (Visa)', path: 'migrate-invoices-visa.js' },
  { name: 'Invoices (Non-Commission)', path: 'migrate-invoices-non-commission.js' },
  { name: 'Accounts', path: 'migrate-accounts.js' },
  { name: 'Money Receipts', path: 'migrate-money-receipts.js' },
  { name: 'Vendor Payments', path: 'migrate-vendor-payments.js' },
  { name: 'Advance Returns (Client)', path: 'migrate-advance-returns.js' },
  { name: 'Advance Returns (Vendor)', path: 'migrate-vendor-advance-returns.js' },
  { name: 'expanse head ', path: 'migrate-expense-heads.js' },
  { name: 'Expenses', path: 'migrate-expenses.js' },
  { name: 'Balance Transfers', path: 'migrate-balance-transfers.js' },
  { name: 'non invoice company', path: 'migrate-non-invoice-companies.js' },
  { name: 'Non-Invoice Income', path: 'migrate-non-invoice-income.js' },
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runAll() {
  const args = process.argv.slice(2);
  const startIndex = args[0] || '0';
  const endIndex = args[1] || '10000';

  console.log('================================================================');
  console.log('STARTING MASTER MIGRATION');
  console.log(`Range: ${startIndex} to ${endIndex}`);
  console.log('================================================================\n');

  for (const script of scripts) {
    console.log(`\n>>> RUNNING: ${script.name} (${script.path})...`);
    
    const result = spawnSync('node', [path.join(__dirname, script.path), startIndex, endIndex], {
      stdio: 'inherit',
      shell: true
    });

    if (result.status !== 0) {
      console.error(`\n[ERROR] ${script.name} failed with exit code ${result.status}`);
      // Decide if we should continue or stop. For migration, stopping is usually safer.
      console.log('Stopping master migration due to error.');
      process.exit(result.status);
    }

    
    console.log(`<<< COMPLETED: ${script.name}. Waiting 10 seconds...\n`);
    await sleep(10000);
  }

  console.log('================================================================');
  console.log('MASTER MIGRATION COMPLETED SUCCESSFULLY');
  console.log('================================================================');
}

runAll();
