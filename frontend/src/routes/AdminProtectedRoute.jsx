import React, { useEffect } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";

export default function AdminProtectedRoute() {
  const navigate = useNavigate();
  const adminUser = localStorage.getItem("adminUser");

  useEffect(() => {
    // 1. Prevent loading from browser Back-Forward Cache (bfcache)
    const handlePageShow = (event) => {
      if (event.persisted || !localStorage.getItem("adminUser")) {
        window.location.replace("/admin");
      }
    };

    // 2. Prevent back navigation action
    const handlePopState = () => {
      if (!localStorage.getItem("adminUser")) {
        window.location.replace("/admin");
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);

  if (!adminUser) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}