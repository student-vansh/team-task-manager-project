# Team Task Manager

A full-stack team task management application where teams can create projects, assign tasks, manage members, and track work from a dashboard. Built with **React**, **Node.js**, **Express**, and **MongoDB**.

---

## Features

- **User authentication** — Sign up, login, logout with session-based auth (Passport.js)
- **Role-based access** — `Admin` and `Member` roles with protected API routes
- **Project management** — Create projects, view projects you belong to, add/remove members (Admin)
- **Task management** — Create tasks with priority, due date, and assignee; update status; delete tasks
- **Dashboard** — Overview of total, completed, pending, and overdue tasks with status breakdown
- **Business rules** — Task status can only be updated by the assigned user (enforced on backend)

---

## Tech Stack

| Layer      | Technologies |
|-----------|--------------|
| Frontend  | React 19, Vite, React Router, Axios, Tailwind CSS 4 |
| Backend   | Node.js, Express 5, Mongoose |
| Database  | MongoDB |
| Auth      | Passport (Local Strategy), bcryptjs, express-session |
| Security  | CORS (credentials), custom auth & role middleware |

---

## Project Structure

```
team-task-manager/
├── backend/
│   ├── app.js                 # Express app entry point
│   ├── config/db.js           # MongoDB connection
│   ├── middleware/            # isAuthenticated, authorizeRoles
│   ├── models/                # User, Project, Task schemas
│   ├── passport/              # Passport local strategy config
│   └── routes/                # auth, projects, tasks, dashboard
│
└── frontend/
    └── src/
        ├── context/           # AuthContext (global user state)
        ├── services/api.js    # Axios API layer
        ├── routes/            # ProtectedRoute
        ├── pages/             # Login, Signup, Dashboard, Projects, ProjectDetails
        └── components/        # Layout, StatusBadge, PriorityBadge
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (local install or [MongoDB Atlas](https://www.mongodb.com/atlas))

---

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd team-task-manager
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:

```env
MONGO_URI=mongodb://127.0.0.1:27017/team-task-manager
PORT=5000
SESSION_SECRET=your_super_secret_session_key
```

Start the backend server:

```bash
node app.js
```

The API runs at **http://localhost:5000**

> Optional: use `npx nodemon app.js` for auto-restart during development.

### 3. Frontend setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The app runs at **http://localhost:5173**

---

## Environment Variables

| Variable         | Description                          | Example |
|-----------------|--------------------------------------|---------|
| `MONGO_URI`     | MongoDB connection string            | `mongodb://127.0.0.1:27017/team-task-manager` |
| `PORT`          | Backend server port                  | `5000` |
| `SESSION_SECRET`| Secret key for express-session       | Any long random string |

---

## API Endpoints

### Auth (`/api/auth`)

| Method | Endpoint   | Access  | Description        |
|--------|------------|---------|--------------------|
| POST   | `/signup`  | Public  | Register new user  |
| POST   | `/login`   | Public  | Login user         |
| GET    | `/logout`  | Session | Logout user        |
| GET    | `/me`      | Session | Get current user   |

### Projects (`/api/projects`)

| Method | Endpoint                          | Access        | Description              |
|--------|-----------------------------------|---------------|--------------------------|
| POST   | `/create`                         | Admin         | Create a project         |
| GET    | `/my-projects`                    | Authenticated | List user's projects     |
| POST   | `/add-member/:projectId`          | Admin         | Add member by email      |
| DELETE | `/remove-member/:projectId/:userId` | Admin       | Remove a member          |

### Tasks (`/api/tasks`)

| Method | Endpoint                    | Access              | Description                |
|--------|-----------------------------|---------------------|----------------------------|
| POST   | `/create/:projectId`        | Admin               | Create task in project     |
| GET    | `/project/:projectId`       | Authenticated       | Get all tasks in project   |
| PUT    | `/update-status/:taskId`    | Assigned user only  | Update task status         |
| DELETE | `/delete/:taskId`           | Admin               | Delete a task              |

### Dashboard (`/api/dashboard`)

| Method | Endpoint      | Access        | Description                    |
|--------|---------------|---------------|--------------------------------|
| GET    | `/dashboard`  | Authenticated | Task stats and status breakdown |

---

## Authentication Flow

1. User signs up → password is hashed with **bcrypt** and stored in MongoDB.
2. User logs in → **Passport** validates credentials and creates a **server-side session**.
3. Browser stores session cookie → frontend sends it via Axios (`withCredentials: true`).
4. Protected routes use `isAuthenticated` middleware before handling requests.
5. Admin-only routes additionally use `authorizeRoles("Admin")`.

---

## User Roles

| Role   | Permissions |
|--------|-------------|
| **Admin** | Create projects, create/delete tasks, add/remove project members |
| **Member** | View projects they belong to, update status of **assigned** tasks only |

---

## Frontend Routes

| Route                    | Page            | Access     |
|--------------------------|-----------------|------------|
| `/login`                 | Login           | Public     |
| `/signup`                | Signup          | Public     |
| `/dashboard`             | Dashboard       | Protected  |
| `/projects`              | Projects list   | Protected  |
| `/projects/:projectId`   | Project details | Protected  |

---

## Database Models

### User
- `name`, `email`, `password` (hashed)
- `role`: `Admin` | `Member` (default: `Member`)

### Project
- `name`, `description`
- `admin` → User reference
- `members` → Array of User references

### Task
- `title`, `description`, `dueDate`
- `priority`: `Low` | `Medium` | `High`
- `status`: `To Do` | `In Progress` | `Done`
- `assignedTo`, `project`, `createdBy` → User/Project references

---

## Scripts

### Frontend

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run preview  # Preview production build
```

### Backend

```bash
node app.js      # Start server
```

---

## Author

**Vansh Kumar**

---

## License

ISC
