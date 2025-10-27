# Career Development Platform - Phases Documentation

## Project Overview
A comprehensive web application for internship and career development management, built with React frontend, Node.js backend, and MySQL database.

## Technology Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, React Router
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: MySQL 8.0
- **Authentication**: JWT with refresh tokens
- **File Storage**: AWS S3 or local storage
- **Email**: Nodemailer with SMTP
- **Testing**: Jest, React Testing Library
- **Deployment**: Docker, AWS/DigitalOcean

---

## Recommended Theme: "CareerFlow Pro"

### Design Philosophy
- **Clean & Professional**: Modern minimalist design with clean lines
- **Trustworthy**: Professional color scheme that builds confidence
- **Engaging**: Interactive elements and smooth animations
- **Accessible**: WCAG compliant design for all users

### Color Palette
```css
/* Primary Colors */
--primary-blue: #1e3a8a;        /* Deep Blue - Trust and professionalism */
--primary-blue-light: #3b82f6;  /* Lighter Blue for hover states */
--primary-blue-dark: #1e40af;   /* Darker Blue for active states */

/* Secondary Colors */
--secondary-teal: #0d9488;      /* Teal - Growth and opportunity */
--secondary-teal-light: #14b8a6; /* Lighter Teal for accents */
--secondary-teal-dark: #0f766e;  /* Darker Teal for depth */

/* Accent Colors */
--accent-gold: #f59e0b;         /* Gold - Success and achievement */
--accent-gold-light: #fbbf24;   /* Lighter Gold for highlights */
--accent-gold-dark: #d97706;    /* Darker Gold for emphasis */

/* Neutral Colors */
--neutral-white: #ffffff;       /* Pure white */
--neutral-gray-50: #f8fafc;     /* Light background */
--neutral-gray-100: #f1f5f9;   /* Card backgrounds */
--neutral-gray-200: #e2e8f0;   /* Borders */
--neutral-gray-300: #cbd5e1;    /* Disabled states */
--neutral-gray-400: #94a3b8;    /* Placeholder text */
--neutral-gray-500: #64748b;    /* Secondary text */
--neutral-gray-600: #475569;    /* Primary text */
--neutral-gray-700: #334155;    /* Headings */
--neutral-gray-800: #1e293b;    /* Dark text */
--neutral-gray-900: #0f172a;   /* Darkest text */

/* Status Colors */
--success-green: #10b981;       /* Success states */
--warning-orange: #f59e0b;      /* Warning states */
--error-red: #ef4444;           /* Error states */
--info-blue: #3b82f6;           /* Info states */
```

### Typography System
```css
/* Font Families */
--font-heading: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Font Sizes */
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 1.875rem;   /* 30px */
--text-4xl: 2.25rem;    /* 36px */
--text-5xl: 3rem;       /* 48px */
--text-6xl: 3.75rem;    /* 60px */

/* Font Weights */
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;

/* Line Heights */
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;
```

### Spacing System
```css
/* Spacing Scale */
--space-1: 0.25rem;    /* 4px */
--space-2: 0.5rem;      /* 8px */
--space-3: 0.75rem;     /* 12px */
--space-4: 1rem;         /* 16px */
--space-5: 1.25rem;      /* 20px */
--space-6: 1.5rem;       /* 24px */
--space-8: 2rem;         /* 32px */
--space-10: 2.5rem;      /* 40px */
--space-12: 3rem;        /* 48px */
--space-16: 4rem;        /* 64px */
--space-20: 5rem;        /* 80px */
--space-24: 6rem;        /* 96px */
--space-32: 8rem;        /* 128px */
```

### Border Radius
```css
--radius-sm: 0.125rem;   /* 2px */
--radius-base: 0.25rem;  /* 4px */
--radius-md: 0.375rem;   /* 6px */
--radius-lg: 0.5rem;     /* 8px */
--radius-xl: 0.75rem;    /* 12px */
--radius-2xl: 1rem;      /* 16px */
--radius-3xl: 1.5rem;    /* 24px */
--radius-full: 9999px;    /* Fully rounded */
```

