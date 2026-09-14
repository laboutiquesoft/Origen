import React, { Fragment, useState } from 'react';
import { Controller } from 'react-hook-form';
import { useForm as useHookForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Dialog, Transition } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeartPulse, faSpinner, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

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
import { Toggle } from '../../../../../shared/components/index';

const epsSchema = z.object({
  eps_name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  code: z.string().optional(),
  status: z.boolean(),
});

type EpsFormData = z.infer<typeof epsSchema>;

interface CreateEpsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateEpsModal: React.FC<CreateEpsModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<EpsFormData | null>(null);

  const { register, handleSubmit, control, formState: { errors }, reset } = useHookForm<EpsFormData>({
    resolver: zodResolver(epsSchema),
    defaultValues: {
      eps_name: '',
      code: '',
      status: true,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: EpsFormData) => {
      const payload = {
        code: data.code?.trim() || `EPS-${Date.now().toString().slice(-6)}`,
        eps_name: data.eps_name,
        status: data.status,
      };

      return await axios.post(`${cataloguesApi.baseUrl}/eps`, payload, {
        withCredentials: true,
      });
    },
    onSuccess: () => {
      showToast({
        type: 'success',
        title: 'EPS Creada',
        message: 'La EPS ha sido registrada exitosamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['catalogues', 'eps'] });
      handleCloseAll();
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Error al crear la EPS';
      showToast({
        type: 'error',
        title: 'Error',
        message: msg,
      });
    },
  });

  const handleCloseAll = () => {
    reset();
    setShowSaveConfirm(false);
    setShowCancelConfirm(false);
    setPendingFormData(null);
    onClose();
  };

  const onSubmitForm = (data: EpsFormData) => {
    setPendingFormData(data);
    setShowSaveConfirm(true);
  };

  const handleConfirmSave = async () => {
    if (pendingFormData) {
      await mutation.mutateAsync(pendingFormData);
    }
  };

  return (
    <>
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
                  
                  <ModalHeader title="Crear Nueva EPS" onClose={() => setShowCancelConfirm(true)} />

                  <div className="flex-1 overflow-y-auto p-6">
                    <form id="create-eps-form" onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
                      <div>
                        <FormSectionHeader
                          icon={<FontAwesomeIcon icon={faHeartPulse} />}
                          title="Información de la EPS"
                          variant="blue"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <FormInput
                              label="Nombre de la EPS"
                              placeholder="Ej: Sanitas EPS"
                              error={errors.eps_name?.message}
                              {...register('eps_name')}
                            />
                          </div>

                          <div className="md:col-span-2">
                            <FormInput
                              label="Código (Opcional)"
                              placeholder="Ej: EPS-001"
                              error={errors.code?.message}
                              {...register('code')}
                            />
                          </div>

                          <div className="md:col-span-2 pt-2">
                            <Controller
                              name="status"
                              control={control}
                              render={({ field: { value, onChange } }) => (
                                <Toggle
                                  checked={value}
                                  onChange={onChange}
                                  label="Estado de la EPS"
                                  description={value ? "La EPS estará activa y disponible en el catálogo." : "La EPS se creará inactiva."}
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
                      form="create-eps-form"
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

      <ConfirmationModal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleCloseAll}
        title="¿Descartar cambios?"
        description="Si cancelas ahora, se perderán todos los datos ingresados."
        confirmText="Sí, descartar"
        cancelText="Continuar editando"
        variant="warning"
        disabled={mutation.isPending}
      />

      <ConfirmationModal
        isOpen={showSaveConfirm}
        onClose={() => setShowSaveConfirm(false)}
        onConfirm={handleConfirmSave}
        title="Confirmar Creación"
        description={`¿Estás seguro de registrar la EPS "${pendingFormData?.eps_name || ''}"?`}
        confirmText="Sí, crear EPS"
        cancelText="Revisar formulario"
        variant="info"
        disabled={mutation.isPending}
      />
    </>
  );
};

export default CreateEpsModal;