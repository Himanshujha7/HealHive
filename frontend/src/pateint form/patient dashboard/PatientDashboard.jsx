import { useState, useEffect } from "react";
import { useAuth } from "../../Context/AuthContext";
import { MedicalReportUpload } from "../MedicalReportUpload";

import {
  UserCircle,
  Stethoscope,
  Activity,
  Heart,
  FileText,
  File,
  ShieldCheck,
  Clock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Pill,
  BadgeCheck,
  Edit,
  Save,
  X,
  LayoutDashboard,
  HeartPulse,
  AlertTriangle,
  ClipboardList,
} from "lucide-react";
import Navbar from "../../Homepage/Navbar";
import Footer from "../../Homepage/footer";

// Default empty patient structure
const samplePatient = {
  name: "",
  age: "",
  gender: "",
  bloodGroup: "",
  email: "",
  phone: "",
  location: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  primaryCondition: "",
  selectedDisease: "",
  otherDisease: "",
  specialty: "",
  symptoms: [],
  allergies: [],
  currentMedications: [],
  emergencyName: "",
  emergencyContact: "",
  status: "Pending",
  testReports: [],
  medicalDocuments: [],
};

const Badge = ({ label, tone = "emerald" }) => {
  const toneClass =
    tone === "emerald"
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
      : tone === "amber"
      ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
      : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200";
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${toneClass}`}>
      <ShieldCheck className="h-4 w-4" />
      {label}
    </span>
  );
};

// Reusable card surface — override-friendly (bg-white maps to slate-800 in dark)
const Card = ({ id, className = "", children }) => (
  <section
    id={id}
    className={`scroll-mt-24 bg-white border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm ${className}`}
  >
    {children}
  </section>
);

// KPI stat tile — headline number/value with an icon
const StatTile = ({ icon: Icon, label, value, sublabel, children }) => (
  <div className="group bg-white border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
        {Icon && <Icon className="h-5 w-5" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-500">{label}</p>
        {children ? (
          children
        ) : (
          <p className="text-lg font-semibold text-slate-900 truncate">{value ?? "—"}</p>
        )}
      </div>
    </div>
    {sublabel && <p className="mt-3 text-xs text-slate-500">{sublabel}</p>}
  </div>
);

// Compact count tile for the "health at a glance" row
const MiniStat = ({ icon: Icon, count, label, tone = "emerald" }) => {
  const toneClass =
    tone === "amber"
      ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300"
      : "bg-emerald-50 text-emerald-600";
  return (
    <div className="bg-white border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center gap-3">
      <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${toneClass}`}>
        {Icon && <Icon className="h-5 w-5" />}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900 leading-none">{count}</p>
        <p className="text-xs text-slate-500 mt-1">{label}</p>
      </div>
    </div>
  );
};

