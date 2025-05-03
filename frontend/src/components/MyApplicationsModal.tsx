import { Modal, Button } from "flowbite-react";
import { useEffect, useState } from "react";
import api from "../services/axios";
import toast from "react-hot-toast";


interface MyApplicationsModalProps {
  show: boolean;
  onClose: () => void;
  onViewGig: (gigId: number) => void;
}


export default function MyApplicationsModal({ show, onClose, onViewGig }: MyApplicationsModalProps) {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (show) {
      setLoading(true);
      api.get("/applications/my").then((res) => {
        setApplications(res.data);
        setLoading(false);
      });
    }
  }, [show]);

  const handleCancel = async (gigId: number, applicantId: number) => {
    try {
      await api.delete(`/gigs/${gigId}/applications/${applicantId}/`);
      toast.success("Paraiška atšaukta!");
      setApplications((prev) => prev.filter((a) => a.gig !== gigId));
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Nepavyko atšaukti paraiškos.");
    }
  };

  return (
    <Modal show={show} onClose={onClose}>
      <div className="p-6 bg-white dark:bg-gray-800 space-y-6 rounded-lg">
        <h2 className="text-xl font-bold text-white">Tavo paraiškos</h2>

        {loading ? (
          <p className="text-gray-300">Kraunama...</p>
        ) : applications.length === 0 ? (
          <p className="text-gray-400 italic">Nesi pateikęs jokių paraiškų.</p>
        ) : (
          <ul className="space-y-4 max-h-[400px] overflow-y-auto">
            {applications.map((app) => (
              <li
                key={app.id}
                className="border border-gray-600 rounded-lg p-4 bg-gradient-to-br from-gray-800 via-gray-900 to-black flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div>
                  <h3 className="text-white font-semibold">{app.gig_title}</h3>
                  <p className="text-gray-300 text-sm">Būsena: {app.status_display}</p>
                  <p className="text-sm text-gray-400">
                    Pateikta: {new Date(app.applied_at).toLocaleString()}
                  </p>
                </div>

                <div className="flex gap-2 sm:ml-auto">
                  <Button
                    size="xs"
                    color="blue"
                    onClick={() => onViewGig(app.gig)}
                  >
                    Peržiūrėti
                  </Button>
                  <Button
                    size="xs"
                    color="red"
                    onClick={() => handleCancel(app.gig, app.applicant)}
                  >
                    Atšaukti
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


