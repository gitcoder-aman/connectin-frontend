# ConnectIn Frontend

Modern, responsive professional social networking frontend for the **ConnectIn** microservices architecture, built with React, TypeScript, Vite, Tailwind CSS, TanStack Query, and Lucide React.

## 🚀 Production Backend Architecture

The backend microservices are deployed on **Google Kubernetes Engine (GKE)** behind an Ingress and Spring Cloud API Gateway:

- **Production Base URL:** `http://34.95.113.61/`
- **Environment Variable:** `VITE_API_BASE_URL=http://34.95.113.61`

```
Browser / Client
      │
      ▼
GKE Ingress (External IP: 34.95.113.61, Port 80)
      │
      ▼
API Gateway (:8080)
      ├── /api/v1/users/**       ──► user-service (:9020)       ──► PostgreSQL (usersDB)
      ├── /api/v1/posts/**       ──► post-service (:9010)       ──► PostgreSQL (postsDB)
      │                                    │ (OpenFeign)
      │                                    └──► uploader-service (:9050) ──► Cloudinary
      └── /api/v1/connections/** ──► connections-service (:9030) ──► Neo4j Graph DB
                                           │
                                     Kafka Topics
                        (user_created_topic, post_created_topic, post_liked_topic)
                                           │
                                           ▼
                                 notification-service (:9040)  ──► PostgreSQL (notificationDB)
```

---

## 🛠️ Technology Stack

- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (LinkedIn & modern SaaS design system)
- **Routing:** React Router v6
- **Server State Management:** TanStack React Query v5
- **HTTP Client:** Axios (with request/response interceptors)
- **Icons:** Lucide React

---

## 📋 Comprehensive API Mapping

Every frontend feature connects to the verified Spring Boot microservice endpoints:

| Service | HTTP Method | Gateway Route | Headers / Auth | Payload / Params | Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `user-service` | `POST` | `/api/v1/users/auth/signup` | Public | `{ name, email, password }` | `201 Created` (`UserDto`: id, name, email) |
| `user-service` | `POST` | `/api/v1/users/auth/login` | Public | `{ email, password }` | `200 OK` (`LoginResponse`: userEmail, accessToken) |
| `connections-service` | `GET` | `/api/v1/connections/core/all` | `Authorization`, `X-User-Id` | None | `200 OK` (`List<Person>`) |
| `connections-service` | `GET` | `/api/v1/connections/core/{userId}/first-degree` | `Authorization`, `X-User-Id` | `userId` (path) | `200 OK` (`List<Person>`) |
| `connections-service` | `GET` | `/api/v1/connections/core/requests/sent` | `Authorization`, `X-User-Id` | None | `200 OK` (`List<Person>`) |
| `connections-service` | `GET` | `/api/v1/connections/core/requests/received` | `Authorization`, `X-User-Id` | None | `200 OK` (`List<Person>`) |
| `connections-service` | `POST` | `/api/v1/connections/core/request/{userId}` | `Authorization`, `X-User-Id` | `userId` (path) | `204 No Content` |
| `connections-service` | `POST` | `/api/v1/connections/core/accept/{senderId}` | `Authorization`, `X-User-Id` | `senderId` (path) | `204 No Content` |
| `connections-service` | `POST` | `/api/v1/connections/core/reject/{senderId}` | `Authorization`, `X-User-Id` | `senderId` (path) | `204 No Content` |
| `connections-service` | `DELETE` | `/api/v1/connections/core/remove/{userId}` | `Authorization`, `X-User-Id` | `userId` (path) | `204 No Content` |
| `post-service` | `POST` | `/api/v1/posts/core` | `Authorization`, `X-User-Id`, `multipart/form-data` | `post` (JSON blob), `file` (image) | `201 Created` (`PostDto`: id, content, imageUrl, userId, createdAt) |
| `post-service` | `GET` | `/api/v1/posts/core/{postId}` | `Authorization`, `X-User-Id` | `postId` (path) | `200 OK` (`PostDto`) |
| `post-service` | `GET` | `/api/v1/posts/core/users/{userId}/all-posts` | `Authorization`, `X-User-Id` | `userId` (path) | `200 OK` (`List<PostDto>`) |
| `post-service` | `POST` | `/api/v1/posts/likes/{postId}` | `Authorization`, `X-User-Id` | `postId` (path) | `204 No Content` |
| `post-service` | `DELETE` | `/api/v1/posts/likes/{postId}` | `Authorization`, `X-User-Id` | `postId` (path) | `204 No Content` |

