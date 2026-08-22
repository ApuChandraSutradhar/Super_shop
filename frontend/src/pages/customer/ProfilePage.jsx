import React, { useState, useEffect } from "react";
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit2, FiCheckCircle } from "react-icons/fi";

export default function ProfilePage() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        const userData = {
          name: parsedUser.name || "Customer",
          email: parsedUser.email || "customer@example.com",
          phone: parsedUser.phone || "+880 1700-000000",
          address: parsedUser.address || "Dhaka, Bangladesh",
        };
        setUser(userData);
        setFormData(userData);
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setUser(formData);
    
    const existingData = JSON.parse(localStorage.getItem("user")) || {};
    const updatedUser = { ...existingData, ...formData };
    localStorage.setItem("user", JSON.stringify(updatedUser));

    setIsEditing(false);
    setMessage("Profile updated successfully!");

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#064e3b] text-white flex items-center justify-center text-2xl font-bold uppercase shadow-md">
              {user.name ? user.name.charAt(0) : "U"}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{user.name}</h1>
              <p className="text-sm text-gray-400">Manage your profile & account settings</p>
            </div>
          </div>

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-emerald-50 text-[#064e3b] hover:bg-emerald-100 px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer"
            >
              <FiEdit2 /> Edit Profile
            </button>
          )}
        </div>

        {/* Success Alert */}
        {message && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-[#064e3b] px-4 py-3 rounded-xl text-sm font-semibold animate-fade-in">
            <FiCheckCircle className="text-lg" /> {message}
          </div>
        )}

        {/* Profile Info / Edit Form */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          {isEditing ? (

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <FiUser className="absolute left-4 top-3.5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#064e3b] outline-none text-gray-700 font-medium transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-3.5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#064e3b] outline-none text-gray-700 font-medium transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-4 top-3.5 text-gray-400" />
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#064e3b] outline-none text-gray-700 font-medium transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                  Delivery Address
                </label>
                <div className="relative">
                  <FiMapPin className="absolute left-4 top-3.5 text-gray-400" />
                  <textarea
                    name="address"
                    rows="3"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#064e3b] outline-none text-gray-700 font-medium transition"
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#064e3b] hover:bg-emerald-900 text-white font-semibold transition cursor-pointer shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            /* --- View Mode --- */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50/60 rounded-xl border border-gray-100 flex items-start gap-4">
                <div className="p-3 bg-white text-[#064e3b] rounded-lg shadow-sm border border-gray-100">
                  <FiUser className="text-xl" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Full Name</p>
                  <p className="text-base font-semibold text-gray-800 mt-0.5">{user.name}</p>
                </div>
              </div>

              <div className="p-4 bg-gray-50/60 rounded-xl border border-gray-100 flex items-start gap-4">
                <div className="p-3 bg-white text-[#064e3b] rounded-lg shadow-sm border border-gray-100">
                  <FiMail className="text-xl" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Email Address</p>
                  <p className="text-base font-semibold text-gray-800 mt-0.5">{user.email}</p>
                </div>
              </div>

              <div className="p-4 bg-gray-50/60 rounded-xl border border-gray-100 flex items-start gap-4">
                <div className="p-3 bg-white text-[#064e3b] rounded-lg shadow-sm border border-gray-100">
                  <FiPhone className="text-xl" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Phone Number</p>
                  <p className="text-base font-semibold text-gray-800 mt-0.5">{user.phone}</p>
                </div>
              </div>

              <div className="p-4 bg-gray-50/60 rounded-xl border border-gray-100 flex items-start gap-4">
                <div className="p-3 bg-white text-[#064e3b] rounded-lg shadow-sm border border-gray-100">
                  <FiMapPin className="text-xl" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Delivery Address</p>
                  <p className="text-base font-semibold text-gray-800 mt-0.5">{user.address}</p>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}