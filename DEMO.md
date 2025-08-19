# Demo Guide - Workspace Booking Web App

This guide will help you demonstrate all the features of the workspace booking application.

## Demo Flow

### 1. Initial Setup (30 seconds)
- Show the application running at `http://localhost:3000`
- Mention the tech stack: Next.js, Tailwind CSS, PostgreSQL, Prisma, JWT

### 2. Authentication Demo (1 minute)

#### Login as Admin
1. Navigate to `/login`
2. Login with:
   - Email: `admin@example.com`
   - Password: `Admin@123`
3. Show successful redirect to home page
4. Point out "Add Workspace" button (admin-only)

#### Login as User
1. Logout
2. Login with:
   - Email: `user@example.com`
   - Password: `User@123`
3. Show that "Add Workspace" button is not visible
4. Point out "My Bookings" button (user-only)

### 3. Workspace Management Demo (1 minute)

#### Admin Creating Workspace
1. Login as admin
2. Click "Add Workspace"
3. Fill the form:
   - Name: "Conference Room A"
   - Location: "Floor 3, Building A"
   - Capacity: 10
4. Click "Create Workspace"
5. Show successful creation and redirect to home
6. Point out the new workspace in the list

### 4. Booking System Demo (2 minutes)

#### Valid Booking
1. Login as user
2. Click "Book Workspace" on any workspace
3. Fill booking form with valid data:
   - Date: Select tomorrow's date
   - Time: Select 14:00 (on the hour)
   - Full Name: "John Doe" (3+ characters)
   - Phone: "1234567890" (exactly 10 digits)
   - Email: "john@example.com" (valid format)
4. Click "Book Now"
5. Show success message

#### Validation Testing
1. Try booking with invalid data:
   - **Short name**: "Jo" → Show error: "Full name must be at least 3 characters"
   - **Invalid phone**: "123" → Show error: "Phone number must be exactly 10 digits"
   - **Invalid email**: "invalid" → Show error: "Please enter a valid email address"
   - **Past date**: Yesterday → Show error: "Cannot book for past dates"
   - **Invalid time**: 14:30 → Show error: "Booking time must be on the hour"

#### Double Booking Prevention
1. Try to book the same workspace at the same date/time
2. Show error: "This workspace is already booked for [date] at [time]"

### 5. Booking History Demo (30 seconds)
1. Click "My Bookings"
2. Show the booking history page
3. Point out booking details displayed

### 6. Role-Based Access Demo (30 seconds)
1. Show admin can see "Add Workspace" button
2. Show user cannot see "Add Workspace" button
3. Show user can see "My Bookings" button
4. Try accessing `/admin/workspaces` as user → Show access denied

## Key Features to Highlight

### ✅ Authentication
- JWT stored in httpOnly cookies
- Role-based access control
- Session persistence across page refreshes

### ✅ Workspace Management
- Admin can create workspaces
- Users can view workspaces
- Role-based UI elements

### ✅ Booking System
- 1-hour time slots only
- Comprehensive validation
- Double booking prevention
- Real-time form validation

### ✅ UI/UX
- Responsive design
- Clean, simple interface
- Error handling and feedback
- Loading states

### ✅ Security
- Protected routes
- Input validation
- SQL injection prevention
- XSS protection

## Demo Tips

1. **Prepare your data**: Make sure you have at least one workspace created before the demo
2. **Test the flow**: Run through the demo once before recording
3. **Show errors**: Don't skip the validation error demonstrations
4. **Explain the tech**: Mention the technical implementation briefly
5. **Keep it concise**: Focus on functionality, not code details

## Common Demo Scenarios

### Scenario 1: New User Experience
1. Show login page
2. Login as user
3. Show empty workspace list
4. Login as admin and create workspace
5. Login as user again and show workspace available for booking

### Scenario 2: Booking Conflict
1. Create a booking
2. Try to create another booking for same workspace/date/time
3. Show the conflict error
4. Show successful booking with different time

### Scenario 3: Validation Edge Cases
1. Try various invalid inputs
2. Show specific error messages
3. Demonstrate real-time validation

## Troubleshooting

### If something doesn't work:
1. Check the console for errors
2. Verify database connection
3. Ensure all environment variables are set
4. Check that migrations have been run

### Common Issues:
- **Login fails**: Check if users exist in database
- **Booking fails**: Check if workspace exists
- **Validation errors**: Check form input formats
- **Double booking not prevented**: Check database unique constraints

## Demo Script Example

```
"Hi, I'm going to demonstrate the Workspace Booking Web App I built using Next.js, Tailwind CSS, and PostgreSQL.

First, let me show you the authentication system. I'll login as an admin user...
[Login as admin]

As you can see, admins can create workspaces. Let me create one now...
[Create workspace]

Now let me login as a regular user to show the booking functionality...
[Login as user]

Users can book workspaces with comprehensive validation. Let me demonstrate...
[Book workspace]

Notice the validation - it requires a full name of at least 3 characters, exactly 10 digits for phone, and a valid email format. It also prevents double bookings.

Let me show you what happens when validation fails...
[Show validation errors]

And here's the booking history page where users can see all their bookings.

The app includes role-based access control, so users can't create workspaces and admins can't make bookings. It's fully responsive and includes comprehensive error handling.

That concludes the demo. The app meets all the requirements including authentication, workspace management, booking with validation, and role-based access control."
```
