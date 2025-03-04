# Training Hub

A comprehensive training platform with study guides, quizzes, and administrative features.

## Features

- Interactive study guides
- Quiz system with access control
- Admin dashboard for content management
- Role-based access control (user, admin, super_admin)
- Password protection and security features

## Technology Stack

- React (TypeScript)
- Supabase for backend and authentication
- Styled Components for styling
- Docker support for development and deployment

## Setup

1. Clone the repository:
```bash
git clone https://github.com/OrionX6/Training-Hub.git
cd Training-Hub
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Set up your Supabase credentials in `.env`:
```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Run the development server:
```bash
npm start
```

## Database Setup

1. Create a Supabase project
2. Run the migration scripts in order:
   ```bash
   cd supabase/migrations
   ```
   Run each SQL file in numerical order through the Supabase SQL editor

3. Run the auth setup scripts:
   ```bash
   cd scripts
   ./test-auth.sh
   ```

## Default Super Admin Account

- Email: nojs2115@yahoo.com
- Password: Password123!

## Docker Support

To run with Docker:

```bash
# Development
docker-compose up

# Production
docker build -t training-hub .
docker run -p 80:80 training-hub
```

## Security

Make sure to:
- Change the default super admin password after first login
- Keep your Supabase credentials secure
- Never commit `.env` files
