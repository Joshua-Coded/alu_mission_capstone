# RootRise 🌱

### Description
RootRise is a blockchain-powered agricultural funding platform connecting farmers with contributors. Built on Polygon blockchain for transparent, secure transactions. Government officials perform verification to ensure transparency and trust in project funding.

---

### GitHub Repository
[https://github.com/Joshua-Coded/alu_mission_capstone](https://github.com/Joshua-Coded/alu_mission_capstone)

---

### Live Deployment

**Frontend (Vercel)**
🔗 [https://alu-mission-capstone-zc78.vercel.app](https://alu-mission-capstone-zc78.vercel.app)

**Backend API (Render)**
🔗 [https://rootrise.onrender.com/api](https://rootrise.onrender.com/api)

**API Documentation (Swagger)**
📚 [https://rootrise.onrender.com/api](https://rootrise.onrender.com/api)

**Database:** MongoDB Atlas

---

## Environment Setup

### Backend Configuration

Create `.env` file in the `backend` directory:

```bash
# Backend Environment Configuration

# Server Configuration
NODE_ENV=development
PORT=3001

# JWT Configuration - Generate a strong secret
JWT_SECRET=your-super-secure-jwt-secret-key-here-minimum-32-characters
JWT_EXPIRES_IN=7d

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/rootrise

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# API Documentation
API_TITLE=RootRise API
API_DESCRIPTION=Blockchain-based Agricultural Crowdfunding Platform API
API_VERSION=1.0

# Email Configuration (Optional - for email verification)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com

# Cloudinary Configuration (Optional - for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email Verification Settings
EMAIL_VERIFICATION_TOKEN_EXPIRES=24h
VERIFICATION_URL=http://localhost:3000/verify-email

# ================================
# 🟣 POLYGON BLOCKCHAIN CONFIGURATION
# ================================

# Polygon RPC URL
POLYGON_RPC_URL=https://polygon-rpc.com

# Wallet Private Key (Use a test wallet for development)
WALLET_PRIVATE_KEY=your-test-wallet-private-key-here

# Smart Contract Address
CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000

# Polygon Network ID
NETWORK_ID=137

# Admin Wallet Address
ADMIN_WALLET_ADDRESS=0x0000000000000000000000000000000000000000

# Polygonscan API Key (Optional)
POLYGONSCAN_API_KEY=your-polygonscan-api-key
```

### Frontend Configuration

Create `.env.local` file in the `frontend` directory:

```bash
# Frontend Environment Configuration

# Application Configuration
NEXT_PUBLIC_APP_NAME="RootRise - Agricultural Crowdfunding"
NEXT_PUBLIC_APP_DESCRIPTION="Transparent blockchain-based crowdfunding for Rwandan farmers"
NEXT_PUBLIC_ENABLE_TESTNETS=true
NEXT_PUBLIC_DEBUG_MODE=true

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1

# ================================
# 🟣 POLYGON BLOCKCHAIN CONFIGURATION
# ================================

# Polygon Network
NEXT_PUBLIC_CHAIN_ID=137
NEXT_PUBLIC_NETWORK_NAME=polygon
NEXT_PUBLIC_POLYGON_RPC_URL=https://polygon-rpc.com

# Smart Contract Address
NEXT_PUBLIC_ROOTRISE_CONTRACT=0x0000000000000000000000000000000000000000

# WalletConnect (RainbowKit) - Get from https://cloud.walletconnect.com/
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id

# Cloudinary Configuration (Optional)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-upload-preset

# Database (Only if needed for frontend)
MONGODB_URI=mongodb://localhost:27017/rootrise
```

### Setup Instructions

1. **Backend Setup:**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   npm install
   npm run start:dev
   ```

2. **Frontend Setup:**
   ```bash
   cd frontend
   cp .env.local.example .env.local
   # Edit .env.local with your configuration
   npm install
   npm run dev
   ```

### Required Configuration Steps:

1. **Generate JWT Secret:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Get WalletConnect Project ID:**
   - Visit https://cloud.walletconnect.com/
   - Create a new project
   - Copy the Project ID

3. **Setup MongoDB:**
   - Use local MongoDB or MongoDB Atlas
   - Update connection string in `MONGODB_URI`

4. **Blockchain Setup:**
   - Use test wallet for development
   - Deploy smart contract for production
   - Update contract address

---

## Implementation and Testing

### Testing Results

#### Functional Testing
- User Registration - Register as Farmer, Contributor, Government Official
- Project Creation - Farmers can create and submit projects
- Project Verification - Government officials can verify projects
- Blockchain Contribution - Contributors can fund projects with MATIC
- Role-based Access - Different dashboards for each user role

#### Performance Testing
- Frontend Load - Vercel Deployment
- API Response - Render Backend
- Blockchain TX - Polygon Mainnet

#### Cross-Browser Testing
- Chrome 119+
- Firefox 118+
- Safari 16+
- Edge 119+

### Analysis

**Objectives Achieved:**
- Blockchain integration with Polygon Mainnet
- Role-based authentication system
- Project funding with smart contract escrow
- Real-time transaction tracking
- Mobile-responsive design

**Technical Success:**
- Smart contract automatically releases funds upon goal achievement
- Gas-efficient transactions (~$0.01 per contribution)
- Secure JWT authentication with role-based permissions
- Cloudinary integration for image uploads

**Areas for Improvement:**
- Implement email notifications for project updates
- Add more detailed analytics dashboard
- Support for multiple cryptocurrency contributions

### Deployment

#### Deployment Plan
**Frontend (Vercel):**
- Connected to GitHub repository
- Automatic deployments on git push
- Environment variables configured
- Custom domain setup

**Backend (Render):**
- Node.js environment
- MongoDB Atlas connection
- Environment variables secured
- Auto-scaling enabled

**Database (MongoDB Atlas):**
- Cloud database cluster
- Automated backups
- Secure connection strings

#### Verification
- Frontend accessible at: https://alu-mission-capstone-zc78.vercel.app
- Backend API responding: https://rootrise.onrender.com/api
- Database connections stable
- Blockchain transactions confirmed on Polygonscan

---

## Screenshots

### Main Application Views
![Home Page](screenshots/home-page.png)
![Farmer Dashboard](screenshots/farmer-dashboard.png)
![Contributor Dashboard](screenshots/contributor-dashboard.png)
![Government Dashboard](screenshots/government-dashboard.png)

### Testing Evidence
![User Registration Test](screenshots/test1-registration.png)
![Project Funding Test](screenshots/test2.png)
![Blockchain Transaction Test](screenshots/test3.png)
![Mobile Responsive Test](screenshots/test4.png)
![Admin Verification Test](screenshots/test5.png)
![Additional Test](screenshots/test6.png)

---

### Setup Instructions

**Backend (NestJS)**
```bash
cd backend
npm install
npm run start:dev
```
Backend runs on `http://localhost:3001`

**Frontend (Next.js)**
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:3000`

---

### Technology Stack

**Frontend:**
- Next.js 14 with TypeScript
- Chakra UI for styling
- RainbowKit for wallet connection
- Wagmi for blockchain interactions
- Axios for API calls

**Backend:**
- NestJS with TypeScript
- MongoDB with Mongoose
- JWT Authentication
- Swagger/OpenAPI documentation
- Blockchain integration

**Blockchain:**
- Polygon Mainnet
- Smart Contract: `0x5387c3bC42304EbfCEFB0aAD1034753217C01b65`
- MATIC token for contributions

---

### Smart Contract Details

**Contract Address:** `0x5387c3bC42304EbfCEFB0aAD1034753217C01b65`

**Network:** Polygon Mainnet

**Features:**
- Secure fund escrow
- Automatic release upon funding goal
- Transparent transaction history
- Gas-efficient contributions

---

### Video Demo
🎥 [Watch Full Demo Video](https://drive.google.com/file/d/1FfsjCqrhErWnYkFz7QfIvZjwiPqr_QdJ/view?usp=sharing)

**Duration:** 10-15 minutes showcasing:
- User registration and role-based access
- Project creation and verification
- Blockchain contributions with MetaMask
- Real-time transaction tracking
- Smart contract interactions
- Platform administration features

---

### API Documentation

Comprehensive Swagger documentation available at:
📚 [https://rootrise.onrender.com/api](https://rootrise.onrender.com/api)

Includes:
- Authentication endpoints
- Project management APIs
- Contribution processing
- User management
- Blockchain integration endpoints

---

### Code Structure

```
alu_mission_capstone/
├── frontend/                 # Next.js application
├── backend/                  # NestJS API
├── screenshots/              # Application screenshots
└── README.md
```

---

### Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

### License

MIT License - see LICENSE file for details

---
