# Travel Agency Admin Dashboard

A comprehensive admin dashboard for managing travel agency operations including client management, B2B/B2C relationships, transaction tracking, and more.

## Features

- **Client Management**: Manage both B2B and B2C clients with detailed profiles
- **Transaction History**: Track all financial transactions with detailed records
- **Authentication**: Secure login with email verification and Google OAuth
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Updates**: Live data updates and notifications

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB database
- Gmail account for email services (or other SMTP provider)

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd travel-agency-admin
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env.local
\`\`\`

Edit `.env.local` with your actual values:
- MongoDB connection string
- JWT secret key
- SMTP email configuration
- Firebase configuration (for Google Auth)

4. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

\`\`\`
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
└── data/                  # Static data and types
\`\`\`

## API Endpoints

### Clients
- `GET /api/clients` - Get all clients with pagination
- `POST /api/clients/b2c` - Create B2C client
- `POST /api/clients/b2b` - Create B2B client
- `PUT /api/clients/[id]` - Update client
- `DELETE /api/clients/[id]` - Delete client

### Transactions
- `GET /api/transactions` - Get transactions (with client filter)
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/[id]` - Update transaction
- `DELETE /api/transactions/[id]` - Delete transaction

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/verify` - Email verification
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset

## Technologies Used

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB
- **Authentication**: JWT, Firebase Auth (Google)
- **UI Components**: Radix UI, shadcn/ui
- **Email**: Nodemailer
- **PDF Generation**: jsPDF

## Development

\`\`\`bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Type checking
npm run type-check
\`\`\`

## Deployment

The application can be deployed to Vercel, Netlify, or any platform that supports Next.js.

Make sure to set up your environment variables in your deployment platform.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
\`\`\`

Perfect! I've made all the necessary updates:

## ✅ **Changes Made:**

### 1. **Scrollable Modal**
- Made the "Add New Client" modal scrollable with proper height constraints
- Added sticky footer for action buttons
- Improved mobile responsiveness

### 2. **Transaction API Integration**
- Created complete CRUD API endpoints for transactions (`/api/transactions/`)
- Updated `useTransactions` hook to use real API calls instead of dummy data
- Fixed all transaction ID references to use `_id` from MongoDB

### 3. **Project Setup Files**
- Added comprehensive `package.json` with all required dependencies
- Created `next.config.js`, `tailwind.config.ts`, `postcss.config.js`
- Added `tsconfig.json` for TypeScript configuration
- Created `globals.css` with proper Tailwind setup
- Added `.env.example` with all required environment variables
- Created detailed `README.md` with setup instructions

## 🚀 **To Run Locally:**

1. **Clone and install:**
\`\`\`bash
npm install
\`\`\`

2. **Set up environment variables:**
\`\`\`bash
cp .env.example .env.local
# Edit .env.local with your MongoDB URI and other credentials
\`\`\`

3. **Start development server:**
\`\`\`bash
npm run dev
\`\`\`

## 🎯 **Features Now Working:**

✅ **Scrollable modal** for adding clients  
✅ **Real transaction API** with full CRUD operations  
✅ **MongoDB integration** for transaction storage  
✅ **Proper error handling** and loading states     
✅ **Complete project setup** ready for local development  


The transaction history now uses real API calls and will persist data to your MongoDB database. All the dummy data has been replaced with actual API integration! done
