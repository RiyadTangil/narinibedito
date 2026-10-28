const axios = require('axios');
const fs = require('fs');
const path = require('path');
const {
  autoCreateClient,
  autoCreateVendor,
  EXTERNAL_AUTH_TOKEN,
  LOCAL_API_URL,
  LOCAL_SESSION_COOKIE,
  HEADERS_EXTERNAL,
  HEADERS_LOCAL,
  getLocalData,
  extractVoucherNumber,
  sleep,
  syncCounter
} = require('./migration-helpers');

/**
 * OTHER INVOICE MIGRATION SCRIPT
 * 
 * Step 1: Get 'other' invoice list from third-party API
 * Step 2: Fetch local data (Clients, Products, Vendors, TransportTypes, Passports) for mapping
 * Step 3: For each invoice, fetch detailed data from external API
 * Step 4: Map external data to local payload
 * Step 5: Call local create-invoice API
 */

const roomtype = [
  {
    "rtype_id": 12,
    "rtype_name": "Adjacent Room",
    "rtype_create_date": "2023-06-21T08:11:46.000Z",
    "agency_id": null
  },
  {
    "rtype_id": 11,
    "rtype_name": "Adjoining Room",
    "rtype_create_date": "2023-06-21T08:11:46.000Z",
    "agency_id": null
  },
  {
    "rtype_id": 15,
    "rtype_name": "Cabana Room",
    "rtype_create_date": "2023-06-21T08:11:46.000Z",
    "agency_id": null
  },
  {
    "rtype_id": 3,
    "rtype_name": "Double Room",
    "rtype_create_date": "2023-06-21T08:11:46.000Z",
    "agency_id": null
  },
  {
    "rtype_id": 7,
    "rtype_name": "Double-Double Room",
    "rtype_create_date": "2023-06-21T08:11:46.000Z",
    "agency_id": null
  },
  {
    "rtype_id": 17,
    "rtype_name": "Duplex Room",
    "rtype_create_date": "2023-06-21T08:11:46.000Z",
    "agency_id": null
  },
  {
    "rtype_id": 18,
    "rtype_name": "Efficiency Room",
    "rtype_create_date": "2023-06-21T08:11:46.000Z",
    "agency_id": null
  },
  {
    "rtype_id": 6,
    "rtype_name": "Hollywood Twin Room",
    "rtype_create_date": "2023-06-21T08:11:46.000Z",
    "agency_id": null
  },
  {
    "rtype_id": 19,
    "rtype_name": "Hospitality Room",
    "rtype_create_date": "2023-06-21T08:11:46.000Z",
    "agency_id": null
  },
  {
    "rtype_id": 10,
    "rtype_name": "Interconnecting Room",
    "rtype_create_date": "2023-06-21T08:11:46.000Z",
    "agency_id": null
  },
  {
    "rtype_id": 8,
    "rtype_name": "King Room",
    "rtype_create_date": "2023-06-21T08:11:46.000Z",
    "agency_id": null
  },
  {
    "rtype_id": 21,
    "rtype_name": "Lanai Room",
    "rtype_create_date": "2023-06-21T08:11:46.000Z",
    "agency_id": null
  },
  {
    "rtype_id": 13,
    "rtype_name": "Parlour Room",
    "rtype_create_date": "2023-06-21T08:11:46.000Z",
    "agency_id": null
  },
  {
    "rtype_id": 20,
    "rtype_name": "Penthouse Room",
    "rtype_create_date": "2023-06-21T08:11:46.000Z",
    "agency_id": null
  },
  {
    "rtype_id": 5,
    "rtype_name": "Quad Room",
    "rtype_create_date": "2023-06-21T08:11:46.000Z",
    "agency_id": null
  },
  {
    "rtype_id": 9,
    "rtype_name": "Queen Room",
    "rtype_create_date": "2023-06-21T08:11:46.000Z",
    "agency_id": null
  },
  {
    "rtype_id": 1,
    "rtype_name": "Single Room",
    "rtype_create_date": "2023-06-21T08:11:46.000Z",
    "agency_id": null
  },
  {
    "rtype_id": 14,
    "rtype_name": "Studio Room",
    "rtype_create_date": "2023-06-21T08:11:46.000Z",
    "agency_id": null
  },
  {
    "rtype_id": 16,
    "rtype_name": "Suite Room",
    "rtype_create_date": "2023-06-21T08:11:46.000Z",
    "agency_id": null
  },
  {
    "rtype_id": 4,
    "rtype_name": "Triple Room",
    "rtype_create_date": "2023-06-21T08:11:46.000Z",
    "agency_id": null
  },
  {
    "rtype_id": 2,
    "rtype_name": "Twin Room",
    "rtype_create_date": "2023-06-21T08:11:46.000Z",
    "agency_id": null
  }
]

