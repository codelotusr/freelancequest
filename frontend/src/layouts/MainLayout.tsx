import { useEffect, useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Navbar } from "flowbite-react";
import { Moon, Sun } from "lucide-react";

export default function MainLayout() {
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

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
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
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

