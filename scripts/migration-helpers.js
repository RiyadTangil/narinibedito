const axios = require('axios');

// --- SHARED CONFIGURATION ---
const EXTERNAL_AUTH_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX3VzZXJuYW1lIjoidGFudmlyYWlyIiwidXNlcl9mdWxsX25hbWUiOm51bGwsInVzZXJfcm9sZV9pZCI6MSwidXNlcl9pZCI6MzAzNCwidXNlcl9hZ2VuY3lfaWQiOjEyMDIsInVzZXJfYWdlbmN5IjpbMTIwMl0sImlhdCI6MTc4MDM5NzkyNSwiZXhwIjoxNzgxMDAyNzI1fQ.djKWlEv3GOrT4EOtehSE7jdkGHquuyfe4uMmmkPG-jE';
const LOCAL_API_URL = 'http://localhost:3000';
const LOCAL_SESSION_COOKIE = 'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..lr4Q2701NzhnVPul.Y1m9NY-PySUALjgpaN432lXC49VwAP62qTpITxyeH9groy43xtGGgrpm0SdeNoau2_Bex9aIOLuW-zxlz2SKJ3ztBu6tr_RiddlHdDH-nhd1Y2kAjEjbvGQtMNgButZpYREJTz0GCKCZnWzdK44bx8nFnmABS_PuNkmkWLc4Z3vUrNtIxREhtyztY2ociU0kxvsxn-whCwk7GEHER6A5dJbatcbrPgJHpl7yGIC3za1LxF3K2NC4Q6RfwmX9AzoGRENhoi-AJBg4z-nlcrAD13FOirBPJBI0DROrHLZvcPeACfkpNpXXcXLL7hXgjvj1YTj9o9NNfs1SC5ZwulyCJX1VaTAXcgPItxg6vhQLWKIepzZxPzvIxX6xOE1CVdcnDdIJVYg6O65GmpGI5nVBIQN1HCPAO0EAVCmuPwNP6KKtmtf2ooEkSA5jT-WOLcqSx24Vswcz77Tq.Rk-pJV4j7y4lXDj1vH-Nxg';

const HEADERS_EXTERNAL = {
  'Accept': '*/*',
  'Accept-Language': 'en-US,en;q=0.9,bn;q=0.8',
  'Connection': 'keep-alive',
  'Origin': 'https://www.trabill.biz',
  'Referer': 'https://www.trabill.biz/',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'cross-site',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',
  'authorization': EXTERNAL_AUTH_TOKEN,
  'branchid': 'all',
  'sec-ch-ua': '"Chromium";v="148", "Google Chrome";v="148", "Not/A)Brand";v="99"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'session_id': 'c8e2e460-189f-485e-8c6d-09adf3ed160c',
  'sessionid': 'c8e2e460-189f-485e-8c6d-09adf3ed160c'
};

const HEADERS_LOCAL = {
  'Content-Type': 'application/json',
  'Cookie': `__Secure-next-auth.session-token=${LOCAL_SESSION_COOKIE}`
};

async function fetchExternalClientDetails(clientId, headersExternal = HEADERS_EXTERNAL) {
  const url = `https://trabill.m360ictapi.com/api/v1/client/client-${clientId}`;
  try {
    const res = await axios.get(url, { headers: headersExternal });
    return res.data.data;
  } catch (err) {
    console.error(`    - [External Client] Error fetching details for ${clientId}:`, err.response?.data?.message || err.message);
    return null;
  }
}

async function fetchExternalClientLedger(clientId, headersExternal = HEADERS_EXTERNAL) {
  const url = `https://trabill.m360ictapi.com/api/v1/report/client-ledger/${clientId}?from_date=2024-04-18&to_date=2026-05-12`;
  try {
    const res = await axios.get(url, { headers: headersExternal });
    return res.data.data;
  } catch (err) {
    console.error(`    - [External Client] Error fetching ledger for ${clientId}:`, err.response?.data?.message || err.message);
    return null;
  }
}

