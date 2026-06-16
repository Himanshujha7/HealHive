import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";

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

  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Handle search button click
  const handleSearchDoctors = () => {
    if (searchInput.trim()) {
      navigate("/doctor-search", { state: { searchQuery: searchInput } });
      setSearchInput("");
    } else {
      navigate("/doctor-search");
    }
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
            <div className="hidden lg:flex items-center gap-2 bg-emerald-50/60 border border-emerald-100 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-200">
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
                className="bg-transparent outline-none text-sm text-slate-700 placeholder-emerald-400 w-48"
                placeholder="Search doctors, specialties"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSearchDoctors();
                  }
                }}
              />
              {searchInput && (
                <button
                  onClick={handleSearchDoctors}
                  className="text-emerald-600 hover:text-emerald-700 transition ml-1"
                  title="Search"
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
                onClick={() => setOpen(false)}
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
