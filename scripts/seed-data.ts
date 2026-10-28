import mongoose from "mongoose";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
import { Category } from "../models/category";
import { Product } from "../models/product";
import { Order } from "../models/order";
import { Review } from "../models/review";
import { ORDER_STATUS, PAYMENT_METHOD } from "../lib/constants/order-constants";

const CATEGORIES_DATA = [
  {
    id: "churi-alna",
    title: "চুড়ি আলনা ও শোকেস",
    subtitle: "Handcrafted Bangle Showcase",
    count: "১৪০+ ডজন ধারণক্ষমতা",
    image: "/images/products/churi-alna.jpg",
    badge: "সেরা বিক্রিত",
    order: 1,
    status: 1,
  },
  {
    id: "home-decor",
    title: "হোম মন্দির ও ডেকোর",
    subtitle: "Backlit Wooden Mandir",
    count: "এলইডি ব্যাকলিট ডিজাইন",
    image: "/images/products/home-mandir.jpg",
    badge: "কাস্টমাইজড",
    order: 2,
    status: 1,
  },
  {
    id: "jewellery",
    title: "ঐতিহ্যবাহী চুড়ি ও গহনা",
    subtitle: "Reshmi & Bridal Bangles",
    count: "রেশমি ও কাচের কালেকশন",
    image: "/images/products/reshmi-churi.jpg",
    badge: "হট কালেকশন",
    order: 3,
    status: 1,
  },
  {
    id: "organizer",
    title: "জুয়েলারি বক্স ও কেবিনেট",
    subtitle: "Multi-layer Organizer",
    count: "ভেলভেট ড্রয়ার ও চাবি লক",
    image: "/images/products/jewelry-box.jpg",
    badge: "রয়্যাল ফিনিশ",
    order: 4,
    status: 1,
  },
  {
    id: "lighting",
    title: "শোপিস ও ফেয়ারি লাইটিং",
    subtitle: "Showpieces & Fairy Lights",
    count: "হ্যান্ডমেড বোটল আর্ট",
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80",
    badge: "গিফট চয়েস",
    order: 5,
    status: 1,
  },
  {
    id: "clothing",
    title: "পোশাক ও উৎসবের কুর্তি",
    subtitle: "Women's Festive Outfits",
    count: "ট্রেন্ডি ও প্রিমিয়াম ফেব্রিক",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80",
    badge: "নিউ অ্যারাইভাল",
    order: 6,
    status: 1,
  },
  {
    id: "accessories",
    title: "ব্যাগ ও লেডিস এক্সেসরিজ",
    subtitle: "Luxury Bags & Clutches",
    count: "স্টাইলিশ হ্যান্ডব্যাগ",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80",
    badge: "ট্রেন্ডি",
    order: 7,
    status: 1,
  },
  {
    id: "beauty",
    title: "বিউটি, স্কিনকেয়ার ও গিফট",
    subtitle: "Cosmetics & Fragrance",
    count: "সৌন্দর্য ও উপহার সামগ্রী",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80",
    badge: "জনপ্রিয়",
    order: 8,
    status: 1,
  },
];

