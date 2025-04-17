import React from "react";
import BaseLayout from "./BaseLayout";
import Header from "../components/Header"
import { Outlet } from "react-router-dom";

export default function OnboardingLayout() {
  return (
    <BaseLayout>
      <Header variant="onboarding" />
      <main className="p-4 md:p-8">
        <Outlet />
      </main>
    </BaseLayout>
  )
}
