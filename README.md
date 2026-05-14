# CRM Programming School

CRM system for admin and manager workflows around student applications.

## Stack

- Frontend: React 19, TypeScript, Vite, React Router
- Backend: Node.js, Express, TypeScript, MongoDB Atlas, Mongoose
- Export: XLSX
- API docs: Swagger UI

## Project structure

- `frontend` - client app
- `beckend` - server app

## Default admin

- Email: `admin@gmail.com`
- Password: `admin`

The default admin is created automatically on backend startup if it does not exist yet.

## Environment

1. Copy `beckend/.env.example` to `beckend/.env`
2. Fill in your MongoDB Atlas connection string and JWT secrets

Minimum required backend variables:

```env
APP_PORT=3000
APP_HOST=localhost
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority
JWT_ACCESS_SECRET=change_me_access_secret
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_SECRET=change_me_refresh_secret
JWT_REFRESH_EXPIRATION=7d
FRONTEND_URL=http://localhost:5173
ADMIN_EMAIL=admin@gmail.com
```

## Install dependencies

From the project root:

```bash
npm --prefix ./beckend install
npm --prefix ./frontend install
```

## Run the project

Backend:

```bash
npm --prefix ./beckend run dev
```

Frontend:

```bash
npm --prefix ./frontend run dev
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000/api`
- Swagger UI: `http://localhost:3000/api/docs`
- OpenAPI JSON: `http://localhost:3000/api/docs.json`

## Build

```bash
npm --prefix ./beckend run build
npm --prefix ./frontend run build
```

## Postman collection

Import this file into Postman:

- `CRM-Programming-School.postman_collection.json`

## Implemented features

- Login page on root route
- Roles: `admin` and `manager`
- Applications page with pagination by 25 items
- Sorting by every table column with `sortBy` and `sortOrder` in query params
- Filtering with query params and delayed text search
- Expandable application rows with comments, UTM and message
- Edit modal with validation and unique group creation
- Excel export for filtered applications
- Admin panel with status statistics and paginated manager list
- Manager activation and password recovery links with 30-minute lifetime
- Ban and unban manager actions