async function fetchExternalInvoiceList(page = 1, size = 1000) {
  const url = `https://trabill.m360ictapi.com/api/v1/invoice-others/all?page=${page}&size=${size}&from_date=&to_date=&search=`;
  console.log(`  - [External] Fetching List: ${url}`);
  try {
    const res = await axios.get(url, { headers: HEADERS_EXTERNAL });
    return res.data.data || [];
  } catch (err) {
    console.error(`  - [External] Error fetching invoice list:`, err.response?.data?.message || err.message);
    return [];
  }
}

async function fetchExternalInvoiceDetails(invoiceId) {
  const url = `https://trabill.m360ictapi.com/api/v1/invoice-others/get-for-edit/${invoiceId}`;
  try {
    const res = await axios.get(url, { headers: HEADERS_EXTERNAL });
    return res.data.data;
  } catch (err) {
    console.error(`  - [External] Error fetching details for invoice ${invoiceId}:`, err.response?.data?.message || err.message);
    return null;
  }
}

async function findLocalClientByDataEntryId(dataEntryId) {
  try {
    const res = await axios.get(`${LOCAL_API_URL}/api/clients-manager?search=${dataEntryId}`, { headers: HEADERS_LOCAL });
    const data = res.data?.data;
    const clients = data?.clients || (Array.isArray(data) ? data : []);

    // Exact match check
    const matched = clients.find(c => String(c.dataEntryId) === String(dataEntryId));
    return matched ? (matched.id || matched._id) : null;
  } catch (err) {
    console.error(`    - Error searching local client for ${dataEntryId}:`, err.message);
    return null;
  }
}

