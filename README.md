# Ethara AI Assignment

A full-stack project management app with authentication, projects, members, and task assignment.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Axios, React Router
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs

## Folder Structure

```text
Etharaaiassignment/
  Backend/     Express API, MongoDB models, auth/project/task routes
  Frontend/    React UI and API client
```

## Features

- User signup and login
- JWT based protected API requests
- Admin project creation
- Project member management
- Admin task assignment to project members
- User task list with status updates
- Dashboard UI for projects and assigned work

## Environment Variables

Create a `.env` file inside the `Backend` folder:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Optional frontend environment file inside `Frontend`:

```env
VITE_API_BASE_URL=http://localhost:5000
```

If `VITE_API_BASE_URL` is not set, the frontend uses `http://localhost:5000`.

## Installation

Install backend dependencies:

```bash
cd Backend
npm install
```

Install frontend dependencies:

```bash
cd Frontend
npm install
```

## Run Locally

Start the backend:

```bash
cd Backend
npm run dev
```

Start the frontend in another terminal:

```bash
cd Frontend
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

Backend health check:

```text
http://localhost:5000/health
```

## Available Scripts

Backend:

```bash
npm start
npm run dev
```

Frontend:

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Main API Routes

Auth:

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/auth/users`

Projects:

- `POST /api/projects/create`
- `GET /api/projects/myprojects`
- `GET /api/projects/all`
- `PUT /api/projects/:projectId/:memberId`
- `DELETE /api/projects/:projectId/:memberId`

Tasks:

- `POST /api/tasks/create`
- `GET /api/tasks/project/:projectId`
- `GET /api/tasks/mine`
- `PUT /api/tasks/:taskId/status`

## Build Check

To verify the frontend build:

```bash
cd Frontend
npm run build
```

To verify frontend lint:

```bash
cd Frontend
npm run lint
```
