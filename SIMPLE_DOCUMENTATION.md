# Project Management Tool - Simplified Documentation

## For Viva/Oral Presentation

> This document explains the project in simple terms for easy understanding during project evaluation.

---

## 1. What is This Project?

**Project Name:** Project Management and Team Collaboration Tool

**Simple Definition:** A website where teams can organize their work - create projects, assign tasks to team members, and track progress.

**Real-World Example:** Think of it like a digital notice board where:
- A team leader can post what needs to be done
- Team members can see their tasks
- Everyone can track if work is complete or pending

---

## 2. Why Was This Project Made?

### The Problem:
- Teams struggle to manage multiple projects
- Assigning tasks through email or WhatsApp is confusing
- No one knows who is doing what
- Tracking progress is difficult

### Our Solution:
A web application where:
- Projects are organized in one place
- Tasks are assigned to specific people
- Everyone can see progress in real-time
- Admins can manage users and projects

---

## 3. Technologies Used (Tech Stack)

### Frontend (What Users See)
| Technology | What It Does | Simple Explanation |
|------------|--------------|-------------------|
| **React.js** | UI Library | Creates the website pages users interact with |
| **React Router** | Navigation | Allows moving between pages without reloading |
| **Axios** | API Calls | Sends requests to the server |
| **Vite** | Build Tool | Makes the website ready for browsers |
| **CSS3** | Styling | Makes the website look beautiful |

### Backend (Server-Side Logic)
| Technology | What It Does | Simple Explanation |
|------------|--------------|-------------------|
| **Java 21** | Programming Language | The language used to write server code |
| **Spring Boot** | Framework | Makes it easy to build Java web applications |
| **Spring Security** | Security | Protects the application from unauthorized access |
| **JWT** | Authentication | Like a digital ID card for users |
| **Hibernate/JPA** | Database Access | Talks to the database |

### Database
| Technology | What It Does |
|------------|--------------|
| **MySQL/H2** | Stores all data (users, projects, tasks) |

---

## 4. How Does It Work? (Architecture)

```
┌─────────────┐     ┌────────────────┐     ┌────────────────┐     ┌───────────┐
│    USER     │ --> │ REACT FRONTEND │ --> │ SPRING BACKEND │ --> │  DATABASE │
│ (Browser)   │ <-- │   (Website)    │ <-- │ (Server/API)   │ <-- │  (MySQL)  │
└─────────────┘     └────────────────┘     └────────────────┘     └───────────┘
```

### Step-by-Step Flow:

1. **User opens website** in browser
2. **React Frontend** displays the page
3. **User performs action** (like creating a project)
4. **Frontend sends request** to backend via REST API
5. **Spring Boot Backend** processes the request
6. **Backend talks to Database** to save/retrieve data
7. **Response sent back** to frontend
8. **Frontend updates** the display

---

## 5. Key Features

### A. User Authentication (Login System)
- **Registration:** New users create account with username, email, password
- **Login:** Users enter credentials to access the system
- **JWT Tokens:** After login, user gets a "token" (like a digital pass) for accessing protected pages
- **Password Security:** Passwords are encrypted using BCrypt (one-way hashing)

### B. Project Management
- **Create Project:** Users can create new projects with name and description
- **View Projects:** See all projects you own or are a member of
- **Edit/Delete:** Modify or remove projects
- **Status Tracking:** ACTIVE, ON_HOLD, COMPLETED, ARCHIVED

### C. Task Management
- **Create Tasks:** Add tasks within a project
- **Assign Tasks:** Assign tasks to team members
- **Set Priority:** LOW, MEDIUM, HIGH, URGENT
- **Set Deadline:** Due date for task completion
- **Update Status:** TODO → IN_PROGRESS → REVIEW → DONE

### D. Team Collaboration
- **Add Members:** Add users to your project
- **Assign Roles:** OWNER, ADMIN, MENTOR, MEMBER, VIEWER
- **View Team:** See all project members