async function autoCreateClient(externalClientId, localCategories, categoriesJson, localApiUrl = LOCAL_API_URL, headersLocal = HEADERS_LOCAL, headersExternal = HEADERS_EXTERNAL) {
  console.log(`    - Attempting to auto-create missing client (External ID: ${externalClientId})...`);

  const details = await fetchExternalClientDetails(externalClientId, headersExternal);
  if (!details) return null;

  const ledgerData = await fetchExternalClientLedger(externalClientId, headersExternal);
  const ledgers = ledgerData?.ledgers || [];
  let firstLedger = null;
  if (ledgers.length > 0 && !ledgers[0]?.ctrxn_voucher) {
    firstLedger = ledgers[0];
  }

  let openingBalanceType = "";
  let openingBalanceAmount = 0;
  if (firstLedger) {
    openingBalanceAmount = Math.abs(parseFloat(firstLedger.ctrxn_amount) || 0);
    openingBalanceType = firstLedger.ctrxn_type === "DEBIT" ? "Due" : "Advance";
  }

  // Map Category
  const extCat = categoriesJson.find(c => c.category_id === details.client_category_id);
  let localCatId = "";
  if (extCat) {
    const matched = localCategories.find(lc =>
      lc.name.toLowerCase() === extCat.category_title.toLowerCase() ||
      (lc.prefix && lc.prefix.toLowerCase() === extCat.category_prefix.toLowerCase())
    );
    localCatId = matched ? matched.id : "";
  }

  // Fallback if category still not found
  if (!localCatId) {
    const fallbackKeywords = ["all servic", "all service", "general", "default", "customer"];
    for (const kw of fallbackKeywords) {
      const fallbackCat = localCategories.find(lc => lc.name.toLowerCase().includes(kw));
      if (fallbackCat) {
        localCatId = fallbackCat.id;
        console.log(`    - Using fallback category: "${fallbackCat.name}" (ID: ${localCatId})`);
        break;
      }
    }
  }

  // Last resort: take the first category if any exists
  if (!localCatId && localCategories.length > 0) {
    localCatId = localCategories[0].id;
    console.log(`    - Using first available category as last resort: "${localCategories[0].name}" (ID: ${localCatId})`);
  }

  if (!localCatId) {
    console.error(`    - FAILED: No local client category found to assign. Found ${localCategories.length} categories.`);
    return null;
  }

  const payload = {
    name: details.client_name,
    clientType: details.client_type === "INDIVIDUAL" ? "Individual" : "Corporate",
    categoryId: localCatId,
    email: details.client_email || "",
    phone: details.client_mobile || "",
    address: details.client_address || "",
    gender: details.client_gender || "",
    source: details.client_source || "",
    designation: details.client_designation || "",
    tradeLicenseNo: details.client_trade_license || "",
    openingBalanceType,
    openingBalanceAmount: String(openingBalanceAmount),
    creditLimit: String(details.client_credit_limit || 0),
    walkingCustomer: details.client_walking_customer === 1 ? "Yes" : "No",
    active: details.client_activity_status === 1,
    dataEntryId: String(details.client_id),
    createdAt: details.client_created_date,
    deleted: true, // Mark as deleted as requested
  };

  try {
    const res = await axios.post(`${localApiUrl}/api/clients-manager`, payload, { headers: headersLocal });
    const newClientData = res.data?.data?.client || res.data?.client || res.data?.data || res.data;
    const clientId = newClientData.id || newClientData._id;
    console.log(`    - SUCCESS: Auto-created client "${payload.name}" (ID: ${clientId})`);
    return { id: clientId, name: payload.name, dataEntryId: payload.dataEntryId };
  } catch (err) {
    const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message;
    
    // If phone number duplicate, append external ID and retry once
    if (errorMsg.toLowerCase().includes("phone number") && errorMsg.toLowerCase().includes("exists")) {
      console.warn(`    - Phone number duplicate detected. Retrying with modified phone...`);
      payload.phone = `${payload.phone}-${payload.dataEntryId}`;
      try {
        const resRetry = await axios.post(`${localApiUrl}/api/clients-manager`, payload, { headers: headersLocal });
        const newClientData = resRetry.data?.data?.client || resRetry.data?.client || resRetry.data?.data || resRetry.data;
        const clientId = newClientData.id || newClientData._id;
        console.log(`    - SUCCESS: Auto-created client "${payload.name}" with modified phone (ID: ${clientId})`);
        return { id: clientId, name: payload.name, dataEntryId: payload.dataEntryId };
      } catch (retryErr) {
        console.error(`    - FAILED even after modifying phone:`, retryErr.response?.data?.message || retryErr.message);
        return null;
      }
    }

    console.error(`    - FAILED to auto-create client:`, errorMsg);
    if (err.response?.data?.details) {
        console.error(`      Details:`, JSON.stringify(err.response.data.details));
    }
    return null;
  }
}

