# 🎯 SlotPay

**WhatsApp-native booking and payment collection platform for South African service businesses**

SlotPay is a modern booking and payment solution that integrates WhatsApp Business API with PayFast payment gateway, enabling service businesses to accept bookings and collect payments seamlessly through WhatsApp.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-blue.svg)](https://supabase.com/)

## ✨ Features

- 🔐 **JWT Authentication** - Secure user authentication and authorization
- 📅 **Booking Management** - Create, view, update, and cancel bookings
- 💳 **PayFast Integration** - Secure payment processing for South African businesses
- 📱 **WhatsApp Integration** - Automated notifications via WhatsApp Business API
- 🗄️ **Supabase Backend** - PostgreSQL database with Row Level Security
- 🔔 **Real-time Notifications** - Booking confirmations, payment links, and reminders
- 🎨 **Service Catalog** - Manage and display available services
- 📊 **Admin Dashboard** - Monitor bookings and manage services (coming soon)

## 🏗️ Architecture

```
┌─────────────────┐
│   Frontend      │
│  (React/Vite)   │ ← Coming Soon
└────────┬────────┘
         │ REST API
         ▼
┌─────────────────┐
│  Express API    │
│   (Node.js)     │
└────────┬────────┘
         │
    ┌────┴────┬──────────┬──────────┐
    ▼         ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│Supabase│ │PayFast │ │WhatsApp│ │  JWT   │
│   DB   │ │Payment │ │Business│ │  Auth  │
└────────┘ └────────┘ └────────┘ └────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account ([supabase.com](https://supabase.com))
- PayFast merchant account ([payfast.co.za](https://www.payfast.co.za))
- WhatsApp Business API access ([business.whatsapp.com](https://business.whatsapp.com))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/SlotPay.git
   cd SlotPay
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your credentials:
   ```env
   # Server
   PORT=5000
   NODE_ENV=development
   
   # Supabase
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_KEY=your_service_key
   
   # JWT
   JWT_SECRET=your_secret_key
   JWT_EXPIRES_IN=7d
   
   # PayFast
   PAYFAST_MERCHANT_ID=your_merchant_id
   PAYFAST_MERCHANT_KEY=your_merchant_key
   PAYFAST_PASSPHRASE=your_passphrase
   PAYFAST_SANDBOX=true
   
   # WhatsApp
   WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
   WHATSAPP_ACCESS_TOKEN=your_access_token
   WHATSAPP_VERIFY_TOKEN=your_verify_token
   
   # URLs
   FRONTEND_URL=http://localhost:5173
   WEBHOOK_BASE_URL=https://your-ngrok-url.ngrok.io
   ```

4. **Set up the database**
   
   Follow the instructions in [`backend/database/README.md`](backend/database/README.md) to:
   - Create your Supabase project
   - Run the schema SQL
   - Optionally seed sample data

5. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The API will be available at `http://localhost:5000`

6. **Test the API**
   ```bash
   curl http://localhost:5000/health
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Endpoints

#### **Authentication**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/verify-token` - Verify JWT token

#### **Services**
- `GET /api/services` - Get all active services
- `GET /api/services/:id` - Get service by ID
- `GET /api/services/category/:category` - Get services by category

#### **Bookings**
- `POST /api/bookings` - Create new booking (protected)
- `GET /api/bookings` - Get user's bookings (protected)
- `GET /api/bookings/:id` - Get booking by ID (protected)
- `POST /api/bookings/:id/payment` - Generate payment link (protected)
- `PATCH /api/bookings/:id` - Update booking (protected)
- `DELETE /api/bookings/:id` - Cancel booking (protected)

#### **Webhooks**
- `GET /api/webhook/whatsapp` - WhatsApp webhook verification
- `POST /api/webhook/whatsapp` - WhatsApp incoming messages
- `POST /api/webhook/payfast` - PayFast payment notifications
- `GET /api/webhook/payfast/test` - Test PayFast webhook
- `GET /api/webhook/whatsapp/test` - Test WhatsApp webhook

### Example Requests

**Register a new user:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "0821234567"
  }'
