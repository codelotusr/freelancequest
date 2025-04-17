import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { Spinner } from "flowbite-react";

export default function PublicRoute() {
  const { isAuthenticated, loading, isOnboardingRequired } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <Spinner size="xl" aria-label="Kraunama..." />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={isOnboardingRequired ? "/onboarding" : "/dashboard"} replace />;
  }

  return <Outlet />;
}

