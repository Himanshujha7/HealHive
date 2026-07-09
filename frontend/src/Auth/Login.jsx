import { useState, useEffect } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Navbar from "../Homepage/Navbar";
import Footer from "../Homepage/footer";
import { useAuth } from "../Context/AuthContext";
import { Eye, EyeOff } from "lucide-react";

// ✅ Custom Input
function Input({ type = "text", placeholder, className = "", ...props }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className={`w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-750 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition ${className}`}
      {...props}
    />
  );
}

// ✅ Custom Button (supports disabled)
function Button({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={`px-4 py-2 rounded-lg font-medium bg-emerald-600 text-white transition
        hover:bg-emerald-700
        disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-emerald-600
        ${className}`}
    >
      {children}
    </button>
  );
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // ✅ NEW
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { user, loading: authLoading } = useAuth();

  // Redirect already-authenticated users straight to home
  useEffect(() => {
    if (!authLoading && user) {
      navigate("/");
    }
  }, [authLoading, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // 🛑 prevent double click

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      
      const user = userCredential.user;

      // ✅ Check email verification
      // if (!user.emailVerified) {
      //   alert("Please verify your email before logging in.");
      //   await auth.signOut();
      //   return;
      // }

      // ✅ Get Firebase token
      const token = await user.getIdToken();

      // ✅ Sync with backend
      // Inside Login.jsx handleSubmit
      // await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/sync`, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `Bearer ${token}`,
      //   },
      //   body: JSON.stringify({
      //     role: "patient", // Default role for safety if user is missing from DB
      //     extra: { name: user.displayName },
      //   }),
      // });

      // ✅ Ask backend for user role
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

      if (data.role === "patient") {
        if (data.profileCompleted === false) {
          navigate("/patient-form");
        } else {
          navigate("/");
        }
      } else if (data.role === "doctor") {
        if (data.profileCompleted === false) {
          navigate("/doc"); // take doctor to registration if incomplete
        } else {
          navigate("/"); // doctor already registered → go home
        }
      }
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false); // ✅ re-enable button if error
    }
  };

  // Avoid showing the form while auth state is resolving
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
            Log In
          </h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                type="email"
                placeholder="Enter your email"
                className="mt-1"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
  <label className="block text-sm font-medium text-gray-700">
    Password
  </label>

  <div className="relative mt-1">
    <Input
      type={showPassword ? "text" : "password"}
      placeholder="Enter your password"
      className="pr-12"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
    />

    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-emerald-600"
      aria-label={showPassword ? "Hide password" : "Show password"}
    >
      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
    </button>
  </div>
</div>

            <div className="text-right mt-2">
              <a
                href="/forgot-password"
                className="text-sm text-emerald-600 hover:underline"
              >
                Forgot Password?
              </a>
            </div>

            <Button type="submit" disabled={loading} className="w-full mt-2">
              {loading ? "Logging in..." : "Log In"}
            </Button>
          </form>

          <p className="text-sm text-gray-600 mt-6 text-center">
            Don't have an account?{" "}
            <a
              href="/create-account"
              className="text-emerald-600 hover:underline"
            >
              Sign Up
            </a>
          </p>
        </div>
      </div>

      <Footer />
    </>
  );
}
