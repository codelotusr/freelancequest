import { Outlet, Link, useLocation } from "react-router-dom";
import { Navbar } from "flowbite-react";
import DarkModeToggle from "../components/DarkModeToggle";

export default function MainLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors">
      <Navbar fluid rounded className="shadow-md px-4 dark:bg-gray-900 dark:text-white">
        <Link
          to="/"
          className="text-xl font-semibold whitespace-nowrap text-blue-700 dark:text-white"
        >
          FreelanceQuest
        </Link>
        <div className="flex items-center gap-4">
          <DarkModeToggle />

          {location.pathname !== "/login" && location.pathname !== "/register" && (
            <>
              <Link to="/register" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                Registracija
              </Link>
              <Link to="/login" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                Prisijungimas
              </Link>
            </>
          )}
        </div>
      </Navbar>

      <main className="p-4 md:p-8 transition-all">
        <Outlet />
      </main>
    </div>
  );
}

