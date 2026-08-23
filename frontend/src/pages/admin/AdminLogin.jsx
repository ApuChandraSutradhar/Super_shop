import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/login", { phone, password });

      const user = res.data?.user || res.data?.data?.user;
      const rawRole = user?.role || "";
      const userRole = String(rawRole).toLowerCase().trim();

      if ((res.data.success || user) && userRole === "admin") {
        localStorage.setItem("adminUser", JSON.stringify(user));
        
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
        <h2 className="text-2xl font-bold text-center text-[#005a36] mb-6">Admin Portal Login</h2>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 text-center">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#005a36] text-white py-3 rounded-xl font-bold hover:bg-[#004227] transition cursor-pointer"
          >
            {loading ? "Authenticating..." : "Login as Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}