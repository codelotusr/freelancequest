import { Navbar, Button } from "flowbite-react";
import { Link } from "react-router-dom";
import DarkModeToggle from "./DarkModeToggle";
import LogoutButton from "../components/LogoutButton"

interface HeaderProps {
  variant?: "welcome" | "auth" | "onboarding";
}

export default function Header({ variant = "welcome" }: HeaderProps) {
  return (
    <Navbar fluid rounded className="shadow-md px-4 dark:bg-gray-900 dark:text-white">
      <Link
        to="/"
        className="text-xl font-semibold whitespace-nowrap text-blue-700 dark:text-white"
      >
        FreelanceQuest
      </Link>

      <div className="flex items-center gap-2">
        <DarkModeToggle />

        {variant === "welcome" && (
          <>
            <Link to="/register">
              <Button size="sm" className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                Registruotis
              </Button>
            </Link>
            <Link to="/login">
              <Button
                size="sm"
                outline
                className="border-blue-500 text-blue-500 hover:bg-blue-50 dark:border-white dark:text-white dark:hover:bg-gray-700"
              >
                Prisijungti
              </Button>
            </Link>
          </>
        )}

        {variant === "auth" && (
          <Link to="/">
            <Button size="sm" color="gray">
              Grįžti
            </Button>
          </Link>
        )}

        {variant === "onboarding" && (
          <LogoutButton />
        )}

      </div>
    </Navbar>
  );
}
