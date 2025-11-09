## CafeLove — Copilot guidance for contributors

This repository is a small fullstack app (React + Vite frontend and Express/Mongoose backend) with Docker Compose for local development. Use these notes to produce code changes that match project structure and conventions.

- Big picture
  - Services: `frontend` (Vite/React), `backend` (Express + Mongoose), `mongo` (official image). See `docker-compose.yaml` for service wiring and volumes.
  - API surface: backend exposes routes under `/api/*`. Auth routes live in `backend/src/routes/authRoutes.js` and are implemented by thin controllers in `backend/src/controllers/*` which call the business logic in `backend/src/usecases/*`.
  - Data model: Mongoose models are in `backend/src/models/` (e.g. `User.js`). Business rules (hashing, JWT creation) live in `backend/src/usecases/authUseCase.js`.

- Key files to reference when making changes
  - `docker-compose.yaml` — how services are built, dev commands, and environment variables.
  - `backend/server.js` — app boot, middleware, sample protected route and route registration (`/api/auth`).
  - `backend/src/config/db.js` — Mongo connection (reads `process.env.MONGO_URI` or falls back to localhost).
  - `backend/src/usecases/authUseCase.js` — signup/login logic, bcrypt + jwt usage (JWT_SECRET env). Good example of error handling (throws Error messages bubbled to controllers).
  - `frontend/src/App.jsx` — routing and client-side auth check (reads `localStorage.getItem('token')`), use when adding protected UI routes.

- Developer workflows (how to run & debug)
  - Docker (recommended): run at repo root
    - docker-compose up --build
    - Services expose ports: frontend 5173, backend 5000, mongo 27017
  - Without Docker: run services separately
    - Backend: cd backend; npm install; npm run dev (nodemon watches files)
    - Frontend: cd frontend; npm install; npm run dev (Vite; use `--host 0.0.0.0` in containers)
  - Useful quick checks:
    - Backend health: GET /api/test (returns { message: "Server is running!" })
    - Protected: GET /api/dashboard requires Authorization via `authMiddleware` (see `backend/src/middleware/authMiddleware.js`).

- Project-specific conventions & gotchas (do not change without reason)
  - Layering: controllers are thin and delegate to `usecases/*`. Keep business logic inside usecases to match existing structure.
  - JWT secret: environment variable `JWT_SECRET` is used in `authUseCase.js`; default fallback exists but secrets should come from env in production.
  - Env mismatch: `docker-compose.yaml` sets `MONGO_URL` for the backend service, but `backend/src/config/db.js` looks for `MONGO_URI`. When running with Docker, ensure env var names align (prefer `MONGO_URI`) or update docker-compose accordingly.
  - Local token storage: frontend stores token in `localStorage` key `token`. Use that for client-side route protection.
  - Code style: Node uses ES modules (`type: "module"` in package.json). Keep import/export syntax consistent.

- Integration points
  - Frontend -> Backend: frontend expects API at `VITE_API_URL` (set in `docker-compose.yaml` for dev). Check `frontend/package.json` scripts for Vite dev flags.
  - Backend -> DB: Mongoose connects in `backend/src/config/db.js` using `process.env.MONGO_URI`.

- Examples to copy/paste
  - Register route: POST /api/auth/signup handled by `backend/src/routes/authRoutes.js` → `authController.signup` → `usecases/signupUser`.
  - Login returns token: `loginUser` signs JWT with `JWT_SECRET` and returns { message, token }.

- When making changes
  - Update both service code and Docker/dev wiring if you change env names or ports (`docker-compose.yaml`).
  - Preserve layering: move shared logic into `usecases/` and keep controllers thin.
  - Add tests or small smoke checks where possible; at minimum verify `/api/test` and the frontend route behavior.

If anything here is unclear or you want me to expand a section (run commands, fix the MONGO env mismatch, or add examples), say which part and I will iterate. 
