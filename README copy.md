# 99Sellers - The Off-Market Deal Terminal

99Sellers is a powerful real estate lead discovery platform designed for investors and agents to find off-market deals, foreclosures, tax defaults, and distressed property listings instantly.

## 📁 Project Structure

The project is split into two main parts:

- **`/frontend`**: A Next.js application providing the user dashboard, search terminal, and administrative interface.
- **`/backend`**: A Node.js/Express server handling authentication, data persistence, and API endpoints.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MySQL (for backend database)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repository-url>
   cd 99_sellers
   ```

2. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   cp .env.example .env.local # Configure your variables
   npm run dev
   ```

3. **Backend Setup:**
   ```bash
   cd ../backend
   npm install
   cp .env.example .env # Configure your JWT_SECRET and DB credentials
   node index.js
   ```

## 🛠 Features

- **Lead Discovery:** Real-time search by city, zip, or address.
- **User Profiles:** Manage personal information and persistence.
- **Admin Panel:** Comprehensive dashboard for system management and analytics.
- **Premium Access:** Gated content for verified members.

## 🛡 License
This project is licensed under the MIT License.