---

## 🔒 Authentication Flow

1. **User Sign Up:**
   - User submits `name`, `email`, and `password` to `/api/v1/users/auth/signup`.
   - `user-service` saves user to PostgreSQL and emits `UserCreatedEvent` to Kafka topic `user_created_topic`.
   - `connectionService` consumes this Kafka event and registers a `Person` node in Neo4j.
2. **User Login:**
   - Submits `email` and `password` to `/api/v1/users/auth/login`.
   - Returns `accessToken` (JWT signed with HS256) and `userEmail`.
   - The user ID is encoded in the JWT `sub` claim.
3. **Downstream Authentication:**
   - The frontend Axios interceptor automatically attaches both `Authorization: Bearer <token>` and `X-User-Id: <userId>` to every authenticated request.
   - This satisfies both the API Gateway's `AuthenticationFilter` and downstream controllers (`postService`, `connectionService`) that read `X-User-Id`.
4. **Session Expiry:**
   - Token expiration (`exp`) is verified on app startup.
   - Any 401 response from the backend triggers an automatic session cleanup and redirects to `/login`.

---

## ⚠️ Documented Backend Boundaries & Limitations

In accordance with Section 1 & 2 rules (*"Do not modify backend code; if an API is unavailable, document the limitation"*):

1. **No Comments API:**
   - `postService` currently only defines `Post` and `PostLike` entities.
   - No comment tables, repositories, or controllers exist in the backend. The UI documents this limitation cleanly and informs users.
2. **No Notifications Retrieval REST API:**
   - `notification-service` is an asynchronous Kafka consumer (`PostsConsumer`) that writes to PostgreSQL when posts are created or liked.
   - It exposes no REST controller or API Gateway routes. The notifications page explains this architecture clearly.
3. **No User Profile Update REST API:**
   - `userService` only has signup and login endpoints. User attributes like profile headline, bio, and custom locations are maintained in client preferences.
4. **Feed Aggregation:**
   - The backend does not provide a single `/feed` aggregation endpoint. The frontend aggregates posts chronologically from the user and their 1st-degree connections using TanStack Query.
5. **No Pagination Parameters:**
   - Backend list endpoints return complete arrays without `page` or `size` parameters.

---

## 💻 Setup & Installation

### 1. Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### 2. Install Dependencies
```bash
cd connectin-frontend
npm install
```

### 3. Environment Configuration
Create or inspect `.env`:
```env
VITE_API_BASE_URL=http://34.95.113.61
```

### 4. Start Development Server
```bash
npm run dev
```
The application will start at `http://localhost:5173`.
Vite dev server proxies `/api` requests to the production GKE backend at `http://34.95.113.61`.

### 5. Production Build & Preview
```bash
npm run build
npm run preview
```

---

## ✅ Quality & Verification Checklist

- [x] Zero backend Java code modified
- [x] Zero Spring Boot configurations or controllers changed
- [x] Production base URL `http://34.95.113.61/` configured as default
- [x] Configurable via `.env` and `.env.example`
- [x] Centralized Axios client with JWT + `X-User-Id` interceptor
- [x] Responsive layout (Desktop, Tablet, Mobile)
- [x] TanStack React Query for caching, optimistic updates, and invalidations
- [x] Form validation, loading skeletons, empty states, and toast notifications
- [x] Lightbox modal for full-size post images
- [x] Production TypeScript compilation (`tsc`) verified
