# CareerFlow Pro - Setup Guide

## 🚀 Quick Start

This guide will help you set up the CareerFlow Pro development environment.

### Prerequisites

- **Node.js** 18+ and npm
- **MySQL** 8.0+
- **Git**

### Installation Steps

1. **Clone and Navigate**
   ```bash
   cd "/Volumes/External_01/ASH/Projects/Carrer Develpment Web"
   ```

2. **Install Root Dependencies**
   ```bash
   npm install
   ```

3. **Install All Workspace Dependencies**
   ```bash
   npm run install:all
   ```

4. **Set Up Environment Variables**
   ```bash
   # Copy the example environment file
   cp backend/.env.example backend/.env
   
   # Edit backend/.env with your database credentials
   # Update DB_PASSWORD and other settings as needed
   ```

5. **Set Up MySQL Database**
   ```bash
   # Start MySQL service
   # Create the database (if not exists)
   mysql -u root -p
   CREATE DATABASE career_development;
   ```

6. **Run Database Migrations**
   ```bash
   cd backend
   npm run db:migrate
   npm run db:seed
   ```

7. **Start Development Servers**
   ```bash
   # From the root directory
   npm run dev
   
   # Or start them separately:
   # Backend (http://localhost:3001)
   npm run dev:backend
   
   # Frontend (http://localhost:3000)
   npm run dev:frontend
   ```

## 🎯 What's Included in Phase 01

### ✅ Completed Features

- **Project Structure**: Monorepo with frontend/backend separation
- **Backend Foundation**: 
  - Express.js with TypeScript
  - Database connection and migrations
  - Error handling and logging
  - Security middleware (CORS, Helmet, Rate Limiting)
  - Database schema with all core entities
- **Frontend Foundation**:
  - React 18 with TypeScript
  - Tailwind CSS with CareerFlow Pro theme
  - Component library (Button, Card, Input, Modal)
  - Theme context and dark mode support
  - React Router setup
- **Database Schema**: Complete schema for Users, Jobs, Applications, Skills, Events, etc.
- **Theme System**: Professional CareerFlow Pro design system

### 🗄️ Database Schema

The database includes the following main entities:
- **Users** (Students, Employers, Admins)
- **Student Profiles** with career information
- **Employer Profiles** with company details
- **Jobs/Internships** with full job posting features
- **Applications** with status tracking
- **Skills** and skill relationships
- **Events & Workshops** with registration
- **Notifications** system
- **JWT Refresh Tokens** for authentication

### 🎨 Theme Features

- **CareerFlow Pro Design System**
- **Responsive Design** with mobile-first approach
- **Dark Mode Support** with system preference detection
- **Professional Color Palette** (Blue, Teal, Gold)
- **Typography System** with Inter font
- **Component Library** with consistent styling
- **Animation System** with smooth transitions

## 🧪 Testing the Setup

1. **Backend Health Check**
   ```bash
   curl http://localhost:3001/health
   ```

2. **Frontend Access**
   Open http://localhost:3000 in your browser

3. **Default Users** (from database seeding)
   - Admin: `admin@careerdev.com` / `password123`
   - Employer: `employer@techcorp.com` / `password123`
   - Student: `student@university.edu` / `password123`

## 📁 Project Structure

```
career-development-platform/
├── frontend/                 # React TypeScript frontend
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── contexts/        # React contexts
│   │   ├── styles/          # CSS and theme files
│   │   └── utils/           # Utility functions
│   └── public/              # Static assets
├── backend/                 # Node.js Express backend
│   ├── src/
│   │   ├── controllers/     # API controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API routes
│   │   ├── models/          # Database models
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utility functions
│   │   ├── database/        # Database setup
│   │   └── types/           # TypeScript types
│   └── logs/                # Application logs
├── database/                # Database schemas and migrations
└── docs/                    # Documentation
```

## 🔧 Development Commands

```bash
# Install dependencies
npm run install:all

# Development
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Frontend only
npm run dev:backend      # Backend only

# Building
npm run build            # Build both projects
npm run build:frontend   # Build frontend only
npm run build:backend    # Build backend only

# Testing
npm run test             # Run all tests
npm run test:frontend    # Frontend tests only
npm run test:backend     # Backend tests only

# Linting
npm run lint             # Lint all projects
npm run lint:frontend    # Frontend linting only
npm run lint:backend     # Backend linting only

# Database
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed database with sample data
```

## 🚀 Next Steps (Phase 02)

Phase 01 has established the foundation. Phase 02 will include:
- JWT Authentication system
- User registration and login
- Protected routes
- User profile management
- Role-based access control

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check MySQL is running
   - Verify credentials in `.env` file
   - Ensure database exists

2. **Port Already in Use**
   - Backend: Change `PORT` in `.env` file
   - Frontend: React will automatically find next available port

3. **Build Errors**
   - Run `npm run install:all` to ensure all dependencies are installed
   - Check TypeScript configuration

4. **Theme Not Loading**
   - Ensure `src/index.css` imports `./styles/theme.css`
   - Check Tailwind CSS configuration

### Getting Help

- Check the logs in `backend/logs/` for backend errors
- Use browser developer tools for frontend debugging
- Verify all environment variables are set correctly

## 📝 Environment Variables

Key environment variables to configure in `backend/.env`:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=career_development
DB_USER=root
DB_PASSWORD=your_password_here

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

---

**Phase 01 Complete!** 🎉

The foundation is now set up with a professional, scalable architecture. You can start developing features or move to Phase 02 for authentication implementation.
