import React, { useState } from "react";
import axios from "axios";
import { FiX } from "react-icons/fi";
import { useToast } from "../../context/ToastContext";

export default function AuthModal({ closeModal, onAuthenticated }) {
  const { showLoginSuccess } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const endpoint = isLogin
      ? "http://127.0.0.1:8000/api/login"
      : "http://127.0.0.1:8000/api/register";

    try {
      const res = await axios.post(endpoint, formData);
      localStorage.setItem("token", res.data.token ?? res.data.access_token ?? "");
      localStorage.setItem("user", JSON.stringify(res.data.user));
      if (isLogin) showLoginSuccess();
      onAuthenticated?.(res.data.user);
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong!");
    }
  };

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
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>

        {error && (
          <p className="text-red-500 text-sm text-center mb-3 bg-red-50 p-2 rounded-lg">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              onChange={handleChange}
              required
              className="p-3 border rounded-xl outline-none focus:border-[#064e3b]"
            />
          )}
          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            onChange={handleChange}
            required
            className="p-3 border rounded-xl outline-none focus:border-[#064e3b]"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
            className="p-3 border rounded-xl outline-none focus:border-[#064e3b]"
          />
          <button
            type="submit"
            className="bg-[#064e3b] text-white py-3 rounded-xl font-semibold hover:bg-emerald-900 transition-all cursor-pointer"
          >
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <p className="text-sm text-center text-gray-600 mt-4">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-[#064e3b] font-bold underline ml-1 cursor-pointer"
          >
            {isLogin ? "Register" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}
