import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function DeliveryAuth() {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", password: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (isRegister) {
      try {
        // Registration request-a explicitly role: "delivery" pathano hochhe
        const res = await axios.post("http://127.0.0.1:8000/api/delivery/register", {
          ...formData,
          role: "delivery",
        });
        if (res.data.success) {
          setMessage("Registration submitted! Waiting for Admin approval.");
          setIsRegister(false);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Registration failed");
      }
    } else {
      try {
        const res = await axios.post("http://127.0.0.1:8000/api/login", {
          phone: formData.phone,
          password: formData.password,
        });

        // Flexible user and role response check
        const user = res.data?.user || res.data?.data?.user;
        const rawRole = user?.role || "";
        const userRole = String(rawRole).toLowerCase().trim();

        if ((res.data.success || user) && userRole === "delivery") {
          localStorage.setItem("deliveryUser", JSON.stringify(user));
          navigate("/delivery/dashboard");
        } else {
          setError(`Access Denied: Current role is "${rawRole || 'unknown'}". Delivery role required.`);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Login failed");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl max-w-sm w-full border border-gray-100">
        <h2 className="text-2xl font-bold text-center text-[#005a36] mb-2">
          {isRegister ? "Delivery Registration" : "Delivery Partner Login"}
        </h2>
        <p className="text-xs text-center text-gray-500 mb-6">
          {isRegister ? "Apply to become a delivery agent" : "Welcome back, partner!"}
        </p>

        {message && <div className="bg-emerald-50 text-[#005a36] p-3 rounded-lg text-xs mb-4 text-center font-semibold">{message}</div>}
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs mb-4 text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <input
                type="text"
                placeholder="Full Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#005a36]"
              />
            </div>
          )}

          <div>
            <input
              type="text"
              placeholder="Phone Number"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#005a36]"
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#005a36]"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#005a36] text-white py-3 rounded-xl font-bold hover:bg-[#004227] transition text-sm"
          >
            {isRegister ? "Submit Application" : "Login"}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={() => { setIsRegister(!isRegister); setError(""); setMessage(""); }}
            className="text-xs text-[#005a36] font-bold hover:underline"
          >
            {isRegister ? "Already have an account? Login" : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
}