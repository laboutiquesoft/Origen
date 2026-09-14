import React, { Fragment, useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Dialog, Transition, Switch } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faUserShield, faSpinner, faToggleOn, } from '@fortawesome/free-solid-svg-icons';

import { authApi } from '../../../core/config/api';
import { 
  FormInput, 
  FormSectionHeader, 
  ModalHeader, 
  MainButton, 
  CancelButton, 
  ConfirmationModal, 
  useToast 
} from '../../../shared/components/index';
import type { Tenant } from '../components/TenantsDataTable';

// 1. Esquema Zod con 'status' booleano
const editTenantSchema = z.object({
  tenant_name: z.string().min(1, "El nombre de la clínica es requerido"),
  initials: z.string().min(1, "Las siglas son requeridas"),
  nit: z.string().min(1, "El NIT es requerido"),
  status: z.boolean(),
  country: z.string().min(1, "El país es requerido"),
  city: z.string().min(1, "La ciudad es requerida"),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Email institucional inválido").optional().or(z.literal("")),
  habilitation_code: z.string().optional(),
  logoUrl: z.string().optional(),
  territorial_code: z.string().optional(),
  verification_code: z.string().optional(),
  adminUser: z.object({
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    email: z.string().optional(),
    password: z.string().optional(),
  }).optional()
});

type EditTenantFormData = z.infer<typeof editTenantSchema>;

interface EditTenantModalProps {
  tenant: Tenant | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditTenantModal: React.FC<EditTenantModalProps> = ({ tenant, isOpen, onClose }) => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<EditTenantFormData | null>(null);

  const { register, handleSubmit, control, formState: { errors }, reset } = useForm<EditTenantFormData>({
    resolver: zodResolver(editTenantSchema),
    defaultValues: {
      status: true,
    }
  });

  // 2. Cargar/Poblar los inputs
  useEffect(() => {
    if (tenant && isOpen) {
      const admin = tenant.adminUser || tenant.superadmin || tenant.admin_user || {};

      // Normalizar status
      const currentStatus = typeof tenant.status === 'boolean' 
        ? tenant.status 
        : tenant.status === 'ACTIVE' || tenant.is_active === true;

      reset({
        tenant_name: tenant.tenant_name || tenant.name || '',
        initials: tenant.initials || '',
        nit: tenant.nit || '',
        status: currentStatus,
        country: tenant.country || 'Colombia',
        city: tenant.city || '',
        address: tenant.address || '',
        phone: tenant.phone || '',
        email: tenant.email || '',
        habilitation_code: tenant.enablement_code || tenant.habilitation_code || '',
        logoUrl: tenant.logoUrl || '',
        territorial_code: tenant.territorial_code || '',
        verification_code: tenant.verification_code || '',
        
        adminUser: {
          first_name: admin.first_name || tenant.superadmin_firstname || '',
          last_name: admin.last_name || tenant.superadmin_lastname || '',
          email: admin.email || tenant.superadmin_email || '',
          password: '',
        }
      });
    }
  }, [tenant, isOpen, reset]);

  // 3. Mutación PATCH
  const mutation = useMutation({
    mutationFn: async (data: EditTenantFormData) => {
      const tenantId = tenant?.id_tenant || tenant?.id;

      if (!tenantId) {
        throw new Error("No se encontró el ID del tenant para realizar la actualización.");
      }

      const { adminUser, ...tenantFields } = data;

      // Limpieza de campos del Tenant (convierte '' a null respetando booleanos)
      const tenantPayload = Object.fromEntries(
        Object.entries(tenantFields).map(([key, value]) => [
          key, 
          value === '' ? null : value
        ])
      );

      const requests: Promise<any>[] = [
        axios.patch(`${authApi.baseUrl}/tenants/${tenantId}`, tenantPayload)
      ];

      const admin = tenant.adminUser || tenant.superadmin || tenant.admin_user;
      const adminId = admin?.id_user || admin?.id_usuario || admin?.id || tenant.id_user;

      if (adminId && adminUser) {
        const { password, ...userFields } = adminUser;
        const userPayload: Record<string, any> = {};

        Object.entries(userFields).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            userPayload[key] = value;
          }
        });

        if (password && password.trim() !== '') {
          userPayload.password = password;
        }

        if (Object.keys(userPayload).length > 0) {
          requests.push(
            axios.patch(`${authApi.baseUrl}/users/${adminId}`, userPayload)
          );
        }
      }

