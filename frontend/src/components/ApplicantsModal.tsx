import { Modal, Button } from "flowbite-react";
import { FaUser, FaCheck, FaEnvelope, FaExternalLinkAlt, FaTrashAlt } from "react-icons/fa";
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
      <div className="p-6 space-y-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Paraiškos darbui:{" "}
          <span className="text-violet-500">{gig?.title || "—"}</span>
        </h3>

        {applications.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 italic">
            Nėra jokių paraiškų šiam pasiūlymui.
          </p>
        ) : (
          <ul className="space-y-4">
            {applications.map((application) => (
              <li
                key={application.id}
                className="flex justify-between items-center border-b border-gray-700 pb-2"
              >
                <div className="text-sm text-gray-100">
                  <p className="font-medium">
                    <FaUser className="inline-block mr-1 text-white" />
                    {application.applicant_name}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="xs"
                    color="blue"
                    onClick={() => navigate(`/profile/${application.applicant_username}`)}
                    className="flex items-center gap-1"
                  >
                    <FaExternalLinkAlt className="text-xs" />
                    Profilis
                  </Button>

                  <Button
                    size="xs"
                    color="green"
                    onClick={() => onConfirm(application.applicant)}
                    className="flex items-center gap-1"
                  >
                    <FaCheck className="text-xs" />
                    Patvirtinti
                  </Button>

                  <Button
                    size="xs"
                    color="red"
                    onClick={() => onReject(application.applicant)}
                    className="flex items-center gap-1"
                  >
                    <FaTrashAlt className="text-xs" /> Atmesti
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="flex justify-end pt-4">
          <Button color="gray" onClick={onClose}>
            Uždaryti
          </Button>
        </div>
      </div>
    </Modal>
  );
}

