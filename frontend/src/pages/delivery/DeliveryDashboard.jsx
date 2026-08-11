import React from "react";
import DeliverySidebar from "../../components/delivery/DeliverySidebar";

export default function DeliveryDashboard() {
  return (
    <div className="flex bg-gray-100 min-h-screen">
      <DeliverySidebar />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Delivery Management</h1>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Today's Deliveries</h2>
          
          <div className="border border-gray-200 rounded-xl p-4 flex justify-between items-center">
            <div>
              <p className="font-bold text-gray-800">Order #ORD-1024</p>
              <p className="text-sm text-gray-500">Customer: Apu Chandra | Phone: 01789174409</p>
              <p className="text-sm text-gray-500">Address: Uttara, Dhaka</p>
            </div>
            <button className="bg-[#064e3b] text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-800">
              Mark as Delivered
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}