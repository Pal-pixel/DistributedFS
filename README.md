# DistributedFS

> **Distributed Fault-Tolerant Cloud File Storage System**

DistributedFS is a distributed file storage system designed to provide reliable file upload, download, file management, data integrity, persistent metadata, and fault tolerance using multiple backend servers and a storage abstraction layer.

The project is being developed incrementally, starting with a functional single-server file management system and evolving toward a distributed, fault-tolerant storage architecture.

---

# 🚀 Project Overview

Traditional file storage applications commonly follow this architecture:

```text
User
  ↓
Single Backend Server
  ↓
Local Disk
```

This approach introduces several problems:

- Single point of failure
- Limited scalability
- Local storage dependency
- Difficult server migration
- Potential data loss
- No built-in integrity verification
- Metadata may be lost when stored only in application memory

DistributedFS addresses these problems by introducing:

- Multiple backend servers
- Load balancing
- Persistent metadata
- File integrity verification
- Storage abstraction
- Health checks
- Fault tolerance
- Future cloud/object storage integration

---

# 🏗️ System Architecture

The long-term architecture is:

```text
                         ┌───────────────────┐
                         │   React Frontend  │
                         └─────────┬─────────┘
                                   │
                                   ▼
                         ┌───────────────────┐
                         │    Load Balancer  │
                         │       NGINX       │
                         └─────────┬─────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
             ┌────────────┐ ┌────────────┐ ┌────────────┐
             │ API Server │ │ API Server │ │ API Server │
             │    Node 1  │ │    Node 2  │ │    Node 3  │
             └──────┬─────┘ └──────┬─────┘ └──────┬─────┘
                    └──────────────┼──────────────┘
                                   ▼
                         ┌───────────────────┐
                         │  Storage Manager  │
                         └─────────┬─────────┘
                                   │
                     ┌─────────────┴─────────────┐
                     ▼                           ▼
              Local Storage               Future Cloud
              Adapter                     Storage Adapter
                     │                           │
                     └─────────────┬─────────────┘
                                   ▼
                         ┌───────────────────┐
                         │     Firestore     │
                         │     Metadata      │
                         └───────────────────┘

                         ┌───────────────────┐
                         │ Monitoring Layer  │
                         └───────────────────┘
```

---

# 🎯 Project Objectives

DistributedFS aims to:

- Provide reliable file upload and download.
- Provide file management operations.
- Separate file metadata from file contents.
- Avoid permanent dependence on a single storage implementation.
- Support multiple backend servers.
- Detect backend server failures.
- Support load balancing.
- Verify file integrity using SHA-256.
- Store metadata persistently.
- Abstract storage providers.
- Support future storage replication.
- Support future storage failover.
- Provide monitoring and observability.

---

# ✨ Current Features

## File Management

- ✅ File upload
- ✅ File listing
- ✅ File download
- ✅ File deletion

## File Metadata

Each uploaded file contains metadata such as:

```text
fileId
fileName
storageName
size
contentType
checksum
storageProvider
createdAt
```

## File Integrity

DistributedFS calculates a SHA-256 checksum for uploaded files.

```text
File
 ↓
SHA-256
 ↓
Checksum
 ↓
Metadata
```

Example:

```text
38c9792d725c45dd431699e6a3b0f0f8e17c63c9ac7331387ee30dcc6e42a511
```

SHA-256 produces a 256-bit hash represented by 64 hexadecimal characters.

---

# 🛠️ Technology Stack

## Frontend

Planned:

- React
- Vite
- JavaScript
- Axios

## Backend

- Node.js
- Express.js
- JavaScript
- Multer
- UUID
- dotenv
- Firebase Admin SDK

## Database

### Firebase Firestore

Firestore is used to persist file metadata.

The database stores information such as:

```text
fileId
fileName
size
contentType
checksum
storageName
storageProvider
createdAt
```

The actual file contents are not stored inside Firestore.

---

# 💾 Storage Architecture

DistributedFS separates **file contents** from **file metadata**.

## Current Implementation

```text
File Contents
      ↓
Local Development Storage

File Metadata
      ↓
Firebase Firestore
```

The current file-storage provider is:

```text
LOCAL_DEV
```

This is being used during development while the storage abstraction is being built.

---

## Why Local Storage Is Currently Used

The original design considered AWS S3, but AWS account setup could not be completed during development.

Therefore, AWS S3 is **not currently part of the implementation**.

