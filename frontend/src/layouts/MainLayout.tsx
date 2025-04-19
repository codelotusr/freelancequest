import BaseLayout from "./BaseLayout";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";

export default function MainLayout() {
  return (
    <BaseLayout>
      <Header variant="main" />
      <main className="p-4 md:p-8">
        <Outlet />
      </main>
    </BaseLayout>
  );
}
