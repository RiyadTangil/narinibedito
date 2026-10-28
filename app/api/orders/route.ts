import { NextRequest } from "next/server";
import connectMongoose from "@/lib/mongoose";
import { Order } from "@/models/order";
import { ORDER_STATUS, PAYMENT_METHOD } from "@/lib/constants/order-constants";
import { ok, fail, badRequest, notFound } from "@/utils/api-response";

export async function GET(req: NextRequest) {
  try {
    await connectMongoose();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);

    const query: Record<string, any> = {};

    if (status && status !== "all") {
      const numericStatus = parseInt(status, 10);
      if (!isNaN(numericStatus)) {
        query.status = numericStatus;
      }
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { orderNumber: searchRegex },
        { customerName: searchRegex },
        { phone: searchRegex },
        { address: searchRegex },
      ];
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Summary statistics for dashboard widgets
    const allOrders = await Order.find({}).select("status totalAmount").lean();
    const stats = {
      total: allOrders.length,
      pending: allOrders.filter((o) => o.status === ORDER_STATUS.PENDING).length,
      confirmed: allOrders.filter((o) => o.status === ORDER_STATUS.CONFIRMED).length,
      processing: allOrders.filter((o) => o.status === ORDER_STATUS.PROCESSING).length,
      shipped: allOrders.filter((o) => o.status === ORDER_STATUS.SHIPPED).length,
      delivered: allOrders.filter((o) => o.status === ORDER_STATUS.DELIVERED).length,
      cancelled: allOrders.filter((o) => o.status === ORDER_STATUS.CANCELLED).length,
      totalRevenue: allOrders
        .filter((o) => o.status !== ORDER_STATUS.CANCELLED)
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0),
    };

    return ok(orders, 200, "Orders fetched successfully", {
      total,
      page,
      limit,
      stats,
    });
  } catch (error: any) {
    console.error("GET /api/orders error:", error);
    return fail(error, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectMongoose();
    const body = await req.json();

    const {
      customerName,
      phone,
      address,
      deliveryArea = "outside_dhaka",
      deliveryFee = 130,
      items,
      note = "",
      paymentMethod = PAYMENT_METHOD.CASH_ON_DELIVERY,
    } = body;

    // Form validations
    if (!customerName || !customerName.trim()) {
      return badRequest("অনুগ্রহ করে আপনার নাম প্রদান করুন");
    }

    if (!phone || !phone.trim()) {
      return badRequest("অনুগ্রহ করে মোবাইল নম্বর প্রদান করুন");
    }

    const cleanPhone = phone.replace(/[^0-9]/g, "");
    if (cleanPhone.length < 10) {
      return badRequest("সঠিক মোবাইল নম্বর প্রদান করুন (১০-১১ ডিজিট)");
    }

    if (!address || !address.trim()) {
      return badRequest("অনুগ্রহ করে সম্পূর্ণ ডেলিভারি ঠিকানা প্রদান করুন");
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return badRequest("অর্ডারে কোনো পণ্য পাওয়া যায়নি");
    }

    // Calculate subtotal
    const calculatedSubtotal = items.reduce(
      (sum: number, item: any) => sum + Number(item.price) * Number(item.quantity || 1),
      0
    );

    const fee = Number(deliveryFee) || (deliveryArea === "inside_dhaka" ? 60 : 130);
    const totalAmount = calculatedSubtotal + fee;

    // Generate readable orderNumber: NN-YYMMDD-XXXX
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `NN-${yy}${mm}${dd}-${randomSuffix}`;

    const newOrder = await Order.create({
      orderNumber,
      customerName: customerName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      deliveryArea,
      deliveryFee: fee,
      items: items.map((it: any) => ({
        productId: it.productId || it.id || "",
        name: it.name,
        price: Number(it.price),
        quantity: Number(it.quantity || 1),
        size: it.size || "",
        image: it.image || "/images/products/churi-alna.jpg",
      })),
      subtotal: calculatedSubtotal,
      totalAmount,
      status: ORDER_STATUS.PENDING,
      paymentMethod,
      paymentStatus: 1, // Unpaid (Cash On Delivery)
      note: (note || "").trim(),
    });

    return ok(newOrder, 201, "আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে!");
  } catch (error: any) {
    console.error("POST /api/orders error:", error);
    return fail(error, 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await connectMongoose();
    const body = await req.json();
    const { id, status, paymentStatus, note } = body;

    if (!id) {
      return badRequest("Order ID required");
    }

    const updatePayload: Record<string, any> = {};
    if (typeof status === "number") {
      updatePayload.status = status;
    }
    if (typeof paymentStatus === "number") {
      updatePayload.paymentStatus = paymentStatus;
    }
    if (typeof note === "string") {
      updatePayload.note = note;
    }

    const updated = await Order.findByIdAndUpdate(id, updatePayload, { new: true });

    if (!updated) {
      return notFound("অর্ডার পাওয়া যায়নি");
    }

    return ok(updated, 200, "অর্ডার আপডেট সম্পন্ন হয়েছে");
  } catch (error: any) {
    console.error("PATCH /api/orders error:", error);
    return fail(error, 500);
  }
}
