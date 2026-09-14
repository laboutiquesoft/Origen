import React from 'react';
import { Dialog } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBuilding,
  faAddressCard,
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
  faShieldAlt,
  faCalendarAlt,
  faUserShield,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import {
  MainButton,
  CancelButton,
  FormSectionHeader,
  ModalHeader,
} from '../../../shared/components';
import type { Tenant } from '../components/TenantsDataTable';

interface TenantDetailModalProps {
  tenant: Tenant | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectTenant: (tenant: Tenant) => void;
}

export const TenantDetailModal: React.FC<TenantDetailModalProps> = ({
  tenant,
  isOpen,
  onClose,
  onSelectTenant,
}) => {
  if (!tenant || !isOpen) return null;

  const handleEnterDashboard = () => {
    onSelectTenant(tenant);
    onClose();
  };

  const formattedDate = tenant.created_at
    ? new Date(tenant.created_at).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'No registrada';

  // Mapeo basado en tus Schemas de Backend (Joi)
  // Tenant -> habilitation_code
  // AdminUser / Superadmin -> first_name, last_name, email
  const adminUser = tenant.adminUser || tenant.superadmin || tenant.admin_user || {};
  
  const superAdminFirstName =
    adminUser.first_name || tenant.superadmin_firstname || '';
  const superAdminLastName =
    adminUser.last_name || tenant.superadmin_lastname || '';
  
  // Concatenación de Nombres y Apellidos
  const superAdminFullName = 
    `${superAdminFirstName} ${superAdminLastName}`.trim() || 'No registrado';

  const superAdminEmail =
    adminUser.email || tenant.superadmin_email || 'No registrado';

  const habilitationCode =
    tenant.habilitation_code ||
    tenant.enablement_code ||
    tenant.codigo_habilitacion ||
    'No registrado';

  const tenantName = tenant.name || tenant.tenant_name || 'Sin nombre';

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Fondo translúcido */}
      <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs transition-opacity" aria-hidden="true" />

      {/* Contenedor de centrado */}
      <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
        <Dialog.Panel className="relative w-full max-w-3xl bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-10 my-8">
          
          {/* Cabecera ModalHeader */}
          <ModalHeader title="Datos del Prestador" onClose={onClose} />

          {/* Cuerpo del Modal */}
          <div className="p-6 space-y-6 text-sm text-gray-700 max-h-[72vh] overflow-y-auto">
            
            {/* Tarjeta Identificadora Resumida */}
            <div className="flex items-center space-x-3.5 p-3.5 bg-gray-50/80 rounded-lg border border-gray-200/80">
              {tenant.logoUrl ? (
                <img
                  src={tenant.logoUrl}
                  alt={tenantName}
                  className="w-12 h-12 rounded border border-gray-200 object-contain bg-white p-1 shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-base shrink-0">
                  {tenant.initials || tenantName.substring(0, 2).toUpperCase()}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold text-gray-900 truncate">
                  {tenantName}
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-500 font-mono">
                    NIT: {tenant.nit || 'Sin registrar'}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                      tenant.status ?? true
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                    }`}
                  >
                    {tenant.status ?? true ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            </div>

            {/* 1. Información Institucional */}
            <div>
              <FormSectionHeader
                icon={<FontAwesomeIcon icon={faBuilding} />}
                title="Información Institucional"
                description="Datos legales y de identificación corporativa de la entidad."
                variant="indigo"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50/80 border border-gray-100">
                  <FontAwesomeIcon icon={faBuilding} className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Nombre Legal</p>
                    <p className="text-gray-800 font-semibold mt-0.5">{tenantName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50/80 border border-gray-100">
                  <FontAwesomeIcon icon={faAddressCard} className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Código de Habilitación</p>
                    <p className="text-gray-800 font-semibold font-mono mt-0.5">
                      {habilitationCode}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Contacto y Localización */}
            <div>
              <FormSectionHeader
                icon={<FontAwesomeIcon icon={faMapMarkerAlt} />}
                title="Contacto y Localización"
                description="Canales de comunicación directos y dirección de la sede principal."
                variant="teal"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50/80 border border-gray-100">
                  <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 font-medium">Correo Institucional</p>
                    <p className="text-gray-800 font-medium mt-0.5 truncate">
                      {tenant.email || 'No registrado'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50/80 border border-gray-100">
                  <FontAwesomeIcon icon={faPhone} className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Teléfono Institucional</p>
                    <p className="text-gray-800 font-medium mt-0.5">
                      {tenant.phone || 'No registrado'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50/80 border border-gray-100 md:col-span-2">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Ubicación / Dirección</p>
                    <p className="text-gray-800 font-medium mt-0.5">
                      {[tenant.address, tenant.city, tenant.country].filter(Boolean).join(', ') || 'No registrada'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Usuario Superadmin */}
            <div>
              <FormSectionHeader
                icon={<FontAwesomeIcon icon={faUserShield} />}
                title="Usuario Superadmin"
                description="Información del administrador con privilegios globales en este tenant."
                variant="purple"
              />

              <div className="grid grid-cols-1 gap-3">
                {/* Renglón 1: Nombres y Apellidos integrados */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50/80 border border-gray-100">
                  <FontAwesomeIcon icon={faUser} className="w-4 h-4 text-purple-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Nombres y Apellidos</p>
                    <p className="text-gray-800 font-semibold mt-0.5">{superAdminFullName}</p>
                  </div>
                </div>

                {/* Renglón 2: Correo Electrónico abajo */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50/80 border border-gray-100">
                  <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4 text-purple-500 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 font-medium">Correo Electrónico</p>
                    <p className="text-gray-800 font-medium mt-0.5 truncate">{superAdminEmail}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Detalles del Registro */}
            <div>
              <FormSectionHeader
                icon={<FontAwesomeIcon icon={faShieldAlt} />}
                title="Detalles del Registro"
                description="Información de la fecha de creación en el sistema."
                variant="gray"
              />

              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50/80 border border-gray-100">
                  <FontAwesomeIcon icon={faCalendarAlt} className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Fecha de Registro</p>
                    <p className="text-gray-800 font-medium mt-0.5">{formattedDate}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Pie del Modal */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50/80 border-t border-gray-200">
            <CancelButton onClick={onClose}>
              Cerrar
            </CancelButton>

            <MainButton onClick={handleEnterDashboard}>
              Ingresar al Dashboard
            </MainButton>
          </div>

        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default TenantDetailModal;