import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

import App from "./App.jsx";
import Login from "./Auth/Login.jsx";
import ForgotPassword from "./Auth/ForgotPassword.jsx";
import CreateAccount from "./Auth/CreateAccount.jsx";
import ResetPassword from "./Auth/ResetPassword.jsx";
import { AuthProvider } from "./Context/AuthContext";
import ResetSuccess from "./ResetSuccess.jsx";
import PatientForm from "./pateint form/PatientForm.jsx";
// import AvailableDoctors from "./pateint form/AvailableDoctors.jsx";
import DoctorsAvailable from "./pateint form/DoctorsAvailable.jsx";
import ChatPage from "./chat/pages/ChatPage.jsx";
import DoctorForm from "./Doctor-Ui/pages/DoctorForm.jsx";
import DoctorSearch from "./pateint form/DoctorSearch.jsx";
import DoctorProfile from "./pateint form/DoctorProfile.jsx";
import ConsultationPayment from "./pateint form/ConsultationPayment.jsx";
import CallRoom from "./chat/pages/CallRoom.jsx";
import AppointmentHistory from "./pateint form/AppointmentHistory.jsx";

// Lazy load dashboards
const PatientDashboard = lazy(() => import("./pateint form/patient dashboard/PatientDashboard.jsx"));
const DoctorDashboard = lazy(() => import("./Doctor-Ui/pages/DoctorDashboard.jsx"));

const PageLoader = () => (
  <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
    <div className="text-center">
      <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 animate-spin mb-4">
        <div className="h-8 w-8 rounded-full border-4 border-emerald-200 border-t-emerald-600" />
      </div>
      <p className="text-slate-600 font-medium">Loading...</p>
    </div>
  </div>
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/create-account" element={<CreateAccount />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/resetsuccess" element={<ResetSuccess />} />
            <Route path="/patient-form" element={<PatientForm />} />
            <Route path="/available-doctors" element={<DoctorsAvailable />} />
            <Route path="/patient-dashboard" element={<PatientDashboard />} />
            <Route path="/doc" element={<DoctorForm />} />
            <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
            <Route path="/chat/:consultationId" element={<ChatPage />} />
            <Route path="/doctor-search" element={<DoctorSearch />} />
            <Route path="/doctor-profile/:doctorId" element={<DoctorProfile />} />
            <Route path="/consultation-payment/:doctorId" element={<ConsultationPayment />} />
            <Route path="/call-room/:consultationId" element={<CallRoom />} />
            <Route path="/appointment-history" element={<AppointmentHistory />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
