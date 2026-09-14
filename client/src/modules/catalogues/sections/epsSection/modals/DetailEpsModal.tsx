import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeartPulse, faHashtag, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

import { ModalHeader, CancelButton } from '../../../../../shared/components/index';
import type { Eps } from '../components/EpsSectionDataTable';

interface DetailEpsModalProps {
  eps: Eps | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DetailEpsModal: React.FC<DetailEpsModalProps> = ({ eps, isOpen, onClose }) => {
  if (!eps) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all flex flex-col max-h-[90vh]">
                
                <ModalHeader title="Detalles de la EPS" onClose={onClose} />

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg">
                        <FontAwesomeIcon icon={faHeartPulse} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase">Nombre</p>
                        <p className="text-base font-bold text-gray-800">{eps.eps_name}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200/60">
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase flex items-center gap-1">
                          <FontAwesomeIcon icon={faHashtag} className="text-gray-400" /> Código
                        </p>
                        <p className="text-sm font-mono font-medium text-gray-700 mt-0.5">
                          {eps.code || 'N/A'}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase">Estado</p>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mt-1 ${
                            eps.status
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          <FontAwesomeIcon icon={eps.status ? faCheckCircle : faTimesCircle} />
                          {eps.status ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end p-4 border-t border-gray-100 bg-gray-50">
                  <CancelButton type="button" onClick={onClose}>
                    Cerrar
                  </CancelButton>
                </div>

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default DetailEpsModal;