import { useState } from "react";
import axios from "axios";
import { FiX } from "react-icons/fi";
import { useToast } from "../../context/ToastContext";

export default function AuthModal({ closeModal, onAuthenticated }) {
  const { showLoginSuccess } = useToast();
  const [view, setView] = useState("login");
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "" });
  const [otp, setOtp] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const isLogin = view === "login";
  const isRegister = view === "register";

  const handleChange = (e) => {
    const value = e.target.name === "phone"
      ? e.target.value.replace(/\D/g, "").slice(0, 11)
      : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (view === "register" && !/^01[3-9]\d{8}$/.test(formData.phone)) {
      setError("Enter a valid 11-digit Bangladeshi phone number starting with 013-019.");
      return;
    }

    if (view === "forgot-request") {
      try {
        const res = await axios.post("http://127.0.0.1:8000/api/password/forgot", { email: formData.email });
        setMessage(res.data.message);
        setView("forgot-reset");
      } catch (err) {
        setError(err.response?.data?.message || "Unable to send the OTP.");
      }
      return;
    }

    if (view === "forgot-reset") {
      if (formData.password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      try {
        const res = await axios.post("http://127.0.0.1:8000/api/password/reset", {
          email: formData.email,
          otp,
          password: formData.password,
          password_confirmation: confirmPassword,
        });
        setMessage(res.data.message);
        setView("login");
        setFormData({ ...formData, password: "" });
        setOtp("");
        setConfirmPassword("");
      } catch (err) {
        setError(err.response?.data?.message || "Unable to reset the password.");
      }
      return;
    }

    const endpoint = isLogin
      ? "http://127.0.0.1:8000/api/login"
      : "http://127.0.0.1:8000/api/register";

    try {
      const res = await axios.post(endpoint, formData);
      localStorage.setItem("token", res.data.token ?? res.data.access_token ?? "");
      localStorage.setItem("user", JSON.stringify(res.data.user));
      window.dispatchEvent(new Event("auth-changed"));
      if (isLogin) showLoginSuccess();
      onAuthenticated?.(res.data.user);
      closeModal();
    } catch (err) {
      const validationErrors = err.response?.data?.errors;
      setError(err.response?.data?.message || (validationErrors && Object.values(validationErrors).flat()[0]) || "Something went wrong!");
    }
  };

  const switchView = (nextView) => {
    setView(nextView);
    setError("");
    setMessage("");
  };

  const title = isLogin ? "Welcome Back" : isRegister ? "Create Account" : "Reset Password";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
        <button
          onClick={closeModal}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 text-xl cursor-pointer"
        >
          <FiX />
        </button>

        <h2 className="text-2xl font-bold text-[#064e3b] mb-4 text-center">
          {title}
        </h2>

        {error && (
          <p className="text-red-500 text-sm text-center mb-3 bg-red-50 p-2 rounded-lg">
            {error}
          </p>
        )}

        {message && (
          <p className="text-emerald-700 text-sm text-center mb-3 bg-emerald-50 p-2 rounded-lg">
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isRegister && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              onChange={handleChange}
              required
              className="p-3 border rounded-xl outline-none focus:border-[#064e3b]"
            />
          )}
          {(isLogin || isRegister) && (
            <input
              type={isLogin ? "text" : "tel"}
              name="phone"
              placeholder="Phone Number"
              onChange={handleChange}
              value={formData.phone}
              maxLength={11}
              pattern={isRegister ? "01[3-9][0-9]{8}" : undefined}
              required
              className="p-3 border rounded-xl outline-none focus:border-[#064e3b]"
            />
          )}
          {isRegister && (
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              onChange={handleChange}
              required
              className="p-3 border rounded-xl outline-none focus:border-[#064e3b]"
            />
          )}
          {!isLogin && !isRegister && (
            <input
              type="email"
              name="email"
              placeholder="Registered Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className="p-3 border rounded-xl outline-none focus:border-[#064e3b]"
            />
          )}
          {view === "forgot-reset" && (
            <>
              <input
                type="text"
                inputMode="numeric"
                placeholder="6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                required
                className="p-3 border rounded-xl outline-none focus:border-[#064e3b]"
              />
              <input
                type="password"
                name="password"
                placeholder="New Password"
                onChange={handleChange}
                required
                minLength={6}
                className="p-3 border rounded-xl outline-none focus:border-[#064e3b]"
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="p-3 border rounded-xl outline-none focus:border-[#064e3b]"
              />
            </>
          )}
          {(isLogin || isRegister) && (
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
            className="p-3 border rounded-xl outline-none focus:border-[#064e3b]"
          />
          )}
          {isLogin && (
            <button
              type="button"
              onClick={() => switchView("forgot-request")}
              className="self-end text-sm text-[#064e3b] font-semibold hover:underline cursor-pointer"
            >
              Forgot Password?
            </button>
          )}
          <button
            type="submit"
            className="bg-[#064e3b] text-white py-3 rounded-xl font-semibold hover:bg-emerald-900 transition-all cursor-pointer"
          >
            {isLogin ? "Login" : isRegister ? "Register" : "Reset Password"}
          </button>
        </form>

        <p className="text-sm text-center text-gray-600 mt-4">
          {isLogin ? "Don't have an account?" : isRegister ? "Already have an account?" : "Remembered your password?"}{" "}
          <button
            type="button"
            onClick={() => switchView(isLogin ? "register" : "login")}
            className="text-[#064e3b] font-bold underline ml-1 cursor-pointer"
          >
            {isLogin ? "Register" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}
