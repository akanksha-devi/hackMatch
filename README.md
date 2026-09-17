ss# ⚡ HackMatch — Hackathon Team & Skill Matching Platform

> **Solve the *"I have an idea but no teammate with skill X"* problem for hackathon participants worldwide.**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Skill Matching Algorithm](#-skill-matching-algorithm)
- [System Architecture](#-system-architecture)
- [Database Models (Mongoose Schemas)](#-database-models-mongoose-schemas)
- [REST API Endpoints](#-rest-api-endpoints)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started & Local Development](#-getting-started--local-development)
- [Quick Demo Accounts](#-quick-demo-accounts)
- [Roadmap & Stretch Goals](#-roadmap--stretch-goals)

---

## 🌟 Overview

**HackMatch** is a full-stack platform where developers, designers, and innovators create rich skill profiles, browse ongoing and upcoming hackathons, and post targeted **team requests** specifying required skill sets. 

The platform's built-in **Smart Matching Engine** computes skill overlap in real-time, ranks candidate developers, and provides an end-to-end request/response workflow to form balanced, multi-disciplinary hackathon squads.

### 💡 Core Value Proposition
- **No More Incomplete Teams**: Fixes the common issue where a team has 3 frontend devs but lacks a backend engineer, AI modeler, or UI/UX designer.
- **Instant Skill Overlap Scoring**: Calculates exact percentage match and highlights common skills.
- **Streamlined Recruitment**: Direct application flow with `Pending`, `Accepted`, and `Rejected` statuses.

---

## 🚀 Key Features

### 1. 🎯 Smart Real-Time Skill Matching
- Dynamically intersects `skillsNeeded` with registered developers' skill sets.
- Calculates matching score percentage and ranks developers by relevance.
- Live **Suggested Matches Preview** updates side-by-side as you pick skills while composing a team request.

### 2. 🏆 Hackathon Directory & Details
- Browse active, upcoming, and past hackathons.
- Filter by mode (**Online**, **Offline**, **Hybrid**), tags (**AI**, **Web3**, **GovTech**, **UI/UX**), or keyword search.
- View countdown deadlines, organizers, official registration links, and all active team requests for each hackathon.
- Authenticated users can list new hackathons directly.

### 3. 📢 Team Request Posting & Discovery
- Post project openings with title, description, team size needed, and multi-selected skill tags.
- Interactive custom skill tag creation with auto-complete suggestions.
- Toggle request status between **Open** and **Closed**.

### 4. 📬 Application & Response Management (`/my-requests`)
- **Requests I Created**: Accordion view of all applicant responses with one-click **Accept** or **Reject** actions.
- **Applications I Sent**: Real-time status tracking (*Pending*, *Accepted*, *Rejected*) with sent message details.

### 5. 🧑‍💻 Developer Profiles & Talent Search (`/users`)
- Developer portfolio cards displaying avatar, experience level (*Beginner*, *Intermediate*, *Advanced*), bio, and skill tags.
- Direct links to GitHub, LinkedIn, and portfolio websites.
- Search talent by developer name, bio text, experience level, and skill filters.

### 6. 🎨 High-Performance Dark Glassmorphism UI
- Styled with modern Tailwind CSS v4, custom animated mesh ambient glows, and Plus Jakarta Sans typography.
- Mobile-friendly responsive navigation drawer and interactive modals.
- Persistent client-side data layer (`localStorage`) populated with rich initial seed datasets.

---

## 🛠️ Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend** | React 19 (Vite) | Lightning-fast reactive component architecture |
| **Styling** | Tailwind CSS v4 | Cutting-edge utility-first CSS with modern `@theme` support |
| **Icons** | Lucide React | Clean, modern developer iconography |
| **Routing** | React Router v7 | Dynamic client-side routing & route guards |
| **HTTP Client**| Axios | Configured instance with JWT request/response interceptors |
| **Backend** | Node.js + Express.js | High-performance modular REST API |
| **Database** | MongoDB + Mongoose | Document database with schema validation & references |
| **Authentication** | JWT + bcryptjs | Secure access token issuance and password hashing |

---

## 🧠 Skill Matching Algorithm

HackMatch employs a deterministic skill overlap calculation modeled after the MongoDB `$in` operator:

$$\text{Skill Match Score (\%)} = \left( \frac{|\text{User Skills} \cap \text{Skills Needed}|}{\max(|\text{Skills Needed}|, 1)} \right) \times 100$$

### Matching Workflow:
1. When creating or browsing a `TeamRequest`, the system extracts `skillsNeeded = ["React", "Python", "UI/UX"]`.
2. Candidate developer profiles are scanned for overlapping skills (case-insensitive intersection).
3. Overlap count and match percentage are computed.
4. Candidates are sorted by:
   - **Primary:** Highest overlap count ($\text{descending}$)
   - **Secondary:** Highest match percentage ($\text{descending}$)
5. Matching skills are visually highlighted on developer cards with active rings and badges.

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        React Frontend (Vite)                           │
│  ┌──────────────┐  ┌───────────────────┐  ┌─────────────────────────┐  │
│  │ Navbar/Pages │  │ Skill Match UI    │  │ AuthContext & Storage   │  │
│  └──────┬───────┘  └─────────┬─────────┘  └────────────┬────────────┘  │
└─────────┼────────────────────┼─────────────────────────┼───────────────┘
          │                    │                         │
          ▼                    ▼                         ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      Express.js REST API (Node)                        │
│  ┌──────────────┐  ┌───────────────────┐  ┌─────────────────────────┐  │
│  │ /api/auth    │  │ /api/hackathons   │  │ /api/team-requests      │  │
│  └──────┬───────┘  └─────────┬─────────┘  └────────────┬────────────┘  │
└─────────┼────────────────────┼─────────────────────────┼───────────────┘
          │                    │                         │
          ▼                    ▼                         ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     MongoDB Database (Mongoose)                        │
│   (Users Collection)   (Hackathons)   (TeamRequests)   (Responses)     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Models (Mongoose Schemas)

### User
```javascript
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // bcrypt hashed
  bio: { type: String },
  skills: [{ type: String }], // e.g. ["React", "Node.js", "Python"]
  experienceLevel: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], default: "Intermediate" },
  githubUrl: { type: String },
  linkedinUrl: { type: String },
  portfolioUrl: { type: String },
  avatarUrl: { type: String },
  createdAt: { type: Date, default: Date.now }
}
```

### Hackathon
```javascript
{
  title: { type: String, required: true },
  description: { type: String },
  organizer: { type: String },
  mode: { type: String, enum: ["Online", "Offline", "Hybrid"], default: "Online" },
  location: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  registrationDeadline: { type: Date },
  registrationLink: { type: String },
  tags: [{ type: String }], // e.g. ["AI", "Web3", "GovTech"]
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
}
```

### TeamRequest
```javascript
{
  hackathon: { type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon', required: true },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  skillsNeeded: [{ type: String, required: true }],
  teamSizeNeeded: { type: Number, default: 1 },
  status: { type: String, enum: ["Open", "Closed"], default: "Open" },
  createdAt: { type: Date, default: Date.now }
}
```

### Response
```javascript
{
  teamRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'TeamRequest', required: true },
  respondent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String },
  status: { type: String, enum: ["Pending", "Accepted", "Rejected"], default: "Pending" },
  createdAt: { type: Date, default: Date.now }
}
```

---

## 📡 REST API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Register new user & hash password | No |
| `POST` | `/api/auth/login` | Authenticate & return JWT token | No |
| `GET` | `/api/auth/me` | Fetch logged-in user profile | Yes |

### Users (`/api/users`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/users` | List / search users (`?skill=`, `?experienceLevel=`) | Yes |
| `GET` | `/api/users/:id` | Get single user public profile | Yes |
| `PUT` | `/api/users/:id` | Update own user profile | Yes |

### Hackathons (`/api/hackathons`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/hackathons` | List hackathons (`?mode=`, `?tag=`, `?search=`) | No |
| `GET` | `/api/hackathons/:id` | Get single hackathon details | No |
| `POST` | `/api/hackathons` | Create a hackathon listing | Yes |
| `PUT` | `/api/hackathons/:id` | Edit hackathon (owner only) | Yes |
| `DELETE`| `/api/hackathons/:id` | Delete hackathon (owner only) | Yes |

### Team Requests (`/api/team-requests`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/team-requests` | List team requests (`?hackathon=`, `?skill=`) | Yes |
| `GET` | `/api/team-requests/:id` | Get single team request details | Yes |
| `POST` | `/api/team-requests` | Create team request & trigger skill matcher | Yes |
| `PUT` | `/api/team-requests/:id` | Edit or toggle Open/Closed status | Yes |
| `DELETE`| `/api/team-requests/:id` | Delete team request (owner only) | Yes |

### Responses (`/api/responses`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/responses` | Send application response to a team request | Yes |
| `GET` | `/api/responses/my` | Get sent and received responses | Yes |
| `PUT` | `/api/responses/:id` | Accept or reject an applicant response | Yes |

---

## 📁 Project Directory Structure

```
hackmatch/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # MongoDB connection setup
│   │   ├── models/
│   │   │   ├── User.js               # User Mongoose schema
│   │   │   ├── Hackathon.js          # Hackathon listing schema
│   │   │   ├── TeamRequest.js        # Team request schema
│   │   │   └── Response.js           # Team application response schema
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── userController.js
│   │   │   ├── hackathonController.js
│   │   │   ├── teamRequestController.js
│   │   │   └── responseController.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   ├── hackathonRoutes.js
│   │   │   ├── teamRequestRoutes.js
│   │   │   └── responseRoutes.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js     # JWT Bearer verification
│   │   │   ├── errorMiddleware.js    # Global error response handler
│   │   │   └── validateMiddleware.js # Input validation
│   │   ├── utils/
│   │   │   └── generateToken.js
│   │   └── app.js                    # Express app & CORS configuration
│   ├── server.js                     # Server launcher
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axiosInstance.js      # Axios client with interceptors
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Sticky responsive navigation & dropdown
│   │   │   ├── Footer.jsx            # Platform footer with quick links
│   │   │   ├── HackathonCard.jsx     # Hackathon display card
│   │   │   ├── UserCard.jsx          # Profile snapshot & match badge
│   │   │   ├── SkillTag.jsx          # Color-coded interactive skill pill
│   │   │   ├── TeamRequestCard.jsx   # Request card with respond trigger
│   │   │   ├── MatchScoreBadge.jsx   # Percentage overlap pill
│   │   │   └── ProtectedRoute.jsx    # Authentication route guard
│   │   ├── pages/
│   │   │   ├── Home.jsx              # Hero, stats, featured hackathons
│   │   │   ├── Login.jsx             # Auth page with 1-click demo accounts
│   │   │   ├── Signup.jsx            # Profile creation with multi-skill tagger
│   │   │   ├── Hackathons.jsx        # Hackathon directory with filters & modal
│   │   │   ├── HackathonDetail.jsx   # Single hackathon view + team requests
│   │   │   ├── PostTeamRequest.jsx   # Post request with live matching preview
│   │   │   ├── BrowseUsers.jsx       # Talent discovery search
│   │   │   ├── Profile.jsx           # User portfolio view
│   │   │   ├── EditProfile.jsx       # Profile editor
│   │   │   ├── MyRequests.jsx        # Request management & applicant acceptance
│   │   │   └── Dashboard.jsx         # Summary stats & recommended teammates
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Auth provider & state management
│   │   ├── hooks/
│   │   │   └── useAuth.js            # Auth custom hook
│   │   ├── services/
│   │   │   ├── mockData.js           # Seed datasets for standalone testing
│   │   │   └── storageService.js     # Persistent state & skill matching logic
│   │   ├── App.jsx                   # Routes configuration
│   │   ├── index.css                 # Tailwind CSS v4 & custom glass styling
│   │   └── main.jsx                  # Entry point
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## 💻 Getting Started & Local Development

### Prerequisites
- **Node.js**: v18.0 or higher
- **npm**: v9.0 or higher
- **MongoDB** *(Optional for local database mode)*: Local MongoDB or MongoDB Atlas URI

---

### Step 1: Run Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

### Step 2: Run Backend (Optional)

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Start server
npm run dev # or node server.js
```

The backend server will run at **[http://localhost:5000](http://localhost:5000)**.

---

## 🔑 Quick Demo Accounts

To test the application instantly without manual registration, 1-click quick login buttons are available on the [Login Page](http://localhost:5173/login):

| User | Email | Password | Role / Skills |
|---|---|---|---|
| **Alex Rivera** | `alex@example.com` | `password123` | Full-Stack (React, Node.js, Express, MongoDB) |
| **Priya Sharma** | `priya@example.com` | `password123` | AI Engineer (Python, PyTorch, Gemini API) |
| **Sophia Martinez** | `sophia@example.com` | `password123` | UI/UX Designer (Figma, Design Systems, Tailwind) |

---

## 🔮 Roadmap & Stretch Goals

- [ ] **Real-Time Team Chat**: Socket.io integration for instant direct messages between matched team members.
- [ ] **Email Notifications**: Automated alerts when a team request receives a response or an application is accepted.
- [ ] **Skill Endorsements**: Peer validations and endorsements on developer profiles.
- [ ] **Cloudinary Integration**: Direct image uploads for user profile avatars and hackathon banners.
- [ ] **Advanced Matching v2**: Machine learning vector embeddings for semantic project and skill matching.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
# hackMatch
Smart hackathon team formation platform based on skill and interest matching.
