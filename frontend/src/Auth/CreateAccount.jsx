import { useState } from "react";
import { auth } from "../firebase";
import { Eye, EyeOff } from "lucide-react";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Navbar from "../Homepage/Navbar";
import Footer from "../Homepage/footer";

// ✅ Custom Input
function Input({ type = "text", placeholder, className = "", ...props }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className={`w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition ${className}`}
      {...props}
    />
  );
}

// ✅ Button
function Button({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={`px-4 py-2 rounded-lg font-medium bg-emerald-600 text-white transition
        hover:bg-emerald-700
        disabled:opacity-60 disabled:cursor-not-allowed
        ${className}`}
    >
      {children}
    </button>
  );
}

export default function CreateAccount() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);

    try {
      // 1️⃣ Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2️⃣ Update Firebase display name
      await updateProfile(user, { displayName: name });

      // 3️⃣ Get Firebase ID token for backend authentication
      const token = await user.getIdToken(); // Firebase ID token

      // ✅ Sync user to backend using configured URL
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role: role,
          extra: {
            name: name,
          },
        }),
      });

      // 5️⃣ Send verification email with explicit Action Code Settings
      const actionCodeSettings = {
        url:
          import.meta.env.VITE_EMAIL_VERIFY_CONTINUE_URL ||
          `${window.location.origin}/login`,
        handleCodeInApp: false,
        ...(import.meta.env.VITE_FIREBASE_DYNAMIC_LINK_DOMAIN
          ? { dynamicLinkDomain: import.meta.env.VITE_FIREBASE_DYNAMIC_LINK_DOMAIN }
          : {}),
      };
      await sendEmailVerification(user, actionCodeSettings);

      // 6️⃣ Sign out until verified
      await auth.signOut();

      alert(
        "Account created! A verification email was sent. Please check your Inbox, Spam, and Promotions. Open the email on your device and tap Verify, then log in."
      );
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
            Create Account
          </h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Name */}
            <div>
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required className="mt-1" />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1" />
            </div>

            {/* Role Slider */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Register As</label>

              <div className="relative w-64 h-10 bg-gray-200 rounded-full flex items-center cursor-pointer select-none">
                {/* Sliding indicator */}
                <div
                  className={`absolute top-1 left-1 w-1/2 h-8 bg-emerald-50 border border-emerald-700 rounded-full shadow-md transition-transform duration-300 ${
                    role === "doctor" ? "translate-x-full" : "translate-x-0"
                  }`}
                ></div>

                {/* Labels */}
                <div
                  className="w-1/2 text-center z-10 font-semibold text-emerald-700 cursor-pointer"
                  onClick={() => setRole("patient")}
                >
                  Patient
                </div>
                <div
                  className="w-1/2 text-center z-10 font-semibold text-emerald-700 cursor-pointer"
                  onClick={() => setRole("doctor")}
                >
                  Doctor
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
  <label className="text-sm font-medium text-gray-700">Password</label>

  <div className="relative mt-1">
    <Input
      type={showPassword ? "text" : "password"}
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
      className="pr-12"
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

            <Button type="submit" disabled={loading} className="w-full mt-2">
              {loading ? "Creating Account..." : "Sign Up"}
            </Button>
          </form>

          <p className="text-sm text-gray-600 mt-6 text-center">
            Already have an account?{" "}
            <a href="/login" className="text-emerald-600 hover:underline">
              Log in
            </a>
          </p>
        </div>
      </div>

      <Footer />
    </>
  );
}