async function migrate() {
  const args = process.argv.slice(2);
  const startIndex = parseInt(args[0]) || 0;
  const endIndex = parseInt(args[1]) || 1000;

  if (!LOCAL_SESSION_COOKIE) {
    console.error('ERROR: Please provide LOCAL_SESSION_COOKIE in the script configuration.');
    process.exit(1);
  }

  try {
    console.log('Fetching local data for mapping...');
    const clients = await getLocalData('/api/clients-manager?page=1&limit=2000');
    const products = await getLocalData('/api/products?pageSize=10000');
    const vendors = await getLocalData('/api/vendors?pageSize=10000');
    const localTransportTypes = await getLocalData('/api/transport-types?pageSize=10000');
    const passports = await getLocalData('/api/passports?page=1&limit=500');
    const airlines = await getLocalData('/api/airlines?selection=true&page=1&limit=200');
    const localClientCategories = await getLocalData('/api/clients/client-categories?pageSize=1000');
    const localAgents = await getLocalData('/api/agents?pageSize=10000');
    const localEmployees = await getLocalData('/api/employees?pageSize=10000');
    const categoriesJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'client_category.json'), 'utf8'));

    console.log(`Found ${clients.length} clients, ${products.length} products, ${vendors.length} vendors, ${localTransportTypes.length} transport types, ${passports.length} passports, ${airlines.length} airlines, ${localAgents.length} agents, ${localEmployees.length} employees, and ${localClientCategories.length} client categories locally.`);

    const clientMap = new Map(clients.filter(c => c.dataEntryId).map(c => [String(c.dataEntryId), c.id]));
    const agentMap = new Map(localAgents.filter(a => a.dataEntryId).map(a => [String(a.dataEntryId), a.id]));
    const employeeMap = new Map(localEmployees.filter(e => e.dataEntryId).map(e => [String(e.dataEntryId), e.id]));
    const transportTypeMap = new Map(localTransportTypes.filter(t => t.dataEntryId).map(t => [String(t.dataEntryId), t.id]));
    const productMap = new Map(products.filter(p => p.dataEntryId).map(p => [String(p.dataEntryId), p.id]));
    const vendorMap = new Map(vendors.filter(v => v.dataEntryId).map(v => [String(v.dataEntryId), v.id]));
    const passportMap = new Map(passports.filter(p => p.dataEntryId).map(p => [String(p.dataEntryId), p.id]));
    const airlineMap = new Map(airlines?.map(a => [String(a.id), a._id]) || []);

    console.log('Fetching external invoice list...');
    const invoiceList = await fetchExternalInvoiceList();
    console.log(`Found ${invoiceList.length} 'other' invoices on external API.`);

    const range = invoiceList.slice(startIndex, endIndex);
    console.log(`Processing range ${startIndex} to ${endIndex} (${range.length} invoices)...`);

    let maxInvoiceNo = '';
    let maxInvoiceVal = 0;

    for (let i = 0; i < range.length; i++) {
      const extItem = range[i];
      const invoiceNo = extItem.invoice_no;
      console.log(`[${startIndex + i + 1}/${Math.min(endIndex, invoiceList.length)}] Migrating Invoice: ${invoiceNo} (ID: ${extItem.invoice_id})...`);

      // Track max invoice for counter sync
      const vVal = extractVoucherNumber(invoiceNo);
      if (vVal > maxInvoiceVal) {
        maxInvoiceVal = vVal;
        maxInvoiceNo = invoiceNo;
      }

      // 1. Fetch Detailed Data
      const details = await fetchExternalInvoiceDetails(extItem.invoice_id);
      // console.log("details => ", details.billing_information);
      if (!details) continue;

      // 2. Map Client
      const externalClientId = details.invoice_combclient_id ? details.invoice_combclient_id.replace('client-', '') : null;
      let localClientId = clientMap.get(String(externalClientId));

      if (!localClientId && externalClientId) {
        console.warn(`  - WARNING: Local client for external ID "${externalClientId}" not found in initial list. Checking local API...`);
        localClientId = await findLocalClientByDataEntryId(externalClientId);
        if (localClientId) {
          console.log(`    - Found client in local API (ID: ${localClientId})`);
          clientMap.set(String(externalClientId), localClientId);
        }
      }

      if (!localClientId && externalClientId) {
        console.warn(`  - WARNING: Client still not found. Auto-creating...`);
        const newClient = await autoCreateClient(externalClientId, localClientCategories, categoriesJson, LOCAL_API_URL, HEADERS_LOCAL, HEADERS_EXTERNAL);
        if (newClient) {
          localClientId = newClient.id;
          clientMap.set(String(externalClientId), localClientId);
        }
      }

      if (!localClientId) {
        console.warn(`  - SKIPPING: Could not find or create local client for external ID "${externalClientId}".`);
        continue;
      }

      // Map Agent
      let localAgentId = "";
      const externalAgentId = details.invoice_agent_id;
      if (externalAgentId) {
        localAgentId = agentMap.get(String(externalAgentId)) || "";
        if (!localAgentId) {
          console.error(`  - SKIPPING: Agent ${externalAgentId} not found locally for invoice ${invoiceNo}.`);
          continue;
        }
        console.log(`    - Mapped agent: ${externalAgentId} -> ${localAgentId}`);
      }

      // Map Employee
      let localEmployeeId = null;
      const externalEmployeeId = details.invoice_sales_man_id;
      if (externalEmployeeId) {
        localEmployeeId = employeeMap.get(String(externalEmployeeId));
        if (!localEmployeeId) {
          console.error(`  - SKIPPING: Sales person (Employee) ${externalEmployeeId} not found locally for invoice ${invoiceNo}.`);
          continue;
        }
        console.log(`    - Mapped employee: ${externalEmployeeId} -> ${localEmployeeId}`);
      } else {
        console.error(`  - SKIPPING: No sales person (Employee) ID provided for invoice ${invoiceNo}.`);
        continue;
      }

      // 3. Map Billing Items
      // console.log("details.billing_information => ",details.billing_information)
      let totalCostSum = 0;
      const billingItems = [];
      const billingInformation = (details.billing_information || []);
      
      for (let index = 0; index < billingInformation.length; index++) {
        const bi = billingInformation[index];
        const extVendorId = bi.billing_comvendor ? String(bi.billing_comvendor).replace('vendor-', '') : '';
        const localProdId = productMap.get(String(bi.billing_product_id));
        let localVendorId = vendorMap.get(extVendorId);

        if (!localVendorId && extVendorId) {
          console.warn(`  - WARNING: Vendor ${extVendorId} not found locally. Auto-creating...`);
          const newVendor = await autoCreateVendor(extVendorId, LOCAL_API_URL, HEADERS_LOCAL, HEADERS_EXTERNAL);
          if (newVendor) {
            localVendorId = newVendor.id;
            vendorMap.set(extVendorId, localVendorId);
          }
        }

        const cost = parseFloat(bi.billing_cost_price || 0);
        const qty = parseFloat(bi.billing_quantity || 1);
        
        if (localProdId) {
          totalCostSum += (cost * qty);
          billingItems.push({
            id: String(index + 1),
            product: localProdId, // Zod expects 'product' as the ID string
            vendor: localVendorId || "",  // Zod expects 'vendor' as the ID string
            paxName: bi.pax_name || "",
            description: bi.billing_description || "",
            quantity: qty,
            unitPrice: parseFloat(bi.billing_unit_price || 0),
            costPrice: cost,
            totalSales: parseFloat(bi.billing_subtotal || 0),
            totalCost: cost * qty,
            profit: parseFloat(bi.billing_profit || 0)
          });
        }
      }
      // console.log("billingItems => ", billingItems);
      if (billingItems.length === 0) {
        console.warn(`  - WARNING: No valid billing items for invoice ${extItem.invoice_id}. Skipping...`);
        continue;
      }

      // 4. Map Global Details
      const mappedPassports = (details.passport_information || []).map((p, index) => ({
        id: String(index + 1),
        passportId: passportMap.get(String(p.passport_id)) || undefined,
        passportNo: p.passport_passport_no || "",
        name: p.passport_name || "",
        email: p.passport_email || "",
        contactNo: p.passport_mobile_no || "",
        dateOfBirth: p.passport_date_of_birth ? p.passport_date_of_birth.slice(0, 10) : "",
        dateOfIssue: p.passport_date_of_issue ? p.passport_date_of_issue.slice(0, 10) : "",
        dateOfExpire: p.passport_date_of_expire ? p.passport_date_of_expire.slice(0, 10) : "",
        paxType: p.passport_pax_type || ""
      }));

      const mappedTickets = (details.ticketInfo || []).map((t, index) => ({
        id: String(index + 1),
        ticketNo: t.ticket_no || "",
        pnr: t.ticket_pnr || "",
        route: t.ticket_route || "",
        airlineId: airlineMap.get(String(t.ticket_airline_id))+"" || undefined,
        journeyDate: t.ticket_journey_date ? t.ticket_journey_date.slice(0, 10) : "",
        returnDate: t.ticket_return_date ? t.ticket_return_date.slice(0, 10) : "",
        referenceNo: t.ticket_reference_no || "",
        gdsPnr: t.ticket_gds_pnr || "",
        ticketType: t.ticket_type || "",
        airbusClass: t.ticket_class || "",
        issueDate: t.ticket_issue_date ? t.ticket_issue_date.slice(0, 10) : ""
      }));

      const mappedHotels = (details.hotel_information || []).map((h, index) => {
        const matchedRoomType = roomtype.find(rt => rt.rtype_id === h.hotel_room_type_id);
        return {
          id: String(index + 1),
          hotelName: h.hotel_name || "",
          referenceNo: h.hotel_reference_no || "",
          checkInDate: h.hotel_check_in_date ? h.hotel_check_in_date.slice(0, 10) : "",
          checkOutDate: h.hotel_check_out_date ? h.hotel_check_out_date.slice(0, 10) : "",
          roomType: matchedRoomType ? matchedRoomType.rtype_name : ""
        };
      });

      const mappedTransports = (details.transport_information || []).map((tr, index) => {
        // Extract HH:mm from "YYYY-MM-DD HH:mm:ss.SSS"
        const extractTime = (dateTimeStr) => {
          if (!dateTimeStr) return "00:00";
          const parts = dateTimeStr.split(' ');
          if (parts.length > 1) {
            return parts[1].slice(0, 5); // Gets HH:mm
          }
          return "00:00";
        };

        const localTTypeId = transportTypeMap.get(String(tr.transport_type_id));
        if (!localTTypeId) {
          console.warn(`    - WARNING: Transport type ${tr.transport_type_id} (${tr.transport_type_name}) not found locally for invoice ${invoiceNo}.`);
        }

        return {
          id: String(index + 1),
          transportTypeId: localTTypeId || "",
          transportType: tr.transport_type_name || "",
          referenceNo: tr.transport_reference_no || "",
          pickupPlace: tr.transport_pickup_place || "",
          pickupTime: extractTime(tr.transport_pickup_time),
          dropOffPlace: tr.transport_dropoff_place || "",
          dropoffTime: extractTime(tr.transport_dropoff_time)
        };
      });

      // 5. Prepare Payload
      const netTotal = parseFloat(details.invoice_net_total || 0);
      const payload = {
        general: {
          invoiceNo: details.invoice_no,
          clientId: localClientId,
          employeeId: localEmployeeId,
          agentId: localAgentId,
          salesDate: details.invoice_sales_date?.slice(0, 10),
          dueDate: details.invoice_due_date ? details.invoice_due_date.slice(0, 10) : details.invoice_sales_date?.slice(0, 10),
        },
        billing: {
          items: billingItems,
          subtotal: parseFloat(details.invoice_sub_total || 0),
          totalCost: totalCostSum,
          discount: parseFloat(details.invoice_discount || 0),
          serviceCharge: parseFloat(details.invoice_service_charge || 0),
          vatTax: parseFloat(details.invoice_vat || 0),
          netTotal: netTotal,
          note: details.invoice_note || "",
          reference: details.invoice_reference || "",
        },
        passport: mappedPassports,
        ticket: mappedTickets,
        hotel: mappedHotels,
        transport: mappedTransports,
        moneyReceipt: {
          paymentMethod: "",
          paymentMethodId: "",
          accountId: "",
          accountName: "",
          amount: 0,
          discount: 0,
          transNo: "",
          paymentDate: "",
          receiptNo: "",
          note: "",
          showPrevDue: "no",
          showDiscount: "yes"
        },
        invoiceType: "other",
        showPrevDue: details.invoice_show_prev_due === 1,
        showDiscount: details.invoice_show_discount === 1,
        agentCommission: parseFloat(details.invoice_agent_com_amount || 0),
        clientPreviousDue: Math.max(0, parseFloat(details.invoice_client_previous_due || 0))
      };

      // // 6. Call Local API
      // console.log("payload => ", payload)
      // console.log("items  => ", payload.billing.items[0])
      try {
        const res = await axios.post(`${LOCAL_API_URL}/api/invoices`, payload, { headers: HEADERS_LOCAL });
        console.log(`  - SUCCESS: Invoice added (ID: ${res.data.id || res.data.data?.id})`);

        // Brief sleep to prevent overwhelming the server
        await sleep(1000);
      } catch (err) {
        console.error(`  - FAILED:`, err.response?.data?.message || err.message);
        if (err.response?.data?.details) {
          console.error(`    Details:`, JSON.stringify(err.response.data.details));
        }
      }
    }

    // Sync counter after migration
    if (maxInvoiceNo) {
      await syncCounter(maxInvoiceNo);
    }

    console.log('\nMigration completed.');
  } catch (error) {
    console.error('Critical Error:', error.message);
  }
}

migrate();
