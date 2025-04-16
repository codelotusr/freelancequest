import { Route, Routes } from "react-router-dom";
import WelcomePage from "../pages/WelcomePage";
import RegisterPage from "../pages/RegisterPage";
import TempPage from "../pages/TempPage";
import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "./ProtectedRoute";
import AuthLayout from "../layouts/AuthLayout";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route element={<AuthLayout />}>
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      <Route element={<MainLayout />}>
        <Route element={<ProtectedRoute />}>
          <Route path="/temp" element={<TempPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

