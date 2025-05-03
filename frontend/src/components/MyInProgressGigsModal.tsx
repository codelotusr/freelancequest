import { Modal, Button } from "flowbite-react";
import { useEffect, useState } from "react";
import api from "../services/axios";
import { FaFileUpload, FaCommentDots, FaComments } from "react-icons/fa";

interface MyInProgressGigsModalProps {
  show: boolean;
  onClose: () => void;
  onSubmitClick: (gig: any) => void;
}

export default function MyInProgressGigsModal({
  show,
  onClose,
  onSubmitClick,
}: MyInProgressGigsModalProps) {
  const [gigs, setGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (show) {
      api.get("/gigs/my").then((res) => {
        const activeGigs = res.data.filter((g: any) => g.status === "in_progress" || g.status === "pending");
        setGigs(activeGigs);
        setLoading(false);
      });
    }
  }, [show]);

  return (
    <Modal show={show} onClose={onClose}>
      <div className="p-6 bg-white dark:bg-gray-800 space-y-6 rounded-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white">Tavo vykdomi darbai</h2>

        {loading ? (
          <p className="text-gray-300">Kraunama...</p>
        ) : gigs.length === 0 ? (
          <p className="text-gray-400 italic">Šiuo metu nevykdai jokių darbų.</p>
        ) : (
          <ul className="space-y-4">
            {gigs.map((gig) => (
              <li
                key={gig.id}
                className="border border-gray-600 rounded-lg p-4 bg-gradient-to-br from-gray-800 via-gray-900 to-black"
              >
                <h3 className="text-white font-semibold">{gig.title}</h3>
                <p className="text-gray-300">{gig.description}</p>
                <p className="text-sm text-gray-400 mt-1">
                  Atlygis: <strong>{gig.price}€</strong>
                </p>

                <div className="flex justify-end gap-2 mt-4">
                  {gig.status === "in_progress" && (
                    <Button
                      size="xs"
                      color="green"
                      onClick={() => onSubmitClick(gig)}
                      className="flex items-center gap-1"
                    >
                      <FaFileUpload className="text-xs" /> Pateikti darbą
                    </Button>
                  )}

                  {gig.status === "pending" && gig.submission && (
                    <>
                      <a
                        href={gig.submission.file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block"
                      >
                        <Button
                          size="xs"
                          color="blue"
                          className="flex items-center gap-1"
                        >
                          <FaFileUpload className="text-xs" /> Atsisiųsti darbą
                        </Button>
                      </a>

                      <Button
                        size="xs"
                        color="green"
                        onClick={() => onSubmitClick(gig)}
                        className="flex items-center gap-1"
                      >
                        <FaFileUpload className="text-xs" /> Pakeisti darbą
                      </Button>
                    </>
                  )}

                  <Button
                    size="xs"
                    color="yellow"
                    disabled
                    className="flex items-center gap-1 opacity-60"
                  >
                    <FaCommentDots className="text-xs" /> Komentarai
                  </Button>

                  <Button
                    size="xs"
                    color="blue"
                    disabled
                    className="flex items-center gap-1 opacity-60"
                  >
                    <FaComments className="text-xs" /> Pokalbis
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

