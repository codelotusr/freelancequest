import { Modal, Button, Label, Textarea, Select, Spinner } from "flowbite-react";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import api from "../services/axios";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaStar,
  FaFileDownload,
  FaCommentDots,
  FaFileAlt,
} from "react-icons/fa";

interface SubmissionReviewModalProps {
  show: boolean;
  onClose: () => void;
  gig: any;
  onSuccess: () => void;
}

function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || "";
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
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(false);

  const latestSubmission = gig?.latest_submission;
  const isReviewComplete = gig?.status === "completed" || !!gig?.review;

  useEffect(() => {
    if (gig?.id && show) {
      setLoadingSubs(true);
      api
        .get(`/gigs/${gig.id}/submissions/`)
        .then((res) => setSubmissions(res.data))
        .catch(() => toast.error("Nepavyko gauti darbų pateikimų"))
        .finally(() => setLoadingSubs(false));
    }
  }, [gig?.id, show]);

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

  if (!gig || !latestSubmission) return null;

  return (
    <Modal show={show} onClose={onClose} size="lg">
      <div className="p-6 space-y-6 bg-white dark:bg-gray-900 rounded-xl shadow-xl">
        <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
          <FaCheckCircle className="text-green-500" />
          Darbo pateikimai
        </h3>

        {loadingSubs ? (
          <div className="flex justify-center py-6">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {submissions.map((sub) => {
              const isLatest = sub.id === latestSubmission.id;
              const ext = getFileExtension(sub.file_url || "");

              return (
                <div
                  key={sub.id}
                  className={`p-4 rounded-lg border space-y-2 ${isLatest
                      ? "border-green-500 bg-green-50 dark:bg-green-900"
                      : "border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                    }`}
                >
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Pateikta: {new Date(sub.submitted_at).toLocaleString("lt-LT")}
                    {isLatest && <span className="ml-2 text-green-600 font-semibold">(naujausia)</span>}
                  </p>
                  <p className="text-gray-800 dark:text-gray-100 whitespace-pre-line">{sub.message}</p>

                  {/* Preview logic */}
                  {ext === "pdf" && (
                    <iframe
                      src={sub.file_url}
                      className="w-full h-64 border rounded-md"
                      title="PDF Preview"
                    />
                  )}

                  {["png", "jpg", "jpeg", "gif", "webp"].includes(ext) && (
                    <img
                      src={sub.file_url}
                      alt="Pateiktas vaizdas"
                      className="rounded-lg border w-full max-h-80 object-contain"
                    />
                  )}

                  {!["pdf", "png", "jpg", "jpeg", "gif", "webp"].includes(ext) && sub.file_url && (
                    <a
                      href={sub.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <FaFileDownload /> Atsisiųsti failą
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!isReviewComplete && !showReview && (
          <div className="flex justify-end gap-3 pt-4">
            <Button color="gray" onClick={onClose}>
              Uždaryti
            </Button>
            <Button
              color="red"
              onClick={handleDecline}
              disabled={loading}
              className="flex items-center gap-1"
            >
              <FaTimesCircle /> Atmesti
            </Button>
            <Button
              color="green"
              onClick={handleApprove}
              className="flex items-center gap-1"
            >
              <FaCheckCircle /> Patvirtinti ir palikti atsiliepimą
            </Button>
          </div>
        )}

        {!isReviewComplete && showReview && (
          <div className="space-y-4 pt-2">
            <div>
              <Label htmlFor="feedback" className="text-gray-800 dark:text-gray-200">
                Atsiliepimas
              </Label>
              <Textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Ką manote apie darbą?"
                rows={4}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="rating" className="text-gray-800 dark:text-gray-200">
                Įvertinimas
              </Label>
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
              <Button
                color="green"
                onClick={handleSubmitReview}
                disabled={loading}
                className="flex items-center gap-1"
              >
                <FaCheckCircle />
                {loading ? "Pateikiama..." : "Pateikti atsiliepimą"}
              </Button>
            </div>
          </div>
        )}

        {isReviewComplete && (
          <div className="text-center text-gray-600 dark:text-gray-400 font-medium pt-4">
            <p className="flex justify-center items-center gap-2">
              <FaCheckCircle className="text-green-500" />
              Darbas jau peržiūrėtas ir patvirtintas.
            </p>
            <div className="pt-4">
              <Button color="gray" onClick={onClose}>Uždaryti</Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

