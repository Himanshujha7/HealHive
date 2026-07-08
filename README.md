# HealHive

HealHive is a secure, real-time telehealth platform built with React, Firebase Authentication, Node.js, Express, MongoDB, Socket.IO, and Stripe. It enables patients to search for doctors, complete registration and profile flows, initiate consultation payments, and join chat/video sessions with doctors.

## Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Setup and Installation](#setup-and-installation)
- [Environment Variables](#environment-variables)
- [Firebase Setup](#firebase-setup)
- [Running the App](#running-the-app)
- [API Endpoints](#api-endpoints)
- [Troubleshooting](#troubleshooting)
- [Development Notes](#development-notes)
- [Future Improvements](#future-improvements)

## Project Overview

HealHive provides an end-to-end telehealth experience for patients and doctors. The platform combines:

- Firebase Authentication for secure sign-in and account management
- MongoDB for doctor, patient, and consultation persistence
- Stripe payment flow for consultation booking
- Socket.IO for real-time chat and WebRTC signaling
- A responsive React frontend powered by Vite

## Key Features

- Patient and doctor account registration with Firebase Authentication
- Role-based flows for patients and doctors
- Doctor search and selection by specialty and availability
- Consultation payment session creation and confirmation via Stripe
- Real-time chat and video signaling support using Socket.IO
- Patient profile management and medical history capture
- Doctor profile registration and availability management
- MongoDB persistence for doctor, patient, and consultation state

## Tech Stack

### Frontend

- React 19
- Vite
- React Router DOM
- Firebase
- Stripe React SDK
- Socket.IO Client
- Tailwind CSS support via Vite plugin
- Framer Motion for animations
- Lucide React icons

### Backend

- Node.js with ES module support
- Express 5
- Mongoose / MongoDB
- Firebase Admin SDK for auth verification
- Stripe for payment intent creation
- Socket.IO for real-time chat and WebRTC signaling
- CORS and body parsing middleware

## Repository Structure

- `backend/`
  - `server.js` - Express server setup, MongoDB connection, Socket.IO configuration
  - `routes/` - API routes for users, doctors, patients, and payments
  - `models/` - Mongoose models for Doctor, Patient, and User
  - `middleware/` - Firebase token verification middleware
  - `firebaseAdmin.js` - Firebase Admin initialization from env or local service account

- `frontend/`
  - `src/` - React application source code
  - `src/App.jsx` - Main homepage layout
  - `src/firebase.js` - Firebase client initialization
  - `src/Context/AuthContext.jsx` - auth context provider
  - `src/chat/` - chat and call room components
  - `src/Doctor-Ui/` - doctor dashboard and form pages
  - `src/patient form/` - patient registration, profile, and payment screens
  - `firebase.json` - Firebase hosting configuration for frontend

## Setup and Installation

### Prerequisites

- Node.js 18+ (recommended)
- npm
- MongoDB connection string
- Firebase project with Authentication enabled
- Firebase Service Account JSON or `FIREBASE_SERVICE_ACCOUNT_JSON`
- Stripe account and secret key

### Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```
The repository includes `frontend/.env.example` and `backend/.env.example` as templates. Copy them to `.env` before running the application.


## Environment Variables

### Backend

Copy the example environment file and update it with your own values.

**Linux / macOS**

```bash
cd backend
cp .env.example .env
```

**Windows (PowerShell)**

```powershell
Copy-Item .env.example .env
```

### Frontend

Copy the example environment file and update it with your own values.

**Linux / macOS**

```bash
cd frontend
cp .env.example .env
```

**Windows (PowerShell)**

```powershell
Copy-Item .env.example .env
```

After copying the files:

- Update the backend `.env` with your MongoDB URI, Stripe secret key, and Firebase Admin credentials.
- Update the frontend `.env` with your Firebase Web SDK configuration, backend URL, and other required values.


## Firebase Setup

### Frontend (Firebase Web SDK)

1. Go to the Firebase Console.
2. Open your Firebase project.
3. Navigate to **Project Settings → General**.
4. Under **Your Apps**, copy the Firebase Web App configuration.
5. Update the values in `frontend/.env`.

### Backend (Firebase Admin SDK)

Generate a Firebase Admin SDK service account key.

You can configure it in either of the following ways:

- Set `FIREBASE_SERVICE_ACCOUNT_JSON` in `backend/.env`.

or

- Place `serviceAccountKey.json` inside the `backend/` directory.


## Running the App

### Start Backend

```bash
cd backend
npm run start
```

### Start Frontend

```bash
cd frontend
npm run dev
```

Open your browser at the URL shown by Vite (usually `http://localhost:5173`).

## API Endpoints

### User Synchronization / Login

- `POST /api/users/sync` - Sync Firebase signed-in user to MongoDB
- `POST /api/users/login` - Fetch role and profile completion status

### Patient

- `POST /api/patient/submit` - Save or update patient profile data
- `GET /api/patient/get` - Retrieve patient profile data
- `PUT /api/patient/update` - Update patient profile data

### Doctor

- `POST /api/doctor/submit` - Register or complete doctor profile
- `GET /api/doctor/public` - Get public doctor listings
- `POST /api/doctor/select/:doctorId` - Patient selects doctor
- `GET /api/doctor/profile` - Fetch doctor profile by authenticated doctor

### Payments

- `POST /api/payments/initiate` - Dummy payment initiation flow
- `POST /api/payments/create-intent` - Create Stripe payment intent
- `POST /api/payments/confirm` - Confirm payment and mark consultation as paid
- `GET /api/payments/status/:consultationId` - Check active consultation/payment status


## Troubleshooting

### FirebaseError: auth/invalid-api-key

**Cause**

The frontend Firebase configuration is missing or invalid.

**Solution**

Verify that all required `VITE_FIREBASE_*` variables are correctly configured in `frontend/.env`.

---

### Could not load Firebase credentials

**Cause**

The backend Firebase Admin SDK credentials are not configured.

**Solution**

Either:

- Set `FIREBASE_SERVICE_ACCOUNT_JSON` in `backend/.env`, or
- Place `serviceAccountKey.json` inside the `backend/` directory.

---

### MongoDB connection failed

**Cause**

The MongoDB connection string is missing or incorrect.

**Solution**

Verify that `MONGO_URI` is correctly configured and that your MongoDB instance is running.


## Development Notes

- The backend supports Socket.IO signaling for real-time chat and WebRTC call setup.
- Firebase Authentication tokens are verified on protected routes using Firebase Admin.
- The current payment route includes a dummy initiation path and Stripe payment intent creation.
- Frontend routing and detailed patient/doctor screens are organized under `frontend/src/`.
- Firebase Hosting is configured via `frontend/firebase.json`.

## Future Improvements

- Add full patient appointment history and doctor availability scheduling
- Implement complete video call UI using WebRTC streams
- Add role-based navigation and authorization enforcement on the frontend
- Improve Stripe payment confirmation and webhook handling
- Add automated tests for backend and frontend components
- Use a shared root package manager or monorepo scripts for smoother development

## License

This repository does not currently specify an open source license.

## Code of Conduct

We are committed to fostering a welcoming and inclusive community.
Please read our [Code of Conduct](./CODE_OF_CONDUCT.md) before contributing.
