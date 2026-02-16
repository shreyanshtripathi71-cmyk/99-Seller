# 99Sellers - Real Estate Lead Generation Platform 🏡# Hozn - Real Estate 🏡🚀



A modern real estate lead generation platform built with **Next.js 14**, **React**, **TypeScript**, and an **Express.js** backend.![GitHub repo size](https://img.shields.io/github/repo-size/AHMAD-JX/Hozn-RealEstate-Fullstack?style=for-the-badge)

![GitHub stars](https://img.shields.io/github/stars/AHMAD-JX/Hozn-RealEstate-Fullstack?style=for-the-badge)

## Features![GitHub forks](https://img.shields.io/github/forks/AHMAD-JX/Hozn-RealEstate-Fullstack?style=for-the-badge)

![GitHub license](https://img.shields.io/github/license/AHMAD-JX/Hozn-RealEstate-Fullstack?style=for-the-badge)

- **User Dashboard**: Analytics, saved leads, saved searches, billing management![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)

- **Admin Dashboard**: User management, property management, auction management, crawler status![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)

- **Authentication**: JWT-based auth with admin/user role separation![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

- **Subscription System**: Free trial, multiple plan tiers![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)

- **Lead Discovery**: Search and filter distressed property leads![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)

![Sequelize](https://img.shields.io/badge/Sequelize-52B0E7?style=for-the-badge&logo=sequelize&logoColor=white)

## Tech Stack![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)

![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

- **Frontend**: Next.js 14, React, TypeScript, SCSS![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

- **Backend**: Express.js, Sequelize ORM, MySQL![Sass](https://img.shields.io/badge/Sass-CC6699?style=for-the-badge&logo=sass&logoColor=white)

- **Authentication**: JWT tokens![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)

- **Styling**: SCSS Modules, Bootstrap![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)



## Getting Started

## 🌟 Overview

### Prerequisites**Hozn - Real Estate** is a **Full-Stack** real estate website built with **React, Next.js, TypeScript**, and a **Node.js (Express) backend**. The platform allows users to browse, list, and manage properties seamlessly.

- Node.js 18+

- MySQL database## 🎯 Features

- 🔥 **Modern UI/UX** with smooth animations

### Frontend Setup- 🏠 **Property listing & management**

- 🏠 **BUY & Sell Property listing **

```bash- 🔒 **User authentication** (Signup/Login)

cd 99Sellers- 📊 **Admin Dashboard** for managing users & listings

npm install- 📡 **Backend API** built with Express & Sequelize

npm run dev- 🎨 **Fully Responsive** on all devices

```

  ### Backend:

Frontend runs at: http://localhost:3000- **Authentication & Authorization** (JWT-based login/signup)

- **Profile Management** (Edit user details)

### Backend Setup- **Real Estate Listings** (Add, update, delete properties)

- **Buying & Selling API**

```bash- **Database Management with PostgreSQL & Sequelize**

cd real-estate-backend  

npm install

cp .env.example .env  # Configure your database## 📸 Screenshots

npm run dev### 🏠 Home Page

```![Home](https://github.com/AHMAD-JX/Hozn-RealEstate-Fullstack/blob/eedce2626f82448aa5611f945dbc5778ddcef4eb/public/assets/images/assets/1.png)



Backend runs at: http://localhost:3001### 🏡 Property Listing

![Properties](https://github.com/AHMAD-JX/Hozn-RealEstate-Fullstack/blob/eedce2626f82448aa5611f945dbc5778ddcef4eb/public/assets/images/assets/2.png)

## Authentication Flow

### 🛠️ Dashboard

- **Regular Users**: Sign in → Redirected to `/search` (Main Dashboard)

- **Admin Users**: Sign in with admin credentials → Redirected to `/admin`

## 🛠️ Tech Stack

## Routes

### 🌐 Frontend

### Public Routes- **React.js** (Framework: Next.js)

- `/` - Homepage- **TypeScript**

- `/signin` - Sign in / Sign up- **Tailwind CSS & CSS** (for styling)

- `/search` - Main Dashboard (Property Search)- **SCSS**

- `/faq` - FAQ page- **Framer Motion** (for animations)

- `/contact` - Contact page- **Three.js**

- **Axios** (for API calls)

### User Dashboard Routes

- `/search` - Main Dashboard with Lead Search### 🖥️ Backend (real-estate-backend)

- `/dashboard/analytics` - Analytics- **Node.js** (Runtime)

- `/dashboard/profile` - User profile- **Express.js** (Framework)

- `/dashboard/billing` - Billing management- **Sequelize** (ORM for PostgreSQL/MySQL)

- `/dashboard/saved-leads` - Saved leads- **JWT (JSON Web Token)** (for authentication)

- `/dashboard/saved-search` - Saved searches- **bcrypt.js** (for password hashing)

- `/dashboard/subscription` - Subscription management- **Multer** (for handling file uploads)



### Admin Routes## 📂 Project Structure

- `/admin` - Admin dashboard```

- `/admin/users` - User managementHozn-RealEstate-Fullstack/Hozn-RealEstate

- `/admin/properties` - Property management├── Hozn-RealEstate/  # React + Next.js frontend

- `/admin/auctions` - Auction management│   ├── .next/

- `/admin/owners` - Owner management│   ├── node_modules/

- `/admin/loans` - Loan management│   ├── public/

- `/admin/crawler` - Crawler status│   └── src/

- `/admin/subscriptions` - Subscription management|       ├── app/

- `/admin/settings` - System settings│       ├── components/

│       ├── data/

## License|       ├── hooks/

│       ├── layouts/

MIT License│       ├── models/

│       ├── redux/
│       ├── styles/
│       ├── types/
│       └── utils/
│
├── real-estate-backend/  # Node.js Express.js backend
│   ├── config/
│   ├── migrations/
│   ├── models/
│   ├── node_modules/
│   ├── seeders/
│   └── src/
|       ├── config/
│       ├── controllers/
│       ├── middleware/
|       ├── models/
│       ├── routes/
│       ├── models/
│       ├── app.ts
│       ├── custom.d.ts
│       └── server.ts
│
└── README.md

```
## ⚙️ Installation & Setup

### 1️⃣ Install Node.js and npm
Ensure you have **Node.js** and **npm** installed. If not, install it from:
👉 [Download Node.js](https://nodejs.org/)

Check installation:
```sh
node -v
npm -v
```

### 2️⃣ Install PostgreSQL Database
Download and install **PostgreSQL**:
👉 [Download PostgreSQL](https://www.postgresql.org/download/)

After installation, create a new database:
```sh
psql -U postgres
CREATE DATABASE real-estate-backend;
```

### 3️⃣ Clone the Repository
```sh
git clone https://github.com/AHMAD-JX/Hozn-RealEstate-Fullstack.git
cd Hozn-RealEstate-Fullstack
```

### 2️⃣ Install dependencies:
```sh
# Install frontend dependencies
cd Hozn-RealEstate
npm install

# Install backend dependencies
cd ../real-estate-backend
npm install
```

### 3️⃣ Setup environment variables:
**Frontend (`.env.local`):**
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

**Backend (`.env`):**
```
PORT=5000
DATABASE_URL=postgres://user:password@localhost:5432/realestate
JWT_SECRET=your_jwt_secret
```

### 4️⃣ Run the project:
```sh
# Start backend server
cd real-estate-backend
npm run dev

# Start frontend
cd ../hozn-frontend

npx ts-node src/server.ts
or
npm run dev

```
## 🛠️ API Endpoints

| Method | Endpoint            | Description                 |
|--------|---------------------|-----------------------------|
| POST   | /api/signup         | User Signup                |
| POST   | /api/login          | User Login                 |
| GET    | /api/profile        | Get User Profile           |
| PUT    | /api/profile/edit   | Edit User Profile          |
| POST   | /api/property/add   | Add New Property           |
| GET    | /api/property/list  | List Properties            |
| POST   | /api/property/buy   | Buy Property               |
| DELETE | /api/property/sell  | Sell Property              |

#### 📌 Example API Request (Add Property):
```sh
curl -X POST "http://localhost:5000/api/properties" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"title":"Luxury Villa", "price":250000, "location":"Cairo", "description":"Spacious 3-bedroom villa"}'

```


## 📡 API Endpoints

### 🏠 Authentication (Auth Routes)
| Method | Endpoint       | Description           |
|--------|---------------|-----------------------|
| POST   | /signup       | Register a new user  |
| POST   | /login        | Authenticate user    |

### 📄 Profile Routes
| Method | Endpoint     | Description                |
|--------|-------------|----------------------------|
| GET    | /profile    | Fetch user profile        |
| PUT    | /profile    | Update user profile       |

### 🏠 Properties Routes
| Method | Endpoint        | Description                |
|--------|----------------|----------------------------|
| GET    | /properties    | Fetch all properties      |
| POST   | /properties    | Add a new property        |
| PUT    | /properties/:id| Update property details   |
| DELETE | /properties/:id| Delete a property        |

---

## 💡 Example API Request (Update Profile)
```js
fetch('http://localhost:5000/api/profile', {
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer YOUR_TOKEN`
    },
    body: JSON.stringify({
        firstName: "John",
        lastName: "Doe",
        phoneNumber: "123456789",
        about: "Real estate expert."
    })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));
```

---

## ✨ Contributing
Feel free to fork the repository and create a pull request! 😊

## 📜 License
This project is licensed under the **MIT License**.

🚀 **HOZN - Real Estate** | Built with ❤️ by [AHMAD-JX](https://github.com/AHMAD-JX)




