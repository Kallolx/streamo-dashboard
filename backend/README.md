# Dashboard Backend

This is the backend API for the Music Dashboard application.

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication

## Setup Instructions

1. **Clone the repository**

2. **Install dependencies**
   ```
   cd backend
   npm install
   ```

3. **Configure environment variables**
   - Create a `.env` file in the backend directory
   - Add the following variables:
     ```
     PORT=5000
     MONGODB_URI=your_mongodb_atlas_connection_string
     JWT_SECRET=your_jwt_secret_key
     NODE_ENV=development
     ```

4. **Set up MongoDB Atlas**
   - Create a MongoDB Atlas account: https://www.mongodb.com/cloud/atlas/register
   - Create a new cluster
   - Set up a database user with password
   - Add your IP address to the IP access list
   - Get your connection string and add it to the `.env` file

5. **Start the development server**
   ```
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Log in a user
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)
- `PUT /api/users/profile` - Update current user profile

### Releases
- `GET /api/releases` - Get all releases for user
- `POST /api/releases` - Create a new release
- `GET /api/releases/:id` - Get release by ID
- `PUT /api/releases/:id` - Update release
- `DELETE /api/releases/:id` - Delete release

### Royalties
- `GET /api/royalties` - Get royalties for user
- `GET /api/royalties/summary` - Get royalty summary
- `POST /api/royalties/add` - Add royalty payment (Admin only)

### Withdrawal Requests
- `GET /api/withdrawals` - Get all withdrawal requests for user
- `POST /api/withdrawals` - Create withdrawal request
- `GET /api/withdrawals/all` - Get all withdrawal requests (Admin only)
- `GET /api/withdrawals/:id` - Get withdrawal request by ID
- `PUT /api/withdrawals/:id` - Update withdrawal request (Admin only)

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard analytics
- `GET /api/analytics/streams` - Get streaming analytics
- `GET /api/analytics/revenue` - Get revenue analytics
- `GET /api/analytics/releases/:id` - Get analytics for specific release
- `GET /api/analytics/platform` - Get platform breakdown analytics 