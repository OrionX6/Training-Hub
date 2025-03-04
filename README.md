# Training Hub

A web application for managing study guides, quizzes, and training materials.

## Features

- Public access to study guides without requiring login
- Admin dashboard for managing content
- Super admin role for user management
- Quiz system with results tracking
- Responsive design for desktop and mobile

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account and project

## Setup Instructions

### 1. Environment Setup

Create a `.env` file in the root directory with the following variables:

```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Database Setup

1. Run the schema migration script in your Supabase SQL editor:
   - Copy the contents of `supabase/migrations/00000000000000_schema.sql` and run it in the SQL editor

2. Create a super admin user:
   - Copy the contents of `scripts/create-super-admin.sql` and run it in the SQL editor
   - This will create a super admin user with the following credentials:
     - Email: nojs2115@yahoo.com
     - Password: Password123!

3. Add sample data (optional):
   - Copy the contents of `scripts/add-sample-data.sql` and run it in the SQL editor
   - This will create sample study guides, questions, and a quiz

### 3. Install Dependencies

```bash
npm install
# or
yarn install
```

### 4. Start the Development Server

```bash
npm start
# or
yarn start
```

The application will be available at http://localhost:3000

## Usage

### Public Access

- Anyone can access the study guides without logging in
- Navigate to the Study Guides section to view available guides

### Admin Access

- Log in with admin credentials to access the admin dashboard
- Admins can create and manage study guides, quizzes, and questions

### Super Admin Access

- Log in with super admin credentials to access all admin features
- Super admins can also manage user roles and permissions

## Troubleshooting

### Login Issues

If you're having trouble logging in:

1. Check that your Supabase URL and anon key are correct in the `.env` file
2. Verify that the super admin user was created successfully
3. Try running the create-super-admin.sql script again

### Database Issues

If you encounter database errors:

1. Check the Supabase console for any error messages
2. Verify that all tables were created correctly
3. Try running the schema migration script again

## License

This project is licensed under the MIT License - see the LICENSE file for details.
