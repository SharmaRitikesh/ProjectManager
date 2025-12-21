# Project Manager - Full Stack Application

A modern, full-featured project management application built with **Java Spring Boot** and **React**.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Java](https://img.shields.io/badge/Java-21-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-green)
![React](https://img.shields.io/badge/React-18-blue)

## ✨ Features

### Core Features
- **Project Management** - Create, edit, and organize projects with descriptions and status tracking
- **Task Management** - Create tasks with priorities, deadlines, and assignees
- **Team Collaboration** - Add members to projects with different roles
- **Progress Tracking** - Visual progress bars and task completion metrics

### Authentication & Security
- **JWT Authentication** - Secure token-based authentication
- **Password Strength Validation** - Real-time password requirements checking
- **Email Validation** - Format verification on registration
- **Role-Based Access Control** - USER, MANAGER, ADMIN system roles

### Admin Dashboard
- **User Management** - View all users, edit credentials, change roles
- **Project Assignment** - Bulk assign users to projects with role selection
- **System Overview** - Statistics and metrics for all projects/users

### UI/UX
- **Professional Dark Theme** - Black/white gradient design
- **Responsive Layout** - Works on desktop, tablet, and mobile
- **Time-Based Greetings** - Dynamic Good Morning/Afternoon/Evening messages
- **Smooth Animations** - Subtle transitions and hover effects

---

## 🏗️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Java 21 | Programming language |
| Spring Boot 3.2 | Application framework |
| Spring Security | Authentication & authorization |
| Spring Data JPA | Database operations |
| H2 Database | In-memory database (dev) |
| Lombok | Boilerplate reduction |
| JWT | Token-based auth |

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI library |
| React Router | Client-side routing |
| Axios | HTTP client |
| Vite | Build tool |
| CSS3 | Styling |

---

## 📁 Project Structure

```
├── backend/
│   ├── src/main/java/com/projectmanager/
│   │   ├── controller/       # REST API endpoints
│   │   ├── dto/              # Data Transfer Objects
│   │   ├── model/            # Entity classes
│   │   ├── repository/       # Database repositories
│   │   ├── security/         # JWT & security config
│   │   └── service/          # Business logic
│   └── src/main/resources/
│       └── application.properties
│
├── frontend/
│   ├── src/
│   │   ├── api/              # Axios API configuration
│   │   ├── components/       # Reusable components
│   │   ├── context/          # React context (Auth)
│   │   └── pages/            # Page components
│   └── index.html
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Java 21 or higher
- Node.js 18 or higher
- npm or yarn

### Backend Setup

```bash
cd backend

# Using Maven Wrapper
./mvnw spring-boot:run

# Or with Maven installed
mvn spring-boot:run
```

The backend runs on **http://localhost:8080**

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend runs on **http://localhost:5173**

---

## 🔐 Authentication

### Register
1. Navigate to `/register`
2. Fill in username, email, full name
3. Create a password meeting all requirements:
   - 8+ characters
   - Uppercase letter
   - Lowercase letter
   - Number
   - Special character

### Login
1. Navigate to `/login`
2. Enter username and password
3. JWT token is stored for subsequent requests

### Admin Access
To make a user an admin, access H2 Console:
1. Go to `http://localhost:8080/h2-console`
2. JDBC URL: `jdbc:h2:mem:projectmanager`
3. Username: `sa`, Password: *(leave blank)*
4. Run: `UPDATE USERS SET SYSTEM_ROLE = 'ADMIN' WHERE USERNAME = 'yourusername';`

---

## 📊 Database Schema

### Users Table
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary key |
| username | VARCHAR(50) | Unique username |
| email | VARCHAR(100) | Unique email |
| password | VARCHAR(120) | Encrypted password |
| full_name | VARCHAR(100) | Display name |
| system_role | VARCHAR(20) | USER/MANAGER/ADMIN |
| created_at | TIMESTAMP | Registration date |

### Projects Table
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary key |
| name | VARCHAR(100) | Project name |
| description | VARCHAR(500) | Project description |
| status | VARCHAR(20) | ACTIVE/ON_HOLD/COMPLETED/ARCHIVED |
| owner_id | BIGINT | FK to Users |
| created_at | TIMESTAMP | Creation date |

### Tasks Table
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary key |
| title | VARCHAR(100) | Task title |
| description | TEXT | Task details |
| status | VARCHAR(20) | TODO/IN_PROGRESS/REVIEW/DONE |
| priority | VARCHAR(10) | LOW/MEDIUM/HIGH/URGENT |
| deadline | DATE | Due date |
| project_id | BIGINT | FK to Projects |
| assignee_id | BIGINT | FK to Users |

### Project Members Table
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary key |
| project_id | BIGINT | FK to Projects |
| user_id | BIGINT | FK to Users |
| role | VARCHAR(20) | OWNER/ADMIN/MENTOR/MEMBER/VIEWER |
| joined_at | TIMESTAMP | Join date |

---

## 🔗 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/register` | User registration |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get current user |
| GET | `/api/users/search` | Search users |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | Get all projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/{id}` | Get project by ID |
| PUT | `/api/projects/{id}` | Update project |
| DELETE | `/api/projects/{id}` | Delete project |
| POST | `/api/projects/{id}/members` | Add member |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks/project/{id}` | Get tasks by project |
| GET | `/api/tasks/my-tasks` | Get my tasks |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/{id}` | Update task |
| PATCH | `/api/tasks/{id}/status` | Update task status |
| DELETE | `/api/tasks/{id}` | Delete task |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | Get all users |
| PUT | `/api/admin/users/{id}` | Update user |
| PUT | `/api/admin/users/{id}/role` | Change user role |
| GET | `/api/admin/projects` | Get all projects |
| POST | `/api/admin/projects/{id}/assign` | Bulk assign users |

---

## 🎨 UI Components

### Pages
- **LoginPage** - Authentication with time-based greeting
- **RegisterPage** - Registration with password validation
- **DashboardPage** - Overview with stats and admin quick actions
- **ProjectsPage** - Project listing and creation
- **ProjectDetailPage** - Tasks, members, and progress
- **AdminDashboardPage** - User and project management

### Theme
The application uses a professional dark theme with:
- Background: `#000000` (pure black)
- Accents: White/gray gradients
- Cards: Glassmorphism with backdrop blur
- Buttons: White gradient with black text

---

## 📝 License

This project is for educational purposes.

---

## 👨‍💻 Author

Built as a Full Stack Development Project
