# Quick Workspace Booking Web App

A full-stack Next.js application for workspace management and booking with role-based authentication.

## Features

- **Authentication**: JWT-based authentication with role-based access control
- **Workspace Management**: Admins can create workspaces, users can view them
- **Booking System**: Users can book workspaces with validation and double-booking prevention
- **Responsive Design**: Mobile-friendly UI built with Tailwind CSS

## Tech Stack

- **Frontend & Backend**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT stored in httpOnly cookies
- **Validation**: Frontend and backend validation with comprehensive error handling

## Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL database (or compatible database)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd altf-assessment
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="your-postgresql-connection-string"

# JWT Secret (generate a secure random string)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
```

### 4. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database with sample users
npm run seed
```

### 5. Run the Application

```bash
# Development mode
npm run dev

# Or build and run production
npm run build
npm start
```

The application will be available at `http://localhost:3000`

## Sample Users

The database is preloaded with two sample users:

### Admin User
- **Email**: `admin@example.com`
- **Password**: `Admin@123`
- **Role**: `admin`
- **Permissions**: Can create workspaces and view all data

### Regular User
- **Email**: `user@example.com`
- **Password**: `User@123`
- **Role**: `user`
- **Permissions**: Can view workspaces and make bookings

## Application Structure

### Pages

1. **`/login`** - Login form with email/password authentication
2. **`/`** - Home page showing workspace list with booking functionality
3. **`/admin/workspaces`** - Admin-only page for creating new workspaces
4. **`/bookings`** - User's booking history

### API Routes

- **`/api/auth/login`** - User authentication
- **`/api/auth/logout`** - User logout
- **`/api/auth/me`** - Get current user's basic auth status
- **`/api/auth/user`** - Get current user's full details
- **`/api/workspaces`** - CRUD operations for workspaces (GET/POST)
- **`/api/bookings`** - CRUD operations for bookings (GET/POST)

### Database Schema

```prisma
model User {
  id         String     @id @default(uuid())
  email      String     @unique
  password   String
  role       String     @default("user")
  workspaces Workspace[] @relation("WorkspaceCreator")
  bookings   Booking[]  @relation("UserBookings")
}

model Workspace {
  id        String   @id @default(uuid())
  name      String
  location  String
  capacity  Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  createdBy String
  creator   User     @relation("WorkspaceCreator", fields: [createdBy], references: [id])
  bookings  Booking[] @relation("WorkspaceBookings")
}

model Booking {
  id          String   @id @default(uuid())
  workspaceId String
  userId      String
  date        DateTime
  time        String
  name        String
  phone       String
  email       String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  workspace   Workspace @relation("WorkspaceBookings", fields: [workspaceId], references: [id], onDelete: Cascade)
  user        User     @relation("UserBookings", fields: [userId], references: [id], onDelete: Cascade)

  @@unique([workspaceId, date, time])
}
```

## Features & Validation

### Authentication
- JWT-based authentication with httpOnly cookies
- Role-based access control (admin/user)
- Protected routes with middleware
- Automatic session persistence

### Workspace Management
- **Admin**: Can create workspaces with name, location, and capacity
- **User**: Can view workspace list but cannot create workspaces
- Workspaces display creator information and creation date

### Booking System
- **1-hour time slots**: Only allows booking on the hour (e.g., 14:00, 15:00)
- **Validation Rules**:
  - Full Name: Minimum 3 characters, maximum 100 characters
  - Phone Number: Exactly 10 digits (removes formatting)
  - Email: Valid email format
  - Date: Cannot book for past dates
  - Time: Must be on the hour
- **Double Booking Prevention**: Database-level unique constraint and application-level checks
- **Error Handling**: Comprehensive error messages for validation failures

### UI/UX Features
- Responsive design for mobile and desktop
- Real-time form validation with visual feedback
- Modal booking forms
- Loading states and error handling
- Clean, simple interface using Tailwind CSS

## Testing the Application

### 1. Login as Admin
1. Go to `http://localhost:3000/login`
2. Login with `admin@example.com` / `Admin@123`
3. You should see "Add Workspace" button

### 2. Create a Workspace (Admin)
1. Click "Add Workspace"
2. Fill in workspace details:
   - Name: "Conference Room A"
   - Location: "Floor 3, Building A"
   - Capacity: 10
3. Click "Create Workspace"

### 3. Login as User
1. Logout and login with `user@example.com` / `User@123`
2. You should see workspace list but no "Add Workspace" button

### 4. Book a Workspace (User)
1. Click "Book Workspace" on any workspace
2. Fill in booking details:
   - Date: Select a future date
   - Time: Select time on the hour (e.g., 14:00)
   - Full Name: At least 3 characters
   - Phone: Exactly 10 digits
   - Email: Valid email format
3. Click "Book Now"

### 5. Test Validation
- Try booking with invalid data to see validation errors
- Try double-booking the same workspace/date/time
- Try booking for past dates

### 6. View Bookings
- Click "My Bookings" to see your booking history

## API Endpoints

### Authentication
```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "User@123"
}

POST /api/auth/logout

GET /api/auth/me

GET /api/auth/user
```

### Workspaces
```bash
GET /api/workspaces
# Returns list of all workspaces

POST /api/workspaces
# Admin only - Create new workspace
{
  "name": "Workspace Name",
  "location": "Location",
  "capacity": 10
}
```

### Bookings
```bash
GET /api/bookings
# Returns user's bookings

POST /api/bookings
# Create new booking
{
  "workspaceId": "workspace-uuid",
  "date": "2024-01-15",
  "time": "14:00",
  "name": "John Doe",
  "phone": "1234567890",
  "email": "john@example.com"
}
```

## Error Handling

The application provides comprehensive error handling:

- **400 Bad Request**: Validation errors (invalid input)
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Admin access required
- **404 Not Found**: Resource not found
- **409 Conflict**: Double booking attempt
- **500 Internal Server Error**: Server errors

## Security Features

- JWT tokens stored in httpOnly cookies
- Password hashing (bcrypt)
- Input validation and sanitization
- Role-based access control
- SQL injection prevention (Prisma ORM)
- XSS protection

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run seed         # Seed database with sample data
```

### Database Commands

```bash
npx prisma generate  # Generate Prisma client
npx prisma migrate dev # Run migrations
npx prisma studio    # Open Prisma Studio
npx prisma db seed   # Seed database
```

## Deployment

The application can be deployed to various platforms:

- **Vercel**: Recommended for Next.js apps
- **Railway**: Easy PostgreSQL + Next.js deployment
- **Heroku**: Traditional deployment option
- **Docker**: Containerized deployment

Make sure to set the environment variables in your deployment platform.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).
