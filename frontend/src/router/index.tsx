import { Route, Routes } from "react-router-dom";
import WelcomePage from "../pages/WelcomePage";
import RegisterPage from "../pages/RegisterPage";
import LoginPage from "../pages/LoginPage";
import TempPage from "../pages/TempPage";
import OnboardingPage from "../pages/onboarding/OnboardingPage";
import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "./ProtectedRoute";
import AuthLayout from "../layouts/AuthLayout";
import PublicRoute from "./PublicRoute";
import OnboardingLayout from "../layouts/OnboardingLayout";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/" element={<WelcomePage />} />
        <Route element={<AuthLayout />}>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<OnboardingLayout />}>
          <Route path="/onboarding" element={<OnboardingPage />} />
        </Route>
        <Route element={<MainLayout />}>
          <Route path="/temp" element={<TempPage />} />
        </Route>
      </Route>
    </Routes >
  );
}

