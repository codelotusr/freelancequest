import { Route, Routes } from "react-router-dom";
import WelcomePage from "../pages/WelcomePage";
import RegisterPage from "../pages/RegisterPage";
import LoginPage from "../pages/LoginPage";
import OnboardingPage from "../pages/onboarding/OnboardingPage";
import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "./ProtectedRoute";
import AuthLayout from "../layouts/AuthLayout";
import PublicRoute from "./PublicRoute";
import OnboardingLayout from "../layouts/OnboardingLayout";
import DashboardPage from "../pages/DashboardPage";
import GigsPage from "../pages/GigsPage";
import ProfilePage from "../pages/ProfilePage";
import LeaderboardPage from "../pages/LeaderboardPage";

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
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/gigs" element={<GigsPage />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
        </Route>
      </Route>
    </Routes >
  );
}

