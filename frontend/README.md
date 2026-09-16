# DistributedFS Frontend

A modern, production-quality dashboard interface for managing and monitoring the **DistributedFS** distributed file system. Interfacing directly with the Express coordinator backend (`http://localhost:5000/api`), this application provides real-time visualization of distributed storage topology, 2x primary & replica redundancy, checksum integrity, fault-tolerant failover downloading, storage node health, and automatic/manual replication repair.

---

## Technical Features

- **Distributed Topology Map**: Interactive visual diagram displaying coordinator load balancing and storage node cluster routing.
- **2x Redundancy Management**: Tracks primary node (`Node X`) and replica node (`Node Y`) allocations for every file in the system.
- **Checksum Integrity**: Displays SHA-256 integrity verification hashes for all stored files.
- **Node Health Monitoring**: Real-time health detection (`ONLINE`, `OFFLINE`, `RECOVERED`) with recovery notifications.
- **Failover Downloading**: Seamless client file download routing handled by coordinator failover.
- **Replication Repair**: Manual cluster-wide and per-file replication repair for missing or degraded file copies.
- **Session Activity Log**: Real-time event tracking across file uploads, downloads, deletions, node recovery, and repair operations.

---

## Requirements

- **Node.js** v18.0.0 or higher
- **npm** v9.0.0 or higher
- **DistributedFS Express Backend** running at `http://localhost:5000`

---

## Setup & Installation

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Ensure environment variable configuration in `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

---

## Running the Application

Start the Next.js development server:

```bash
npm run dev
```

- **Frontend Application**: [http://localhost:3000](http://localhost:3000)
- **Coordinator Backend**: [http://localhost:5000](http://localhost:5000)

---

## Project Structure

```
frontend/
├── public/
├── src/
│   ├── app/
│   │   ├── layout.js          # App layout with responsive navigation sidebar
│   │   ├── page.js            # System Overview & Dashboard page
│   │   ├── globals.css        # Tailwind styling & modern CSS design tokens
│   │   ├── files/
│   │   │   └── page.js        # File Manager page with search & actions
│   │   ├── nodes/
│   │   │   └── page.js        # Storage Nodes monitor & repair controller
│   │   └── activity/
│   │       └── page.js        # Session Activity log timeline
│   │
│   ├── components/
│   │   ├── Sidebar.js         # Navigation sidebar with status badge
│   │   ├── Header.js          # Header bar with title & refresh button
│   │   ├── StatCard.js        # Overview metric cards
│   │   ├── FileTable.js       # Searchable file table container
│   │   ├── FileRow.js         # File table row component
│   │   ├── FileDetailsModal.js# Primary/replica metadata inspection modal
│   │   ├── UploadModal.js     # Upload modal with progress bar
│   │   ├── UploadDropzone.js  # Drag-and-drop file upload zone
│   │   ├── NodeCard.js        # Storage node card component
│   │   ├── NodeStatus.js      # Status indicator badges
│   │   ├── StorageOverview.js # Topology map & storage load bars
│   │   ├── ActivityList.js    # Session activity timeline
│   │   ├── EmptyState.js      # Empty state placeholder
│   │   ├── LoadingState.js    # Loading spinner component
│   │   ├── ErrorState.js      # Error fallback component
│   │   └── ConfirmDialog.js   # Deletion and repair confirmation modal
│   │
│   └── lib/
│       ├── api.js             # Centralized Axios API client
│       └── activity.js        # Session activity logging service
│
├── .env.local
├── .gitignore
├── next.config.js
├── tailwind.config.js
├── package.json
└── README.md
```
