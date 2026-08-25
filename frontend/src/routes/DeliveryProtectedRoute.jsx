import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";

const RIDER_LOGIN_PATH = "/login";

const getApprovedDeliveryRider = () => {
  try {
    const rider = JSON.parse(localStorage.getItem("deliveryUser"));
    const isDeliveryRider = String(rider?.role || "").toLowerCase().trim() === "delivery";
    const isApproved = rider?.is_approved === true || Number(rider?.is_approved) === 1;

    return isDeliveryRider && isApproved;
  } catch {
    return false;
  }
};

export default function DeliveryProtectedRoute() {
  const isAuthorized = getApprovedDeliveryRider();

  useEffect(() => {
    const redirectIfUnauthorized = () => {
      if (!getApprovedDeliveryRider()) {
        window.location.replace(RIDER_LOGIN_PATH);
      }
    };

    // A page restored from the browser back-forward cache does not remount,
    // so validate its stored rider session again before showing it.
    const handlePageShow = (event) => {
      if (event.persisted) redirectIfUnauthorized();
    };

    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("popstate", redirectIfUnauthorized);
    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("popstate", redirectIfUnauthorized);
    };
  }, []);

  if (!isAuthorized) {
    return <Navigate to={RIDER_LOGIN_PATH} replace />;
  }

  return <Outlet />;
}
