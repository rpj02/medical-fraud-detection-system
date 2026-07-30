# Medical Reimbursement Fraud Detection Platform - Comprehensive Project Report

**Date**: July 31, 2026  
**Author**: Rishit Prakash Jaiswal  
**GitHub Repository**: [https://github.com/rpj02/medical-fraud-detection-system](https://github.com/rpj02/medical-fraud-detection-system)  
**Live Application UI**: [http://localhost:3000](http://localhost:3000)  
**Backend API Base**: [http://localhost:5001](http://localhost:5001)  

---

## 1. Project Overview

The **Medical Reimbursement Fraud Detection Platform** is an enterprise-grade AI-assisted security and auditing system designed to automatically process medical claim documents (PDFs, receipts, discharge summaries, prescription sheets, and images), detect suspicious fraud signals, and calculate an **Explainable Fraud Risk Score (0-100%)**.

The platform prevents insurance reimbursement fraud by identifying:
- **Duplicate Document Submissions** (via SHA-256 cryptographic file hashing).
- **Unverified Doctors & Unaccredited Healthcare Providers** (cross-referencing State & National Medical License DBs).
- **Unrecognized / Suspicious Medications** (cross-referencing National Medical Formulary index).
- **Inflated Billing Charges** (comparing against standard procedure cost benchmarks in Indian Rupees `₹`).
- **Non-Medical / Retail Receipts** (blocking electronics, camera, and retail store invoices).
- **Document Tampering / Image Editing** (inspecting structural PDF metadata & Adobe Photoshop signatures).

---

## 2. System Architecture

The project is architected as a modern, decoupled full-stack application built entirely in **JavaScript (ES Modules)**.

```
                  +--------------------------------------------------+
                  |               Next.js Frontend App               |
                  |     (React, Tailwind CSS, Lucide Icons)          |
                  |              http://localhost:3000               |
                  +------------------------+-------------------------+
                                           |
                                           | HTTP REST API Requests
                                           v
                  +--------------------------------------------------+
                  |               Node.js Express API                |
                  |              http://localhost:5001               |
                  +------------------------+-------------------------+
                                           |
     +-------------------+-----------------+-------------------+-------------------+
     |                   |                 |                   |                   |
     v                   v                 v                   v                   v
+----+----+         +----+----+       +----+----+         +----+----+         +----+----+
| Tesseract|        | PDF-Parse|       | SQLite  |         | File    |         | PDFKit  |
| Image   |        | Text    |       | Engine  |         | Storage |         | Report  |
| Engine  |        | Engine  |       | Engine  |         | Vault   |         | Engine  |
+---------+         +---------+       +---------+         +---------+         +---------+
```

### Technology Stack
- **Frontend Framework**: Next.js 14+ (App Router, React, Tailwind CSS, Lucide Icons, Glassmorphism UI)
- **Backend Framework**: Node.js (Express.js, ES Modules)
- **OCR Engine**: Tesseract.js (Multi-Format Optical Character Recognition for JPG/PNG/WEBP) & `pdf-parse` (PDF Stream Extractor)
- **Database**: SQLite3 (`better-sqlite3` native driver for synchronous, crash-resilient ACID queries)
- **Storage**: Dual-vault filesystem storage (`backend/uploads/original/`, `backend/uploads/processing/`, `backend/uploads/all_bills/`)
- **PDF Generator**: `pdfkit` (Dynamic Audit Report Certificate Generation)
- **Version Control**: Git & GitHub (`https://github.com/rpj02/medical-fraud-detection-system.git`)

---

## 3. Core Modules & Engine Features

### 3.1 Hybrid OCR & Field Extraction Engine (`ocrService.js`)
The OCR service automatically parses uploaded claims without hardcoded assumptions or overfitted fallbacks:
- **Tesseract.js OCR Integration**: Runs neural character recognition on raster images (PNG, JPG, WEBP, BMP).
- **PDF Text Parsing**: Uses `pdf-parse` to extract clean text streams from digital PDFs.
- **Dynamic Field Parsing**:
  - **Hospital / Provider**: Extracts organization headers (e.g., `BLK-MAX Super Speciality Hospital`, `MediCare Wholesale Pharmacy`, `Dr. Kalyan Banerjee's Clinic`).
  - **Attending Doctor**: Parses `Dr. [Name]` headers, qualifications (`MBBS`, `MD`, `MS`, `DrNB`), and registration numbers (`State Registration No. : 8046`).
  - **Patient Name**: Identifies explicit patient labels and honorifics (`Mrs. Pranita Jaiswal`, `Gaurav Sharma`).
  - **Invoice Reference & Date**: Extracts invoice numbers (`BLCS1028675`, `27`) and dates (`13-Dec-2024`, `31 Oct, 2022`).
  - **Billed Amount**: Calculates exact numeric grand total values in Indian Rupees (`₹2,469.60`).
  - **Prescribed Items**: Captures medicine lines (`Paracetamol 500mg`, `INJ BREVIPIL 200 MG IV STAT`, `TAB THYRONORM 37.5 UG`).

### 3.2 Non-Medical Retail Bill Protection
- Automatically detects retail and electronics store signatures (`AVIT DIGITAL`, `Godox Camera Flash`, `SmallRig`, `Sony Alpha`, `HSN/SAC`).
- Immediately blocks non-medical uploads with an **Invalid Document** warning:
  > *"Invalid Document: Found non-medical retail item signature ("CAMERA") in document. Please upload a valid medical bill, pharmacy receipt, or hospital discharge summary."*

### 3.3 Explainable Fraud Risk Scoring Model (`scoringService.js`)
Computes an overall **Risk Score (0% - 100%)** categorized into **LOW RISK (0-29%)**, **MEDIUM RISK (30-69%)**, or **HIGH RISK (70-100%)**:

| Fraud Signal | Risk Weight | Trigger Condition |
| :--- | :---: | :--- |
| **Exact Duplicate File** | **+45 Risk** | SHA-256 hash matches a previously submitted claim |
| **Unverified Doctor** | **+25 Risk** | State/National License ID not found in Medical Registry |
| **Price Variance** | **+20 Risk** | Billed amount exceeds tariff benchmarks by > 15% |
| **Metadata Editing** | **+15 Risk** | Structural PDF metadata indicates Adobe Photoshop / Editor usage |
| **Unknown Medicines** | **+15 Risk** | Prescribed drugs not found in National Medical Formulary |
| **Unaccredited Provider** | **+10 Risk** | Hospital is unlisted or pending registry accreditation |

### 3.4 Duplicate Detection Engine (`duplicateService.js`)
- Calculates SHA-256 cryptographic hashes for every uploaded file.
- Identifies exact duplicate documents submitted under different claim numbers.
- Handles duplicate submissions as **70%-95% HIGH FRAUD RISK** signals instead of database crashes.

### 3.5 Central Saved Bills Vault (`/bills`)
- Automatically saves a copy of every uploaded bill to `backend/uploads/all_bills/`.
- Provides an interactive gallery page with file size metrics, upload timestamps, view-in-browser previews, and direct file downloads.

### 3.6 Database Refresh & Reset API (`POST /api/reset-db`)
- Includes a DB reset endpoint and red header button ("Reset & Seed Database") in `/claims`.
- Flushes old test data and seeds clean Indian Rupee (`₹`) sample claims (`₹1,45,000`, `₹12,500`, `₹89,000`).

---

## 4. Key Endpoints & API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | System health check & status |
| `GET` | `/api/claims` | List all claims with risk levels & status filters |
| `GET` | `/api/claims/:id` | Fetch complete claim details, OCR data, & fraud signals |
| `POST` | `/api/claims/upload` | Upload & analyze new claim file (PDF/PNG/JPG) |
| `PUT` | `/api/claims/:id/review` | Update reviewer decision (`APPROVED`, `REJECTED`, `MORE_INFO`) |
| `GET` | `/api/claims/:id/report` | Download official PDF Audit Certificate Report |
| `GET` | `/api/bills` | Fetch list of all saved bill documents in central vault |
| `GET` | `/api/bills/download/:file` | Download saved bill file from central storage vault |
| `POST` | `/api/reset-db` | Reset and re-seed database with clean INR claim records |

---

## 5. Local Setup & Execution Guide

### Prerequisites
- Node.js (v18.0 or higher)
- npm (v9.0 or higher)

### Setup Commands

```bash
# 1. Clone the repository
git clone https://github.com/rpj02/medical-fraud-detection-system.git
cd medical-fraud-detection-system

# 2. Install dependencies
npm run install:all

# 3. Start development servers
# Terminal 1 - Backend Server (Port 5001)
npm run dev:backend

# Terminal 2 - Frontend App (Port 3000)
npm run dev:frontend
```