Instead, the project continues using local development storage while keeping the architecture provider-independent.

This allows the application to be developed without changing the API design.

---

# 🔌 Storage Abstraction

The application is designed so that controllers and routes do not need to know where a file is physically stored.

The intended architecture is:

```text
Controller
    ↓
Storage Manager
    ↓
Storage Adapter
    ↓
Storage Provider
```

Current implementation:

```text
Controller
    ↓
File Service
    ↓
Local Storage
```

Target architecture:

```text
                  Storage Manager
                        │
              ┌─────────┴─────────┐
              ▼                   ▼
       Local Storage        Future Cloud
          Adapter              Adapter
              │                   │
              ▼                   ▼
         Local Files       Cloud Storage
```

This design allows a future storage provider to be added without rewriting the complete application.

---

# 📁 Project Structure

```text
DistributedFS/
│
├── backend/
│   │
│   ├── src/
│   │   │
│   │   ├── config/
│   │   │   └── firebase.js
│   │   │
│   │   ├── controllers/
│   │   │   └── fileController.js
│   │   │
│   │   ├── middleware/
│   │   │   └── uploadMiddleware.js
│   │   │
│   │   ├── models/
│   │   │
│   │   ├── routes/
│   │   │   └── fileRoutes.js
│   │   │
│   │   ├── services/
│   │   │   └── fileService.js
│   │   │
│   │   ├── utils/
│   │   │   └── checksum.js
│   │   │
│   │   └── server.js
│   │
│   ├── tests/
│   ├── uploads/
│   │
│   ├── firebase-service-account.json
│   │
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── hooks/
│       └── utils/
│
├── infrastructure/
│   ├── nginx/
│   ├── docker/
│   └── monitoring/
│
├── docs/
│
└── README.md
```

> **Security note:** `firebase-service-account.json` must never be committed to GitHub.

---

# 🔄 Backend Architecture

DistributedFS follows a layered backend architecture:

```text
HTTP Request
      ↓
Route
      ↓
Controller
      ↓
Service
      ↓
Storage / Database
```

### Routes

```text
POST   /api/files/upload
GET    /api/files
GET    /api/files/:id/download
DELETE /api/files/:id
```

### Controllers

Controllers are responsible for:

- Receiving HTTP requests
- Validating request-level information
- Calling application services
- Returning HTTP responses

### Services

Services contain application logic such as:

- File management
- Metadata management
- Storage operations
- Checksum generation
- Database operations

---

# 📤 File Upload Flow

The current upload process is:

```text
User
 ↓
POST /api/files/upload
 ↓
Multer
 ↓
Local File Storage
 ↓
Generate UUID
 ↓
Calculate SHA-256
 ↓
Create Metadata
 ↓
Store Metadata
 ↓
Return Response
```

Example response:

```json
{
  "success": true,
  "message": "File uploaded successfully",
  "file": {
    "fileId": "320456ef-ac11-40f8-a645-481e5b59c389",
    "fileName": "file-sample_150kB.pdf",
    "storageName": "1787154521472-661086065.pdf",
    "size": 142786,
    "contentType": "application/pdf",
    "checksum": "38c9792d725c45dd431699e6a3b0f0f8e17c63c9ac7331387ee30dcc6e42a511",
    "storageProvider": "LOCAL_DEV",
    "createdAt": "2026-08-19T15:48:41.477Z"
  }
}
```

---

# 📥 File Download Flow

```text
Client
  ↓
GET /api/files/:id/download
  ↓
Find Metadata
  ↓
Locate Local Storage Object
  ↓
Return File
  ↓
Client Downloads File
```

---

# 🗑️ File Delete Flow

```text
Client
  ↓
DELETE /api/files/:id
  ↓
Find Metadata
  ↓
Delete Stored Object
  ↓
Delete Metadata
  ↓
Return Success
```

---

# 🔐 File Integrity

SHA-256 is used to identify the exact contents of an uploaded file.

```text
Uploaded File
      ↓
SHA-256 Algorithm
      ↓
Checksum
      ↓
Metadata
```

Example:

```text
38c9792d725c45dd431699e6a3b0f0f8e17c63c9ac7331387ee30dcc6e42a511
```

If the file contents change, the checksum changes.

This provides a mechanism for detecting file corruption.

---

# 🗄️ Firestore Metadata

Firestore stores metadata rather than complete file contents.

Conceptual structure:

