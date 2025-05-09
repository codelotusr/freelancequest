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

  const handleApprove = () => setShowReview(true);

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

  const submission = gig?.latest_submission;

  if (!submission) return null;

  const isReviewComplete = gig.status === "completed" || !!gig.review;

  return (
    <Modal show={show} onClose={onClose} size="lg">
      <div className="p-6 space-y-6 bg-white dark:bg-gray-900 rounded-lg">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          Darbo pateikimas
        </h3>

        <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap border border-gray-300 dark:border-gray-700 rounded p-4 bg-gray-50 dark:bg-gray-800">
          {submission.message}
        </div>

        <a
          href={submission.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-blue-500 hover:underline font-medium"
        >
          Atsisiųsti pateiktą failą
        </a>

        {!isReviewComplete && !showReview && (
          <div className="flex justify-end gap-2 pt-4">
            <Button color="gray" onClick={onClose}>
              Uždaryti
            </Button>
            {gig.status !== "completed" && (
              <>
                <Button color="red" onClick={handleDecline} disabled={loading}>
                  Atmesti
                </Button>
                <Button color="green" onClick={handleApprove}>
                  Patvirtinti ir rašyti atsiliepimą
                </Button>
              </>
            )}
          </div>
        )}

        {!isReviewComplete && showReview && (
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="feedback">Atsiliepimas</Label>
              <Textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Įveskite komentarą apie atliktą darbą..."
                className="mt-1"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="rating">Įvertinimas</Label>
              <Select
                id="rating"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="mt-1"
              >
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

        {isReviewComplete && (
          <div className="flex justify-end pt-4">
            <Button color="gray" onClick={onClose}>
              Uždaryti
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}

