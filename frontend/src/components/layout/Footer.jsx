import React from "react";
import { FaFacebookF, FaLinkedinIn, FaTwitter, FaYoutube } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="w-full font-sans mt-16 md:mt-24">
      
      {/* 1. Newsletter Banner */}
      <div className="bg-emerald-600 text-white py-8 px-6 md:px-16">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
          
          {/* Left Text */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">
              Subscribe to our newsletter
            </h2>
            <p className="text-emerald-100 text-sm mt-1">
              Get exclusive deals, fresh arrivals, and offers right in your inbox.
            </p>
          </div>

          {/* Right Input & Button */}
          <div className="flex items-center w-full lg:w-auto bg-emerald-700/60 p-1.5 rounded-full border border-emerald-500/50">
            <input
              type="email"
              placeholder="Enter your email"
              className="bg-transparent text-white placeholder-emerald-200 text-sm px-4 py-2 flex-grow lg:w-72 outline-none"
            />
            <button className="bg-white text-emerald-700 font-semibold text-sm px-6 py-2.5 rounded-full hover:bg-emerald-50 transition-all">
              Subscribe
            </button>
          </div>

        </div>
      </div>

      {/* 2. Main Dark Footer */}
      <div className="bg-[#0b132a] text-gray-300 pt-16 pb-12 px-6 md:px-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand Info */}
          <div className="lg:col-span-2 pr-4">
            <div className="flex items-center gap-2.5">
              <div className="bg-emerald-500 p-2 rounded-xl text-white">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
              </div>
              <span className="text-xl font-extrabold text-white tracking-wide">
                FreshMart
              </span>
            </div>
            
            <p className="text-xs text-gray-400 mt-4 leading-relaxed max-w-sm">
              Your trusted partner for fresh groceries and daily essentials, delivered to your doorstep.
            </p>

            {/* Social Icons */}
            <div className="flex gap-2 mt-6">
              {[FaFacebookF, FaLinkedinIn, FaTwitter, FaYoutube].map((Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs text-gray-400 hover:bg-emerald-600 hover:text-white transition-all"
                >
                  <Icon />
                </a>
              ))}
            </div>

            {/* Payment Methods */}
            <div className="mt-8">
              <h4 className="text-white font-medium text-xs mb-3">We Accept</h4>
              <div className="flex flex-wrap gap-2 text-[11px]">
                <span className="bg-slate-800 px-3 py-1 rounded text-gray-300 border border-slate-700/40">Visa</span>
                <span className="bg-slate-800 px-3 py-1 rounded text-gray-300 border border-slate-700/40">MasterCard</span>
                <span className="bg-slate-800 px-3 py-1 rounded text-pink-400 border border-slate-700/40 font-semibold">bKash</span>
                <span className="bg-slate-800 px-3 py-1 rounded text-orange-400 border border-slate-700/40 font-semibold">Nagad</span>
                <span className="bg-slate-800 px-3 py-1 rounded text-emerald-400 border border-slate-700/40 font-semibold">COD</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Quick Links</h3>
            <ul className="space-y-2.5 text-xs text-gray-400">
              {["Home", "About Us", "Shop", "Offers", "Blog", "Contact"].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-emerald-400 transition">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Customer</h3>
            <ul className="space-y-2.5 text-xs text-gray-400">
              {["My Account", "My Orders", "Track Order", "Wishlist", "Return Policy", "FAQ"].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-emerald-400 transition">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Legal</h3>
            <ul className="space-y-2.5 text-xs text-gray-400">
              {["Privacy Policy", "Terms of Service", "Cookie Policy", "Disclaimer", "Sitemap"].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-emerald-400 transition">{item}</a>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="max-w-7xl mx-auto border-t border-slate-800/80 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 gap-2">
          <p>© 2026 FreshMart Super Shop. All rights reserved.</p>
          <p>Made with ❤️ for better grocery experience</p>
        </div>
      </div>

    </footer>
  );
}