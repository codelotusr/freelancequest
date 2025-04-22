import { Modal, Button } from "flowbite-react";
import { FaTrashAlt } from "react-icons/fa";

interface DeleteGigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  gigTitle?: string;
}

export default function DeleteGigModal({ isOpen, onClose, onConfirm, gigTitle }: DeleteGigModalProps) {
  return (
    <Modal show={isOpen} onClose={onClose} size="md">
      <div className="p-6 space-y-4 bg-white dark:bg-gray-800 rounded-lg">
        <div className="flex items-center gap-2">
          <FaTrashAlt className="text-red-500 text-lg" />
          <h3 className="text-lg font-semibold text-gray-600 dark:text-white">
            Ar tikrai norite ištrinti pasiūlymą?
          </h3>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Po ištrynimo šio pasiūlymo negalėsite atstatyti. Pasiūlymas <strong>{gigTitle}</strong> bus visam laikui pašalintas.
        </p>
        <div className="flex justify-end gap-2 pt-4">
          <Button color="gray" onClick={onClose}>
            Atšaukti
          </Button>
          <Button color="red" onClick={onConfirm}>
            Patvirtinti
          </Button>
        </div>
      </div>
    </Modal>
  );
}

