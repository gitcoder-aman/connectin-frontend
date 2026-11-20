# ConnectIn Frontend: Modern Professional Social Network

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB.svg?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.11-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.16-38B2AC.svg?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TanStack Query](https://img.shields.io/badge/TanStack%20Query-v5-FF4154.svg?logo=reactquery&logoColor=white)](https://tanstack.com/query/latest)
[![Axios](https://img.shields.io/badge/Axios-1.7.9-5A29E4.svg?logo=axios&logoColor=white)](https://axios-http.com/)
[![Lucide Icons](https://img.shields.io/badge/Lucide-React-F56565.svg)](https://lucide.dev/)
[![Kubernetes GKE](https://img.shields.io/badge/Backend-GKE%20Microservices-326CE5.svg?logo=kubernetes&logoColor=white)](http://34.95.113.61/)

A responsive single-page web application (SPA) built for **ConnectIn**, an enterprise microservices social networking platform. ConnectIn delivers LinkedIn-style professional networking, social graph exploration, multipart post publishing with Cloudinary media integration, optimistic like interactions, and synchronized real-time connection state management.

---

## Table of Contents

1. [Architectural Overview](#-architectural-overview)
2. [Technology Stack](#-technology-stack)
3. [Key Features](#-key-features)
4. [Backend API Mapping](#-backend-api-mapping)
5. [Authentication & Session Persistence](#-authentication--session-persistence)
6. [Pre-Seeded Test Accounts](#-pre-seeded-test-accounts)
7. [Getting Started & Local Development](#-getting-started--local-development)
8. [Vite Proxy & CORS Strategy](#-vite-proxy--cors-strategy)
9. [Project Directory Structure](#-project-directory-structure)
10. [Documented Backend Architectural Boundaries](#-documented-backend-architectural-boundaries)
11. [Production Build & Quality Verification](#-production-build--quality-verification)

---

## 🚀 Architectural Overview

The frontend interacts with the **ConnectIn** backend deployed on **Google Kubernetes Engine (GKE)** via a centralized Google Cloud HTTP(S) Load Balancer and Spring Cloud Gateway:

```
[ Browser Client (http://localhost:5173) ]
                    │
                    ▼  (Same-Origin /api/* Proxy)
[ Vite Development Reverse Proxy (Port 5173) ]
                    │
                    ▼  (Server-to-Server / Zero CORS)
[ GKE Ingress Controller (External IP: 34.95.113.61:80) ]
                    │
                    ▼
[ API Gateway (Spring Cloud Gateway :8080) ]
        │  • JWT Bearer Authentication & Claims Validation
        │  • Downstream X-User-Id Header Enrichment
        │  • Prefix Stripping (/api/v1/* -> /*)
        │
        ├── /api/v1/users/**         ──► User Service (:9020)         ──► PostgreSQL (userDB)
        │                                    │ [user_created_topic]
        │                                    ▼
        ├── /api/v1/connections/**   ──► Connections Service (:9030)  ──► Neo4j Graph DB
        │                                    ▲
        ├── /api/v1/posts/**         ──► Post Service (:9010)         ──► PostgreSQL (postsDB)
        │                                    │ (OpenFeign)
        │                                    ├──► Uploader Service (:9050) ──► Cloudinary CDN
        │                                    │
        │                                    └──► [Kafka Topics: post_created, post_liked]
        │                                                 │
        │                                                 ▼
        └── /api/v1/notifications/** ──► Notification Service (:9040) ──► PostgreSQL (notificationDB)
```

---

## 🛠️ Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Core Framework** | React | `^18.3.1` | Component-based declarative UI architecture |
| **Language** | TypeScript | `^5.6.3` | Strict static typing, interfaces, and compile-time verification |
| **Build Tooling** | Vite | `^5.4.11` | Instant HMR, ESM bundling, and reverse proxying |
| **Styling** | Tailwind CSS | `^3.4.16` | Utility-first responsive design matching modern enterprise standards |
| **Routing** | React Router DOM | `^6.28.0` | Declarative client-side routing with protected route guards |
| **Server State** | TanStack React Query | `^5.62.7` | Asynchronous data fetching, intelligent caching, and optimistic mutations |
| **HTTP Client** | Axios | `^1.7.9` | Promise-based client with custom request/response interceptors |
| **Iconography** | Lucide React | `^0.468.0` | Accessible, tree-shakeable SVG icon collection |
| **Media Hosting** | Cloudinary CDN | Hosted | Offloaded image transformations and secure asset delivery |

---

## ✨ Key Features

### 1. Dynamic Home Feed (`/feed`)
* **Composer Box:** Create posts with text and optional media attachments.
* **1x1 Transparent Fallback Image:** Automatically satisfies the backend `@RequestPart("file")` contract when a user publishes a text-only post without showing broken image boxes in the UI.
* **Chronological Aggregation:** Since the backend does not have a global feed endpoint, the frontend merges the authenticated user's posts with all mutual 1st-degree connections' posts, deduplicating by ID and sorting in reverse chronological order.
* **Optimistic Liking:** Instant UI feedback when clicking the like button with automatic rollback on network failure.

### 2. Social Network Management (`/network`)
Organized across **4 intuitive tabs** with real-time counters:
* **Discover People (`all`):** Explores all registered `:Person` nodes across the Neo4j graph with one-click "Connect" actions.
* **1st-Degree Connections (`connected`):** Shows confirmed mutual connections with the ability to disconnect via a confirmation dialog.
* **Invitations Received (`received`):** Displays pending incoming requests with one-click "Accept" or "Decline" buttons.
* **Requests Sent (`sent`):** Tracks pending outbound requests awaiting recipient approval.
* **Live Search:** Filter members instantly across any active tab by name or user ID.

### 3. Media & File Uploader (`/upload`)
* Drag-and-drop file upload zone supporting JPG, PNG, WebP, and GIF up to 10MB.
* Real-time upload progress bar and instant image preview.
* Direct Cloudinary URL output with a one-click "Copy to Clipboard" button.

### 4. User Profile & Timeline (`/profile` & `/profile/:userId`)
* Profile hero card with member initials, title, location, and connection counts.
* In-line profile editor modal allowing users to customize their headline, bio, and location (persisted in local storage).
* Tabular post history rendering all posts authored by the selected member.

### 5. Live Notifications Hub (`/notifications`)
* **Real-Time Kafka Event Integration:** Consumes real-time notifications persisted from Kafka (`post_liked_topic`, `post_created_topic`) via backend REST endpoint `/api/v1/notifications/core/users/{userId}`.
* **Notification Cards:** Displays like alerts ("User with id: 6 has liked your post with id: 6") and connection post notifications with relative timestamps.
* **Navbar Unread Counter Badge:** Live red badge counter on the top navigation bar with automated 10-second background polling.
* **Mark All As Read:** One-click clear action that synchronizes read status to `localStorage` and dismisses the badge counter.
* **Connection Requests:** Displays pending incoming network requests alongside activity alerts.

---

## 📋 Backend API Mapping

All frontend service calls interface with verified Spring Boot microservice endpoints:

| Domain | Method | Endpoint | Auth | Request Body / Params | Expected Response |
|---|---|---|---|---|---|
| **Auth** | `POST` | `/api/v1/users/auth/signup` | Public | `{ name, email, password }` | `201 Created` (`UserDto`) |
| **Auth** | `POST` | `/api/v1/users/auth/login` | Public | `{ email, password }` | `200 OK` (`LoginResponse`) |
| **Posts** | `POST` | `/api/v1/posts/core` | Bearer | Multipart: `post` (JSON), `file` (binary) | `201 Created` (`PostDto`) |
| **Posts** | `GET` | `/api/v1/posts/core/{postId}` | Bearer | Path: `postId` | `200 OK` (`PostDto`) |
| **Posts** | `GET` | `/api/v1/posts/core/users/{userId}/all-posts` | Bearer | Path: `userId` | `200 OK` (`List<PostDto>`) |
| **Posts** | `POST` | `/api/v1/posts/likes/{postId}` | Bearer | Path: `postId`, Body: `{}` | `204 No Content` |
| **Posts** | `DELETE` | `/api/v1/posts/likes/{postId}` | Bearer | Path: `postId` | `204 No Content` |
| **Network** | `GET` | `/api/v1/connections/core/all` | Bearer | None | `200 OK` (`List<Person>`) |
| **Network** | `GET` | `/api/v1/connections/core/{userId}/first-degree` | Bearer | Path: `userId` | `200 OK` (`List<Person>`) |
| **Network** | `GET` | `/api/v1/connections/core/requests/sent` | Bearer | None | `200 OK` (`List<Person>`) |
| **Network** | `GET` | `/api/v1/connections/core/requests/received` | Bearer | None | `200 OK` (`List<Person>`) |
| **Network** | `POST` | `/api/v1/connections/core/request/{userId}` | Bearer | Path: `userId`, Body: `{}` | `204 No Content` |
| **Network** | `POST` | `/api/v1/connections/core/accept/{senderId}` | Bearer | Path: `senderId`, Body: `{}` | `204 No Content` |
| **Network** | `POST` | `/api/v1/connections/core/reject/{senderId}` | Bearer | Path: `senderId`, Body: `{}` | `204 No Content` |
| **Network** | `DELETE` | `/api/v1/connections/core/remove/{userId}` | Bearer | Path: `userId` | `204 No Content` |
| **Notifications** | `GET` | `/api/v1/notifications/core/users/{userId}` | Bearer | Path: `userId` | `200 OK` (`List<Notification>`) |
| **Notifications** | `GET` | `/api/v1/notifications/core` | Bearer | Header: `X-User-Id` | `200 OK` (`List<Notification>`) |

---

## 🔒 Authentication & Session Persistence

### 1. Token Issuance & Storage
* Upon successful authentication, the backend returns an `accessToken` (HMAC-SHA256 JWT) and `userEmail`.
* The token payload contains `sub` (representing the numeric `userId`) and `email`.
* Stored keys in `localStorage`:
  - `connectin_token`: Active JWT Bearer token.
  - `connectin_user_id`: Numeric user ID for downstream services.
  - `connectin_user_email`: Authenticated user email.
  - `connectin_user_name`: Display name.
  - `connectin_user_profile`: Custom bio, headline, and location.

### 2. Synchronous Session Restoration
* The `AuthProvider` synchronously hydrates the `user` and `token` state from `localStorage` on the very first React render pass using `restoreUserFromStorage()`.
* **Zero Redirect Glitches:** Because `isAuthenticated` is initialized as `true` immediately when a token exists, reloading the page at `/feed` or `/network` stays on that page without flashing or redirecting to `/login`.

### 3. Server-Authoritative Token Validation
* The client relies on the Spring Boot API Gateway as the source of truth for token validity.
* If a token is revoked or expires on the server, the gateway responds with `401 Unauthorized`.
* An Axios response interceptor intercepts the `401`, triggers `logout()`, cleans up local storage, and prompts the user to sign in again.

---

## 👥 Pre-Seeded Test Accounts

The live backend cluster (`http://34.95.113.61`) has been pre-populated with active accounts:

| Member | Email | Password | Role / Headline | User ID | Pre-Configured State |
|---|---|---|---|---|---|
| **Sarah Chen** | `sarah.chen@connectin.com` | `Password123!` | Principal Cloud Architect @ Google Cloud | **6** | Connected with Alex & Priya; pending request from Emily. |
| **Alex Rivera** | `alex.rivera@connectin.com` | `Password123!` | Senior Full-Stack Engineer @ Meta | **7** | Connected with Sarah & David; published tutorial post. |
| **Priya Sharma** | `priya.sharma@connectin.com` | `Password123!` | Lead Product Designer & UX Strategist | **8** | Connected with Sarah & David; published design post. |
| **David Kim** | `david.kim@connectin.com` | `Password123!` | Staff DevOps & SRE @ Netflix | **9** | Connected with Alex & Priya; published Kubernetes post. |
| **Emily Watson** | `emily.watson@connectin.com` | `Password123!` | VP of Engineering @ Stripe | **10** | Sent invitation to Sarah; published hiring post. |

---

## 💻 Getting Started & Local Development

### 1. Prerequisites
* **Node.js:** `>= 18.0.0` (LTS recommended)
* **npm:** `>= 9.0.0`

### 2. Installation
Clone the repository and install dependencies:
```bash
cd connectin-frontend
npm install
```

### 3. Environment Configuration
Inspect or create `.env`:
```ini
# Leave VITE_API_BASE_URL empty in local dev to route through the Vite proxy (/api/...)
# This avoids CORS preflight OPTIONS rejection from the backend API Gateway.
VITE_API_BASE_URL=
VITE_BACKEND_TARGET=http://34.95.113.61
```

### 4. Start Development Server
```bash
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 🌐 Vite Proxy & CORS Strategy

### The Problem
When the frontend makes cross-origin requests directly to `http://34.95.113.61/api/v1/...`, the browser dispatches an HTTP `OPTIONS` preflight check. Because browser security standards forbid sending `Authorization` headers on preflight requests, the backend API Gateway's `AuthenticationFilter` rejected preflight checks with **HTTP 401 Unauthorized**.

### The Solution
In local development, `apiClient` uses relative URLs (`/api/...`). Vite's development server acts as a reverse proxy:
```typescript
// vite.config.ts
server: {
  port: 5173,
  host: true,
  proxy: {
    '/api': {
      target: targetUrl, // http://34.95.113.61
      changeOrigin: true,
      secure: false,
    },
    '/upload': {
      target: env.VITE_UPLOADER_BASE_URL || targetUrl,
      changeOrigin: true,
      secure: false,
    },
  },
}
```
* The browser communicates **same-origin** with `http://localhost:5173/api/...`.
* **Zero CORS preflight checks** are issued by the browser.
* The Vite proxy forwards requests directly to the GKE cluster, passing all `Authorization` and `X-User-Id` headers without interference.

---

## 📁 Project Directory Structure

```
connectin-frontend/
├── index.html                   # HTML entry point (loads /src/main.tsx)
├── package.json                 # Dependencies and build scripts
├── postcss.config.js            # PostCSS configuration for Tailwind
├── tailwind.config.js           # Custom typography, colors, and shadows
├── tsconfig.json                # TypeScript compiler configuration
├── vite.config.ts               # Vite configuration with reverse proxy
├── .env                         # Local environment variables
├── .env.example                 # Example environment template
└── src/
    ├── main.tsx                 # React DOM root render
    ├── App.tsx                  # QueryClient, Auth, and Router providers
    ├── index.css                # Global Tailwind CSS styles
    ├── api/                     # Centralized API service layer
    │   ├── client.ts            # Axios instance with auth & error interceptors
    │   ├── authApi.ts           # Login and signup API calls
    │   ├── postsApi.ts          # Posts, likes, and feed calls
    │   ├── connectionsApi.ts    # Neo4j graph connection endpoints
    │   ├── notificationsApi.ts  # Backend Kafka notification stream endpoints
    │   └── uploaderApi.ts       # Cloudinary media uploader service
    ├── components/
    │   ├── common/              # Reusable UI primitives
    │   │   ├── Badge.tsx        # Status pills & counters
    │   │   ├── Button.tsx       # Standard buttons with loading states
    │   │   ├── ConfirmDialog.tsx# Modal confirmation for destructive actions
    │   │   ├── EmptyState.tsx   # Visual fallbacks when lists are empty
    │   │   ├── Input.tsx        # Styled form inputs
    │   │   ├── Lightbox.tsx     # Fullscreen image viewer
    │   │   ├── Modal.tsx        # Accessible dialog wrapper
    │   │   ├── Skeleton.tsx     # Animated loading skeleton placeholders
    │   │   └── Textarea.tsx     # Auto-expanding text areas
    │   ├── feed/                # Post and feed components
    │   │   ├── CreatePostCard.tsx # Post composer with media upload
    │   │   ├── PostCard.tsx     # Post display with likes and lightbox
    │   │   └── PostDetailModal.tsx # Post metadata inspection dialog
    │   ├── layout/              # App chrome & navigation
    │   │   ├── Navbar.tsx       # Top bar with search, badges, and profile menu
    │   │   ├── MobileNav.tsx    # Mobile bottom navigation bar
    │   │   ├── SidebarLeft.tsx  # User profile summary and shortcuts
    │   │   └── SidebarRight.tsx # Recommended members & architecture status
    │   ├── network/             # Social graph components
    │   │   ├── ConnectionTabs.tsx# Tab switchers for All, Connected, Sent, Received
    │   │   ├── NetworkSearch.tsx# Live member filter input
    │   │   └── PersonCard.tsx   # Member card with dynamic action buttons
    │   ├── profile/             # Profile page components
    │   │   ├── ProfileBioModal.tsx # Headline and bio editor
    │   │   ├── ProfileHeader.tsx# Profile hero card with action buttons
    │   │   └── UserPostsList.tsx# Member post timeline
    │   └── system/
    │       └── BackendStatusModal.tsx # Live GKE microservices inspector
    ├── context/
    │   ├── AuthContext.tsx      # Session management and synchronous restoration
    │   ├── NotificationContext.tsx # Live Kafka notification polling & unread badge sync
    │   └── ToastContext.tsx     # System notification toasts
    ├── hooks/
    │   ├── useFeed.ts           # Post creation, likes, and timeline aggregation
    │   └── useNetwork.ts        # Graph queries and connection mutations
    ├── layouts/
    │   ├── AuthLayout.tsx       # Centered card layout for login and signup
    │   └── DashboardLayout.tsx  # Responsive 3-column desktop layout
    ├── pages/
    │   ├── DirectUploadPage.tsx # Standalone Cloudinary media uploader
    │   ├── FeedPage.tsx         # Main activity feed
    │   ├── LoginPage.tsx        # User authentication form
    │   ├── NetworkPage.tsx      # Professional network management
    │   ├── NotFoundPage.tsx     # 404 fallback page
    │   ├── NotificationsPage.tsx# Notifications stream
    │   ├── ProfilePage.tsx      # Member profile and activity view
    │   └── SignupPage.tsx       # User registration form
    ├── routes/
    │   ├── AppRoutes.tsx        # Client routing configuration
    │   └── ProtectedRoute.tsx   # Auth guard for private views
    ├── types/                   # TypeScript interfaces and contracts
    │   ├── api.ts               # Spring Boot ApiError interface
    │   ├── auth.ts              # User, Login, and Profile types
    │   ├── connection.ts        # Graph Person and Tab types
    │   └── post.ts              # PostDto and FeedPost interfaces
    └── utils/
        ├── cn.ts                # Tailwind class merging utility
        ├── formatters.ts        # Relative timestamps and initial generators
        └── jwt.ts               # Base64 JWT decoding and claims extraction
```

---

## ⚠️ Documented Backend Architectural Boundaries & Integrations

The frontend strictly aligns with backend boundaries and contracts:

1. **No Global Feed Endpoint:** `postService` only exposes `/core/users/{userId}/all-posts`. The frontend dynamically aggregates posts from mutual 1st-degree connections using React Query.
2. **Notification REST API Integration:** The backend `notification-service` exposes `/api/v1/notifications/core/users/{userId}`, which the frontend polls every 10 seconds to display real-time Kafka post like events and connection post updates.
3. **No Comments Entity:** The backend does not implement comments. The comment button displays an architectural notice.
4. **No User Profile Editing API:** User metadata like headline and bio are cached in `localStorage`.
5. **No Pagination Parameters:** Backend endpoints return complete arrays, which the frontend renders cleanly with search filtering.

---

## 📦 Production Build & Quality Verification

### 1. Build Production Assets
```bash
npm run build
```
Compiles TypeScript with `tsc` and bundles static assets into `dist/`:
```text
✓ 1736 modules transformed.
dist/index.html                   0.66 kB │ gzip:   0.40 kB
dist/assets/index-CZO8umeB.css   36.88 kB │ gzip:   6.90 kB
dist/assets/index-DyiWwT_I.js   395.66 kB │ gzip: 120.65 kB
✓ built in 1.92s
```

### 2. Preview Production Build
```bash
npm run preview
```
Starts a local web server serving the optimized production build at `http://localhost:4173`.

---

## 📄 License & Author

* **Project:** ConnectIn Social Network (Frontend Client)
* **Author:** Aman Kumar ([@gitcoder-aman](https://github.com/gitcoder-aman))
* **License:** [Apache License 2.0](LICENSE)