```

**Create a booking:**
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "serviceId": "service-uuid",
    "bookingDate": "2024-12-25",
    "bookingTime": "10:00",
    "notes": "Please call before arriving"
  }'
```

**Generate payment link:**
```bash
curl -X POST http://localhost:5000/api/bookings/booking-uuid/payment \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🗄️ Database Schema

The application uses PostgreSQL (via Supabase) with the following main tables:

- **users** - User accounts and profiles
- **services** - Available services for booking
- **bookings** - Booking records with payment status
- **notifications** - Notification tracking (optional)
- **audit_logs** - Audit trail (optional)

See [`backend/database/schema.sql`](backend/database/schema.sql) for complete schema definition.

## 🔒 Security Features

- ✅ JWT-based authentication
- ✅ Row Level Security (RLS) in Supabase
- ✅ Environment variable protection
- ✅ CORS configuration
- ✅ Input validation
- ✅ Secure webhook signature verification
- 🔄 Rate limiting (coming soon)
- 🔄 Request sanitization (coming soon)

## 🧪 Testing

```bash
# Run tests (coming soon)
npm test

# Run tests with coverage
npm run test:coverage

# Run linter
npm run lint
```

## 📦 Project Structure

```
SlotPay/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js          # Authentication routes
│   │   │   ├── bookings.js      # Booking management
│   │   │   ├── services.js      # Service catalog
│   │   │   └── webhook.js       # Webhook handlers
│   │   ├── services/
│   │   │   ├── supabase.js      # Database operations
│   │   │   ├── payfast.js       # Payment processing
│   │   │   └── whatsapp.js      # WhatsApp messaging
│   │   └── server.js            # Express app setup
│   ├── database/
│   │   ├── schema.sql           # Database schema
│   │   ├── seed.sql             # Sample data
│   │   └── README.md            # Database setup guide
│   ├── .env.example             # Environment template
│   └── package.json
├── frontend/                     # Coming soon
├── .gitignore
└── README.md
```

## 🚢 Deployment

### Backend Deployment Options

**Option 1: Railway**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

**Option 2: Render**
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push

**Option 3: Docker**
```bash
# Build image
docker build -t slotpay-backend .

# Run container
docker run -p 5000:5000 --env-file .env slotpay-backend
```

### Webhook Configuration

For webhooks to work, you need a public URL. During development, use ngrok:

```bash
# Install ngrok
npm install -g ngrok

# Start tunnel
ngrok http 5000

# Update WEBHOOK_BASE_URL in .env with ngrok URL
```

Then configure webhooks:
- **PayFast**: Add `https://your-url.ngrok.io/api/webhook/payfast` in PayFast dashboard
- **WhatsApp**: Add `https://your-url.ngrok.io/api/webhook/whatsapp` in Meta Developer Console

## 🛠️ Development

### Available Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with auto-reload
npm test           # Run tests (coming soon)
npm run lint       # Run ESLint
```

### Code Style

This project uses ESLint and Prettier for code formatting. Run before committing:

```bash
npm run lint
npm run format
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) - Backend as a Service
- [PayFast](https://www.payfast.co.za) - Payment Gateway
- [WhatsApp Business API](https://business.whatsapp.com) - Messaging Platform
- [Express.js](https://expressjs.com) - Web Framework

## 📧 Contact

**Athandile Tetyana**
- GitHub: [@athandile-tetyana](https://github.com/athandile-tetyana)
- LinkedIn: [athandile-tetyana](https://www.linkedin.com/in/athandile-tetyana)

## 🗺️ Roadmap

- [x] Backend API with authentication
- [x] PayFast payment integration
- [x] WhatsApp notifications
- [x] Database schema and setup
- [ ] Frontend React application
- [ ] Admin dashboard
- [ ] Rate limiting and security hardening
- [ ] Automated testing
- [ ] API documentation (Swagger)
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Booking reminders
- [ ] Multi-language support
- [ ] Mobile app (React Native)

---

**Made with ❤️ by Bob** 🤖

*SlotPay - Simplifying bookings and payments for South African businesses*