### Shadows
```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-base: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
```

### Component Design Guidelines

#### Buttons
- **Primary**: Deep blue background with white text
- **Secondary**: Teal background with white text
- **Outline**: Transparent background with colored border
- **Ghost**: Transparent background with colored text
- **Sizes**: Small (sm), Medium (md), Large (lg)
- **States**: Default, Hover, Active, Disabled, Loading

#### Cards
- **Background**: White with subtle shadow
- **Border**: Light gray border
- **Padding**: Consistent spacing
- **Hover**: Subtle shadow increase
- **Border Radius**: Medium rounded corners

#### Forms
- **Input Fields**: Clean borders, focus states with primary color
- **Labels**: Medium weight, proper contrast
- **Validation**: Clear error states with red accents
- **Placeholders**: Muted text color

#### Navigation
- **Header**: Clean, minimal design with proper spacing
- **Sidebar**: Collapsible, organized sections
- **Breadcrumbs**: Clear hierarchy indication
- **Active States**: Clear visual feedback

### Animation Guidelines
```css
/* Transition Durations */
--duration-fast: 150ms;
--duration-normal: 300ms;
--duration-slow: 500ms;

/* Easing Functions */
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Responsive Breakpoints
```css
--breakpoint-sm: 640px;   /* Small devices */
--breakpoint-md: 768px;   /* Medium devices */
--breakpoint-lg: 1024px;  /* Large devices */
--breakpoint-xl: 1280px;  /* Extra large devices */
--breakpoint-2xl: 1536px; /* 2X large devices */
```

### Accessibility Features
- **Color Contrast**: WCAG AA compliant (4.5:1 ratio minimum)
- **Focus States**: Clear keyboard navigation indicators
- **Screen Reader**: Proper ARIA labels and semantic HTML
- **Motion**: Respect prefers-reduced-motion settings
- **Touch Targets**: Minimum 44px touch target size

---

## Phase 1: Foundation & Setup (Week 1-2)

### 1.1 Project Initialization
- [x] Set up development environment
- [x] Initialize Git repository with proper .gitignore
- [x] Create project structure for monorepo or separate repos
- [x] Set up ESLint, Prettier, and TypeScript configurations
- [x] Configure environment variables management

### 1.2 Database Design & Setup
- [x] Design database schema for:
  - Users (Students, Employers, Admins)
  - Jobs/Internships
  - Applications
  - Career Development Plans
  - Skills & Competencies
  - Events & Workshops
  - Notifications
- [x] Set up MySQL database
- [x] Create database migrations
- [x] Set up database seeding for development

### 1.3 Backend Foundation
- [x] Initialize Node.js/Express project
- [x] Set up TypeScript configuration
- [x] Configure middleware (CORS, helmet, morgan)
- [x] Set up database connection (MySQL)
- [x] Create basic API structure
- [x] Implement error handling middleware
- [x] Set up logging system

### 1.4 Frontend Foundation
- [x] Initialize React project with TypeScript
- [x] Set up Tailwind CSS with CareerFlow Pro theme configuration
- [x] Configure custom CSS variables for theme colors and spacing
- [x] Set up Inter font family from Google Fonts
- [x] Configure React Router
- [x] Set up state management (Context API or Redux Toolkit)
- [x] Create basic component structure with theme integration
- [x] Set up API client (Axios)
- [x] Implement responsive design system using theme breakpoints
- [x] Create theme configuration file with all CSS variables
- [x] Set up component library foundation (Button, Card, Input, etc.)

### 1.5 Theme Implementation
- [x] Create `src/styles/theme.css` with all CSS custom properties
- [x] Set up Tailwind config with CareerFlow Pro color palette
- [x] Create theme provider context for dynamic theming
- [ ] Implement dark mode support (optional)
- [x] Create base component styles following design guidelines
- [x] Set up icon library (Heroicons or Lucide React)
- [x] Create animation utilities using theme timing functions
- [x] Implement responsive utilities using theme breakpoints
- [ ] Set up CSS-in-JS or styled-components (if preferred over Tailwind)
- [x] Create theme documentation for developers

---

## Phase 2: Authentication & User Management (Week 3-4)

### 2.1 Authentication System
- [x] Implement JWT authentication
- [x] Create login/register endpoints
- [x] Set up password hashing (bcrypt)
- [x] Implement refresh token mechanism
- [ ] Create password reset functionality
- [ ] Add email verification system

### 2.2 User Roles & Permissions
- [x] Implement role-based access control (RBAC)
- [x] Create user roles: Student, Employer, Admin
- [x] Set up permission middleware
- [x] Implement user profile management
- [x] Add user dashboard based on role

### 2.3 Frontend Authentication
- [x] Create login/register forms using CareerFlow Pro theme
- [x] Implement protected routes with theme-aware loading states
- [x] Set up authentication context
- [x] Create user profile components with consistent styling
- [x] Implement logout functionality with confirmation modal
- [x] Add form validation and error handling with theme colors
- [x] Create authentication layout with theme branding
- [x] Implement loading states using theme animations
- [x] Add success/error notifications with theme styling

---

## Phase 3: Core Features - Job Management (Week 5-7)

### 3.1 Job/Internship Management (Employer Side) ✅ **COMPLETED**
- [x] Create job posting form
- [x] Implement job CRUD operations
- [x] Add job categories and tags
- [x] Set up job search and filtering
- [x] Implement job status management
- [x] Add job analytics dashboard

### 3.2 Job Discovery (Student Side) ✅ **COMPLETED**
- [x] Create job listing page with filters using theme cards
- [x] Implement job search functionality with theme-styled search bar
- [x] Add job details page with consistent theme layout
- [x] Create job application system with theme forms
- [x] Implement application tracking with theme progress indicators
- [x] Add job recommendations with theme-styled recommendation cards
- [x] Create job bookmark/favorite functionality with theme icons
- [x] Implement job sharing with theme-styled share buttons

### 3.3 Application Management ✅ **COMPLETED**
- [x] Create enhanced application form with file uploads and rich content
- [x] Implement comprehensive application status tracking with timeline
- [x] Add application review system
- [x] Create application analytics dashboard
- [x] Implement bulk operations for applications
- [x] Add application communication system

---

## Phase 4: Career Development Features (Week 8-10)

### 4.1 Skills & Competency Management
- [ ] Create skills database
- [ ] Implement skill assessment tools
- [ ] Add competency tracking
- [ ] Create skill gap analysis
- [ ] Implement skill recommendations
- [ ] Add skill certification system

### 4.2 Career Planning Tools
- [ ] Create career path mapping
- [ ] Implement goal setting system
- [ ] Add progress tracking
- [ ] Create career milestone system
- [ ] Implement career advice engine
- [ ] Add mentorship matching

### 4.3 Learning & Development
- [ ] Create learning resource library
- [ ] Implement course management
- [ ] Add progress tracking
- [ ] Create certification system
- [ ] Implement learning paths
- [ ] Add skill-based recommendations

---

## Phase 5: Communication & Engagement (Week 11-12)

### 5.1 Messaging System
- [ ] Implement real-time messaging
- [ ] Create message threading
- [ ] Add file sharing capabilities
- [ ] Implement message search
- [ ] Add message notifications
- [ ] Create message templates

### 5.2 Event Management
- [ ] Create event creation system
- [ ] Implement event registration
- [ ] Add event calendar
- [ ] Create event notifications
- [ ] Implement event feedback
- [ ] Add event analytics

### 5.3 Notification System
- [ ] Implement email notifications
- [ ] Add in-app notifications
- [ ] Create notification preferences
- [ ] Implement notification scheduling
- [ ] Add notification analytics
- [ ] Create notification templates

---

## Phase 6: Analytics & Reporting (Week 13-14)

### 6.1 Dashboard Analytics
- [ ] Create admin dashboard
- [ ] Implement user analytics
- [ ] Add job posting analytics
- [ ] Create application analytics
- [ ] Implement engagement metrics
- [ ] Add performance indicators

### 6.2 Reporting System
- [ ] Create report generation
- [ ] Implement data export
- [ ] Add custom report builder
- [ ] Create scheduled reports
- [ ] Implement report sharing
- [ ] Add report analytics

---

## Phase 7: Advanced Features (Week 15-16)

### 7.1 AI-Powered Features
- [ ] Implement job matching algorithm
- [ ] Add skill gap analysis
- [ ] Create personalized recommendations
- [ ] Implement resume optimization
- [ ] Add interview preparation tools
- [ ] Create career path suggestions

### 7.2 Integration Features
- [ ] LinkedIn integration
- [ ] Calendar integration
- [ ] Email integration
- [ ] Social media integration
- [ ] Third-party job boards
- [ ] HR system integration

---

## Phase 8: Testing & Quality Assurance (Week 17-18)

### 8.1 Testing Implementation
- [ ] Unit testing for backend
- [ ] Integration testing
- [ ] Frontend component testing
- [ ] End-to-end testing
- [ ] Performance testing
- [ ] Security testing

### 8.2 Code Quality
- [ ] Code review process
- [ ] Static code analysis
- [ ] Performance optimization
- [ ] Security audit
- [ ] Accessibility testing
- [ ] Cross-browser testing

---

## Phase 9: Deployment & DevOps (Week 19-20)

### 9.1 Production Setup
- [ ] Set up production database
- [ ] Configure production environment
- [ ] Set up CI/CD pipeline
- [ ] Implement monitoring and logging
- [ ] Set up backup systems
- [ ] Configure SSL certificates

### 9.2 Deployment
- [ ] Deploy backend to cloud
- [ ] Deploy frontend to CDN
- [ ] Set up domain and DNS
- [ ] Configure load balancing
- [ ] Implement auto-scaling
- [ ] Set up monitoring dashboards

---

## Phase 10: Launch & Maintenance (Week 21-22)

### 10.1 Pre-Launch
- [ ] User acceptance testing
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Documentation completion
- [ ] Training materials
- [ ] Launch planning

### 10.2 Post-Launch
- [ ] Monitor system performance
- [ ] Collect user feedback
- [ ] Bug fixes and updates
- [ ] Feature enhancements
- [ ] User support
- [ ] Continuous improvement

---

## Key Features by User Role

### Student Features
- Job search and application
- Career planning tools
- Skill assessment and tracking
- Learning resources
- Event participation
- Messaging with employers
- Application tracking
- Resume builder
- Interview preparation

### Employer Features
- Job posting management
- Candidate screening
- Application review
- Communication tools
- Analytics dashboard
- Event hosting
- Talent pipeline management
- Company profile management

### Admin Features
- User management
- System configuration
- Analytics and reporting
- Content management
- Event management
- Notification management
- Security monitoring
- Performance monitoring

---

## Technical Considerations

### Security
- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection
- Rate limiting
- HTTPS enforcement

### Performance
- Database indexing
- Query optimization
- Caching strategy (Redis)
- CDN for static assets
- Image optimization
- Lazy loading
- Code splitting
- Bundle optimization

### Scalability
- Microservices architecture consideration
- Database sharding
- Load balancing
- Auto-scaling
- Caching layers
- CDN implementation
- API rate limiting
- Queue management

---

## Success Metrics

### User Engagement
- Daily/Monthly active users
- Session duration
- Feature adoption rates
- User retention rates
- Application completion rates

### Business Metrics
- Job posting success rate
- Application-to-hire conversion
- User satisfaction scores
- Platform performance metrics
- Revenue metrics (if applicable)

---

## Risk Mitigation

### Technical Risks
- Database performance issues
- Security vulnerabilities
- Scalability challenges
- Third-party service dependencies
- Data loss prevention

### Business Risks
- User adoption challenges
- Competition analysis
- Feature scope creep
- Timeline delays
- Resource constraints

---

---

## Theme Implementation Guide

### Tailwind CSS Configuration
Create `tailwind.config.js` with CareerFlow Pro theme:

```javascript
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        accent: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'heading': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 0.6s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
  plugins: [],
}
```

### CSS Custom Properties Setup
Create `src/styles/theme.css`:

```css
:root {
  /* Colors */
  --primary-blue: #1e3a8a;
  --primary-blue-light: #3b82f6;
  --primary-blue-dark: #1e40af;
  
  --secondary-teal: #0d9488;
  --secondary-teal-light: #14b8a6;
  --secondary-teal-dark: #0f766e;
  
  --accent-gold: #f59e0b;
  --accent-gold-light: #fbbf24;
  --accent-gold-dark: #d97706;
  
  /* Neutral Colors */
  --neutral-white: #ffffff;
  --neutral-gray-50: #f8fafc;
  --neutral-gray-100: #f1f5f9;
  --neutral-gray-200: #e2e8f0;
  --neutral-gray-300: #cbd5e1;
  --neutral-gray-400: #94a3b8;
  --neutral-gray-500: #64748b;
  --neutral-gray-600: #475569;
  --neutral-gray-700: #334155;
  --neutral-gray-800: #1e293b;
  --neutral-gray-900: #0f172a;
  
  /* Status Colors */
  --success-green: #10b981;
  --warning-orange: #f59e0b;
  --error-red: #ef4444;
  --info-blue: #3b82f6;
  
  /* Typography */
  --font-heading: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  
  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-20: 5rem;
  --space-24: 6rem;
  --space-32: 8rem;
  
  /* Border Radius */
  --radius-sm: 0.125rem;
  --radius-base: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
  --radius-3xl: 1.5rem;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-base: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  
  /* Transitions */
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
  
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Base Styles */
* {
  box-sizing: border-box;
}

body {
  font-family: var(--font-body);
  color: var(--neutral-gray-700);
  background-color: var(--neutral-gray-50);
  line-height: 1.6;
}

/* Component Base Styles */
.btn-primary {
  background-color: var(--primary-blue);
  color: var(--neutral-white);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-6);
  font-weight: 500;
  transition: all var(--duration-normal) var(--ease-in-out);
}

