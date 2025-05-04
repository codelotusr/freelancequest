import { toast } from "react-hot-toast";
import api from "../services/axios";
import MissionToast from "../components/MissionToast";

export async function checkRecentMissions(refetchUser?: () => Promise<void>) {
  try {
    const res = await api.get("/gamification/progress/recent/");
    const unseen = res.data;

    if (unseen.length === 0) return;

    for (const missionProgress of unseen) {
      const mission = missionProgress.mission;
      toast.custom(
        <MissionToast
          title={mission.title}
          xp={mission.xp_reward}
          points={mission.point_reward}
        />,
        {
          duration: 4000,
          position: "top-center",
        }
      );

      await api.patch(`/gamification/progress/${missionProgress.id}/`, {
        seen: true,
      });

    }

    if (unseen.length && refetchUser) {
      await refetchUser();
    }

  } catch (err) {
    console.error("Failed to fetch recent missions", err);
  }
}