      await Promise.all(requests);
    },
    onSuccess: () => {
      showToast({
        type: 'success',
        title: 'Tenant Actualizado',
        message: 'Los datos de la institución se han actualizado correctamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      handleCloseAll();
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Error al actualizar la información';
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

  const onSubmitForm = (data: EditTenantFormData) => {
    setPendingFormData(data);
    setShowSaveConfirm(true);
  };

  const handleConfirmSave = async () => {
    if (pendingFormData) {
      try {
        await mutation.mutateAsync(pendingFormData);
      } catch (e) {
        // Manejado por onError en React Query
      }
    }
  };

  if (!isOpen || !tenant) return null;

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
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all flex flex-col max-h-[90vh]">
                  
                  <ModalHeader 
                    title={`Editar Tenant: ${tenant.tenant_name || tenant.name || ''}`} 
                    onClose={() => setShowCancelConfirm(true)} 
                  />

                  <div className="flex-1 overflow-y-auto p-6">
                    <form id="edit-tenant-form" onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
                      
                      {/* Toggle de Estado (Activo / Inactivo) */}
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                          <FontAwesomeIcon 
                            icon={faToggleOn} 
                            className="text-gray-500 text-xl" 
                          />
                          <div>
                            <p className="text-sm font-semibold text-gray-800">Estado de la Institución</p>
                            <p className="text-xs text-gray-500">
                              Determina si la institución puede acceder y operar en la plataforma.
                            </p>
                          </div>
                        </div>

                        <Controller
                          name="status"
                          control={control}
                          render={({ field: { value, onChange } }) => (
                            <div className="flex items-center gap-3">
                              <span className={`text-xs font-bold uppercase tracking-wider ${value ? 'text-emerald-600' : 'text-red-500'}`}>
                                {value ? 'Activo' : 'Inactivo'}
                              </span>
                              
                              <Switch
                                checked={value}
                                onChange={onChange}
                                className={`${
                                  value 
                                    ? 'bg-emerald-500 shadow-emerald-200' 
                                    : 'bg-red-500 shadow-red-200'
                                } relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-opacity-75 shadow-md`}
                              >
                                <span className="sr-only">Cambiar estado</span>
                                <span
                                  aria-hidden="true"
                                  className={`${
                                    value ? 'translate-x-7' : 'translate-x-0'
                                  } pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-300 ease-in-out`}
                                />
                              </Switch>
                            </div>
                          )}
                        />
                      </div>

                      {/* Sección Institución */}
                      <div>
                        <FormSectionHeader
                          icon={<FontAwesomeIcon icon={faBuilding} />}
                          title="Información Institucional"
                          variant="orange"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="md:col-span-3">
                            <FormInput 
                              label="Nombre de la Clínica / Empresa" 
                              placeholder="Ej: Clínica Central" 
                              error={errors.tenant_name?.message} 
                              {...register('tenant_name')} 
                            />
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

                      {/* Sección Administrador */}
                      <div>
                        <FormSectionHeader
                          icon={<FontAwesomeIcon icon={faUserShield} />}
                          title="Administrador Principal"
                          variant="blue"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormInput 
                            label="Nombres"             
                            {...register('adminUser.first_name')} 
                          />
                          <FormInput 
                            label="Apellidos"                
                            {...register('adminUser.last_name')} 
                          />
                          <FormInput 
                            label="Email Acceso" 
                            type="email"               
                            {...register('adminUser.email')} 
                          />
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
                      form="edit-tenant-form" 
                      disabled={mutation.isPending}
                    >
                      {mutation.isPending ? (
                        <span className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                          Guardando...
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

      <ConfirmationModal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleCloseAll}
        title="¿Descartar cambios?"
        description="Si cancelas ahora, se perderán las modificaciones no guardadas."
        confirmText="Sí, descartar"
        cancelText="Continuar editando"
        variant="warning"
        disabled={mutation.isPending}
      />

      <ConfirmationModal
        isOpen={showSaveConfirm}
        onClose={() => setShowSaveConfirm(false)}
        onConfirm={handleConfirmSave}
        title="Confirmar Actualización"
        description={`¿Estás seguro de actualizar la información de "${pendingFormData?.tenant_name || ''}"?`}
        confirmText="Sí, guardar cambios"
        cancelText="Revisar formulario"
        variant="info"
        disabled={mutation.isPending}
      />
    </>
  );
};

export default EditTenantModal;