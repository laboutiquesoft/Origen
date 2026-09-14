import React from 'react';
import { Dialog } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLayerGroup,
  faHashtag,
  faAlignLeft,
  faShieldAlt,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';
import {
  CancelButton,
  FormSectionHeader,
  ModalHeader,
} from '../../../../../shared/components';
import type { ServiceGroup } from '../components/GroupsSectionDataTable';

interface GroupsSectionDetailModalProps {
  group: ServiceGroup | null;
  isOpen: boolean;
  onClose: () => void;
}

export const GroupsSectionDetailModal: React.FC<GroupsSectionDetailModalProps> = ({
  group,
  isOpen,
  onClose,
}) => {
  if (!group || !isOpen) return null;

  const groupName = group.service_group_name || 'Sin nombre';

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs transition-opacity" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
        <Dialog.Panel className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-10 my-8">
          
          <ModalHeader title="Detalles del Grupo / Sección" onClose={onClose} />

          <div className="p-6 space-y-6 text-sm text-gray-700 max-h-[72vh] overflow-y-auto">
            
            {/* Header del Objeto */}
            <div className="flex items-center space-x-3.5 p-3.5 bg-gray-50/80 rounded-lg border border-gray-200/80">
              <div className="w-12 h-12 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg shrink-0">
                <FontAwesomeIcon icon={faLayerGroup} />
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold text-gray-900 truncate">
                  {groupName}
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-500 font-mono">
                    CÓD: {group.code || 'Sin código'}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                      group.status
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                    }`}
                  >
                    {group.status ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            </div>

            {/* 1. Información Principal */}
            <div>
              <FormSectionHeader
                icon={<FontAwesomeIcon icon={faInfoCircle} />}
                title="Información General"
                description="Datos de identificación y clasificación dentro del catálogo."
                variant="indigo"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50/80 border border-gray-100">
                  <FontAwesomeIcon icon={faHashtag} className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Código Identificador</p>
                    <p className="text-gray-800 font-semibold font-mono mt-0.5">{group.code || 'No asignado'}</p>
                  </div>
                </div>

                {/* <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50/80 border border-gray-100">
                  <FontAwesomeIcon icon={faHashtag} className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">ID de Registro</p>
                    <p className="text-gray-800 font-semibold font-mono mt-0.5">{group.id_service_group || 'No disponible'}</p>
                  </div>
                </div> */}

                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50/80 border border-gray-100 md:col-span-2">
                  <FontAwesomeIcon icon={faAlignLeft} className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Descripción</p>
                    <p className="text-gray-800 font-medium mt-0.5 whitespace-pre-line">
                      {group.description || 'Sin descripción detallada.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Estado del Sistema */}
            <div>
              <FormSectionHeader
                icon={<FontAwesomeIcon icon={faShieldAlt} />}
                title="Estado y Visibilidad"
                description="Disponibilidad actual del registro en el sistema."
                variant="gray"
              />

              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50/80 border border-gray-100">
                  <FontAwesomeIcon icon={faShieldAlt} className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Estado Operativo</p>
                    <p className="text-gray-800 font-medium mt-0.5">
                      {group.status ? 'El grupo se encuentra activo y visible para su selección.' : 'El grupo está inactivo en el catálogo.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50/80 border-t border-gray-200">
            <CancelButton onClick={onClose}>
              Cerrar
            </CancelButton>
          </div>

        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default GroupsSectionDetailModal;