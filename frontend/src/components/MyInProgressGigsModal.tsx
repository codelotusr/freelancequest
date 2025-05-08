import { Modal, Button } from "flowbite-react";
import { useEffect, useState } from "react";
import api from "../services/axios";
import {
  FaFileUpload,
  FaCommentDots,
  FaComments,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaEye,
} from "react-icons/fa";
import ChatModal from "../components/ChatModal";
import GigModal from "../components/GigModal";

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
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [chatPartnerUsername, setChatPartnerUsername] = useState<string | null>(null);
  const [selectedGig, setSelectedGig] = useState<any | null>(null);
  const [isGigModalOpen, setIsGigModalOpen] = useState(false);

  useEffect(() => {
    if (show) {
      api.get("/gigs/my").then((res) => {
        const activeGigs = res.data.filter(
          (g: any) => g.status === "in_progress" || g.status === "pending"
        );
        setGigs(activeGigs);
        setLoading(false);
      });
    }
  }, [show]);

  return (
    <Modal show={show} onClose={onClose} size="lg">
      <div className="p-6 bg-white dark:bg-gray-900 space-y-6 rounded-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white">Tavo vykdomi darbai</h2>

        {loading ? (
          <p className="text-gray-300">Kraunama...</p>
        ) : gigs.length === 0 ? (
          <p className="text-gray-400 italic">Šiuo metu nevykdai jokių darbų.</p>
        ) : (
          <ul className="space-y-4">
            {gigs.map((gig) => (
              <li
                key={gig.id}
                className="border border-gray-700 rounded-xl p-5 bg-gradient-to-br from-gray-800 via-gray-900 to-black"
              >
                <div className="mb-4 space-y-1">
                  <h3 className="text-lg font-bold text-white">{gig.title}</h3>
                </div>

                <div className="flex gap-6 text-sm text-gray-300 mb-4">
                  <div className="flex items-center gap-2">
                    <FaMoneyBillWave className="text-green-400" />
                    <span>
                      <strong>{gig.price} €</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-blue-400" />
                    <span>
                      {gig.due_date
                        ? new Date(gig.due_date).toLocaleDateString("lt-LT")
                        : "Nenurodyta"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                  <Button
                    size="xs"
                    color="blue"
                    onClick={() => {
                      setSelectedGig(gig);
                      setIsGigModalOpen(true);
                    }}
                    className="flex items-center gap-1 justify-center"
                  >
                    <FaEye className="text-xs" /> Peržiūrėti darbą
                  </Button>

                  {gig.status === "in_progress" && (
                    <Button
                      size="xs"
                      color="green"
                      onClick={() => onSubmitClick(gig)}
                      className="flex items-center gap-1 justify-center"
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
                        className="block"
                      >
                        <Button
                          size="xs"
                          color="purple"
                          className="flex items-center gap-1 justify-center w-full"
                        >
                          <FaFileUpload className="text-xs" /> Atsisiųsti darbą
                        </Button>
                      </a>

                      <Button
                        size="xs"
                        color="green"
                        onClick={() => onSubmitClick(gig)}
                        className="flex items-center gap-1 justify-center"
                      >
                        <FaFileUpload className="text-xs" /> Pakeisti darbą
                      </Button>
                    </>
                  )}

                  <Button
                    size="xs"
                    color="indigo"
                    disabled
                    className="flex items-center gap-1 opacity-60 justify-center"
                  >
                    <FaCommentDots className="text-xs" /> Komentarai
                  </Button>

                  <Button
                    size="xs"
                    color="yellow"
                    onClick={() => {
                      const partner = gig.client_username;
                      if (partner) {
                        setChatPartnerUsername(partner);
                        setChatModalOpen(true);
                      }
                    }}
                    className="flex items-center gap-1 justify-center"
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

        {chatPartnerUsername && (
          <ChatModal
            show={chatModalOpen}
            onClose={() => {
              setChatModalOpen(false);
              setChatPartnerUsername(null);
            }}
            otherUsername={chatPartnerUsername}
          />
        )}

        {selectedGig && (
          <GigModal
            isOpen={isGigModalOpen}
            onClose={() => {
              setIsGigModalOpen(false);
              setSelectedGig(null);
            }}
            initialData={selectedGig}
            onSubmit={() => {
              setIsGigModalOpen(false);
              setSelectedGig(null);
            }}
          />
        )}
      </div>
    </Modal>
  );
}

