# Career Development Platform

A comprehensive web application for internship and career development management, built with React frontend, Node.js backend, and MySQL database.

## 🚀 Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, React Router
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: MySQL 8.0
- **Authentication**: JWT with refresh tokens
- **File Storage**: AWS S3 or local storage
- **Email**: Nodemailer with SMTP
- **Testing**: Jest, React Testing Library
- **Deployment**: Docker, AWS/DigitalOcean

## 🎨 Theme: CareerFlow Pro

A professional, modern design system featuring:
- Clean & Professional aesthetic
- Trustworthy color scheme
- Engaging interactive elements
- WCAG compliant accessibility

### Color Palette
- **Primary**: Deep Blue (#1e3a8a) - Trust and professionalism
- **Secondary**: Teal (#0d9488) - Growth and opportunity  
- **Accent**: Gold (#f59e0b) - Success and achievement

## 📁 Project Structure

```
career-development-platform/
├── frontend/                 # React TypeScript frontend
├── backend/                  # Node.js Express backend
├── database/                 # Database schemas and migrations
├── docs/                     # Documentation
├── package.json              # Root package.json for workspace management
└── README.md                 # This file
```

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ and npm
- MySQL 8.0+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd career-development-platform
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration
   ```

4. **Set up the database**
   ```bash
   # Create MySQL database
   mysql -u root -p
   CREATE DATABASE career_development;
   ```

5. **Run database migrations**
   ```bash
   cd backend
   npm run db:migrate
   npm run db:seed
   ```

### Development

Start both frontend and backend in development mode:
```bash
npm run dev
```

Or start them separately:
```bash
# Backend only (runs on http://localhost:3001)
npm run dev:backend

# Frontend only (runs on http://localhost:3000)
npm run dev:frontend
```

## 🧪 Testing

Run all tests:
```bash
npm run test
```

Run tests for specific workspace:
```bash
npm run test:frontend
npm run test:backend
```

## 🏗️ Building for Production

Build all projects:
```bash
npm run build
```

## 📋 Features by User Role

### 👨‍🎓 Student Features
- Job search and application
- Career planning tools
- Skill assessment and tracking
- Learning resources
- Event participation
- Application tracking
- Resume builder

### 🏢 Employer Features
- Job posting management
- Candidate screening
- Application review
- Communication tools
- Analytics dashboard
- Event hosting
- Talent pipeline management

### 👨‍💼 Admin Features
- User management
- System configuration
- Analytics and reporting
- Content management
- Event management
- Security monitoring

## 🚀 Deployment

The application is designed for deployment on:
- AWS (EC2, RDS, S3)
- DigitalOcean
- Docker containers

See deployment documentation in the `docs/` folder for detailed instructions.

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Please read our contributing guidelines before submitting pull requests.

## 📞 Support

For support and questions, please contact the development team.
