import { Modal, Button, Label, Textarea, Select } from "flowbite-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import api from "../services/axios";

interface SubmissionReviewModalProps {
  show: boolean;
  onClose: () => void;
  gig: any;
  onSuccess: () => void;
}

export default function SubmissionAndReviewModal({
  show,
  onClose,
  gig,
  onSuccess,
}: SubmissionReviewModalProps) {
  const [showReview, setShowReview] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState("5");
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setShowReview(true);
  };

  const handleDecline = async () => {
    try {
      setLoading(true);
      await api.post(`/gigs/${gig.id}/decline_submission/`);
      toast.success("Darbas atmestas. Specialistas gali pateikti iš naujo.");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Nepavyko atmesti darbo.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    try {
      setLoading(true);
      await api.post(`/gigs/${gig.id}/approve_submission/`, {
        rating: parseInt(rating),
        feedback,
      });
      toast.success("Darbas patvirtintas ir atsiliepimas pateiktas!");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Nepavyko pateikti atsiliepimo.");
    } finally {
      setLoading(false);
    }
  };


  if (!gig?.submission) return null;

  return (
    <Modal show={show} onClose={onClose}>
      <div className="p-6 space-y-6 bg-white dark:bg-gray-800 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Darbo pateikimas
        </h3>

        <p className="text-gray-300 whitespace-pre-wrap">{gig.submission.message}</p>

        <a
          href={gig.submission.file}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 underline"
        >
          Atsisiųsti pateiktą failą
        </a>

        {!showReview ? (
          <div className="flex justify-end gap-2 pt-4">
            <Button color="red" onClick={handleDecline} disabled={loading}>
              Atmesti
            </Button>
            <Button color="green" onClick={handleApprove}>
              Patvirtinti ir rašyti atsiliepimą
            </Button>
          </div>
        ) : (
          <div className="space-y-4 pt-4">
            <div>
              <Label>Atsiliepimas</Label>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Įveskite komentarą apie atliktą darbą..."
              />
            </div>

            <div>
              <Label>Įvertinimas</Label>
              <Select value={rating} onChange={(e) => setRating(e.target.value)}>
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>
                    {r} ★
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button color="gray" onClick={onClose}>
                Atšaukti
              </Button>
              <Button color="green" onClick={handleSubmitReview} disabled={loading}>
                Pateikti atsiliepimą
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

