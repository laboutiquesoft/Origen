import React from 'react';
import { Dialog } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

interface ModalHeaderProps {
  title: string;
  onClose: () => void;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({ title, onClose }) => {
  return (
    <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-main-gradient bg-[length:200%_200%] animate-gradient">
      <Dialog.Title as="h3" className="text-xl font-bold text-white pl-3">
        {title}
      </Dialog.Title>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
        <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
      </button>
    </div>
  );
};