const PRODUCTS_DATA = [
  {
    sku: "NN-ALNA-01",
    name: "এক্সক্লুসিভ ডাবল ডোর কাঠের চুড়ি আলনা (১৪০ ডজন ধারণক্ষমতা)",
    category: "চুড়ি আলনা ও শোকেস",
    categorySlug: "churi-alna",
    price: 2250,
    originalPrice: 2650,
    discount: "১৫% ছাড়",
    rating: 5.0,
    reviews: 48,
    badge: "সেরা বিক্রিত",
    highlight: "স্বচ্ছ গ্লাস ডোর • সিকিউরিটি লক ও চাবি • ১৪০ ডজন ধারণক্ষমতা • অর্গানাইজার ড্রয়ার",
    description: "আপনার প্রিয় চুড়ি ও অলংকারগুলো সুরক্ষিত ও পরিপাটি রাখতে নারী নিবেদিতের তৈরি ১০০% আসল মেহগনি কাঠের চুড়ি আলনা। বাইরে থেকে পুরো কালেকশন দৃশ্যমান থাকে এবং চাবি লক সিস্টেম থাকায় মূল্যবান অলংকার থাকে শতভাগ নিরাপদ।",
    size: "২১\" x ১৬\" সাইজ",
    material: "আসল পালিশ কাঠ ও উচ্চমানের স্বচ্ছ গ্লাস",
    image: "/images/products/churi-alna.jpg",
    secondaryImages: [
      "/images/products/jewelry-box.jpg",
      "/images/products/reshmi-churi.jpg"
    ],
    stock: 25,
    inStock: true,
    status: 1,
    whatsappMsg: "আমি 'ডাবল ডোর কাঠের চুড়ি আলনা (২২৫০ টাকা)' অর্ডার করতে চাই।",
  },
  {
    sku: "NN-MANDIR-02",
    name: "কাস্টমাইজড উডেন হোম মন্দির (ওম ও গণেশ এলইডি ব্যাকলিট)",
    category: "হোম মন্দির ও ডেকোর",
    categorySlug: "home-decor",
    price: 3450,
    originalPrice: 4200,
    discount: "১৮% ছাড়",
    rating: 4.9,
    reviews: 32,
    badge: "কাস্টমাইজড",
    highlight: "সুক্ষ্ম লেজার কাটিং • ইন-বিল্ট ওয়ার্ম গোল্ডেন এলইডি লাইট • এক্রিলিক প্রোটেকশন",
    description: "ঘরের পূজা ও প্রার্থনা স্থানকে আলোকিত করতে সুক্ষ্ম লেজার কাটিংয়ে তৈরি কাঠের হোম মন্দির। ইন-বিল্ট ওয়ার্ম এলইডি লাইটের সোনালী আলো ঘরের পরিবেশকে করে তোলে স্নিগ্ধ ও পবিত্র।",
    size: "২৪\" x ১৮\" ওয়াল মাউন্ট ও টেবিলটপ",
    material: "উন্নত এইচডিএফ কাঠ ও এক্রিলিক আর্ট",
    image: "/images/products/home-mandir.jpg",
    secondaryImages: [
      "/images/products/churi-alna.jpg"
    ],
    stock: 12,
    inStock: true,
    status: 1,
    whatsappMsg: "আমি 'কাস্টমাইজড উডেন হোম মন্দির (৩৪৫০ টাকা)' অর্ডার করতে চাই।",
  },
  {
    sku: "NN-CHURI-03",
    name: "উৎসবের রেশমি কাচের চুড়ি স্পেশাল কম্বো সেট (৬০ পিস)",
    category: "ঐতিহ্যবাহী চুড়ি ও গহনা",
    categorySlug: "jewellery",
    price: 580,
    originalPrice: 720,
    discount: "২০% ছাড়",
    rating: 4.9,
    reviews: 65,
    badge: "নতুন কালেকশন",
    highlight: "ঐতিহ্যবাহী নিখুঁত রেশমি চুড়ি • আকর্ষণীয় মাল্টিকালার কম্বো",
    description: "বিয়ে, উৎসব বা যেকোনো বিশেষ মুহূর্তের সাজে ঐতিহ্যবাহী রেশমি কাচের চুড়ির জমকালো কম্বো। প্রতিটি চুড়ি নিখুঁত সাইজ ও কালার গ্যারান্টিযুক্ত।",
    size: "সাইজ ২.৪, ২.৬, ২.৮ এভেইলেবল",
    material: "প্রিমিয়াম গ্লাস ও সিল্ক থ্রেড",
    image: "/images/products/reshmi-churi.jpg",
    secondaryImages: [],
    stock: 80,
    inStock: true,
    status: 1,
    whatsappMsg: "আমি 'রেশমি কাচের চুড়ি কম্বো সেট (৫৮০ টাকা)' অর্ডার করতে চাই।",
  },
  {
    sku: "NN-BOX-04",
    name: "এম্বিয়েন্ট এলইডি লাইটিংসহ ড্রয়ারযুক্ত রয়্যাল চুড়ি বক্স",
    category: "চুড়ি আলনা ও শোকেস",
    categorySlug: "churi-alna",
    price: 1950,
    originalPrice: 2350,
    discount: "১৭% ছাড়",
    rating: 4.9,
    reviews: 41,
    badge: "ট্রেন্ডিং",
    highlight: "ওয়ার্ম হোয়াইট এলইডি • আলাদা রিং ও গহনার ড্রয়ার • ভেলভেট কুশন",
    description: "ড্রেসিং টেবিলে রাখার জন্য আকর্ষণীয় কাঁচের টপ ও নরম ভেলভেট কুশনযুক্ত লাক্সারি জুয়েলারি ও চুড়ি বক্স। ড্রয়ারসহ চাবি লক সুবিধা রয়েছে।",
    size: "১৮\" x ১৪\" সাইজ",
    material: "মেহগনি ফিনিশ কাঠ ও ভেলভেট কুশন",
    image: "/images/products/jewelry-box.jpg",
    secondaryImages: [],
    stock: 18,
    inStock: true,
    status: 1,
    whatsappMsg: "আমি 'এলইডি লাইটিংসহ চুড়ি বক্স (১৯৫০ টাকা)' অর্ডার করতে চাই।",
  },
  {
    sku: "NN-ORGANIZER-05",
    name: "রয়্যাল মাল্টি-লেয়ার জুয়েলারি ও মেকআপ অর্গানাইজার কেবিনেট",
    category: "চুড়ি আলনা ও শোকেস",
    categorySlug: "churi-alna",
    price: 1650,
    originalPrice: 1950,
    discount: "১৫% ছাড়",
    rating: 4.8,
    reviews: 27,
    badge: "জনপ্রিয়",
    highlight: "পার্টিশন ট্রে • ডাবল লক সুবিধা • উন্নতমানের মেহগনি উড ফিনিশ",
    description: "নেকলেস, কানের দুল ও চুড়ি আলাদা সেকশনে সাজিয়ে রাখার নিখুঁত মেকআপ কেবিনেট।",
    size: "১৬\" x ১২\" সাইজ",
    material: "কাঠ ও ভেলভেট সেকশন",
    image: "/images/products/jewelry-box.jpg",
    secondaryImages: [],
    stock: 15,
    inStock: true,
    status: 1,
    whatsappMsg: "আমি 'মাল্টি-লেয়ার জুয়েলারি অর্গানাইজার (১৬৫০ টাকা)' অর্ডার করতে চাই।",
  },
  {
    sku: "NN-LIGHT-06",
    name: "হ্যান্ডক্রাফটেড ফেয়ারি লাইট গ্লাস বোটল ডেকোর শোপিস",
    category: "শোপিস ও লাইটিং",
    categorySlug: "lighting",
    price: 450,
    originalPrice: 550,
    discount: "১৮% ছাড়",
    rating: 4.7,
    reviews: 19,
    badge: "গিফট চয়েস",
    highlight: "ঘরের কর্নার বা বেডরুম সাজানোর জন্য আকর্ষণীয় ফেয়ারি লাইট শোপিস",
    description: "ঘরের সৌন্দর্য বৃদ্ধি করতে কাঁচের বোতলে সফট ওয়ার্ম ফেয়ারি লাইট এবং নান্দনিক জুট ক্রাফটের সুন্দর সমন্বয়।",
    size: "স্ট্যান্ডার্ড ওয়াইন বোটল সাইজ",
    material: "গ্লাস ও এলইডি ফেয়ারি ওয়্যার",
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80",
    secondaryImages: [],
    stock: 40,
    inStock: true,
    status: 1,
    whatsappMsg: "আমি 'ফেয়ারি লাইট গ্লাস বোটল শোপিস (৪৫০ টাকা)' অর্ডার করতে চাই।",
  },
  {
    sku: "NN-BALA-07",
    name: "ঐতিহ্যবাহী গোল্ড-প্লেটেড ব্রাইডাল বালা ও চুড়ি সেট",
    category: "ঐতিহ্যবাহী চুড়ি ও গহনা",
    categorySlug: "jewellery",
    price: 1150,
    originalPrice: 1450,
    discount: "২১% ছাড়",
    rating: 4.9,
    reviews: 52,
    badge: "ব্রাইডাল স্পেশাল",
    highlight: "দীর্ঘস্থায়ী গোল্ড কালার ফিনিশ • ঐতিহ্যবাহী কারুকাজ ও কুন্দন স্টাইল",
    description: "বিয়ে ও ব্রাইডাল সাজের জন্য আকর্ষণীয় কুন্দন ও মীনাকারি কাজের গোল্ড প্লেটেড বালা সেট।",
    size: "স্ট্যান্ডার্ড সাইজ কম্বো",
    material: "ব্রাস বেস ও প্রিমিয়াম গোল্ড পলিশ",
    image: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=800&q=80",
    secondaryImages: [],
    stock: 30,
    inStock: true,
    status: 1,
    whatsappMsg: "আমি 'গোল্ড-প্লেটেড ব্রাইডাল বালা সেট (১১৫০ টাকা)' অর্ডার করতে চাই।",
  },
  {
    sku: "NN-KURTI-08",
    name: "ডিজাইনার এমব্রয়ডারি উৎসব কুর্তি ও থ্রি-পিস সেট",
    category: "পোশাক ও কুর্তি",
    categorySlug: "clothing",
    price: 1850,
    originalPrice: 2200,
    discount: "১৬% ছাড়",
    rating: 4.8,
    reviews: 38,
    badge: "এক্সক্লুসিভ",
    highlight: "১০০% প্রিমিয়াম সুতি ফেব্রিক • আকর্ষণীয় হাতের কাজ ও জর্জেট ওড়না",
    description: "উৎসব ও পার্টিতে পরিধানের জন্য আরামদায়ক সুতি কাপড় ও নজরকাড়া এমব্রয়ডারি কাজের কুর্তি সেট।",
    size: "M, L, XL, XXL এভেইলেবল",
    material: "১০০% প্রিমিয়াম কটন ও জর্জেট",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
    secondaryImages: [],
    stock: 22,
    inStock: true,
    status: 1,
    whatsappMsg: "আমি 'ডিজাইনার উৎসব কুর্তি সেট (১৮৫০ টাকা)' অর্ডার করতে চাই।",
  },
];

