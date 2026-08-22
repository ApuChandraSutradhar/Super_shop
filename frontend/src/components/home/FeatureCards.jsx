import React from "react";
import {
  FiGift,
  FiRefreshCw,
  FiShield,
  FiHeadphones,
} from "react-icons/fi";

const features = [
  {
    id: 1,
    icon: <FiGift size={24} />,
    title: "100 Tk Coupon",
    subtitle: "On orders over ৳2000",
    iconBg: "bg-emerald-100 text-emerald-600",
  },
  {
    id: 2,
    icon: <FiRefreshCw size={24} />,
    title: "Easy Returns",
    subtitle: "7-day policy",
    iconBg: "bg-orange-100 text-orange-500",
  },
  {
    id: 3,
    icon: <FiShield size={24} />,
    title: "100% Secure",
    subtitle: "Safe Online Payment",
    iconBg: "bg-blue-100 text-blue-600",
  },
  {
    id: 4,
    icon: <FiHeadphones size={24} />,
    title: "24/7 Support",
    subtitle: "Always Here To Help",
    iconBg: "bg-purple-100 text-purple-600",
  },
];

export default function FeatureCards() {
  return (
    <section className="mb-4 lg:ml-[320px] -mt-24 lg:-mt-52 relative z-10 pr-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl px-3.5 py-8 flex items-center gap-3 shadow-md border border-gray-100 hover:shadow-lg transition-all"
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${item.iconBg}`}
            >
              {item.icon}
            </div>

            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base text-gray-900 leading-snug truncate">
                {item.title}
              </h3>
              <p className="text-gray-500 text-xs font-medium mt-0.5 truncate">
                {item.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}