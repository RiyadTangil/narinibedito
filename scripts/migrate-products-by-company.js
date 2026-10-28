const axios = require('axios');
const { 
  LOCAL_API_URL, 
  LOCAL_SESSION_COOKIE, 
  HEADERS_EXTERNAL, 
  HEADERS_LOCAL,
  getLocalData,
  sleep
} = require('./migration-helpers');

/**
 * PRODUCT MIGRATION BY COMPANY SCRIPT
 * 
 * Step 1: Get products from third-party API
 * Step 2: Fetch local product categories for mapping
 * Step 3: For each product with agency_id, call local POST /api/products
 */

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

async function migrate() {
  const args = process.argv.slice(2);
  const startIndex = parseInt(args[0]) || 0;
  const endIndex = parseInt(args[1]) || 10000;

  if (!LOCAL_SESSION_COOKIE) {
    console.error('ERROR: Please provide LOCAL_SESSION_COOKIE in the script configuration.');
    process.exit(1);
  }

  try {
    console.log('Fetching local product categories for mapping...');
    // Note: API path updated to /api/product-categories
    const localCategories = await getLocalData('/api/product-categories?pageSize=1000');
    console.log(`Found ${localCategories.length} local product categories.`);

    console.log('Fetching external products...');
    const allProducts = await fetchExternalProducts();
    console.log(`Found ${allProducts.length} total products on external API.`);

    // Filter for company-specific products (agency_id is NOT null)
    const companyProducts = allProducts.filter(p => p.agency_id !== null);
    console.log(`Found ${companyProducts.length} company-specific products to migrate.`);

    const range = companyProducts.slice(startIndex, endIndex);
    console.log(`Processing range ${startIndex} to ${endIndex} (${range.length} products)...`);

    for (let i = 0; i < range.length; i++) {
      const p = range[i];
      console.log(`[${startIndex + i + 1}/${Math.min(endIndex, companyProducts.length)}] Migrating Product: ${p.product_name} (Agency: ${p.agency_id})...`);

      // 1. Map Category
      const matchedCat = localCategories.find(lc => 
        lc.name.toUpperCase() === (p.category_title || "").toUpperCase()
      );

      if (!matchedCat) {
        console.warn(`  - WARNING: No local product category found for "${p.category_title}". Skipping...`);
        continue;
      }

      // 2. Prepare Payload
      const payload = {
        product_name: p.product_name,
        categoryId: matchedCat.id,
        dataEntryId: String(p.product_id),
        status: p.product_status === 1 ? "active" : "inactive",
      };

      // 3. Call Local API
      try {
        const res = await axios.post(`${LOCAL_API_URL}/api/products`, payload, { headers: HEADERS_LOCAL });
        console.log(`  - SUCCESS: Product added (ID: ${res.data.data?.id})`);
        
        // Brief sleep to avoid overwhelming the server
        await sleep(500);
      } catch (err) {
        const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message;
        if (errorMsg.includes("Duplicate")) {
            console.log(`  - SKIPPED: Product already exists`);
        } else {
            console.error(`  - FAILED:`, errorMsg);
        }
      }
    }

    console.log('\nMigration completed.');
  } catch (error) {
    console.error('Critical Error:', error.message);
  }
}

migrate();