async function autoCreateAccount(externalAccountId, accountName, localAccounts, localApiUrl = LOCAL_API_URL, headersLocal = HEADERS_LOCAL, headersExternal = HEADERS_EXTERNAL) {
  console.log(`    - Attempting to auto-create missing account "${accountName}" (External ID: ${externalAccountId})...`);

  // Default to Cash if we can't determine
  const CASH_ACCOUNT_TYPE_ID = "6a04073c73601487f0db2133";

  const payload = {
    name: accountName || `Account ${externalAccountId}`,
    type: "Cash",
    accountTypeId: CASH_ACCOUNT_TYPE_ID,
    accountNo: "MIGRATED",
    accountOpeningAmount: 0,
    lastBalance: 0,
    dataEntryId: String(externalAccountId),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    const res = await axios.post(`${localApiUrl}/api/accounts`, payload, { headers: headersLocal });
    const newAccount = res.data?.data || res.data;
    const accountId = newAccount.id || newAccount._id;
    console.log(`    - SUCCESS: Auto-created account "${payload.name}" (ID: ${accountId})`);
    
    const result = { id: accountId, name: payload.name, dataEntryId: String(externalAccountId) };
    localAccounts.push(result); // Cache it
    return result;
  } catch (err) {
    console.error(`    - FAILED to auto-create account:`, err.response?.data?.message || err.message);
    return null;
  }
}

async function autoCreateDeletedAccount(localAccounts, localApiUrl = LOCAL_API_URL, headersLocal = HEADERS_LOCAL) {
  const DELETED_ACCOUNT_NAME = "Deleted Account";
  const CASH_ACCOUNT_TYPE_ID = "6a04073c73601487f0db2133";
  
  // 1. Check if already exists in our local list
  let matched = localAccounts.find(a => a.name === DELETED_ACCOUNT_NAME);
  if (matched) return matched;

  console.log(`    - "Deleted Account" not found locally. Auto-creating...`);

  // 2. Prepare Payload
  const payload = {
    name: DELETED_ACCOUNT_NAME,
    type: "Cash",
    accountTypeId: CASH_ACCOUNT_TYPE_ID,
    accountNo: "DELETED",
    accountOpeningAmount: 0,
    lastBalance: 0,
    dataEntryId: "deleted-account-fallback",
    deleted: true,
  };

  try {
    const res = await axios.post(`${localApiUrl}/api/accounts`, payload, { headers: headersLocal });
    const newAccount = res.data?.data || res.data;
    const accountId = newAccount.id || newAccount._id;
    console.log(`    - SUCCESS: Auto-created "${DELETED_ACCOUNT_NAME}" (ID: ${accountId})`);
    
    const result = { id: accountId, name: DELETED_ACCOUNT_NAME, dataEntryId: "deleted-account-fallback" };
    localAccounts.push(result); // Cache it
    return result;
  } catch (err) {
    console.error(`    - FAILED to auto-create Deleted Account:`, err.response?.data?.message || err.message);
    return null;
  }
}

async function fetchExternalVendorDetails(vendorId, headersExternal = HEADERS_EXTERNAL) {
  const url = `https://trabill.m360ictapi.com/api/v1/vendors/for-edit/${vendorId}`;
  try {
    const res = await axios.get(url, { headers: headersExternal });
    return res.data.data;
  } catch (err) {
    console.error(`    - [External Vendor] Error fetching details for ${vendorId}:`, err.response?.data?.message || err.message);
    return null;
  }
}

async function fetchExternalVendorLedger(vendorId, headersExternal = HEADERS_EXTERNAL) {
  const url = `https://trabill.m360ictapi.com/api/v1/report/vendors-ledger/${vendorId}?from_date=2023-04-10&to_date=2026-05-13`;
  try {
    const res = await axios.get(url, { headers: headersExternal });
    return res.data.data;
  } catch (err) {
    console.error(`    - [External Vendor] Error fetching ledger for ${vendorId}:`, err.response?.data?.message || err.message);
    return null;
  }
}