```text
Firestore
│
└── files
    │
    ├── <fileId>
    │   ├── fileName
    │   ├── size
    │   ├── contentType
    │   ├── checksum
    │   ├── storageProvider
    │   ├── storageName
    │   └── createdAt
    │
    └── <fileId>
        ├── fileName
        ├── size
        ├── contentType
        ├── checksum
        ├── storageProvider
        ├── storageName
        └── createdAt
```

The separation provides a clean distinction between:

```text
File Data
    ↓
Storage

File Metadata
    ↓
Firestore
```

---

# 🌐 Distributed Backend

The final system will run multiple instances of the backend.

```text
API Server 1
API Server 2
API Server 3
```

Each server can have a unique ID:

```env
SERVER_ID=server-1
```

Example:

```env
SERVER_ID=server-2
```

Health endpoint:

```http
GET /health
```

Example response:

```json
{
  "status": "healthy",
  "serverId": "server-1",
  "timestamp": "2026-08-19T15:48:41.477Z"
}
```

---

# ⚖️ Load Balancing

NGINX will eventually distribute requests across backend servers.

```text
                         Client
                            │
                            ▼
                    ┌─────────────┐
                    │    NGINX    │
                    │Load Balancer│
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
          Server 1      Server 2      Server 3
             🟢            🟢            🟢
```

If one server fails:

```text
Server 1 🟢
Server 2 🔴
Server 3 🟢
```

the load balancer can route requests toward the healthy servers.

---

# 🧩 Fault Tolerance

Planned fault-tolerance features include:

- Multiple backend instances
- Health checks
- Load balancing
- Server failure detection
- Retry mechanisms
- Storage-provider fallback
- Optional file replication
- Resumable uploads
- Chunked uploads

The objective is to prevent a single backend instance from becoming a complete system failure.

---

# 📊 Monitoring

The planned monitoring architecture is:

```text
Backend Servers
      ↓
 Prometheus
      ↓
   Grafana
      ↓
Monitoring Dashboard
```

Future metrics will include:

- Server health
- Request count
- Request latency
- Upload throughput
- Download throughput
- Error rate
- Storage usage
- Failed requests
- Storage-provider failures

---

# 🔌 API Reference

## Health Check

```http
GET /health
```

Example response:

```json
{
  "status": "healthy",
  "serverId": "server-1",
  "timestamp": "2026-08-19T15:48:41.477Z"
}
```

---

## Upload File

```http
POST /api/files/upload
```

Request:

```text
multipart/form-data
file=<file>
```

---

## List Files

```http
GET /api/files
```

---

## Download File

```http
GET /api/files/:id/download
```

---

## Delete File

```http
DELETE /api/files/:id
```

---

# ⚙️ Local Development

## Clone Repository

```bash
git clone <repository-url>
cd DistributedFS
```

## Backend

```bash
cd backend
npm install
```

Create `.env`:

```env
PORT=5000
SERVER_ID=server-1
NODE_ENV=development
```

Start the backend:

```bash
npm run dev
```

Backend:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/health
```

---

# 🔥 Firebase Configuration

The backend uses the Firebase Admin SDK to communicate with Firestore.

The service-account file must be stored locally:

```text
backend/firebase-service-account.json
```

It must **never** be committed to GitHub.

`.gitignore` should contain:

```text
node_modules/
.env
uploads/
logs/
firebase-service-account.json
```

The Firebase service account is used only by the backend.

It should never be exposed to the frontend.

---

# 🔒 Security

DistributedFS follows these security principles:

- Never commit Firebase service-account credentials.
- Never expose private keys.
- Never expose backend credentials in frontend code.
- Keep storage private.
- Validate uploaded files.
- Restrict maximum file size.
- Validate MIME types where appropriate.
- Implement authentication before production deployment.
- Implement authorization before production deployment.
- Use HTTPS in production.
- Implement rate limiting.
- Validate all user input.
- Log security-relevant failures.

---

# 🧪 Testing

The file lifecycle can be tested using Postman or another API client.

## Upload

```http
POST http://localhost:5000/api/files/upload
```

Use:

```text
Body → form-data

