import { Modal, Button, Label, TextInput, Textarea } from "flowbite-react";
import { useState, useEffect } from "react";

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
  };
}


export default function GigModal({ isOpen, onClose, onSubmit, initialData }: GigModalProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [price, setPrice] = useState(initialData?.price?.toString() || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          Paskelbk naują pasiūlymą
        </h3>

        <div>
          <Label htmlFor="title">Pavadinimas</Label>
          <TextInput
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="pvz. Reikia svetainės dizaino"
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Aprašymas</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Trumpas darbo aprašymas..."
            rows={4}
            required
          />
        </div>

        <div>
          <Label htmlFor="price">Pradinė kaina (€)</Label>
          <TextInput
            id="price"
            type="number"
            min="1"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="100"
            required
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button color="gray" onClick={onClose}>
            Atšaukti
          </Button>
          <Button disabled={isSubmitting || !title || !description || !price} onClick={handleSubmit}>
            {isSubmitting ? "Išsaugoma..." : initialData ? "Atnaujinti" : "Sukurti"}
          </Button>

        </div>
      </div>
    </Modal>
  );
}

