# 🩺 MediFraud Guard — Medical Reimbursement Fraud Detection Platform

> **AI-assisted full-stack platform for detecting fraudulent medical reimbursement claims, validating OCR bill documents, verifying physician registry licenses, price tariff benchmarking in Indian Rupees (₹), and generating explainable compliance audit reports.**

---

## 🚀 Overview

Medical reimbursement fraud causes millions in financial losses annually through inflated hospital bills, fake doctor licenses, duplicate claim submissions, and altered receipts. **MediFraud Guard** addresses this challenge with an explainable multi-signal fraud scoring engine built on a decoupled **Node.js (Express)** backend and a dark-glassmorphism **Next.js 14** frontend.

---

## ⚡ Key Features

- **🛡️ Exact SHA-256 Duplicate Document Detection**: Instantly flags duplicate document submissions matching previous claims (+45 Fraud Risk).
- **🔍 OCR Document Parsing**: Extracts hospital name, attending doctor, patient name, registration code, invoice date, total billed amount, and prescribed medicines.
- **🩺 Doctor Council Registry Verification**: Cross-references doctor registration codes against state medical council database.
- **🇮🇳 Tariff Price Benchmarking (INR - ₹)**: Compares billed amounts in Indian Rupees against standard national procedure tariffs.
- **📄 Downloadable PDF Audit Reports**: Generates formal compliance audit reports using PDFKit for record keeping.
- **📂 Saved Bills Central Vault (`/bills`)**: Dedicated repository for viewing, previewing, and downloading all uploaded bill photos and documents.
- **⚖️ Reviewer Compliance Room**: Allows compliance officers to inspect claims, review explainability signals, add notes, and approve/reject claims.

---

## 🏗️ Technology Stack

| Layer | Technology Used |
| :--- | :--- |
| **Frontend Framework** | Next.js 14 (App Router, React 18, TailwindCSS, Lucide Icons) |
| **Backend Framework** | Node.js (Express.js REST API) |
| **Database** | SQLite (`better-sqlite3` with WAL mode) |
| **Document Storage** | Dual-copy file storage (`uploads/original/` & `uploads/processing/` & `uploads/all_bills/`) |
| **PDF Generation** | PDFKit |
| **Hashing Engine** | Node.js Crypto SHA-256 |

---

## 📁 Repository Structure

```text
Project/
├── backend/
│   ├── src/
│   │   ├── config/database.js          # SQLite schema & seeding (INR claims)
│   │   ├── controllers/                # Claim & PDF Report controllers
│   │   ├── routes/api.js               # Express API routes
│   │   ├── services/                   # Storage, OCR, Duplicate, Scoring, Verification
│   │   └── server.js                   # Express server entry (Port 5001)
│   └── uploads/all_bills/              # Central bill photos & documents folder
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.jsx                # Overview Dashboard & KPI Metrics
│   │   │   ├── claims/page.jsx         # Claims Audit Registry & Filters
│   │   │   ├── claims/[id]/page.jsx    # Deep-Dive Claim Inspection Room
│   │   │   ├── bills/page.jsx          # Saved Bills Central Repository
│   │   │   └── upload/page.jsx         # Medical Bill Document Uploader
│   │   ├── components/                 # Navbar, Gauge, ValidationCards, ReviewerPanel
│   │   └── lib/api.js                  # Frontend API client
│   └── package.json
│
├── package.json                        # Root orchestration scripts
└── README.md
```

---

## ⚙️ Installation & Local Setup

### 1️⃣ Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 2️⃣ Clone Repository
```bash
git clone https://github.com/rpj02/medical-fraud-detection-system.git
cd medical-fraud-detection-system
```

### 3️⃣ Install Dependencies
```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 4️⃣ Run Application

#### Option A: Running Backend & Frontend via Root Scripts
From project root directory (`medical-fraud-detection-system/`):

```bash
# Start Backend API (Port 5001)
npm run dev:backend

# Start Frontend Dashboard (Port 3000)
npm run dev:frontend
```

---

## 🌐 Local Application URLs

- **Frontend Dashboard**: [http://localhost:3000](http://localhost:3000)
- **Claims Audit Registry**: [http://localhost:3000/claims](http://localhost:3000/claims)
- **Saved Bills Vault**: [http://localhost:3000/bills](http://localhost:3000/bills)
- **Backend API Health**: [http://localhost:5001/api/health](http://localhost:5001/api/health)

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health status monitor |
| `GET` | `/api/claims` | List all claims (supports search & risk filters) |
| `POST` | `/api/claims/upload` | Upload medical bill document for OCR & scoring |
| `GET` | `/api/claims/:id` | Fetch detailed claim record & explainability signals |
| `POST` | `/api/claims/:id/review` | Update reviewer decision (APPROVED / REJECTED) |
| `POST` | `/api/claims/:id/report` | Generate downloadable PDF audit compliance report |
| `GET` | `/api/bills` | List all saved bill photos in central repository |
| `POST` | `/api/reset-db` | Reset & re-seed SQLite database with clean INR sample claims |

---

## 📜 License

This project is open-source under the MIT License.
