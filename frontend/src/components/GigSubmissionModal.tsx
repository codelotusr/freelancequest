import { Modal, Button, Textarea, Label, FileInput } from "flowbite-react";
import { useState } from "react";
import api from "../services/axios";
import toast from "react-hot-toast";

interface GigSubmissionModalProps {
  gigId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

export default function GigSubmissionModal({
  gigId,
  isOpen,
  onClose,
  onSubmitted,
}: GigSubmissionModalProps) {
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!gigId) return;
    if (!file) {
      toast.error("Pridėkite failą prieš pateikdami darbą.");
      return;
    }

    const formData = new FormData();
    formData.append("message", message);
    formData.append("file", file);

    setIsSubmitting(true);
    try {
      await api.post(`/gigs/${gigId}/submit_work/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Darbas sėkmingai pateiktas!");
      setMessage("");
      setFile(null);
      onClose();
      if (onSubmitted) onSubmitted();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Nepavyko pateikti darbo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={isOpen} onClose={onClose}>
      <div className="p-6 bg-white dark:bg-gray-800 space-y-6 rounded-lg">
        <h2 className="text-xl font-bold text-white">Pateikti atliktą darbą</h2>

        <div>
          <Label htmlFor="message">Žinutė</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Aprašykite pateikiamą darbą..."
            rows={4}
            required
          />
        </div>

        <div>
          <Label htmlFor="file">Failas</Label>
          <FileInput
            id="file"
            onChange={(e) => {
              if (e.target.files?.length) setFile(e.target.files[0]);
            }}
            required
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button color="gray" onClick={onClose}>
            Atšaukti
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !file}
            color="green"
          >
            {isSubmitting ? "Pateikiama..." : "Pateikti"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

