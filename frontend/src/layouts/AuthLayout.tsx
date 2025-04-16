import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import BaseLayout from "./BaseLayout";

export default function AuthLayout() {
  return (
    <BaseLayout>
      <Header variant="auth" />
      <main className="p-4 md:p-8">
        <Outlet />
      </main>
    </BaseLayout>
  );
}

