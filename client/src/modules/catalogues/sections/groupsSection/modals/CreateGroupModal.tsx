import React, { Fragment, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Dialog, Transition } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderPlus, faSpinner, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

import { cataloguesApi } from '../../../../../core/config/api';

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
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  code: z.string().optional(),
  description: z.string().min(5, "La descripción debe tener al menos 5 caracteres"),
  isActive: z.boolean(),
});

type GroupFormData = z.infer<typeof groupSchema>;

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // Estados para controlar los modales de confirmación
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<GroupFormData | null>(null);

  const { register, handleSubmit, control, formState: { errors }, reset } = useForm<GroupFormData>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      isActive: true,
    },
  });

  // Mutación de TanStack Query con payload corregido
  const mutation = useMutation({
    mutationFn: async (data: GroupFormData) => {
      // 🛠️ Mapeo de nombres para que coincida con la entidad ServiceGroup del Backend
      const payload = {
        // Si no ingresa código, genera uno básico para evitar que la validación falle
        code: data.code?.trim() || `GRP-${Date.now().toString().slice(-6)}`,
        service_group_name: data.name, // Mapeado desde 'name'
        description: data.description,
        status: data.isActive,         // Mapeado desde 'isActive'
      };

      return await axios.post(`${cataloguesApi.baseUrl}/service-groups`, payload, {
        withCredentials: true,
      });
    },
    onSuccess: () => {
      showToast({
        type: 'success',
        title: 'Grupo Creado',
        message: 'El grupo de catálogo ha sido registrado exitosamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['catalogues', 'groups'] });
      handleCloseAll();
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Error al crear el grupo';
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

  // 1. Submit del Formulario -> Abre modal de confirmación
  const onSubmitForm = (data: GroupFormData) => {
    setPendingFormData(data);
    setShowSaveConfirm(true);
  };

  // 2. Confirmación de Guardado -> Ejecuta la mutación
  const handleConfirmSave = async () => {
    if (pendingFormData) {
      await mutation.mutateAsync(pendingFormData);
    }
  };

  // 3. Confirmación de Cancelación -> Descarta cambios
  const handleConfirmCancel = () => {
    handleCloseAll();
  };

  return (
    <>
      {/* MODAL PRINCIPAL */}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setShowCancelConfirm(true)}>
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
                  
                  <ModalHeader title="Crear Nuevo Grupo" onClose={() => setShowCancelConfirm(true)} />

                  <div className="flex-1 overflow-y-auto p-6">
                    <form id="create-group-form" onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
                      
                      <div>
                        <FormSectionHeader
                          icon={<FontAwesomeIcon icon={faFolderPlus} />}
                          title="Información del Grupo"
                          variant="blue"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Nombre del Grupo */}
                          <div className="md:col-span-2">
                            <FormInput 
                              label="Nombre del Grupo" 
                              placeholder="Ej: Grupo de Especialidades Quirúrgicas" 
                              error={errors.name?.message} 
                              {...register('name')} 
                            />
                          </div>

                          {/* Código (Opcional en formulario) */}
                          <div className="md:col-span-2">
                            <FormInput 
                              label="Código (Opcional)" 
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
                              name="isActive"
                              control={control}
                              render={({ field: { value, onChange } }) => (
                                <Toggle
                                  checked={value}
                                  onChange={onChange}
                                  label="Estado del Grupo"
                                  description={value ? "El grupo estará activo y disponible en el catálogo." : "El grupo se creará inactivo e invisibilizado."}
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
                      onClick={() => setShowCancelConfirm(true)} 
                      disabled={mutation.isPending}
                    >
                      Cancelar
                    </CancelButton>
                    <MainButton 
                      type="submit" 
                      form="create-group-form" 
                      disabled={mutation.isPending}
                    >
                      {mutation.isPending ? (
                        <span className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                          Guardando...
                        </span>
                      ) : (
                        'Aceptar'
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
        onConfirm={handleConfirmCancel}
        title="¿Descartar cambios?"
        description="Si cancelas ahora, se perderán todos los datos ingresados en este grupo."
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
        title="Confirmar Creación"
        description={`¿Estás seguro de registrar el grupo "${pendingFormData?.name || ''}"?`}
        confirmText="Sí, crear grupo"
        cancelText="Revisar formulario"
        variant="info"
        disabled={mutation.isPending}
      />
    </>
  );
};

export default CreateGroupModal;