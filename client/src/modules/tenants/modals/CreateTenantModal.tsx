import React, { Fragment, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Dialog, Transition } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faUserShield, faSpinner } from '@fortawesome/free-solid-svg-icons';

import { authApi } from '../../../core/config/api';

// Componentes Reutilizables
import { 
  FormInput, 
  FormSectionHeader, 
  ModalHeader, 
  MainButton, 
  CancelButton, 
  ConfirmationModal, 
  useToast 
} from '../../../shared/components/index';

const tenantSchema = z.object({
  name: z.string().min(3, "El nombre es requerido"),
  initials: z.string().min(2, "Siglas requeridas"),
  nit: z.string().min(5, "NIT requerido"),
  verification_code: z.string().optional(),
  habilitation_code: z.string().optional(),
  territorial_code: z.string().optional(),
  logoUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  country: z.string().min(2, "País requerido"),
  city: z.string().min(2, "Ciudad requerida"),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Email inválido"),
  adminFirstName: z.string().min(2, "Nombre del admin requerido"),
  adminLastName: z.string().min(2, "Apellido del admin requerido"),
  adminEmail: z.string().email("Email del admin inválido"),
  adminPassword: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

type TenantFormData = z.infer<typeof tenantSchema>;

interface CreateTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateTenantModal: React.FC<CreateTenantModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // Estados para controlar los modales de confirmación
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<TenantFormData | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<TenantFormData>({
    resolver: zodResolver(tenantSchema),
    defaultValues: { country: 'Colombia' },
  });

  const mutation = useMutation({
    mutationFn: async (data: TenantFormData) => {
      // Extraemos las propiedades del admin para removerlas de la raíz
      const { 
        adminFirstName, 
        adminLastName, 
        adminEmail, 
        adminPassword, 
        ...tenantData 
      } = data;

      // Construimos el payload limpio que espera el backend
      const payload = {
        ...tenantData,
        adminUser: {
          first_name: adminFirstName,
          last_name: adminLastName,
          email: adminEmail,
          password: adminPassword,
        },
      };

      await axios.post(`${authApi.baseUrl}/tenants`, payload);
    },
    onSuccess: () => {
      showToast({
        type: 'success',
        title: 'Tenant Creado',
        message: 'La institución y su administrador han sido creados exitosamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      handleCloseAll();
    }, // 👈 Aquí faltaba cerrar la llave de onSuccess
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Error al crear el tenant';
      showToast({
        type: 'error',
        title: 'Error',
        message: msg,
      });
    },
  });
  

  // Limpieza total al cerrar el modal principal
  const handleCloseAll = () => {
    reset();
    setShowSaveConfirm(false);
    setShowCancelConfirm(false);
    setPendingFormData(null);
    onClose();
  };

  // 1. Manejo del Submit del Formulario -> Abre modal de confirmación
  const onSubmitForm = (data: TenantFormData) => {
    setPendingFormData(data);
    setShowSaveConfirm(true);
  };

  // 2. Confirmación de Guardado -> Dispara la mutación
  const handleConfirmSave = async () => {
    if (pendingFormData) {
      await mutation.mutateAsync(pendingFormData);
    }
  };

  // 3. Confirmación de Cancelación -> Resetea y cierra
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
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all flex flex-col max-h-[90vh]">
                  
                  <ModalHeader title="Crear Nuevo Tenant" onClose={() => setShowCancelConfirm(true)} />

                  <div className="flex-1 overflow-y-auto p-6">
                    <form id="create-tenant-form" onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
                      
                      {/* Sección Institución */}
                      <div>
                        <FormSectionHeader
                          icon={<FontAwesomeIcon icon={faBuilding} />}
                          title="Información Institucional"
                          variant="orange"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="md:col-span-3">
                            <FormInput label="Nombre" placeholder="Ej: Clínica Central" error={errors.name?.message} {...register('name')} />
                          </div>
                          <FormInput label="Siglas" placeholder="Ej: CC" error={errors.initials?.message} {...register('initials')} />
                          <FormInput label="NIT" error={errors.nit?.message} {...register('nit')} />
                          <FormInput label="Cód. Verificación" error={errors.verification_code?.message} {...register('verification_code')} />
                          <FormInput label="Cód. Habilitación" error={errors.habilitation_code?.message} {...register('habilitation_code')} />
                          <FormInput label="Cód. Territorial" error={errors.territorial_code?.message} {...register('territorial_code')} />
                          <FormInput label="País" error={errors.country?.message} {...register('country')} />
                          <FormInput label="Ciudad" error={errors.city?.message} {...register('city')} />
                          <FormInput label="Email Corporativo" type="email" error={errors.email?.message} {...register('email')} />
                          <FormInput label="Teléfono" error={errors.phone?.message} {...register('phone')} />
                          <div className="md:col-span-3">
                            <FormInput label="Dirección" error={errors.address?.message} {...register('address')} />
                          </div>
                          <div className="md:col-span-3">
                            <FormInput label="Logo URL" placeholder="https://..." error={errors.logoUrl?.message} {...register('logoUrl')} />
                          </div>
                        </div>
                      </div>

                      {/* Sección Admin */}
                      <div>
                        <FormSectionHeader
                          icon={<FontAwesomeIcon icon={faUserShield} />}
                          title="Administrador Principal"
                          variant="blue"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormInput label="Nombres" error={errors.adminFirstName?.message} {...register('adminFirstName')} />
                          <FormInput label="Apellidos" error={errors.adminLastName?.message} {...register('adminLastName')} />
                          <FormInput label="Email Acceso" type="email" error={errors.adminEmail?.message} {...register('adminEmail')} />
                          <FormInput label="Contraseña" type="password" error={errors.adminPassword?.message} {...register('adminPassword')} />
                        </div>
                      </div>

                    </form>
                  </div>

                  {/* Footer / Botones */}
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
                      form="create-tenant-form" 
                      disabled={mutation.isPending}
                    >
                      {mutation.isPending ? (
                        <span className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                          Creando...
                        </span>
                      ) : (
                        'Crear Tenant'
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
        description="Si cancelas ahora, se perderán todos los datos ingresados en el formulario."
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
        description={`¿Estás seguro de registrar la institución "${pendingFormData?.name || ''}" y crear su administrador principal?`}
        confirmText="Sí, crear tenant"
        cancelText="Revisar formulario"
        variant="info"
        disabled={mutation.isPending}
      />
    </>
  );
};

export default CreateTenantModal;