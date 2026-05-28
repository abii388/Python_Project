# Petty Cash Management System Implementation Plan

This document outlines the step-by-step plan to build the Petty Cash Management System based on your 7-phase requirements. The system will be a fully self-hosted, open-source stack using Django REST Framework for the backend and React 18 for the frontend.

## User Review Required

> [!IMPORTANT]
> Please review the planned directory structure and technologies to confirm they meet your exact zero-cost, self-hosted requirements.
> The project will be set up in the workspace `e:\file\fullstack\python_new\petty_cash`.

## Proposed Changes

### Phase 1: Django Foundation & Infrastructure

- Scaffold the Django project and configure `settings.py` for PostgreSQL, Redis, and JWT.
- Set up Docker infrastructure (`docker-compose.yml`, Nginx configuration, Dockerfiles).
- Create `.env` file for configurations.
- Create `CustomUser` and `Role` models.
- Implement JWT authentication endpoints (login, refresh, logout, reset).
- Define DRF Permission Classes (`IsAdmin`, `IsCashier`, `IsApprover`, etc.).
- Create and register all 8 core apps: `accounts`, `funds`, `transactions`, `approvals`, `replenishments`, `reports`, `notifications`, `audit`.

### Phase 2: Core Backend Apps

- **Funds app**: Models, CRUD operations, balance property, role-filtered querysets.
- **Transactions app**: Models, receipts handling, filters, role-filtered querysets.
- **Approvals app**: ApprovalChain, workflow engine, state transitions.
- **Replenishments app**: Request/approve/reject flow logic.

### Phase 3: Background & Realtime

- Set up Celery for background tasks (low balance alert, escalation checker, report generation).
- Configure Django Channels for WebSocket notifications.
- Implement audit signals to automatically log model changes.

### Phase 4: Reports

- Integrate openpyxl for Excel generation.
- Implement role-filtered report access endpoints.

### Phase 5: React Foundation

- Initialize React with Vite + TypeScript + TailwindCSS + shadcn/ui.
- Set up Axios with JWT interceptors (auto-refresh).
- Configure Zustand for state management (`authStore` for user, role, tokens).
- Set up React Router with `ProtectedRoute` for role guards.
- Create Role-aware Sidebar and `usePermission` hook.

### Phase 6: React Pages

- Build out pages: Login + Password Reset, Dashboard (with Recharts), Funds, Transactions, Approvals Queue, Replenishments, Reports, Audit Log, and Settings.

### Phase 7: Polish

- Add skeleton loaders and error boundaries.
- Implement WebSocket notifications and Toast notifications (Sonner).
- Create empty states and 403/404 pages.
- Write pytest-django tests (aiming for 80%+ coverage).
- Generate Swagger docs using `drf-spectacular` at `/api/docs/`.

## Verification Plan

### Automated Tests

- Run backend tests using `pytest` to ensure 80%+ coverage.

### Manual Verification

- Run `docker compose up --build` to verify all services (Django, React, Postgres, Redis, Nginx) start correctly.
- Open the frontend to verify the UI and role-based access.
- Check Swagger UI at `/api/docs/` to ensure all API endpoints are properly documented.
