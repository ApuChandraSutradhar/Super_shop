import { Outlet } from "react-router-dom";
import DeliveryNavbar from "./DeliveryNavbar";
import DeliverySidebar from "./DeliverySidebar";

export default function DeliveryLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <DeliverySidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DeliveryNavbar />
        <main className="flex-1 p-5 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
