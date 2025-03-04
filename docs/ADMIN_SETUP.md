# Admin Setup Guide

This document provides instructions for setting up and managing the Training Hub application, including creating admin users and managing study guides and quizzes.

## Table of Contents

1. [Initial Setup](#initial-setup)
2. [Super Admin Account](#super-admin-account)
3. [Managing Users](#managing-users)
4. [Managing Study Guides](#managing-study-guides)
5. [Managing Quizzes](#managing-quizzes)
6. [Viewing Quiz Results](#viewing-quiz-results)
7. [Troubleshooting](#troubleshooting)

## Initial Setup

Before you can use the admin features, you need to set up the database and create a super admin account.

### Database Setup

1. Make sure your Supabase instance is running
2. Apply all migrations in the `supabase/migrations` directory
3. Create a super admin account using the provided script

## Super Admin Account

A super admin account has full access to the application and can assign admin roles to other users.

### Creating a Super Admin

Run the following command to create a super admin account:

```bash
# Connect to your Supabase database
psql -h <your-supabase-host> -p 5432 -d postgres -U postgres -f scripts/create-super-admin.sql
```

This will create a super admin account with the following credentials:

- Email: admin@example.com
- Password: Admin123!

**Important**: Change this password after your first login!

### Logging in as Super Admin

1. Navigate to the login page
2. Enter the super admin credentials
3. You will be prompted to change your password on first login
4. After changing your password, you will have access to the admin dashboard

## Managing Users

As a super admin, you can manage users from the admin dashboard.

### Assigning Admin Roles

1. Navigate to the Admin Dashboard
2. Go to the "User Management" section
3. Find the user you want to make an admin
4. Click the "Edit" button
5. Change their role to "admin"
6. Click "Save"

### Removing Admin Access

1. Navigate to the Admin Dashboard
2. Go to the "User Management" section
3. Find the admin user
4. Click the "Edit" button
5. Change their role to "user"
6. Click "Save"

## Managing Study Guides

Study guides are accessible to all users without requiring login. Admins can create, edit, and publish study guides.

### Creating a Study Guide

1. Navigate to the Admin Dashboard
2. Go to the "Study Guide Manager" section
3. Click "Create New Study Guide"
4. Fill in the title, description, and category
5. Add questions and answers
6. Set the status to "draft" while working on it
7. Click "Save"

### Publishing a Study Guide

1. Navigate to the Admin Dashboard
2. Go to the "Study Guide Manager" section
3. Find the study guide you want to publish
4. Click the "Edit" button
5. Set the status to "published"
6. Click "Save"

### Editing a Study Guide

1. Navigate to the Admin Dashboard
2. Go to the "Study Guide Manager" section
3. Find the study guide you want to edit
4. Click the "Edit" button
5. Make your changes
6. Click "Save"

## Managing Quizzes

Quizzes are based on study guides and can be used to test knowledge.

### Creating a Quiz

1. Navigate to the Admin Dashboard
2. Go to the "Quiz Manager" section
3. Click "Create New Quiz"
4. Select the study guide to base the quiz on
5. Configure quiz settings (time limit, passing score, etc.)
6. Click "Save"

### Generating Access Tokens

1. Navigate to the Admin Dashboard
2. Go to the "Quiz Manager" section
3. Find the quiz you want to generate tokens for
4. Click "Generate Access Tokens"
5. Specify the number of tokens and expiration date
6. Click "Generate"
7. Download or copy the generated tokens

## Viewing Quiz Results

Admins can view quiz results to track user performance.

1. Navigate to the Admin Dashboard
2. Go to the "Quiz Results" section
3. Use filters to find specific results (by date, user, quiz, etc.)
4. View detailed results including scores and answers

## Troubleshooting

### Database Connection Issues

If you encounter database connection issues:

1. Check that your Supabase instance is running
2. Verify your database credentials in the `.env` file
3. Check the Supabase console for any errors

### Authentication Issues

If users are having trouble logging in:

1. Check that the user exists in both `auth.users` and `public.users` tables
2. Verify that the user's email is confirmed
3. Reset the user's password if necessary

### Study Guide Access Issues

If study guides are not accessible to public users:

1. Check that the study guide is published
2. Verify that the RLS policies are correctly set up
3. Check the browser console for any errors

For additional help, please contact the development team.
