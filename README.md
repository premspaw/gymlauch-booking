# Gym Booking Portal

A modern web application for managing gym class bookings. This application allows instructors to create and manage fitness classes, while users can view and book available spots.

## Features
- Create and manage fitness classes
- View available classes
- Book classes
- Delete classes
- Real-time seat availability
- Mobile-responsive design
- Instructor management
- Class type management

## Tech Stack
- Frontend: HTML5, CSS3, JavaScript
- Backend: Supabase
- Database: PostgreSQL (via Supabase)

## Prerequisites
- A Supabase account
- A GitHub account (for deployment)
- Basic knowledge of web development

## Setup Instructions

1. Clone this repository:
```bash
git clone https://github.com/your-username/gym-booking-portal.git
cd gym-booking-portal
```

2. Set up Supabase:
   - Create a new project at https://supabase.com
   - Create the following tables:
     ```sql
     -- class_types table
     CREATE TABLE class_types (
         id SERIAL PRIMARY KEY,
         name TEXT NOT NULL
     );

     -- instructors table
     CREATE TABLE instructors (
         id SERIAL PRIMARY KEY,
         name TEXT NOT NULL
     );

     -- classes table
     CREATE TABLE classes (
         id SERIAL PRIMARY KEY,
         class_name TEXT NOT NULL,
         instructor_name TEXT NOT NULL,
         date_time TIMESTAMP WITH TIME ZONE NOT NULL,
         duration INTEGER NOT NULL,
         total_seats INTEGER NOT NULL,
         available_seats INTEGER NOT NULL
     );
     ```
   - Get your project URL and anon key from Project Settings > API
   - Update the Supabase credentials in `assets/js/app.js` and `assets/js/instructor.js`

3. Local Development:
   - Use a local server to run the application:
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js
     npx serve
     ```
   - Access the application at:
     - User view: http://localhost:8000
     - Instructor view: http://localhost:8000/instructor.html

## Deployment Options

### Option 1: GitHub Pages (Free)
1. Create a new repository on GitHub
2. Push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/your-username/gym-booking-portal.git
   git push -u origin main
   ```
3. Enable GitHub Pages:
   - Go to repository Settings > Pages
   - Select main branch as source
   - Your site will be available at: `https://your-username.github.io/gym-booking-portal`

### Option 2: Netlify (Free)
1. Create a Netlify account
2. Connect your GitHub repository
3. Deploy settings:
   - Build command: leave empty
   - Publish directory: ./
4. Click Deploy

### Option 3: Vercel (Free)
1. Create a Vercel account
2. Connect your GitHub repository
3. Deploy settings:
   - Framework Preset: None
   - Build and Output Settings: leave empty
4. Click Deploy

## Security Considerations
- All database operations are handled through Supabase
- Row Level Security (RLS) policies are in place
- No sensitive data is stored in the frontend

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details. 