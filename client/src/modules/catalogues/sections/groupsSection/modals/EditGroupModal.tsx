import React, { Fragment, useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Dialog, Transition } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolder, faSpinner, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

import { cataloguesApi } from '../../../../../core/config/api';
import type { ServiceGroup } from '../components/GroupsSectionDataTable';

import { 
  FormInput, 
  FormSectionHeader, 
  ModalHeader, 
  MainButton, 
  CancelButton, 
  ConfirmationModal, 
  useToast 
} from '../../../../../shared/components/index';

import { Toggle } from '../../../../../shared/components/toggle/Toggle';

// Esquema de Validación Zod
const groupSchema = z.object({
  service_group_name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  code: z.string().min(1, "El código es requerido"),
  description: z.string().min(5, "La descripción debe tener al menos 5 caracteres"),
  status: z.boolean(),
});

type GroupFormData = z.infer<typeof groupSchema>;

interface EditGroupModalProps {
  group: ServiceGroup | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditGroupModal: React.FC<EditGroupModalProps> = ({ group, isOpen, onClose }) => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // Estados para controlar los modales de confirmación
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<GroupFormData | null>(null);

  const { register, handleSubmit, control, formState: { errors, isDirty }, reset } = useForm<GroupFormData>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      service_group_name: '',
      code: '',
      description: '',
      status: true,
    },
  });

  // Precargar los datos del grupo en el formulario cuando cambie el prop 'group'
  useEffect(() => {
    if (group) {
      reset({
        service_group_name: group.service_group_name || '',
        code: group.code || '',
        description: group.description || '',
        status: group.status !== undefined ? group.status : true,
      });
    }
  }, [group, reset]);

  // Mutación de TanStack Query para Actualizar
  const mutation = useMutation({
    mutationFn: async (data: GroupFormData) => {
      const groupId = group?.id_service_group;

      if (!groupId) {
        throw new Error('No se encontró el ID del grupo a actualizar.');
      }

      const payload = {
        code: data.code.trim(),
        service_group_name: data.service_group_name.trim(),
        description: data.description.trim(),
        status: data.status,
      };

      return await axios.put(`${cataloguesApi.baseUrl}/service-groups/${groupId}`, payload, {
        withCredentials: true,
      });
    },
    onSuccess: () => {
      showToast({
        type: 'success',
        title: 'Grupo Actualizado',
        message: 'Los cambios del grupo se han guardado exitosamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['catalogues', 'groups'] });
      handleCloseAll();
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || error.message || 'Error al actualizar el grupo';
      showToast({
        type: 'error',
        title: 'Error',
        message: msg,
      });
    },
  });

  // Limpieza total al cerrar
  const handleCloseAll = () => {
    reset();
    setShowSaveConfirm(false);
    setShowCancelConfirm(false);
    setPendingFormData(null);
    onClose();
  };

  // Submit del Formulario
  const onSubmitForm = (data: GroupFormData) => {
    if (!isDirty) {
      showToast({
        type: 'info',
        title: 'Sin cambios',
        message: 'No has realizado ninguna modificación.',
      });
      return;
    }
    setPendingFormData(data);
    setShowSaveConfirm(true);
  };

  // Intentar cerrar modal
  const handleAttemptClose = () => {
    if (isDirty) {
      setShowCancelConfirm(true);
    } else {
      handleCloseAll();
    }
  };

  // Confirmación de Guardado
  const handleConfirmSave = async () => {
    if (pendingFormData) {
      await mutation.mutateAsync(pendingFormData);
    }
  };

  return (
    <>
      {/* MODAL PRINCIPAL */}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={handleAttemptClose}>
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
                <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all flex flex-col max-h-[90vh]">
                  
                  <ModalHeader title="Editar Grupo de Catálogo" onClose={handleAttemptClose} />

                  <div className="flex-1 overflow-y-auto p-6">
                    <form id="edit-group-form" onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
                      
                      <div>
                        <FormSectionHeader
                          icon={<FontAwesomeIcon icon={faFolder} />}
                          title="Información del Grupo"
                          variant="blue"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Nombre del Grupo */}
                          <div className="md:col-span-2">
                            <FormInput 
                              label="Nombre del Grupo" 
                              placeholder="Ej: Grupo de Especialidades Quirúrgicas" 
                              error={errors.service_group_name?.message} 
                              {...register('service_group_name')} 
                            />
                          </div>

                          {/* Código */}
                          <div className="md:col-span-2">
                            <FormInput 
                              label="Código del Grupo" 
                              placeholder="Ej: GRP-001" 
                              error={errors.code?.message} 
                              {...register('code')} 
                            />
                          </div>

                          {/* Descripción */}
                          <div className="md:col-span-2 flex flex-col gap-1">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                              Descripción
                            </label>
                            <textarea
                              rows={3}
                              placeholder="Ingresa una breve descripción de este grupo..."
                              className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-hidden focus:ring-2 focus:ring-offset-1 ${
                                errors.description 
                                  ? 'border-red-500 focus:ring-red-400' 
                                  : 'border-slate-300 focus:border-[var(--main-color,#2563eb)] focus:ring-[var(--main-color,#2563eb)]'
                              }`}
                              {...register('description')}
                            />
                            {errors.description && (
                              <span className="text-xs text-red-500 mt-0.5">
                                {errors.description.message}
                              </span>
                            )}
                          </div>

                          {/* Estado (Toggle) */}
                          <div className="md:col-span-2 pt-2">
                            <Controller
                              name="status"
                              control={control}
                              render={({ field: { value, onChange } }) => (
                                <Toggle
                                  checked={value}
                                  onChange={onChange}
                                  label="Estado del Grupo"
                                  description={value ? "El grupo está activo y disponible en el catálogo." : "El grupo está inactivo e invisibilizado."}
                                  activeIcon={faCheck}
                                  inactiveIcon={faTimes}
                                  size="md"
                                />
                              )}
                            />
                          </div>

                        </div>
                      </div>

                    </form>
                  </div>

                  {/* Footer con Botones */}
                  <div className="flex justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50">
                    <CancelButton 
                      type="button" 
                      onClick={handleAttemptClose} 
                      disabled={mutation.isPending}
                    >
                      Cancelar
                    </CancelButton>
                    <MainButton 
                      type="submit" 
                      form="edit-group-form" 
                      disabled={mutation.isPending}
                    >
                      {mutation.isPending ? (
                        <span className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                          Actualizando...
                        </span>
                      ) : (
                        'Guardar Cambios'
                      )}
                    </MainButton>
                  </div>

                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* MODAL DE CONFIRMACIÓN: CANCELAR */}
      <ConfirmationModal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleCloseAll}
        title="¿Descartar cambios?"
        description="Tienes cambios no guardados. Si cancelas ahora, se perderán las modificaciones realizadas."
        confirmText="Sí, descartar"
        cancelText="Continuar editando"
        variant="warning"
        disabled={mutation.isPending}
      />

      {/* MODAL DE CONFIRMACIÓN: GUARDAR */}
      <ConfirmationModal
        isOpen={showSaveConfirm}
        onClose={() => setShowSaveConfirm(false)}
        onConfirm={handleConfirmSave}
        title="Confirmar Edición"
        description={`¿Estás seguro de actualizar la información del grupo "${pendingFormData?.service_group_name || ''}"?`}
        confirmText="Sí, guardar cambios"
        cancelText="Revisar formulario"
        variant="info"
        disabled={mutation.isPending}
      />
    </>
  );
};

export default EditGroupModal;