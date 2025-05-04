import { FaMedal } from "react-icons/fa";
import { motion } from "framer-motion";

type Props = {
  title: string;
  xp: number;
  points: number;
};

export default function MissionToast({ title, xp, points }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex items-center gap-4 px-5 py-4 rounded-xl bg-emerald-600 text-white shadow-2xl"
    >
      <FaMedal className="text-white text-3xl" />
      <div className="space-y-1">
        <div className="font-semibold text-lg leading-tight">Misija įvykdyta!</div>
        <div className="text-sm opacity-90">{title}</div>
        <div className="text-sm font-medium text-white/90">
          +{xp} XP • +{points} taškai
        </div>
      </div>
    </motion.div>
  );
}