### E. Admin Dashboard (For Admins Only)
- **View All Users:** See registered users
- **Change User Roles:** Promote users to MANAGER or ADMIN
- **Manage Projects:** Assign users to any project

---

## 6. Database Tables

### Users Table
Stores user information:
- id (unique number)
- username
- email
- password (encrypted)
- full_name
- system_role (USER/MANAGER/ADMIN)
- created_at

### Projects Table
Stores project information:
- id
- name
- description
- status
- owner_id (who created it)
- created_at

### Tasks Table
Stores task information:
- id
- title
- description
- status
- priority
- deadline
- project_id (belongs to which project)
- assignee_id (who is assigned)

### Project_Members Table
Links users to projects with roles:
- project_id
- user_id
- role (OWNER/ADMIN/MEMBER/VIEWER)

---

## 7. How Login Works (Authentication Flow)

```
           LOGIN PROCESS
           ==============

User enters username/password
            ↓
Frontend sends to /api/auth/login
            ↓
Backend checks username exists
            ↓
Backend verifies password (BCrypt)
            ↓
Backend creates JWT token
            ↓
Token sent back to frontend
            ↓
Token stored in browser (localStorage)
            ↓
User is now "logged in"


           ACCESSING PROTECTED PAGES
           =========================

User clicks on "Projects" page
            ↓
Frontend sends request with JWT token
            ↓
Backend JwtFilter checks token
            ↓
If valid: Allow access
If invalid: Redirect to login
```

---

## 8. Project Structure (File Organization)

### Backend (Java/Spring Boot)
```
backend/
├── controller/     → Handles HTTP requests (like a receptionist)
│   ├── AuthController.java      → Login/Register endpoints
│   ├── ProjectController.java   → Project CRUD endpoints
│   ├── TaskController.java      → Task CRUD endpoints
│   └── AdminController.java     → Admin-only endpoints
│
├── service/        → Business logic (the actual work)
│   ├── AuthService.java         → Login/Register logic
│   ├── ProjectService.java      → Project operations
│   └── TaskService.java         → Task operations
│
├── repository/     → Database access (talks to MySQL)
│   ├── UserRepository.java
│   ├── ProjectRepository.java
│   └── TaskRepository.java
│
├── model/          → Data structures (what data looks like)
│   ├── User.java
│   ├── Project.java
│   └── Task.java
│
└── security/       → Authentication/Authorization
    ├── SecurityConfig.java       → Security rules
    ├── JwtTokenProvider.java     → Create/validate tokens
    └── JwtAuthenticationFilter.java → Check tokens on requests
```

### Frontend (React)
```
frontend/src/
├── pages/          → Main screens users see
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── DashboardPage.jsx
│   ├── ProjectsPage.jsx
│   └── AdminDashboardPage.jsx
│
├── components/     → Reusable UI pieces
│   └── Sidebar.jsx
│
├── context/        → Global state management
│   └── AuthContext.jsx  → Manages logged-in user info
│
└── api/            → API communication
    └── axios.js    → Configured HTTP client
```

---

## 9. Key Concepts Explained Simply

### What is REST API?
- **REST** = Representational State Transfer
- It's a way for frontend and backend to communicate
- Uses HTTP methods: GET (read), POST (create), PUT (update), DELETE (delete)
- Example: `GET /api/projects` returns list of all projects

### What is JWT?
- **JWT** = JSON Web Token
- A secure string that proves "this user is logged in"
- Contains: user info + expiration time + digital signature
- Sent with every request in the "Authorization" header

### What is Spring Boot?
- A Java framework that makes building web applications easy
- Provides auto-configuration (less manual setup)
- Built-in web server (Tomcat)
- Easy database integration

### What is React?
- A JavaScript library for building user interfaces
- Uses "components" - reusable UI pieces
- Virtual DOM - efficient page updates
- One-way data flow - predictable state management

---

