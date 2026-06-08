# HealHive

HealHive is a secure, real-time telehealth platform built with React, Firebase Authentication, Node.js, Express, MongoDB, Socket.IO, and Stripe. It enables patients to search for doctors, complete registration and profile flows, initiate consultation payments, and join chat/video sessions with doctors.

## Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Setup and Installation](#setup-and-installation)
- [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)
- [API Endpoints](#api-endpoints)
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
  - `models/` - Mongoose models forDoctor, Patient, and User
  - `middleware/` - Firebase token verification middleware
  - `firebaseAdmin.js` - Firebase Admin initialization from env or local service account

- `frontend/`
  - `src/` - React application source code
  - `src/App.jsx` - Main homepage layout
  - `src/firebase.js` - Firebase client initialization
  - `src/Context/AuthContext.jsx` - auth context provider
  - `src/chat/` - chat and call room components
  - `src/Doctor-Ui/` - doctor dashboard and form pages
  - `src/pateint form/` - patient registration, profile, and payment screens
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

## Environment Variables

### Backend

Create a `.env` file inside `backend/` with the following variables:

```env
MONGO_URI=your_mongodb_connection_string
STRIPE_SECRET_KEY=your_stripe_secret_key
PORT=5000
FIREBASE_SERVICE_ACCOUNT_JSON={...}
```

- `MONGO_URI` - MongoDB connection URL
- `STRIPE_SECRET_KEY` - Stripe secret key for payment intent generation
- `PORT` - backend port (default: 5000)
- `FIREBASE_SERVICE_ACCOUNT_JSON` - JSON string for Firebase Admin service account credentials

If you do not provide `FIREBASE_SERVICE_ACCOUNT_JSON`, place `serviceAccountKey.json` inside `backend/`.

### Frontend

Create a `.env` file inside `frontend/` with your Firebase config values:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

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
