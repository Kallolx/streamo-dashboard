# Music Dashboard Application

## Overview
A modern music dashboard application for managing users, releases, royalties, and analytics.

## Features
- User management with role-based access control
- Release management
- Royalty tracking
- Analytics dashboard

## User Roles
The system supports four different user roles:
- **Super Admin**: Full control over the application
- **Admin**: Can manage users, releases, and view analytics
- **Label Owner**: Can manage their own releases and view related analytics
- **Artist**: Can view their own releases, royalties, and analytics

## Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB

### Installation

#### Backend Setup
1. Navigate to the backend directory:
```
cd backend
```

2. Install dependencies:
```
npm install
```

3. Create a `.env` file with the following variables:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

4. Seed initial users:
```
npm run seed-users
```
This will create two initial users:
- Super Admin (Email: khksnkallol@gmail.com, Password: 123456)
- Admin (Email: khksnkallol2@gmail.com, Password: 12345678)

5. Start the backend server:
```
npm run dev
```

#### Frontend Setup
1. Navigate to the frontend directory:
```
cd ../
```

2. Install dependencies:
```
npm install
```

3. Start the frontend application:
```
npm run dev
```

## User Management
- Only Super Admin and Admin roles can access the User Management page
- The system allows adding, editing, and deleting users
- New users are stored directly in the MongoDB database
- Label Owner and Artist users will have different login approaches

## Deployment
Instructions for deploying to production will be added in the future.