// Single-value completeness meter (SVG donut, brand hue)
const CompletenessRing = ({ value }) => {
  const r = 42;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;
  return (
    <div className="relative h-32 w-32">
      <svg viewBox="0 0 100 100" className="h-32 w-32 -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" strokeWidth="9" className="stroke-slate-200 dark:stroke-slate-700" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="stroke-emerald-500 transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-extrabold text-slate-900">{value}%</span>
        <span className="text-[10px] uppercase tracking-wide text-slate-500">Complete</span>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between gap-4 py-2.5 border-b border-slate-100 dark:border-slate-700/60 last:border-0 text-sm">
    <span className="text-slate-500">{label}</span>
    <span className="font-medium text-slate-900 text-right break-words">{value || "—"}</span>
  </div>
);

const SectionHeader = ({ icon: Icon, title, subtitle }) => (
  <div className="flex items-start gap-3 mb-6">
    <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
      {Icon && <Icon className="h-5 w-5" />}
    </div>
    <div>
      <h3 className="text-lg font-bold text-slate-900 leading-tight">{title}</h3>
      {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
    </div>
  </div>
);

// Anchor pill for the sticky in-page quick nav
const QuickLink = ({ href, icon: Icon, label }) => (
  <a
    href={href}
    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium whitespace-nowrap bg-white border border-slate-200 dark:border-slate-700 text-slate-600 hover:text-emerald-700 hover:border-emerald-300 dark:hover:text-emerald-300 transition-colors"
  >
    {Icon && <Icon className="h-4 w-4 text-emerald-500" />}
    {label}
  </a>
);

const PatientDashboard = ({ patient = samplePatient }) => {
  const { user, loading: authLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [patientData, setPatientData] = useState(patient);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ✅ Fetch patient data on mount
  useEffect(() => {
    if (authLoading) return;

    const fetchPatientData = async () => {
      try {
        if (!user) {
          console.log("❌ No user logged in");
          setLoading(false);
          return;
        }

        setLoading(true);
        console.log("✅ User logged in:", user.email);
        const token = await user.getIdToken();
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        console.log("🔗 Fetching from:", `${backendUrl}/api/patient/get`);

        const response = await fetch(
          `${backendUrl}/api/patient/get`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("📡 Response status:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("📦 Received data:", data);
          
          // Map backend fields to frontend display names
          const mappedData = {
            ...samplePatient,
            name: data.fullName || "",
            age: data.age || "",
            gender: data.gender || "",
            bloodGroup: data.bloodGroup || "",
            email: data.email || user.email || "",
            phone: data.phone || "",
            address: data.address || "",
            city: data.city || "",
            state: data.state || "",
            pincode: data.pincode || "",
            primaryCondition: data.selectedDisease || "",
            selectedDisease: data.selectedDisease || "",
            otherDisease: data.otherDisease || "",
            specialty: data.specialty || "",
            symptoms: Array.isArray(data.symptoms) 
              ? data.symptoms 
              : (typeof data.symptoms === 'string' && data.symptoms.trim() 
                  ? data.symptoms.split(',').map(s => s.trim()).filter(s => s) 
                  : []),
            allergies: Array.isArray(data.allergies) 
              ? data.allergies 
              : (typeof data.allergies === 'string' && data.allergies.trim() 
                  ? data.allergies.split(',').map(s => s.trim()).filter(s => s) 
                  : []),
            currentMedications: Array.isArray(data.currentMedications) 
              ? data.currentMedications 
              : (typeof data.currentMedications === 'string' && data.currentMedications.trim() 
                  ? data.currentMedications.split(',').map(s => s.trim()).filter(s => s) 
                  : []),
            emergencyName: data.emergencyName || "",
            emergencyContact: data.emergencyContact || "",
            medicalDocuments: data.medicalDocuments || [],
          };
          
          console.log("🗺️ Mapped data:", mappedData);
          setPatientData(mappedData);
        } else {
          const errorText = await response.text();
          console.error("❌ Error response:", errorText);
        }
      } catch (err) {
        console.error("❌ Failed to fetch patient data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [user, authLoading]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/patient/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fullName: patientData.name,
            age: patientData.age,
            gender: patientData.gender,
            bloodGroup: patientData.bloodGroup,
            email: patientData.email,
            phone: patientData.phone,
            address: patientData.address,
            city: patientData.city,
            state: patientData.state,
            pincode: patientData.pincode,
            selectedDisease: patientData.selectedDisease,
            otherDisease: patientData.otherDisease,
            specialty: patientData.specialty,
            symptoms: patientData.symptoms,
            allergies: patientData.allergies,
            currentMedications: patientData.currentMedications,
            emergencyName: patientData.emergencyName,
            emergencyContact: patientData.emergencyContact,
          }),
        }
      );

      if (response.ok) {
        setIsEditing(false);
        alert("Patient data updated successfully!");
      } else {
        alert("Failed to update patient data");
      }
    } catch (err) {
      console.error("Error saving patient data:", err);
      alert("Error saving patient data");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setPatientData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleArrayChange = (field, index, value) => {
    setPatientData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const handleAddToArray = (field, value) => {
    setPatientData((prev) => ({
      ...prev,
      [field]: [...(prev[field] || []), value],
    }));
  };

  const handleRemoveFromArray = (field, index) => {
    setPatientData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleReportUploaded = (newReport) => {
    setPatientData((prev) => ({
      ...prev,
      medicalDocuments: [...(prev.medicalDocuments || []), newReport],
    }));
  };

  const data = patientData;

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center py-12 px-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 animate-spin mb-4">
              <div className="h-8 w-8 rounded-full border-4 border-emerald-200 border-t-emerald-600" />
            </div>
            <p className="text-slate-600 font-medium">Loading your dashboard...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Check if user has no profile data yet
  const hasNoData = !patientData.name && !patientData.age && !patientData.phone;

  if (hasNoData) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center py-12 px-4">
          <div className="text-center max-w-md">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 mb-4">
              <UserCircle className="h-10 w-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome to Your Dashboard</h2>
            <p className="text-slate-600 mb-6">
              You haven't filled out your patient profile yet. Complete your profile to get started with consultations.
            </p>
            <a
              href="/patient-form"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition"
            >
              <Edit className="h-5 w-5" />
              Complete Your Profile
            </a>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Derived, user-centric metrics for the at-a-glance visualizations
  const symptomsCount = (data.symptoms || []).length;
  const medsCount = (data.currentMedications || []).length;
  const allergiesCount = (data.allergies || []).length;
  const reportsCount = (data.medicalDocuments || []).length;

  // Profile completeness — share of key fields the patient has filled in
  const completenessFields = [
    data.name,
    data.age,
    data.gender,
    data.bloodGroup,
    data.email,
    data.phone,
    data.location || data.city || data.address,
    data.primaryCondition,
    data.specialty,
    symptomsCount > 0,
    medsCount > 0,
    data.emergencyContact,
  ];
  const completeness = Math.round(
    (completenessFields.filter(Boolean).length / completenessFields.length) * 100
  );

  const quickLinks = [
    { href: "#overview", label: "Overview", icon: LayoutDashboard },
    { href: "#personal", label: "Personal Info", icon: UserCircle },
    { href: "#health", label: "Symptoms & Meds", icon: HeartPulse },
    { href: "#care", label: "Care Team", icon: BadgeCheck },
    { href: "#reports", label: "Test Reports", icon: File },
    { href: "#history", label: "Medical History", icon: Clock },
  ];

  return (
    <>
      <Navbar />
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-8 px-4 sm:px-6 lg:px-10">
        {/* Background accents */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 bg-emerald-200/40 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute top-40 -right-24 h-72 w-72 bg-teal-200/40 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <p className="text-sm text-emerald-700 font-semibold flex items-center gap-2">
                <Stethoscope className="h-4 w-4" /> Patient Dashboard
              </p>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-1">
                {data.name}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Badge label={data.status || "Active"} tone="emerald" />
                {data.primaryCondition && (
                  <Badge label={data.primaryCondition} tone="amber" />
                )}
                {data.specialty && (
                  <span className="text-sm text-slate-600 inline-flex items-center gap-2">
                    <UserCircle className="h-4 w-4 text-emerald-500" />
                    {data.specialty}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition"
                >
                  <Edit className="h-5 w-5" />
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 text-white font-semibold shadow-lg hover:shadow-xl transition disabled:opacity-60"
                  >
                    <Save className="h-5 w-5" />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition"
                  >
                    <X className="h-5 w-5" />
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Allergy safety alert — status color WITH icon + label, never color alone */}
          {allergiesCount > 0 && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-500/10 px-4 py-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-sm">
                <span className="font-semibold text-amber-800 dark:text-amber-200">
                  Known allergies:
                </span>{" "}
                <span className="text-amber-700 dark:text-amber-300">
                  {(data.allergies || []).join(", ")}
                </span>
              </div>
            </div>
          )}

          {/* Sticky in-page quick navigation */}
          <div className="sticky top-2 z-10 -mx-1 mb-6">
            <nav className="flex gap-2 overflow-x-auto rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur border border-slate-200 dark:border-slate-700 p-2 shadow-sm">
              {quickLinks.map((link) => (
                <QuickLink key={link.href} href={link.href} icon={link.icon} label={link.label} />
              ))}
            </nav>
          </div>

          {/* Single-page dashboard body */}
          <div className="space-y-6">
            {/* KPI row */}
            <div id="overview" className="scroll-mt-24 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatTile icon={Activity} label="Primary Condition" sublabel="Latest assessment">
                {isEditing ? (
                  <input
                    type="text"
                    value={data.primaryCondition || ""}
                    onChange={(e) => handleChange("primaryCondition", e.target.value)}
                    className="text-lg font-semibold text-slate-900 border-b border-emerald-300 focus:border-emerald-500 outline-none w-full bg-transparent"
                    placeholder="Enter condition"
                  />
                ) : (
                  <p className="text-lg font-semibold text-slate-900 truncate">{data.primaryCondition || "—"}</p>
                )}
              </StatTile>

              <StatTile icon={Heart} label="Assigned Doctor" sublabel={data.specialty ? `${data.specialty} Specialist` : "Awaiting assignment"}>
                {isEditing ? (
                  <input
                    type="text"
                    value={data.doctor || ""}
                    onChange={(e) => handleChange("doctor", e.target.value)}
                    className="text-lg font-semibold text-slate-900 border-b border-emerald-300 focus:border-emerald-500 outline-none w-full bg-transparent"
                    placeholder="Enter doctor name"
                  />
                ) : (
                  <p className="text-lg font-semibold text-slate-900 truncate">{data.doctor || "Not assigned"}</p>
                )}
              </StatTile>

              <StatTile icon={Calendar} label="Last Visit" sublabel="Previous consultation">
                {isEditing ? (
                  <input
                    type="date"
                    value={data.lastVisit || ""}
                    onChange={(e) => handleChange("lastVisit", e.target.value)}
                    className="text-lg font-semibold text-slate-900 border-b border-emerald-300 focus:border-emerald-500 outline-none w-full bg-transparent"
                  />
                ) : (
                  <p className="text-lg font-semibold text-slate-900 truncate">{data.lastVisit || "—"}</p>
                )}
              </StatTile>

              <StatTile icon={Clock} label="Next Follow-up" sublabel="Suggested timeline">
                {isEditing ? (
                  <input
                    type="date"
                    value={data.nextFollowUp || ""}
                    onChange={(e) => handleChange("nextFollowUp", e.target.value)}
                    className="text-lg font-semibold text-slate-900 border-b border-emerald-300 focus:border-emerald-500 outline-none w-full bg-transparent"
                  />
                ) : (
                  <p className="text-lg font-semibold text-slate-900 truncate">{data.nextFollowUp || "To be scheduled"}</p>
                )}
              </StatTile>
            </div>

            {/* Health at a glance — data-driven count tiles */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MiniStat icon={ClipboardList} count={symptomsCount} label="Symptoms logged" />
              <MiniStat icon={Pill} count={medsCount} label="Current medications" />
              <MiniStat icon={AlertTriangle} count={allergiesCount} label="Known allergies" tone={allergiesCount > 0 ? "amber" : "emerald"} />
              <MiniStat icon={File} count={reportsCount} label="Test reports" />
            </div>

            {/* Two-column content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Personal Info */}
                <Card id="personal" className="p-6 sm:p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center text-2xl font-bold shrink-0">
                      {data.name?.[0]?.toUpperCase() || "P"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-slate-500">Patient</p>
                      {isEditing ? (
                        <input
                          type="text"
                          value={data.name}
                          onChange={(e) => handleChange("name", e.target.value)}
                          className="text-xl font-bold text-slate-900 border-b-2 border-emerald-300 focus:border-emerald-500 outline-none w-full bg-transparent"
                        />
                      ) : (
                        <p className="text-xl font-bold text-slate-900 truncate">{data.name}</p>
                      )}
                      <p className="text-sm text-emerald-600 font-medium">{data.primaryCondition || "—"}</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-x-8">
                    {isEditing ? (
                      <>
                        <div className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-700/60 text-sm">
                          <span className="text-slate-500">Age</span>
                          <input
                            type="number"
                            value={data.age}
                            onChange={(e) => handleChange("age", e.target.value)}
                            className="font-medium text-slate-900 border-b border-emerald-300 focus:border-emerald-500 outline-none w-24 text-right bg-transparent"
                          />
                        </div>
                        <div className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-700/60 text-sm">
                          <span className="text-slate-500">Gender</span>
                          <select
                            value={data.gender}
                            onChange={(e) => handleChange("gender", e.target.value)}
                            className="font-medium text-slate-900 border-b border-emerald-300 focus:border-emerald-500 outline-none bg-transparent"
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-700/60 text-sm">
                          <span className="text-slate-500">Blood Group</span>
                          <select
                            value={data.bloodGroup}
                            onChange={(e) => handleChange("bloodGroup", e.target.value)}
                            className="font-medium text-slate-900 border-b border-emerald-300 focus:border-emerald-500 outline-none bg-transparent"
                          >
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                          </select>
                        </div>
                        <div className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-700/60 text-sm">
                          <span className="text-slate-500">Email</span>
                          <input
                            type="email"
                            value={data.email}
                            onChange={(e) => handleChange("email", e.target.value)}
                            className="font-medium text-slate-900 border-b border-emerald-300 focus:border-emerald-500 outline-none flex-1 ml-4 text-right bg-transparent"
                          />
                        </div>
                        <div className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-700/60 text-sm">
                          <span className="text-slate-500">Phone</span>
                          <input
                            type="tel"
                            value={data.phone}
                            onChange={(e) => handleChange("phone", e.target.value)}
                            className="font-medium text-slate-900 border-b border-emerald-300 focus:border-emerald-500 outline-none flex-1 ml-4 text-right bg-transparent"
                          />
                        </div>
                        <div className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-700/60 text-sm">
                          <span className="text-slate-500">Location</span>
                          <input
                            type="text"
                            value={data.location}
                            onChange={(e) => handleChange("location", e.target.value)}
                            className="font-medium text-slate-900 border-b border-emerald-300 focus:border-emerald-500 outline-none flex-1 ml-4 text-right bg-transparent"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <InfoRow label="Age" value={data.age} />
                        <InfoRow label="Gender" value={data.gender} />
                        <InfoRow label="Blood Group" value={data.bloodGroup} />
                        <InfoRow label="Email" value={data.email} />
                        <InfoRow label="Phone" value={data.phone} />
                        <InfoRow label="Location" value={data.location} />
                      </>
                    )}
                  </div>
                </Card>

                {/* Symptoms & Meds */}
                <Card id="health" className="p-6 sm:p-8">
                  <SectionHeader icon={FileText} title="Symptoms & Notes" subtitle="Reported symptoms and active medications" />
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500 mb-3">Symptoms</p>
                      <div className="flex flex-wrap gap-2">
                        {(data.symptoms || []).map((sym, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm"
                          >
                            {sym}
                          </span>
                        ))}
                        {symptomsCount === 0 && (
                          <span className="text-sm text-slate-500">No symptoms listed.</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500 mb-3">Current Medications</p>
                      <div className="space-y-2">
                        {(data.currentMedications || []).map((med, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-sm text-slate-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2"
                          >
                            <Pill className="h-4 w-4 text-emerald-500" /> {med}
                          </div>
                        ))}
                        {medsCount === 0 && (
                          <span className="text-sm text-slate-500">No medications recorded.</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Test Reports */}
                <Card id="reports" className="p-6 sm:p-8">
                  <SectionHeader icon={File} title="Uploaded Test Reports" subtitle="Upload and review your medical documents" />

                  <MedicalReportUpload onUploadSuccess={handleReportUploaded} />

                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    {(data.medicalDocuments || []).map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-4 rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50 transition-all duration-200 hover:shadow-md"
                      >
                        <div className={`p-2 rounded-xl ${file.type === "pdf" ? "bg-red-100" : "bg-blue-100"}`}>
                          {file.type === "pdf" ? (
                            <FileText className="h-5 w-5 text-red-600" />
                          ) : (
                            <File className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{file.name}</p>
                          <p className="text-xs text-slate-500">{file.size} • {file.date}</p>
                        </div>
                        <button onClick={() => window.open(file.url, "_blank")}
                        className="text-emerald-600 text-xs font-semibold hover:underline">View</button>
                      </div>
                    ))}
                    {reportsCount === 0 && (
                      <p className="text-sm text-slate-500">No reports uploaded.</p>
                    )}
                  </div>
                </Card>

                {/* Medical History */}
                <Card id="history" className="p-6 sm:p-8">
                  <SectionHeader icon={Clock} title="Medical History" subtitle="Timeline of past events and consultations" />
                  <div className="space-y-4">
                    {(data.medicalHistory || []).map((event, idx) => (
                      <div key={idx} className="relative pl-4 border-l border-emerald-200">
                        <span className="absolute -left-2 top-1 h-3 w-3 rounded-full bg-emerald-500" />
                        <p className="text-sm font-semibold text-slate-900">{event.title}</p>
                        <p className="text-xs text-slate-500 mb-1">{event.date}</p>
                        <p className="text-sm text-slate-600">{event.note}</p>
                      </div>
                    ))}
                    {(!data.medicalHistory || data.medicalHistory.length === 0) && (
                      <p className="text-sm text-slate-500">No history recorded yet.</p>
                    )}
                  </div>
                </Card>
              </div>

              {/* Side column */}
              <div className="space-y-6">
                {/* Profile completeness */}
                <Card className="p-6 flex flex-col items-center text-center">
                  <p className="text-sm font-semibold text-slate-900 self-start mb-4">Profile Completeness</p>
                  <CompletenessRing value={completeness} />
                  <p className="mt-4 text-xs text-slate-500">
                    {completeness < 100
                      ? "Complete your profile so doctors have the full picture."
                      : "Your profile is fully complete. Nice work!"}
                  </p>
                </Card>

                {/* Care Team */}
                <Card id="care" className="p-6">
                  <SectionHeader icon={BadgeCheck} title="Care Team" subtitle="Your assigned care contacts" />
                  <div className="space-y-1">
                    <InfoRow label="Doctor" value={data.doctor || "Not assigned"} />
                    <InfoRow label="Specialty" value={data.specialty || "—"} />
                    <InfoRow label="Email" value={data.email || "—"} />
                    <InfoRow label="Phone" value={data.phone || "—"} />
                    <InfoRow label="Location" value={data.location || "—"} />
                  </div>
                </Card>

                {/* Allergies */}
                <Card className="p-6">
                  <SectionHeader icon={AlertTriangle} title="Allergies" subtitle="Important for safe prescriptions" />
                  <div className="flex flex-wrap gap-2">
                    {(data.allergies || []).map((item, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 text-sm border border-amber-200 dark:border-amber-500/30"
                      >
                        {item}
                      </span>
                    ))}
                    {allergiesCount === 0 && (
                      <span className="text-sm text-slate-500">No known allergies.</span>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </>
  );
};

export default PatientDashboard;
