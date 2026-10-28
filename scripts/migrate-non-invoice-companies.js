const axios = require('axios');
const { 
  EXTERNAL_AUTH_TOKEN, 
  LOCAL_API_URL, 
  LOCAL_SESSION_COOKIE, 
  HEADERS_EXTERNAL, 
  HEADERS_LOCAL,
  getLocalData,
  sleep
} = require('./migration-helpers');

/**
 * NON-INVOICE COMPANIES MIGRATION SCRIPT
 * 
 * Step 1: Get all non-invoice companies from third-party API
 * Step 2: Fetch local non-invoice companies to check for duplicates by dataEntryId
 * Step 3: Map external company to local payload
 * Step 4: Call local non-invoice company API
 */

async function fetchExternalCompanyList() {
  const url = `https://trabill.m360ictapi.com/api/v1/configuration/companies/view-all`;
  console.log(`  - [External] Fetching Companies: ${url}`);
  try {
    const res = await axios.get(url, { headers: HEADERS_EXTERNAL });
    return res.data.data || [];
  } catch (err) {
    console.error(`  - [External] Error fetching company list:`, err.response?.data?.message || err.message);
    return [];
  }
}

async function migrate() {
  const args = process.argv.slice(2);
  const startIndex = parseInt(args[0]) || 0;
  const endIndex = parseInt(args[1]) || 10000;

  if (!LOCAL_SESSION_COOKIE) {
    console.error('ERROR: Please provide LOCAL_SESSION_COOKIE in the script configuration.');
    process.exit(1);
  }

  try {
    console.log('Fetching local non-invoice companies...');
    const localCompanies = await getLocalData('/api/configuration/companies?page=1&pageSize=10000');
    console.log(`Found ${localCompanies.length} non-invoice companies locally.`);

    console.log('Fetching external non-invoice company list...');
    const externalCompanies = await fetchExternalCompanyList();
    console.log(`Found ${externalCompanies.length} companies on external API.`);

    const range = externalCompanies.slice(startIndex, endIndex);
    console.log(`Processing range ${startIndex} to ${endIndex} (${range.length} companies)...`);

    for (let i = 0; i < range.length; i++) {
      const extItem = range[i];
      console.log(`[${startIndex + i + 1}/${Math.min(endIndex, externalCompanies.length)}] Migrating Company: ${extItem.company_name} (ID: ${extItem.company_id})...`);

      // 1. Check for duplicates
      const matched = localCompanies.find(c => String(c.dataEntryId) === String(extItem.company_id));
      if (matched) {
        console.log(`  - SKIP: Company already exists locally (ID: ${matched.id})`);
        continue;
      }

      // 2. Prepare Payload
      const payload = {
        name: extItem.company_name,
        contactPerson: extItem.company_contact_person || "",
        designation: extItem.company_designation || "",
        phone: extItem.company_phone || "",
        address: extItem.company_address || "",
        dataEntryId: String(extItem.company_id),
        createdAt: extItem.company_create_date || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // 3. Call Local API
      try {
        const res = await axios.post(`${LOCAL_API_URL}/api/configuration/companies`, payload, { headers: HEADERS_LOCAL });
        console.log(`  - SUCCESS: Company added`);
        
        // Brief sleep to prevent overwhelming the server
        await sleep(500);
      } catch (err) {
        console.error(`  - FAILED:`, err.response?.data?.message || err.response?.data?.error || err.message);
      }
    }

    console.log('\nMigration completed.');
  } catch (error) {
    console.error('Critical Error:', error.message);
  }
}

migrate();
