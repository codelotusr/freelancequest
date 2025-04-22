import { Navbar, Button, Avatar } from "flowbite-react";
import { Link, useNavigate } from "react-router-dom";
import DarkModeToggle from "./DarkModeToggle";
import LogoutButton from "../components/LogoutButton"
import { FaFlask, FaLevelUpAlt } from "react-icons/fa";
import { useAuth } from "../context/useAuth"

interface HeaderProps {
  variant?: "welcome" | "auth" | "onboarding" | "main";
}

export default function Header({ variant = "welcome" }: HeaderProps) {
  const user = useAuth().user;
  const navigate = useNavigate();

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

        {variant === "main" && user && (
          <>
            <div className="text-right">
              <p className="text-sm font-semibold">
                {user.first_name} {user.last_name}
              </p>
              {user.gamification_profile && (
                <p className="text-xs text-gray-500 dark:text-gray-300 flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <FaFlask className="text-blue-400" /> {user.gamification_profile.xp} XP
                  </span>
                  •
                  <span className="flex items-center gap-1">
                    <FaLevelUpAlt className="text-green-500" /> {user.gamification_profile.level} Lygis
                  </span>
                </p>

              )}
            </div>

            <Avatar
              img={user.profile_picture || undefined}
              alt={user.first_name}
              rounded
              className="cursor-pointer w-10 h-10"
              onClick={() => navigate(`/profile/${user.username}`)}
            />

            <LogoutButton />

          </>
        )}

      </div>
    </Navbar>
  );
}