async function autoCreateVendor(externalVendorId, localApiUrl = LOCAL_API_URL, headersLocal = HEADERS_LOCAL, headersExternal = HEADERS_EXTERNAL) {
  console.log(`    - Attempting to auto-create missing vendor (External ID: ${externalVendorId})...`);

  const details = await fetchExternalVendorDetails(externalVendorId, headersExternal);
  if (!details) return null;

  const ledgerData = await fetchExternalVendorLedger(externalVendorId, headersExternal);
  const ledgers = ledgerData?.ledgers || [];
  
  let firstLedger = null;
  if (ledgers.length > 0 && !ledgers[0]?.vtrxn_voucher) {
    firstLedger = ledgers[0];
  }

  let openingBalanceType = "due";
  let openingBalanceAmount = 0;
  if (firstLedger) {
    openingBalanceAmount = Math.abs(parseFloat(firstLedger.vtrxn_amount) || 0);
    openingBalanceType = firstLedger.vtrxn_type === "DEBIT" ? "due" : "advance";
  }

  const payload = {
    name: details.vendor_name,
    email: details.vendor_email || "",
    mobile: details.vendor_mobile || "",
    address: details.vendor_address || "",
    fixedAdvance: details.vendor_fixed_advance || 0,
    creditLimit: details.vendor_credit_limit || 0,
    registrationDate: details.vendor_registration_date,
    openingBalanceType: openingBalanceType,
    openingBalance: openingBalanceAmount,
    active: true,
    products: [], // We might not have local product mapping here
    dataEntryId: String(externalVendorId),
    createdAt: details.vendor_registration_date || new Date().toISOString(),
    deleted: true, // Mark as deleted
  };

  try {
    const res = await axios.post(`${localApiUrl}/api/vendors`, payload, { headers: headersLocal });
    const newVendor = res.data?.data || res.data;
    const vendorId = newVendor.id || newVendor._id;
    console.log(`    - SUCCESS: Auto-created vendor "${payload.name}" (ID: ${vendorId})`);
    return { id: vendorId, name: payload.name, dataEntryId: String(externalVendorId) };
  } catch (err) {
    console.error(`    - FAILED to auto-create vendor:`, err.response?.data?.message || err.message);
    return null;
  }
}

async function autoCreateDeletedVendor(localVendors, localApiUrl = LOCAL_API_URL, headersLocal = HEADERS_LOCAL) {
  const DELETED_VENDOR_NAME = "Deleted Vendor";
  
  // 1. Check if already exists in our local list
  let matched = localVendors.find(v => v.name === DELETED_VENDOR_NAME);
  if (matched) return matched;

  console.log(`    - "${DELETED_VENDOR_NAME}" not found locally. Auto-creating...`);

  // 2. Prepare Payload
  const payload = {
    name: DELETED_VENDOR_NAME,
    email: "",
    mobile: "DELETED",
    address: "DELETED",
    registrationDate: new Date().toISOString(),
    openingBalanceType: "due",
    openingBalance: 0,
    active: true,
    dataEntryId: "deleted-vendor-fallback",
    deleted: true,
  };

  try {
    const res = await axios.post(`${localApiUrl}/api/vendors`, payload, { headers: headersLocal });
    const newVendor = res.data?.data || res.data;
    const vendorId = newVendor.id || newVendor._id;
    console.log(`    - SUCCESS: Auto-created "${DELETED_VENDOR_NAME}" (ID: ${vendorId})`);
    
    const result = { id: vendorId, name: DELETED_VENDOR_NAME, dataEntryId: "deleted-vendor-fallback" };
    localVendors.push(result); // Cache it
    return result;
  } catch (err) {
    console.error(`    - FAILED to auto-create Deleted Vendor:`, err.response?.data?.message || err.message);
    return null;
  }
}

async function fetchExternalPassportDetails(passportId, headersExternal = HEADERS_EXTERNAL) {
  const url = `https://trabill.m360ictapi.com/api/v1/passport-management/${passportId}`;
  try {
    const res = await axios.get(url, { headers: headersExternal });
    return res.data.data;
  } catch (err) {
    console.error(`    - [External Passport] Error fetching details for ${passportId}:`, err.response?.data?.message || err.message);
    return null;
  }
}

