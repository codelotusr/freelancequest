import { FaTrophy } from "react-icons/fa";
import { motion } from "framer-motion";

type Props = {
  title: string;
  description: string;
  icon?: string | null;
};

export default function BadgeToast({ title, description, icon }: Props) {
  const isEmoji = icon && !icon.startsWith("/");

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex items-center gap-4 px-5 py-4 rounded-xl bg-yellow-500 text-white shadow-2xl"
    >
      {icon ? (
        isEmoji ? (
          <span className="text-3xl">{icon}</span>
        ) : (
          <img
            src={`http://localhost:8000${icon}`}
            alt={title}
            className="w-10 h-10 rounded-full object-cover"
          />
        )
      ) : (
        <FaTrophy className="text-white text-3xl" />
      )}

      <div className="space-y-1">
        <div className="font-semibold text-lg leading-tight">Ženklelis atrakintas!</div>
        <div className="text-sm opacity-90">{title}</div>
        <div className="text-xs opacity-80">{description}</div>
      </div>
    </motion.div>
  );
}

