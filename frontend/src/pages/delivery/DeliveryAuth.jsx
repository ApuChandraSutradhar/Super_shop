import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function DeliveryAuth() {
  const [isRegister, setIsRegister] = useState(false);
  const [authView, setAuthView] = useState("login");
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "" });
  const [otp, setOtp] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const value = e.target.name === "phone"
      ? e.target.value.replace(/\D/g, "").slice(0, 11)
      : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const switchAuthView = (view) => {
    setAuthView(view);
    setIsRegister(view === "register");
    setError("");
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if ((isRegister || authView === "login") && formData.phone.length !== 11) {
      setError("Phone number must be exactly 11 digits");
      return;
    }

    if (isRegister && !/^01[3-9]\d{8}$/.test(formData.phone)) {
      setError("Enter a valid 11-digit phone number starting with 013-019.");
      return;
    }

    if (authView === "forgot-request") {
      try {
        const res = await axios.post("http://127.0.0.1:8000/api/password/forgot", {
          email: formData.email,
          role: "delivery",
        });
        setMessage(res.data.message);
        setAuthView("forgot-reset");
      } catch (err) {
        setError(err.response?.data?.message || "Unable to send the OTP.");
      }
      return;
    }

    if (authView === "forgot-reset") {
      if (formData.password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      try {
        const res = await axios.post("http://127.0.0.1:8000/api/password/reset", {
          email: formData.email,
          role: "delivery",
          otp,
          password: formData.password,
          password_confirmation: confirmPassword,
        });
        setMessage(res.data.message);
        setAuthView("login");
        setFormData({ ...formData, password: "" });
        setOtp("");
        setConfirmPassword("");
      } catch (err) {
        setError(err.response?.data?.message || "Unable to reset the password.");
      }
      return;
    }

    if (isRegister) {
      try {
        // Registration request-a explicitly role: "delivery"
        const res = await axios.post("http://127.0.0.1:8000/api/delivery/register", {
          ...formData,
          role: "delivery",
        });
        if (res.data.success) {
          setMessage("Registration submitted! Waiting for Admin approval.");
          setIsRegister(false);
          setAuthView("login");
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

        const user = res.data?.user || res.data?.data?.user;
        const rawRole = user?.role || "";
        const userRole = String(rawRole).toLowerCase().trim();

        if ((res.data.success || user) && userRole === "delivery") {
          localStorage.setItem("deliveryUser", JSON.stringify(user));
          const token = res.data?.access_token || res.data?.token;
          if (token) localStorage.setItem("token", token);
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
          {isRegister ? "Delivery Registration" : authView === "forgot-request" || authView === "forgot-reset" ? "Reset Delivery Password" : "Delivery Partner Login"}
        </h2>
        <p className="text-xs text-center text-gray-500 mb-6">
          {isRegister ? "Apply to become a delivery agent" : authView === "forgot-request" ? "Enter your registered email to receive an OTP" : authView === "forgot-reset" ? "Use the OTP sent to your email" : "Welcome back, partner!"}
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

          {(isRegister || authView === "login") && <div>
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              required
              value={formData.phone}
              onChange={handleChange}
              inputMode="numeric"
              maxLength={11}
              className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#005a36]"
            />
          </div>}

          {isRegister && <div>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#005a36]"
            />
          </div>}

          {authView === "forgot-request" && <div>
            <input
              type="email"
              name="email"
              placeholder="Registered Email Address"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#005a36]"
            />
          </div>}

          {authView === "forgot-reset" && <>
            <input
              type="text"
              inputMode="numeric"
              placeholder="6-digit OTP"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              maxLength={6}
              className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#005a36]"
            />
            <input
              type="password"
              placeholder="New Password"
              name="password"
              required
              minLength={6}
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#005a36]"
            />
            <input
              type="password"
              placeholder="Confirm Password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#005a36]"
            />
          </>}

          {(isRegister || authView === "login") && <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#005a36]"
            />
            {authView === "login" && <button
              type="button"
              onClick={() => switchAuthView("forgot-request")}
              className="mt-2 text-xs text-[#005a36] font-bold hover:underline"
            >
              Forgot Password?
            </button>}
          </div>}

          <button
            type="submit"
            className="w-full bg-[#005a36] text-white py-3 rounded-xl font-bold hover:bg-[#004227] transition text-sm"
          >
            {isRegister ? "Submit Application" : authView === "forgot-request" ? "Send OTP" : authView === "forgot-reset" ? "Reset Password" : "Login"}
          </button>
        </form>

        {(authView === "login" || isRegister) && <div className="text-center mt-4">
          <button
            onClick={() => switchAuthView(isRegister ? "login" : "register")}
            className="text-xs text-[#005a36] font-bold hover:underline"
          >
            {isRegister ? "Already have an account? Login" : "Don't have an account? Register"}
          </button>
        </div>}
        {(authView === "forgot-request" || authView === "forgot-reset") && (
          <div className="text-center mt-3">
            <button type="button" onClick={() => switchAuthView("login")} className="text-xs text-gray-500 hover:underline">
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
