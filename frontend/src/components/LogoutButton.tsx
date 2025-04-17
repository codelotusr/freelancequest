import { Button } from "flowbite-react";
import { useAuth } from "../context/useAuth";

export default function LogoutButton() {
  const { logoutUser } = useAuth();

  const handleLogout = async () => {
    await logoutUser();
  };

  return (
    <Button
      size="sm"
      color="gray"
      onClick={handleLogout}
    >
      Atsijungti
    </Button>
  );
}