async function seedDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not found in environment variables.");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB || "nari_nibedito",
  });
  console.log("Connected to MongoDB successfully!");

  // 1. Seed Categories
  console.log("Seeding Categories...");
  for (const cat of CATEGORIES_DATA) {
    await Category.findOneAndUpdate({ id: cat.id }, cat, { upsert: true, new: true });
  }
  console.log(`Seeded ${CATEGORIES_DATA.length} categories.`);

  // 2. Seed Products
  console.log("Seeding Products...");
  for (const prod of PRODUCTS_DATA) {
    await Product.findOneAndUpdate({ sku: prod.sku }, prod, { upsert: true, new: true });
  }
  console.log(`Seeded ${PRODUCTS_DATA.length} products.`);

  // 3. Seed Sample Orders for Tracking verification
  console.log("Seeding Sample Orders for testing tracking...");
  const sampleOrder = {
    orderNumber: "NN-261029-1001",
    customerName: "রাবেয়া আক্তার পপি",
    phone: "01712345678",
    address: "বাসা নং ১২, রোড নং ৫, ধানমন্ডি, ঢাকা",
    deliveryArea: "inside_dhaka",
    deliveryFee: 60,
    items: [
      {
        productId: "NN-ALNA-01",
        name: "এক্সক্লুসিভ ডাবল ডোর কাঠের চুড়ি আলনা (১৪০ ডজন ধারণক্ষমতা)",
        price: 2250,
        quantity: 1,
        size: "২১\" x ১৬\" সাইজ",
        image: "/images/products/churi-alna.jpg",
      },
    ],
    subtotal: 2250,
    totalAmount: 2310,
    status: ORDER_STATUS.CONFIRMED,
    paymentMethod: PAYMENT_METHOD.CASH_ON_DELIVERY,
    paymentStatus: 1,
    note: "বিকেলে ডেলিভারি দিলে ভালো হয়।",
  };

  await Order.findOneAndUpdate({ orderNumber: sampleOrder.orderNumber }, sampleOrder, { upsert: true, new: true });
  console.log("Sample order created: NN-261029-1001 (Phone: 01712345678)");

  // 4. Seed Customer Feedback / Reviews
  console.log("Seeding Customer Feedback & Reviews...");
  const REVIEWS_DATA = [
    {
      name: "রাবেয়া মজুমদার পপি",
      location: "কুমিল্লা সদর",
      rating: 5,
      comment: "মাশাল্লাহ আপু! চুড়ি আলনাটা হাতে পেয়েছি। কাঠের নিখুঁত ফিনিশিং আর কাঁচের কাজটা অসাধারণ হয়েছে। রাতের বেলা এলইডি লাইট জ্বালালে পুরো ড্রেসিং রুম আলোকিত হয়ে ওঠে।",
      productTitle: "এক্সক্লুসিভ ডাবল ডোর কাঠের চুড়ি আলনা (১৪০ ডজন ধারণক্ষমতা)",
      productId: "1",
      verifiedPurchase: true,
      status: 1,
      likes: 14,
    },
    {
      name: "ইয়াসমিন আক্তার",
      location: "মিরপুর, ঢাকা",
      rating: 5,
      comment: "প্যাকেজিং অনেক বেশি সুরক্ষিত ছিল, কোনো প্রকার কাঁচের ক্ষতি হয়নি। পুরো ১৪০ ডজন চুড়ি সুন্দরভাবে গুছিয়ে রাখতে পেরেছি। কুরিয়ারও খুব দ্রুত পেয়েছি। ধন্যবাদ নারী নিবেদিত!",
      productTitle: "এক্সক্লুসিভ ডাবল ডোর কাঠের চুড়ি আলনা (১৪০ ডজন ধারণক্ষমতা)",
      productId: "1",
      verifiedPurchase: true,
      status: 1,
      likes: 9,
    },
    {
      name: "ফাহমিদা সুলতানা",
      location: "জিইসি মোড়, চট্টগ্রাম",
      rating: 5,
      comment: "হোম মন্দিরটা একদম ছবির চেয়েও বাস্তবে অনেক সুন্দর! ব্যাকলিট ওম আর গণেশের খোদাই করা নকশাটা ঘরের শান্তিময় পরিবেশ তৈরি করেছে। অনেক অনেক শুভকামনা।",
      productTitle: "কাস্টমাইজড উডেন হোম মন্দির (ওম ও গণেশ এলইডি ব্যাকলিট)",
      productId: "2",
      verifiedPurchase: true,
      status: 1,
      likes: 12,
    },
    {
      name: "তাসনিম জাহান",
      location: "উত্তরা, ঢাকা",
      rating: 5,
      comment: "রেশমি চুড়িগুলোর ফিনিশিং অসাধারণ, একটার সাথে আরেকটার রঙ দারুণ মানিয়েছে। অনুষ্ঠানে পরে গিয়েছিলাম, সবাই খুব প্রশংসা করেছে। প্যাকেজিংও দারুণ ছিল।",
      productTitle: "উৎসবের রেশমি কাচের চুড়ি স্পেশাল কম্বো সেট (৬০ পিস)",
      productId: "3",
      verifiedPurchase: true,
      status: 1,
      likes: 7,
    },
    {
      name: "শারমিন সুলতানা",
      location: "ধানমন্ডি, ঢাকা",
      rating: 5,
      comment: "ক্যাশ অন ডেলিভারিতে কোনো ঝামেলা ছাড়াই হাতে পেয়েছি। ডেলিভারি ম্যানের ব্যবহারও খুব ভালো ছিল। পণ্যের কোয়ালিটি নিয়ে কোনো সন্দেহ নেই, এককথায় অসাধারণ!",
      productTitle: "এক্সক্লুসিভ ডাবল ডোর কাঠের চুড়ি আলনা (১৪০ ডজন ধারণক্ষমতা)",
      productId: "1",
      verifiedPurchase: true,
      status: 1,
      likes: 11,
    },
    {
      name: "নুসরাত জাহান নিপা",
      location: "সিলেট সদর",
      rating: 5,
      comment: "জুয়েলারি বক্সের ভেলভেট ড্রয়ারগুলো খুব সফট এবং সুন্দর। সব সোনার ও রুপার গহনা আলাদা আলাদা খোপে সাজিয়ে রাখা যায়। লক সিস্টেমটাও খুব কাজের।",
      productTitle: "রয়্যাল মাল্টি-লেয়ার জুয়েলারি অর্গানাইজার বক্স",
      productId: "4",
      verifiedPurchase: true,
      status: 1,
      likes: 6,
    },
    {
      name: "সামিয়া চৌধুরী",
      location: "খালিশপুর, খুলনা",
      rating: 5,
      comment: "কাঠের কোয়ালিটি অনেক সলিড এবং মজবুত। বহু বছর অনায়াসে টিকবে বলে মনে হচ্ছে। এমন ইউনিক হ্যান্ডমেড ক্রাফটসম্যানশিপের জন্য নারী নিবেদিত টিমকে অনেক ধন্যবাদ।",
      productTitle: "এক্সক্লুসিভ ডাবল ডোর কাঠের চুড়ি আলনা (১৪০ ডজন ধারণক্ষমতা)",
      productId: "1",
      verifiedPurchase: true,
      status: 1,
      likes: 8,
    },
  ];

  for (const rev of REVIEWS_DATA) {
    await Review.findOneAndUpdate(
      { name: rev.name, comment: rev.comment },
      rev,
      { upsert: true, new: true }
    );
  }
  console.log(`Seeded ${REVIEWS_DATA.length} verified customer reviews.`);

  console.log("Database seed completed successfully!");
  await mongoose.disconnect();
}

seedDatabase().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