Key: file
Type: File
Value: <select file>
```

## List

```http
GET http://localhost:5000/api/files
```

## Download

```http
GET http://localhost:5000/api/files/<fileId>/download
```

## Delete

```http
DELETE http://localhost:5000/api/files/<fileId>
```

---

# 🗺️ Development Roadmap

## Phase 1 — Backend Foundation

- [x] Node.js backend
- [x] Express server
- [x] Environment configuration
- [x] Health endpoint

## Phase 2 — File Management

- [x] File upload
- [x] File listing
- [x] File download
- [x] File deletion

## Phase 3 — File Integrity

- [x] SHA-256 checksum
- [ ] Integrity verification during retrieval

## Phase 4 — Persistent Metadata

- [x] Firebase project
- [x] Firestore database
- [x] Firebase Admin SDK installed
- [ ] Firebase Admin SDK configuration
- [ ] Firestore metadata integration
- [ ] Remove in-memory metadata

## Phase 5 — Storage Abstraction

- [ ] Storage Manager
- [ ] Storage interface
- [ ] Local storage adapter
- [ ] Cloud storage adapter
- [ ] Replace permanent local storage
- [ ] Object-key management
- [ ] Storage-provider failover

## Phase 6 — Distributed Backend

- [ ] Docker
- [ ] Multiple API instances
- [ ] Server IDs
- [ ] Health monitoring

## Phase 7 — Load Balancing

- [ ] NGINX
- [ ] Reverse proxy
- [ ] Load balancing
- [ ] Failure handling

## Phase 8 — Reliability

- [ ] Retry mechanism
- [ ] Chunked uploads
- [ ] Resumable uploads
- [ ] File replication
- [ ] Storage fallback

## Phase 9 — Observability

- [ ] Prometheus
- [ ] Grafana
- [ ] Request metrics
- [ ] Server metrics
- [ ] Storage metrics

## Phase 10 — Production Hardening

- [ ] Authentication
- [ ] Authorization
- [ ] Rate limiting
- [ ] Input validation
- [ ] HTTPS
- [ ] Security audit

---

# 📌 Current Project Status

```text
DistributedFS

Backend Foundation       ✅
Express Server           ✅
Environment Config       ✅
Health Check             ✅

File Upload              ✅
File Listing             ✅
File Download            ✅
File Delete              ✅

SHA-256 Integrity        ✅

Firebase Project         ✅
Firestore Database       ✅
Firebase Admin SDK       ✅
Firestore Integration    🔄

Local File Storage       ✅
Storage Abstraction      🔄
Cloud Storage            🔄

Multiple Servers         🔄
Docker                   🔄
NGINX                    🔄
Fault Tolerance          🔄
Monitoring               🔄
```

---

# 🎯 Current Architecture

At the current development stage:

```text
                         Client
                           │
                           ▼
                    Express Backend
                           │
                    ┌──────┴──────┐
                    ▼             ▼
                 Multer       Controllers
                                  │
                                  ▼
                             File Service
                                  │
                     ┌────────────┴────────────┐
                     ▼                         ▼
              Local Storage              Firestore
              File Contents               Metadata
                     │
                     ▼
                  SHA-256
```

---

# 🚀 Final Vision

The final DistributedFS system will evolve into:

```text
                         ┌─────────────────┐
                         │      Client     │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │     NGINX       │
                         │ Load Balancer   │
                         └────────┬────────┘
                                  │
                 ┌────────────────┼────────────────┐
                 ▼                ▼                ▼
             ┌────────┐       ┌────────┐       ┌────────┐
             │ API 1  │       │ API 2  │       │ API 3  │
             └────┬───┘       └────┬───┘       └────┬───┘
                  └────────────────┼────────────────┘
                                   ▼
                         ┌─────────────────┐
                         │ Storage Manager │
                         └────────┬────────┘
                                  │
                         ┌────────┴────────┐
                         ▼                 ▼
                  Local Storage      Future Cloud
                                      Storage
                         │                 │
                         └────────┬────────┘
                                  ▼
                         ┌─────────────────┐
                         │    Firestore    │
                         │    Metadata     │
                         └─────────────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ Prometheus +    │
                         │ Grafana         │
                         └─────────────────┘
```

---

# 💡 Project Philosophy

DistributedFS is intentionally being developed incrementally.

The project first establishes a reliable file-management API:

```text
Upload
  ↓
List
  ↓
Download
  ↓
Delete
```

Then it introduces:

```text
SHA-256
  ↓
Persistent Metadata
  ↓
Storage Abstraction
  ↓
Multiple Servers
  ↓
Load Balancing
  ↓
Fault Tolerance
  ↓
Monitoring
```

This approach makes it possible to validate each subsystem independently before combining them into a distributed storage platform.

---

## 📄 License

This project is currently intended for educational, research, and portfolio purposes.