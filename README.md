# ⚡ HackMatch — Multi-College Hackathon Team & Skill Matching Platform

> **Solve the *"I have a hackathon idea but cannot find students with the required skills"* problem with verified campus isolation, smart skill matching, and role-based administration.**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Strict College Isolation Architecture](#-strict-college-isolation-architecture)
- [Role-Based Access Control (RBAC)](#-role-based-access-control-rbac)
- [Key Features](#-key-features)
- [Smart Skill Matching Engine](#-smart-skill-matching-engine)
- [Automatic Hackathon Discovery & Sync](#-automatic-hackathon-discovery--sync)
- [Admin System & Console](#-admin-system--console)
- [Database Models (Mongoose Schemas)](#-database-models-mongoose-schemas)
- [REST API Endpoints](#-rest-api-endpoints)
- [Automated Verification & Isolation Tests](#-automated-verification--isolation-tests)
- [Quick Demo Accounts](#-quick-demo-accounts)
- [Local Development & Getting Started](#-local-development--getting-started)
- [Vercel Deployment Guide](#-vercel-deployment-guide)

---

## 🌟 Overview

**HackMatch** is a production-ready, multi-college hackathon team formation platform. It allows college students to create developer profiles, showcase their technical stack, discover hackathons, post team requests, and find complementary teammates by skill set—**strictly within their own college institution**.

### 💡 The Core Problem It Solves
1. **Unbalanced Teams**: Teams often have multiple frontend developers but lack a backend engineer, ML specialist, or UI/UX designer.
2. **Campus Isolation**: Student teams competing in intra-college hackathons or representing their institution must only find and recruit teammates from their own verified campus.
3. **Institutional Moderation**: College administrators need a dedicated console to oversee hackathon engagement, verify students, and enforce safety policies.

---

## 🛡️ Strict College Isolation Architecture

HackMatch enforces **strict multi-college data isolation** at the database and API layer:

1. **JWT-Derived Scoping**: The backend derives the user's `collegeId` strictly from the authenticated JWT session (`req.user.collegeId`). Client-supplied IDs in `req.body.collegeId` or `req.query.collegeId` are ignored or stripped.
2. **Cross-College Protection**:
   - Students can only query or browse developers registered in their own college.
   - Direct URL navigation to another college student's profile (`GET /api/users/:id`) is blocked with **403 Forbidden**.
   - Direct access to another college's team request (`GET /api/team-requests/:id`) is blocked with **403 Forbidden**.
   - Cross-college applications (`POST /api/responses`) are strictly rejected with **403 Forbidden**.
3. **Campus-Scoped Smart Matching**: The matching engine only evaluates candidate profiles where `collegeId === targetCollegeId`.

---

## 👥 Role-Based Access Control (RBAC)

HackMatch implements three distinct privilege levels:

| Role | Scope | Key Capabilities |
|---|---|---|
| **Super Admin** | Platform-Wide | Global overview, college onboarding/CRUD, assign college admins, inspect audit trails. |
| **College Admin** | Single College | Campus dashboard, student activation/deactivation, team request moderation for their campus. |
| **Student** | Single College | Profile creation, hackathon browsing, posting requests, live skill matching, sending/accepting applications. |

---

## 🧠 Smart Skill Matching Engine

HackMatch calculates skill overlap deterministically using set intersection:

$$\text{Skill Match Score (\%)} = \left( \frac{|\text{User Skills} \cap \text{Skills Needed}|}{\max(|\text{Skills Needed}|, 1)} \right) \times 100$$

### Candidate Ranking Workflow:
1. **College Filter**: Query all active students where `collegeId === user.collegeId` and `_id !== user._id`.
2. **Skill Intersection**: Compute overlapping and missing skills for each candidate.
3. **Relevance Sorting**:
   - Primary: Highest match score percentage ($\text{descending}$)
   - Secondary: Total number of overlapping skills ($\text{descending}$)
4. **Live Match Preview**: While drafting a team request on `/post-request`, the matching engine dynamically returns candidate cards and overlap metrics before the request is published.

---

## 🔄 Automatic Hackathon Discovery & Sync

HackMatch includes an autonomous, production-ready **Hackathon Discovery & Sync Engine** that continuously sources, normalizes, deduplicates, and ingests real hackathons from external platforms without requiring administrators to manually create each listing.

```
External Sources (Hack Club Public API, etc.)
               ↓
    Hackathon Sync Service
               ↓
       Normalize Fields
               ↓
    Deterministic Hash & Deduplicate
               ↓
   Upsert to MongoDB (isExternal: true)
               ↓
 Public Directory & Smart Skill Matching
```

### Key Architectural Pillars:

1. **Pluggable Adapter Pattern (`BaseAdapter`)**:
   - Each external platform is encapsulated in a dedicated adapter class extending `BaseAdapter`.
   - **`curatedFeedAdapter.js` (LIVE)**: Integrates directly with the public, permitted, machine-readable Hack Club Hackathons Directory API (`https://hackathons.hackclub.com/api/events/upcoming`), fetching real 2026/2027 global and collegiate hackathons.
   - **`unstopAdapter.js` (DISABLED)**: Complies with platform terms. Requires official partnership API keys before activation. Unauthorized web scraping is strictly disallowed.
   - **`devpostAdapter.js` (DISABLED)**: Devpost restricts automated scraping in their terms of service and requires enterprise API partner credentials.
   - **`mlhAdapter.js` (DISABLED)**: MyMLH is an OAuth authorization provider and requires registered developer application keys.

2. **Source Status Transparency**:
   - The Super Admin panel monitors each adapter with real-time status badges:
     - `LIVE`: Successfully fetching real data from active endpoints.
     - `DISABLED`: Intentionally turned off due to missing credentials or platform terms.
     - `UNAVAILABLE`: Remote endpoint unreachable or returning 5xx.
     - `ERROR`: Runtime processing or parsing exception.

3. **Deterministic Deduplication & Idempotency**:
   - Primary identity matching via `{ source, externalId }`.
   - Secondary identity fallback via generated slug `{ title, startDate }`.
   - SHA-256 `contentHash` computed over core fields (`title`, `description`, `dates`, `location`, `link`). If the content hash is identical, the record is flagged as `SKIPPED`, avoiding unnecessary MongoDB writes.
   - Preserves manual admin overrides: Admin edits (`visibility`, `collegeId`, `postedBy`, `manuallyOverridden: true`) are never overwritten by automated sync sweeps.

4. **Lifecycle & Expiration Sweeper**:
   - Sweeps events where `endDate < now` or `registrationDeadline < now`, transitioning `syncStatus = 'expired'` and `status = 'Inactive'`.

5. **Scheduled & Manual Triggers**:
   - **Automated Vercel Cron**: Scheduled daily at 04:00 UTC (`0 4 * * *`) via `vercel.json` and secured by `CRON_SECRET` bearer token validation on `GET /api/cron/sync-hackathons`.
   - **Super Admin Manual Sync**: One-click instant sync from the Admin Console (`POST /api/admin/hackathons/sync`).
   - **CLI Tooling**: Run `npm run sync:hackathons` directly in the terminal.

6. **Adding New Source Adapters**:
   To add a new platform:
   1. Create `backend/src/services/hackathonSync/sources/myPlatformAdapter.js` extending `BaseAdapter`.
   2. Implement `async fetchRawEvents()` to return an array of raw event objects.
   3. Implement `normalize(raw)` to map raw properties to standard HackMatch fields (`title`, `description`, `externalId`, `externalUrl`, `startDate`, `endDate`, `registrationDeadline`, `mode`, `location`, `tags`).
   4. Register the adapter in `backend/src/services/hackathonSync/index.js` under `this.adapters`.

---

## 🖥️ Admin System & Console (`/admin/*`)

Administrators have access to a dedicated SaaS console:

- **Overview (`/admin`)**: Institutional KPIs (Students count, Open Requests, Applications status).
- **Campuses (`/admin/colleges`)**: Super Admin college management (Name, Code, Domain, Location, Active toggle).
- **Students (`/admin/students`)**: Student directory with Activate/Deactivate moderation buttons.
- **Team Requests (`/admin/team-requests`)**: Request moderation and status management.
- **Hackathons (`/admin/hackathons`)**: Event directory creation and publishing.
- **Audit Trail (`/admin/audit-logs`)**: Immutable security audit log tracking administrative actions.

---

## 🗄️ Database Models (Mongoose Schemas)

- **College**: `name`, `code`, `emailDomain`, `logo`, `location`, `description`, `status` (*Active/Inactive*).
- **User**: `name`, `email`, `password` (bcrypt), `collegeId` (ref College), `role` (*student/collegeAdmin/superAdmin*), `bio`, `skills`, `experienceLevel`, URLs, `status` (*Active/Inactive*).
- **Hackathon**: `title`, `description`, `organizer`, `mode`, `location`, `startDate`, `endDate`, `registrationDeadline`, `registrationLink`, `tags`, `visibility` (*Global/College*), `collegeId`, `source` (*manual/curated/unstop/devpost/mlh*), `externalId`, `externalUrl`, `isExternal`, `syncStatus`, `contentHash`, `lastSyncedAt`, `firstSeenAt`, `manuallyOverridden`.
- **HackathonSyncLog**: `startedAt`, `completedAt`, `status`, `triggeredBy`, `source`, `fetchedCount`, `createdCount`, `updatedCount`, `expiredCount`, `skippedCount`, `errorCount`, `sources` (per-source breakdowns), `errors`.
- **TeamRequest**: `hackathon` (ref Hackathon), `postedBy` (ref User), `collegeId` (ref College), `title`, `description`, `skillsNeeded`, `teamSizeNeeded`, `status` (*Open/Closed*).
- **Response**: `teamRequest` (ref TeamRequest), `respondent` (ref User), `collegeId` (ref College), `message`, `status` (*Pending/Accepted/Rejected*).
- **ExperienceVerification**: `user` (ref User), `collegeId` (ref College), `requestedLevel`, `status` (*Pending/Verified/Rejected*), links, proof description, review notes, timestamps.
- **Notification**: `recipient` (ref User), `actor` (ref User), `collegeId` (ref College), `type` (11 notification event types), `title`, `message`, `link`, `isRead`, `metadata`.
- **AuditLog**: `actor`, `role`, `action`, `targetType`, `targetId`, `collegeId`, `details`, `timestamp`.

---

## 📡 REST API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/signup` — Register student with verified active college
- `POST /api/auth/login` — Sign in and receive JWT token
- `GET /api/auth/me` — Hydrate current user session and college info

### Colleges (`/api/colleges`)
- `GET /api/colleges` — List colleges (enriched with dynamic `studentCount` and `adminCount`)
- `POST /api/colleges` — Onboard new college (*Super Admin*)
- `PATCH /api/colleges/:id/status` — Toggle college active status (*Super Admin*)

### Students & Users (`/api/users`)
- `GET /api/users` — List developers in user's college
- `GET /api/users/:id` — View developer profile (*403 if different college*)
- `PUT /api/users/:id` — Update developer profile (strictly protects `role`, `collegeId`, resets verification on level change)
- `POST /api/users/avatar/signature` — Get HMAC-SHA1 signed Cloudinary upload credentials
- `PATCH /api/users/avatar` — Save Cloudinary avatar URL & publicId
- `DELETE /api/users/avatar` — Remove profile avatar from Cloudinary & database

### Experience Verification (`/api/experience-verifications`)
- `POST /api/experience-verifications` — Submit verification request (creates admin notifications)
- `GET /api/experience-verifications/my` — Get current student's verification status
- `GET /api/experience-verifications/requests` — View pending requests for college (*College Admin*)
- `PATCH /api/experience-verifications/:id/review` — Approve or reject verification request

### Notifications (`/api/notifications`)
- `GET /api/notifications` — Get recipient-isolated notifications with unread count
- `PATCH /api/notifications/:id/read` — Mark single notification as read
- `PATCH /api/notifications/read-all` — Mark all notifications as read for current user

### Hackathons (`/api/hackathons`)
- `GET /api/hackathons` — List hackathons with timeline filter (`Upcoming`, `Closing Soon`, `Active`, `Past`, `Recently Added`), source filter (`all`, `manual`, `curated`), mode, and search keyword
- `GET /api/hackathons/:id` — Single hackathon details
- `POST /api/hackathons` — Create hackathon listing

### Scheduled Tasks & Crons (`/api/cron`)
- `GET /api/cron/sync-hackathons` — Automated external hackathon sync (secured with `Bearer CRON_SECRET`)

### Team Requests & Matching (`/api/team-requests`)
- `GET /api/team-requests` — List campus team requests
- `POST /api/team-requests` — Create team request (*auto-derives collegeId, strictly enforces 403 VERIFICATION_REQUIRED for unverified/pending/rejected students*)
- `POST /api/team-requests/preview-matches` — Live candidate match preview
- `GET /api/team-requests/:id/matches` — Smart matching query for a request

### Applications (`/api/responses`)
- `POST /api/responses` — Apply to team request (*strictly enforces 403 VERIFICATION_REQUIRED, cross-college blocked*)
- `GET /api/responses/my` — Get sent and received applications with match metrics
- `PUT /api/responses/:id` — Accept or reject an application

### Administration (`/api/admin`)
- `GET /api/admin/dashboard` — Platform-wide or campus-scoped KPIs (including automated sync metrics)
- `GET /api/admin/students` — Student directory with filter controls
- `PATCH /api/admin/students/:id/status` — Activate or deactivate student account
- `GET /api/admin/team-requests` — Moderate team posts
- `GET /api/admin/colleges/:id/admins` — List college administrators (*Super Admin*)
- `POST /api/admin/colleges/:id/admins` — Assign college administrator (*Super Admin*)
- `PATCH /api/admin/colleges/:id/admins/:adminId` — Demote/deactivate admin with Last Admin Protection
- `GET /api/admin/hackathons/sync-status` — Inspect adapter health (`LIVE`, `DISABLED`, `UNAVAILABLE`, `ERROR`) & sync history (*Super Admin*)
- `POST /api/admin/hackathons/sync` — Trigger immediate manual hackathon sync across all sources (*Super Admin*)
- `GET /api/admin/audit-logs` — Administrative audit history

---

## 🧪 Automated Verification & Isolation Tests

HackMatch includes an automated test suite verifying all **130 security, verification, notification, isolation, and automated discovery guarantees**:

```bash
cd backend
npm test
# Or run individual suites:
npm run test:isolation  # 80 core isolation & security tests
npm run test:sync       # 50 hackathon sync & idempotency tests
```

### Verified Isolation & Security Guarantees:
- ✅ Student user discovery strictly filtered to user's college
- ✅ Direct access to other college profiles returns 403
- ✅ Team requests scoped to user's college
- ✅ Direct access to other college requests returns 403
- ✅ Cross-college application submissions rejected with 403
- ✅ Smart skill matching engine restricted to candidate's college
- ✅ Immutability of sensitive fields on self-update (`role`, `collegeId`, `status`)
- ✅ Modifying experience level automatically resets verification status to `Unverified`
- ✅ Dynamic college student and admin count aggregations
- ✅ Last Admin Protection prevents orphan colleges
- ✅ Cloudinary secure upload signatures without leaking API secret
- ✅ Full experience verification lifecycle and campus review isolation
- ✅ Trust notification delivery for students, college admins, and super admins
- ✅ Strict notification query ownership (`req.user._id`) and isolation
- ✅ Team request creation & applications strictly blocked with 403 `VERIFICATION_REQUIRED` for non-verified students

---

## 🔑 Quick Demo Accounts

The database comes pre-seeded with test accounts across 3 demo colleges:

| Account Type | College | Email | Password | Status |
|---|---|---|---|---|
| **Super Admin** | Platform-Wide | `superadmin@hackmatch.com` | `Admin@123` | Platform Access |
| **College Admin** | KIET Group of Institutions | `admin@kiet.edu` | `Admin@123` | Campus Admin |
| **Student (Alex)** | KIET (Full-Stack) | `alex@example.com` | `password123` | Verified (Advanced) |
| **Student (Priya)** | KIET (AI Specialist) | `priya@example.com` | `password123` | Unverified (Ready to verify) |
| **Student (Sophia)**| KIET (UI/UX Designer) | `sophia@example.com` | `password123` | Pending Verification |
| **Student (Rahul)** | ABC Tech | `rahul@example.com` | `password123` | Rejected Verification |
| **Student (Aman)**  | XYZ University | `aman@example.com` | `password123` | Active Student |

---

## 💻 Local Development & Getting Started

### 1. One-Click Launch (Windows)
Double-click `start_demo.bat` to automatically seed the database and launch both the Express backend (port 5000) and Vite frontend (port 5173).

### 2. Manual Launch
```bash
# Terminal 1: Backend
cd backend
npm install
npm run seed     # Seeds demo colleges, users, hackathons, and verifications
node server.js

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
```

*Note: The backend automatically boots an embedded in-memory MongoDB instance if local MongoDB (`127.0.0.1:27017`) is not running.*

---

## 🚀 Vercel & MongoDB Atlas Deployment Guide

HackMatch is production-ready for deployment to **Vercel** and **MongoDB Atlas**:

### 1. MongoDB Atlas Setup
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a database user and whitelist `0.0.0.0/0` (or Vercel IP ranges).
3. Copy your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/hackmatch?retryWrites=true&w=majority
   ```

### 2. Vercel Configuration
The repository includes `vercel.json` configured for unified monorepo deployment:
- Builds `backend/api/index.js` using `@vercel/node`
- Builds `frontend/` using `@vercel/static-build` with `distDir: "dist"`
- Routes `/api/(.*)` to backend serverless function
- Routes all frontend paths to `frontend/index.html` (SPA routing)

### 3. Environment Variables (Vercel Project Settings)
Configure the following in **Vercel Project Settings $\rightarrow$ Environment Variables**:

| Variable | Description | Example |
|---|---|---|
| `MONGODB_URI` | MongoDB Atlas Connection String | `mongodb+srv://user:pass@cluster.mongodb.net/hackmatch` |
| `JWT_SECRET` | Strong JWT signing secret | `your-production-jwt-secret-key-32-chars-min` |
| `CLIENT_URL` | Deployed Frontend URL for CORS | `https://your-hackmatch.vercel.app` |
| `NODE_ENV` | Environment mode | `production` |
| `ADMIN_EMAIL` | Initial Super Admin email | `superadmin@hackmatch.com` |
| `ADMIN_PASSWORD` | Initial Super Admin password | `Admin@123` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Cloud Name (optional for avatars) | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | `your_api_key` |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | `your_api_secret` |
| `CRON_SECRET` | Bearer secret for automated sync `/api/cron/sync-hackathons` | `your-secure-cron-secret-key` |
| `SYNC_CURATED_FEED_ENABLED` | Toggle Hack Club open feed sync adapter | `true` |
| `SYNC_UNSTOP_ENABLED` | Toggle Unstop adapter (requires partner API) | `false` |
| `SYNC_DEVPOST_ENABLED` | Toggle Devpost adapter (requires partner API) | `false` |
| `SYNC_MLH_ENABLED` | Toggle MLH adapter (requires OAuth app) | `false` |
| `VITE_API_URL` | Frontend API URL | `/api` |

### 4. Deploying
```bash
# Push to GitHub and import the repository into Vercel, or use the Vercel CLI:
vercel --prod
```

---

## 📄 License
This project is licensed under the MIT License.
