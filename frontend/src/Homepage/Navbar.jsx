import { useState, useRef, useEffect, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";
import { doctors } from "../utils/doctorFilterService";

const navLinks = [
  { name: "Home", to: "/" },
  { name: "How It Works", to: "/#how-it-works" },
  { name: "Specialties", to: "/#specialties" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // Track user role (patient/doctor)
  const [searchInput, setSearchInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);

  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (e, to) => {
    if (to.startsWith("/#")) {
      e.preventDefault();
      const id = to.substring(2);
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }
      setOpen(false);
    } else {
      setOpen(false);
    }
  };

  const searchSuggestions = useMemo(() => {
    const query = searchInput.trim().toLowerCase();
    if (!query) return [];

    const suggestions = [];
    const seen = new Set();
    const addSuggestion = (suggestion) => {
      const key = `${suggestion.type}:${suggestion.value}`.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        suggestions.push(suggestion);
      }
    };

    doctors.forEach((doctor) => {
      if (doctor.name.toLowerCase().includes(query)) {
        addSuggestion({
          type: "Doctor",
          label: doctor.name,
          value: doctor.name,
          meta: doctor.specialty,
        });
      }

      if (doctor.specialty.toLowerCase().includes(query)) {
        addSuggestion({
          type: "Specialty",
          label: doctor.specialty,
          value: doctor.specialty,
          meta: "Find matching specialists",
        });
      }

      doctor.diseases?.forEach((disease) => {
        if (disease.toLowerCase().includes(query)) {
          addSuggestion({
            type: "Condition",
            label: disease,
            value: disease,
            meta: doctor.specialty,
          });
        }
      });
    });

    return suggestions.slice(0, 6);
  }, [searchInput]);

  // Handle search button click
  const handleSearchDoctors = (query = searchInput) => {
    const nextQuery = query.trim();
    setShowSuggestions(false);
    setActiveSuggestion(-1);

    if (nextQuery) {
      navigate("/doctor-search", { state: { searchQuery: nextQuery } });
      setSearchInput("");
    } else {
      navigate("/doctor-search");
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    setSearchInput(suggestion.value);
    handleSearchDoctors(suggestion.value);
  };

  // 🔥 Auth listener & fetch user role
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          const res = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/users/login`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const data = await res.json();
          setUserRole(data.role); // Set 'patient' or 'doctor'
        } catch (err) {
          console.error("Error fetching user role:", err);
        }
      } else {
        setUserRole(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // 🔓 Logout
  const handleLogout = async () => {
    await signOut(auth);
    setShowAccount(false);
    navigate("/login");
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowAccount(false);
        setOpen(false);
        setShowSuggestions(false);
        setActiveSuggestion(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-emerald-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* LEFT */}
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="text-lg font-extrabold bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 bg-clip-text text-transparent"
            >
              HealHive
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={(e) => handleNavClick(e, link.to)}
                  className="px-4 py-2 rounded-lg text-md font-medium text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 transition"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3" ref={menuRef}>
            {/* 🔍 SEARCH BAR (restored) */}
            <div className="relative hidden lg:block">
              <div className="flex items-center gap-2 bg-emerald-50/60 border border-emerald-100 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-200">
                <svg
                  className="h-4 w-4 text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-4.35-4.35m0 0A7 7 0 1116.65 16.65z"
                  />
                </svg>
                <input
                  className="bg-transparent outline-none text-sm text-slate-700 placeholder-emerald-400 w-56"
                  placeholder="Search doctors, specialties"
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setShowSuggestions(true);
                    setActiveSuggestion(-1);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setShowSuggestions(true);
                      setActiveSuggestion((current) =>
                        Math.min(current + 1, searchSuggestions.length - 1)
                      );
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setActiveSuggestion((current) => Math.max(current - 1, 0));
                    } else if (e.key === "Enter") {
                      e.preventDefault();
                      if (activeSuggestion >= 0 && searchSuggestions[activeSuggestion]) {
                        handleSuggestionSelect(searchSuggestions[activeSuggestion]);
                      } else {
                        handleSearchDoctors();
                      }
                    } else if (e.key === "Escape") {
                      setShowSuggestions(false);
                      setActiveSuggestion(-1);
                    }
                  }}
                />
                {searchInput && (
                  <button
                    onClick={() => handleSearchDoctors()}
                    className="text-emerald-600 hover:text-emerald-700 transition ml-1"
                    title="Search"
                    type="button"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7m0 0l-7 7m7-7H5"
                      />
                    </svg>
                  </button>
                )}
              </div>

              {showSuggestions && searchInput.trim() && searchSuggestions.length > 0 && (
                <div className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-xl border border-emerald-100 bg-white shadow-xl">
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      key={`${suggestion.type}-${suggestion.value}`}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSuggestionSelect(suggestion);
                      }}
                      onMouseEnter={() => setActiveSuggestion(index)}
                      className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition ${
                        activeSuggestion === index
                          ? "bg-emerald-50"
                          : "hover:bg-emerald-50"
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-slate-800">
                          {suggestion.label}
                        </span>
                        <span className="block truncate text-xs text-slate-500">
                          {suggestion.meta}
                        </span>
                      </span>
                      <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                        {suggestion.type}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* CTA - My Dashboard */}
            {user ? (
              <button
                onClick={() => {
                  const dashboardUrl = userRole === "doctor" ? "/doctor-dashboard" : "/patient-dashboard";
                  navigate(dashboardUrl);
                  setShowAccount(false);
                }}
                className="hidden md:inline-flex bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow hover:scale-[1.02] transition"
              >
                My Dashboard
              </button>
            ) : (
              <Link
                to="/patient-form"
                className="hidden md:inline-flex bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow hover:scale-[1.02] transition"
              >
                Consult Now
              </Link>
            )}

            {/* ACCOUNT */}
            <div className="relative">
              <button
                onClick={() => setShowAccount((s) => !s)}
                className="flex items-center gap-2 bg-white border border-emerald-100 rounded-full p-1 hover:shadow transition"
              >
                <img
                  src={`https://ui-avatars.com/api/?name=${user?.displayName || "Account"}&background=059669&color=fff`}
                  alt="avatar"
                  className="h-8 w-8 rounded-full"
                />
                <span className="hidden sm:block text-sm font-medium text-slate-700">
                  {user?.displayName || "Account"}
                </span>
              </button>

              {showAccount && (
                <div className="absolute right-0 mt-3 w-48 rounded-xl bg-white shadow-xl border border-emerald-100 overflow-hidden">
                  {!user ? (
                    <>
                      <Link
                        to="/create-account"
                        className="block px-4 py-2 text-sm hover:bg-emerald-50"
                      >
                        Create Account
                      </Link>
                      <Link
                        to="/login"
                        className="block px-4 py-2 text-sm hover:bg-emerald-50"
                      >
                        Login
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        to={userRole === "doctor" ? "/doctor-dashboard" : "/patient-dashboard"}
                        className="block px-4 py-2 text-sm hover:bg-emerald-50"
                      >
                        My Dashboard
                      </Link>
                      {userRole === "patient" && (
                        <>
                          <Link
                            to="/doctor-search"
                            className="block px-4 py-2 text-sm hover:bg-emerald-50"
                          >
                            Find a Doctor
                          </Link>
                          <Link
                            to="/appointment-history"
                            className="block px-4 py-2 text-sm hover:bg-emerald-50"
                          >
                            My Appointments
                          </Link>
                        </>
                      )}
                      <Link
                        to="/settings"
                        className="block px-4 py-2 text-sm hover:bg-emerald-50"
                      >
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* MOBILE */}
            <button
              onClick={() => setOpen((o) => !o)}
              className="md:hidden p-2 rounded-lg hover:bg-emerald-50"
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="md:hidden bg-white border-t border-emerald-100">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={(e) => handleNavClick(e, link.to)}
                className="block px-4 py-3 rounded-lg hover:bg-emerald-50"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
