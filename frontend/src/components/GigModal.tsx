import { Modal, Button, Label, TextInput, Textarea } from "flowbite-react";
import { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";

interface GigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    price: number;
    id?: number;
  }) => Promise<void>;
  initialData?: {
    id?: number;
    title: string;
    description: string;
    price: number;
    client_name?: string;
    client_id?: number;
    client?: number;
  };
}


export default function GigModal({ isOpen, onClose, onSubmit, initialData }: GigModalProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [price, setPrice] = useState(initialData?.price?.toString() || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFreelancer = user?.role === "freelancer";
  const isClientOwner = user?.role === "client" && user?.pk === initialData?.client;

  useEffect(() => {
    setTitle(initialData?.title || "");
    setDescription(initialData?.description || "");
    setPrice(initialData?.price?.toString() || "");
  }, [initialData, isOpen]);

  const handleSubmit = async () => {
    if (!title || !description || !price) return;

    setIsSubmitting(true);
    await onSubmit({
      id: initialData?.id,
      title,
      description,
      price: parseFloat(price),
    });
    setIsSubmitting(false);
    setTitle("");
    setDescription("");
    setPrice("");
    onClose();
  };

  return (
    <Modal show={isOpen} onClose={onClose}>
      <div className="p-6 space-y-6 bg-white dark:bg-gray-800 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          {isFreelancer ? "Darbo pasiūlymo informacija" : isClientOwner ? "Redaguoti pasiūlymą" : "Darbo pasiūlymo peržiūra"}
        </h3>

        <div>
          <Label>Pavadinimas</Label>
          {isFreelancer ? (
            <p className="text-gray-200">{title}</p>
          ) : (
            <TextInput
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="pvz. Reikia svetainės dizaino"
              required
            />
          )}
        </div>

        <div>
          <Label>Aprašymas</Label>
          {isFreelancer ? (
            <p className="text-gray-200">{description}</p>
          ) : (
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Trumpas darbo aprašymas..."
              rows={4}
              required
            />
          )}
        </div>

        <div>
          <Label>Pradinė kaina (€)</Label>
          {isFreelancer ? (
            <p className="text-gray-200">{price}€</p>
          ) : (
            <TextInput
              id="price"
              type="number"
              min="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="100"
              required
            />
          )}
        </div>

        {isFreelancer && initialData?.client_name && (
          <div className="flex items-center gap-2">
            <span className="font-medium text-white">Klientas:</span>
            <button
              onClick={() => navigate(`/profile/${initialData.client_id}`)}
              className="text-blue-400 hover:underline"
            >
              {initialData.client_name}
            </button>
          </div>
        )}


        <div className="flex justify-end gap-2 pt-4">
          <Button color="gray" onClick={onClose}>
            {isFreelancer ? "Uždaryti" : "Atšaukti"}
          </Button>
          {(
            <Button
              disabled={isSubmitting || !title || !description || !price}
              onClick={handleSubmit}
            >
              {isSubmitting ? "Išsaugoma..." : initialData ? "Atnaujinti" : "Sukurti"}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );

}

