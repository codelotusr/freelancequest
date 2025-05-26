import { Modal, Button } from "flowbite-react";
import { FaCheck, FaExternalLinkAlt, FaTrashAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

type Application = {
  id: number;
  applicant: number;
  applicant_name: string;
  applicant_username: string;
  status: string;
  status_display: string;
  applied_at: string;
};

interface ApplicantsModalProps {
  gig: {
    id: number;
    title: string;
    applications: Application[];
  };
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (freelancerId: number) => Promise<void>;
  onReject: (freelancerId: number) => Promise<void>;
}

export default function ApplicantsModal({
  gig,
  isOpen,
  onClose,
  onConfirm,
  onReject,
}: ApplicantsModalProps) {
  const navigate = useNavigate();
  if (!gig) return null;

  const applications = gig?.applications || [];

  return (
    <Modal show={isOpen} onClose={onClose} size="lg">
      <div className="p-6 space-y-6 bg-white dark:bg-gray-800 rounded-lg">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          Paraiškos darbui: <span className="text-violet-500">{gig?.title}</span>
        </h3>

        {applications.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 italic">
            Nėra jokių paraiškų šiam pasiūlymui.
          </p>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {applications.map((app) => (
              <div
                key={app.id}
                className="flex justify-between items-center border border-gray-700 rounded-lg p-3 bg-gray-900"
              >
                <p className="text-white text-sm font-medium truncate max-w-[40%]">
                  {app.applicant_name}
                </p>

                <div className="flex gap-2 flex-nowrap">
                  <Button
                    size="xs"
                    color="blue"
                    onClick={() => navigate(`/profile/${app.applicant_username}`)}
                    className="flex items-center gap-1"
                  >
                    <FaExternalLinkAlt className="text-xs" />
                    Profilis
                  </Button>

                  <Button
                    size="xs"
                    color="green"
                    onClick={() => onConfirm(app.applicant)}
                    className="flex items-center gap-1"
                  >
                    <FaCheck className="text-xs" />
                    Patvirtinti
                  </Button>

                  <Button
                    size="xs"
                    color="red"
                    onClick={() => onReject(app.applicant)}
                    className="flex items-center gap-1"
                  >
                    <FaTrashAlt className="text-xs" />
                    Atmesti
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-6 border-t border-gray-700">
          <Button color="gray" onClick={onClose}>
            Uždaryti
          </Button>
        </div>
      </div>
    </Modal>
  );
}

