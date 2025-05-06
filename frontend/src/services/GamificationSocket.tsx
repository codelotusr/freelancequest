import { useEffect } from "react";
import { toast } from "react-hot-toast";
import MissionToast from "../components/MissionToast";
import BadgeToast from "../components/BadgeToast";
import { useAuth } from "../context/useAuth";

export default function GamificationSocket() {
  const { user, refreshUser } = useAuth();

  useEffect(() => {
    console.log("GamificationSocket mounted");

    if (!user) {
      console.log("No user found, skipping WebSocket connection.");
      return;
    }

    const token =
      localStorage.getItem("accessToken") ||
      document.cookie.match(/(?:^|; )access=([^;]*)/)?.[1];

    if (!token) {
      console.warn("No access token found for gamification WebSocket");
      return;
    }

    const socketUrl = `ws://localhost:8000/ws/gamification/?token=${token}`;
    let socket: WebSocket;

    try {
      socket = new WebSocket(socketUrl);
      console.log("Attempting WebSocket connection to:", socketUrl);
    } catch (err) {
      console.error("WebSocket creation failed:", err);
      return;
    }

    socket.onopen = () => {
      console.log("Gamification WebSocket connection opened");
    };

    socket.onerror = (error) => {
      console.error("Gamification WebSocket error:", error);
    };

    socket.onmessage = (event) => {
      console.log("Gamification WebSocket message received:", event.data);
      try {
        const data = JSON.parse(event.data);
        if (data.type === "mission_completed") {
          console.log("Mission completed received via WebSocket");
          toast.custom(
            <MissionToast title={data.title} xp={data.xp} points={data.points} />,
            { duration: 4000, position: "top-center" }
          );
          refreshUser();
        }
        if (data.type === "badge_unlocked") {
          toast.custom(
            <BadgeToast title={data.title} description={data.description} icon={data.icon} />,
            { duration: 4000, position: "top-center" }
          );
        }
      } catch (err) {
        console.error("Failed to parse WebSocket message:", err);
      }
    };

    socket.onclose = (event) => {
      console.warn("Gamification WebSocket closed", event);
    };

    return () => {
      socket.close();
    };
  }, [user]);

  return null;
}