.btn-primary:hover {
  background-color: var(--primary-blue-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.card {
  background-color: var(--neutral-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-base);
  padding: var(--space-6);
  border: 1px solid var(--neutral-gray-200);
  transition: all var(--duration-normal) var(--ease-in-out);
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.input-field {
  border: 1px solid var(--neutral-gray-300);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  font-size: 1rem;
  transition: all var(--duration-normal) var(--ease-in-out);
}

.input-field:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 3px rgb(59 130 246 / 0.1);
}
```

### Component Library Examples

#### Button Component
```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled = false,
  loading = false,
}) => {
  const baseClasses = 'font-medium rounded-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-primary-800 text-white hover:bg-primary-900 focus:ring-primary-500',
    secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500',
    outline: 'border border-primary-800 text-primary-800 hover:bg-primary-50 focus:ring-primary-500',
    ghost: 'text-primary-800 hover:bg-primary-50 focus:ring-primary-500',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  );
};
```

#### Card Component
```tsx
interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hover = true }) => {
  const hoverClasses = hover ? 'hover:shadow-lg hover:-translate-y-1' : '';
  
  return (
    <div className={`bg-white rounded-lg shadow-md border border-gray-200 p-6 transition-all duration-300 ease-in-out ${hoverClasses} ${className}`}>
      {children}
    </div>
  );
};
```

### Theme Provider Setup
```tsx
import React, { createContext, useContext, useState } from 'react';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={theme === 'dark' ? 'dark' : ''}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
```

This comprehensive phases documentation provides a structured approach to building the career development platform with the CareerFlow Pro theme fully integrated. Each phase builds upon the previous one, ensuring a solid foundation while delivering value incrementally.