async function autoCreateNonInvoiceCompany(externalCompanyId, localApiUrl = LOCAL_API_URL, headersLocal = HEADERS_LOCAL, headersExternal = HEADERS_EXTERNAL) {
  console.log(`    - Attempting to auto-create missing non-invoice company (External ID: ${externalCompanyId})...`);

  // The view-all API seems to be the source for these companies
  const url = `https://trabill.m360ictapi.com/api/v1/configuration/companies/view-all`;
  try {
    const res = await axios.get(url, { headers: headersExternal });
    const allCompanies = res.data.data || [];
    const details = allCompanies.find(c => String(c.company_id) === String(externalCompanyId));

    if (!details) {
      console.warn(`    - WARNING: External company ID ${externalCompanyId} not found in view-all list.`);
      return null;
    }

    const payload = {
      name: details.company_name,
      contactPerson: details.company_contact_person || "",
      designation: details.company_designation || "",
      phone: details.company_phone || "",
      address: details.company_address || "",
      dataEntryId: String(details.company_id),
      createdAt: details.company_create_date || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const createRes = await axios.post(`${localApiUrl}/api/configuration/companies`, payload, { headers: headersLocal });
    const newCompany = createRes.data?.data || createRes.data;
    const companyId = newCompany.id || newCompany._id;
    console.log(`    - SUCCESS: Auto-created non-invoice company "${payload.name}" (ID: ${companyId})`);
    return { id: companyId, name: payload.name, dataEntryId: payload.dataEntryId };
  } catch (err) {
    console.error(`    - FAILED to auto-create non-invoice company:`, err.response?.data?.message || err.message);
    return null;
  }
}

async function getLocalData(endpoint, localApiUrl = LOCAL_API_URL, headersLocal = HEADERS_LOCAL) {
  try {
    const res = await axios.get(`${localApiUrl}${endpoint}`, { headers: headersLocal });
    const data = res.data?.data;
    if (endpoint.includes("/api/passports") && res.data?.passports) return res.data.passports;
    if (endpoint.includes("/api/airlines") && res.data?.data) return res.data.data.items || [];
    if (Array.isArray(data)) return data;
    if (data?.items && Array.isArray(data.items)) return data.items;
    if (data?.clients && Array.isArray(data.clients)) return data.clients;
    if (res.data?.employees && Array.isArray(res.data.employees)) return res.data.employees;
    if (Array.isArray(res.data)) return res.data;
    if (res.data?.items && Array.isArray(res.data.items)) return res.data.items;
    return [];
  } catch (err) {
    console.error(`  - [Local] Error fetching ${endpoint}:`, err.response?.data?.message || err.message);
    return [];
  }
}

/**
 * Extracts the numeric part of a voucher (e.g. "INV-0042" -> 42)
 */
function extractVoucherNumber(voucherNo) {
  if (!voucherNo) return 0;
  const parts = String(voucherNo).split('-');
  const numericPart = parts[parts.length - 1];
  const val = parseInt(numericPart);
  return isNaN(val) ? 0 : val;
}

async function syncCounter(lastVoucherNo, localApiUrl = LOCAL_API_URL, headersLocal = HEADERS_LOCAL) {
  if (!lastVoucherNo) return;
  
  // Extract prefix and number from voucher (e.g., "INV-0042" -> prefix: INV, lastValue: 42)
  const parts = String(lastVoucherNo).split('-');
  if (parts.length < 2) {
    console.warn(`    - [Counter Sync] Invalid voucher format: "${lastVoucherNo}". Expected PREFIX-NUMBER.`);
    return;
  }

  const prefix = parts[0].toUpperCase();
  const lastValue = extractVoucherNumber(lastVoucherNo);
  
  if (lastValue === 0) {
    console.warn(`    - [Counter Sync] Could not parse numeric value from "${lastVoucherNo}"`);
    return;
  }

  console.log(`    - [Counter Sync] Syncing ${prefix} to ${lastValue}...`);
  try {
    const res = await axios.post(`${localApiUrl}/api/counters/sync`, { prefix, lastValue }, { headers: headersLocal });
    console.log(`    - [Counter Sync] SUCCESS: ${prefix} now at ${res.data.updatedSeq}`);
  } catch (err) {
    console.error(`    - [Counter Sync] FAILED:`, err.response?.data?.message || err.message);
  }
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
  EXTERNAL_AUTH_TOKEN,
  LOCAL_API_URL,
  LOCAL_SESSION_COOKIE,
  HEADERS_EXTERNAL,
  HEADERS_LOCAL,
  fetchExternalClientDetails,
  fetchExternalClientLedger,
  autoCreateClient,
  autoCreateAccount,
  autoCreateDeletedAccount,
  fetchExternalVendorDetails,
  fetchExternalVendorLedger,
  autoCreateVendor,
  autoCreateDeletedVendor,
  autoCreateNonInvoiceCompany,
  fetchExternalPassportDetails,
  getLocalData,
  extractVoucherNumber,
  syncCounter,
  sleep
};