## 10. API Endpoints (How Frontend Talks to Backend)

### Authentication
| Request | Endpoint | Purpose |
|---------|----------|---------|
| POST | /api/auth/login | User login |
| POST | /api/auth/register | Create new user |

### Projects
| Request | Endpoint | Purpose |
|---------|----------|---------|
| GET | /api/projects | Get all projects |
| POST | /api/projects | Create project |
| PUT | /api/projects/{id} | Update project |
| DELETE | /api/projects/{id} | Delete project |

### Tasks
| Request | Endpoint | Purpose |
|---------|----------|---------|
| GET | /api/tasks/project/{id} | Get tasks for a project |
| POST | /api/tasks | Create task |
| PUT | /api/tasks/{id} | Update task |
| PATCH | /api/tasks/{id}/status | Change task status |

---

## 11. Security Features

1. **Password Encryption**
   - Passwords are NEVER stored as plain text
   - BCrypt algorithm creates a one-way hash
   - Even if database is hacked, passwords can't be read

2. **JWT Authentication**
   - Stateless - server doesn't store sessions
   - Token expires after 24 hours
   - Signed with secret key - can't be forged

3. **Role-Based Access Control**
   - USER: Can create own projects
   - MANAGER: Can access admin features
   - ADMIN: Full system access

4. **CORS Protection**
   - Only allowed origins can access the API
   - Prevents unauthorized websites from accessing data

---

## 12. Common Viva Questions & Answers

### Q1: What is Full Stack Development?
**A:** Full Stack means developing both frontend (user interface) and backend (server logic). In this project, React is frontend, Spring Boot is backend.

### Q2: Why did you choose React?
**A:** React is popular, fast, component-based, and has a large community. It uses Virtual DOM for efficient updates.

### Q3: Why Spring Boot instead of Node.js?
**A:** Spring Boot is enterprise-grade, type-safe (Java), and has excellent security features. Good for large-scale applications.

### Q4: How do you ensure security?
**A:** 
- Passwords encrypted with BCrypt
- JWT tokens for authentication
- Role-based access control
- HTTPS for data transmission

### Q5: What is the difference between authentication and authorization?
**A:** 
- **Authentication:** Verifying WHO you are (login)
- **Authorization:** Verifying WHAT you can do (permissions/roles)

### Q6: What is a REST API?
**A:** A standard way for applications to communicate over HTTP using methods like GET, POST, PUT, DELETE.

### Q7: How does the project handle concurrent users?
**A:** Spring Boot is multi-threaded - can handle many users simultaneously. JWT tokens are stateless, reducing server load.

### Q8: What database relationships are used?
**A:**
- One-to-Many: One User can own many Projects
- Many-to-One: Many Tasks belong to one Project
- Many-to-Many: Users and Projects (through ProjectMembers)

---

## 13. How to Run the Project

### Backend:
```bash
cd backend
./mvnw spring-boot:run
```
→ Runs on http://localhost:8080

### Frontend:
```bash
cd frontend
npm install
npm run dev
```
→ Runs on http://localhost:5173

---

## 14. Future Enhancements

1. Email notifications for task deadlines
2. File attachments for tasks
3. Real-time collaboration using WebSockets
4. Mobile application
5. Integration with calendar apps
6. Analytics and reporting dashboard

---

## Quick Reference Card

| Term | Meaning |
|------|---------|
| Frontend | The user interface (React) |
| Backend | Server-side logic (Spring Boot) |
| API | Interface for frontend-backend communication |
| JWT | Secure token for authentication |
| BCrypt | Password hashing algorithm |
| REST | API design pattern |
| CRUD | Create, Read, Update, Delete operations |
| ORM | Object-Relational Mapping (JPA/Hibernate) |
| Component | Reusable UI piece in React |
| Controller | Handles incoming HTTP requests |
| Service | Contains business logic |
| Repository | Database access layer |

---

*Document prepared for academic project evaluation*
