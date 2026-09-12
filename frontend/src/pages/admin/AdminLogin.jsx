import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [view, setView] = useState("login");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const switchView = (nextView) => {
    setView(nextView);
    setError("");
    setMessage("");
  };

  // Prevent accessing login page if already logged in, or clear history
  useEffect(() => {
    const adminUser = localStorage.getItem("adminUser");
    if (adminUser) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (view === "forgot-request") {
      try {
        const res = await axios.post("http://127.0.0.1:8000/api/password/forgot", {
          email,
          role: "admin",
        });
        setMessage(res.data.message);
        setView("forgot-reset");
      } catch (err) {
        setError(err.response?.data?.message || "Unable to send the OTP.");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (view === "forgot-reset") {
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.post("http://127.0.0.1:8000/api/password/reset", {
          email,
          role: "admin",
          otp,
          password,
          password_confirmation: confirmPassword,
        });
        setMessage(res.data.message);
        setView("login");
        setPassword("");
        setOtp("");
        setConfirmPassword("");
      } catch (err) {
        setError(err.response?.data?.message || "Unable to reset the password.");
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/login", { phone, password });

      const user = res.data?.user || res.data?.data?.user;
      const rawRole = user?.role || "";
      const userRole = String(rawRole).toLowerCase().trim();

      if ((res.data.success || user) && userRole === "admin") {
        localStorage.setItem("adminUser", JSON.stringify(user));
        if (res.data?.token) localStorage.setItem("token", res.data.token);
        
        // Use window.location.replace to wipe browser history stack
        window.location.replace("/admin/dashboard");
      } else {
        setError(`Access Denied: Current role is "${rawRole || 'Unknown'}". Admin role required.`);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid Admin Credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full border border-gray-100">
        <h2 className="text-2xl font-bold text-center text-[#005a36] mb-6">
          {view === "login" ? "Admin Portal Login" : "Reset Admin Password"}
        </h2>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 text-center">{error}</div>}
        {message && <div className="bg-emerald-50 text-[#005a36] p-3 rounded-lg text-sm mb-4 text-center">{message}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          {view === "login" && <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="017XXXXXXXX"
                className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005a36]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005a36]"
              />
              <button
                type="button"
                onClick={() => switchView("forgot-request")}
                className="mt-2 text-sm text-[#005a36] font-semibold hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          </>}

          {view === "forgot-request" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="22303020@iubat.edu"
                className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005a36]"
              />
            </div>
          )}

          {view === "forgot-reset" && <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">6-digit OTP</label>
              <input
                type="text"
                inputMode="numeric"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005a36]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005a36]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005a36]"
              />
            </div>
          </>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#005a36] text-white py-3 rounded-xl font-bold hover:bg-[#004227] transition cursor-pointer"
          >
            {loading ? "Processing..." : view === "login" ? "Login as Admin" : view === "forgot-request" ? "Send OTP" : "Reset Password"}
          </button>
        </form>

        {view !== "login" && (
          <button
            type="button"
            onClick={() => switchView("login")}
            className="w-full mt-4 text-sm text-gray-500 hover:underline"
          >
            Back to Admin Login
          </button>
        )}
      </div>
    </div>
  );
}
