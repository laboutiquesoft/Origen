-- Habilitar extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. ESTRUCTURA DE AUTENTICACIÓN Y MULTI-TENANCY
-- =============================================================================

CREATE TABLE tenants (
    id_tenant UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_name VARCHAR(255) UNIQUE NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    initials VARCHAR(255) UNIQUE NOT NULL,
    nit VARCHAR(255) UNIQUE NOT NULL,
    verification_code VARCHAR(255),
    habilitation_code VARCHAR(255),
    territorial_code VARCHAR(255),
    country VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    phone VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    "logoUrl" VARCHAR(255),
    status BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE sites (
    id_site UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_name VARCHAR(255) NOT NULL,
    site_code VARCHAR(255),
    city VARCHAR(255) NOT NULL,
    neighborhood VARCHAR(255),
    address VARCHAR(255),
    phone VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    status BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    id_tenant UUID NOT NULL REFERENCES tenants(id_tenant) ON DELETE CASCADE,
    UNIQUE (id_tenant, site_name)
);

CREATE TABLE roles (
    id_role UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_name VARCHAR(255) NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    id_tenant UUID REFERENCES tenants(id_tenant) ON DELETE CASCADE,
    id_site UUID REFERENCES sites(id_site) ON DELETE CASCADE,
    UNIQUE (id_tenant, id_site, role_name)
);

CREATE TABLE permissions (
    id_permission UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    permission_resource VARCHAR(255) NOT NULL,
    permission_action VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE role_permissions (
    id_role_permission UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_role UUID NOT NULL REFERENCES roles(id_role) ON DELETE CASCADE,
    id_permission UUID NOT NULL REFERENCES permissions(id_permission) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (id_role, id_permission)
);

CREATE TABLE users (
    id_user UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    signature TEXT,
    status BOOLEAN DEFAULT TRUE NOT NULL,
    id_tenant UUID REFERENCES tenants(id_tenant) ON DELETE SET NULL,
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE user_roles (
    id_user_role UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_user UUID NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
    id_role UUID NOT NULL REFERENCES roles(id_role) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (id_user, id_role)
);

CREATE TABLE microservices (
    id_microservice UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    microservice_name VARCHAR(255) UNIQUE NOT NULL,
    code VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE tenant_microservices (
    id_tenant_microservice UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_tenant UUID NOT NULL REFERENCES tenants(id_tenant) ON DELETE CASCADE,
    id_microservice UUID NOT NULL REFERENCES microservices(id_microservice) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (id_tenant, id_microservice)
);

CREATE TABLE user_microservices (
    id_user_microservice UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_user UUID NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
    id_microservice UUID NOT NULL REFERENCES microservices(id_microservice) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (id_user, id_microservice)
);

CREATE TABLE user_sites (
    id_user_site UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_user UUID NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
    id_site UUID NOT NULL REFERENCES sites(id_site) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (id_user, id_site)
);


-- =============================================================================
-- 2. CATÁLOGOS Y TABLAS MAESTRAS (CATALOGUE SERVICE)
-- =============================================================================

CREATE TABLE service_groups (
    id_service_group UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(255) UNIQUE NOT NULL,
    service_group_name VARCHAR(255) NOT NULL,
    description TEXT,
    status BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE services (
    id_service UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(255) UNIQUE NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    description TEXT,
    id_service_group UUID REFERENCES service_groups(id_service_group) ON DELETE SET NULL,
    status BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE cups_resolutions (
    id_resolution UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resolution_number VARCHAR(100) UNIQUE NOT NULL,
    publication_date DATE NOT NULL,
    effective_date DATE NOT NULL,
    end_date DATE NULL,
    status BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE current_cups_version (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_resolution UUID NOT NULL UNIQUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_current_cups_resolution FOREIGN KEY (id_resolution) REFERENCES cups_resolutions(id_resolution) ON DELETE RESTRICT
);

CREATE TABLE cups (
    id_cups UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cups_code VARCHAR(20) NOT NULL,
    cups_description TEXT NOT NULL,
    cups_observation TEXT,
    status BOOLEAN DEFAULT TRUE,
    id_resolution UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cups_resolution FOREIGN KEY (id_resolution) REFERENCES cups_resolutions(id_resolution) ON DELETE RESTRICT,
    CONSTRAINT unq_cups_code_per_resolution UNIQUE (cups_code, id_resolution)
);

CREATE TABLE medical_procedures (
    id_medical_procedure UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medical_procedure_name VARCHAR(255) NOT NULL,
    id_cups UUID NOT NULL,
    patient_id UUID,
    doctor_id UUID,
    procedure_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    status BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_medical_procedure_cups FOREIGN KEY (id_cups) REFERENCES cups(id_cups) ON DELETE RESTRICT
);

CREATE TABLE complexities (
    id_complexity UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complexity_name VARCHAR(255) UNIQUE NOT NULL,
    status BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE modalities (
    id_modality UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    modality_name VARCHAR(255) UNIQUE NOT NULL,
    status BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE specificities (
    id_specificity UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    specificity_name VARCHAR(255) NOT NULL,
    status BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE specialties (
    id_specialty UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    specialty_name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    status BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE professionals (
    id_professional UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255),
    document_type VARCHAR(255) NOT NULL,
    document_number VARCHAR(255) UNIQUE NOT NULL,
    medical_register VARCHAR(100),
    phone VARCHAR(255),
    email VARCHAR(255),
    status BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE countries (
    id_country UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_code VARCHAR(255) UNIQUE NOT NULL,
    country_name VARCHAR(255) UNIQUE NOT NULL,
    demonym VARCHAR(255),
    flag VARCHAR(255),
    status BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE eps (
    id_eps UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    eps_name VARCHAR(255) UNIQUE NOT NULL,
    status BOOLEAN NOT NULL DEFAULT TRUE;
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE allergies (
    id_allergy UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    allergy_name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    status BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);


-- =============================================================================
-- 3. RELACIONES Y ASOCIACIONES DE SEDE Y SERVICIOS
-- =============================================================================

CREATE TABLE site_medical_procedures (
    id_site_medical_procedure UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_site UUID NOT NULL REFERENCES sites(id_site) ON DELETE CASCADE,
    id_medical_procedure UUID NOT NULL REFERENCES medical_procedures(id_medical_procedure) ON DELETE CASCADE,
    status BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (id_site, id_medical_procedure)
);

CREATE TABLE service_procedures (
    id_service_procedure UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_service UUID NOT NULL REFERENCES services(id_service) ON DELETE CASCADE,
    id_medical_procedure UUID NOT NULL REFERENCES medical_procedures(id_medical_procedure) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (id_service, id_medical_procedure)
);

-- -----------------------------------------------------------------------------
-- Bloque de Relaciones / Configuraciones
-- -----------------------------------------------------------------------------

-- Tabla: site_groups
CREATE TABLE site_groups (
    id_site_group UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_site UUID NOT NULL REFERENCES sites(id_site) ON DELETE CASCADE,
    id_service_group UUID NOT NULL REFERENCES service_groups(id_service_group) ON DELETE CASCADE,
    status BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (id_site, id_service_group)
);

-- Tabla: site_group_services
CREATE TABLE site_group_services (
    id_site_group_service UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_site_group UUID NOT NULL REFERENCES site_groups(id_site_group) ON DELETE CASCADE,
    id_service UUID NOT NULL REFERENCES services(id_service) ON DELETE CASCADE,
    id_complexity UUID REFERENCES complexities(id_complexity) ON DELETE SET NULL,
    id_modality UUID REFERENCES modalities(id_modality) ON DELETE SET NULL,
    status BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (id_site_group, id_service)
);

-- Tabla: site_service_modalities
CREATE TABLE site_service_modalities (
    id_site_service_modality UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_site_group_service UUID NOT NULL REFERENCES site_group_services(id_site_group_service) ON DELETE CASCADE,
    id_modality UUID NOT NULL REFERENCES modalities(id_modality) ON DELETE CASCADE,
    status BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT unique_service_modality UNIQUE (id_site_group_service, id_modality)
);

-- Tabla: site_service_modality_specificities
CREATE TABLE site_service_modality_specificities (
    id_site_service_modality_specificity UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_site_service_modality UUID NOT NULL REFERENCES site_service_modalities(id_site_service_modality) ON DELETE CASCADE,
    id_specificity UUID NOT NULL REFERENCES specificities(id_specificity) ON DELETE CASCADE,
    status BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT unique_modality_specificity UNIQUE (id_site_service_modality, id_specificity)
);

-- Tabla: professional_specialties
CREATE TABLE professional_specialties (
    id_professional_specialty UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_professional UUID NOT NULL REFERENCES professionals(id_professional) ON DELETE CASCADE,
    id_specialty UUID NOT NULL REFERENCES specialties(id_specialty) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (id_professional, id_specialty)
);

-- Tabla: tenant_professionals
CREATE TABLE tenant_professionals (
    id_tenant_professional UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_tenant UUID NOT NULL REFERENCES tenants(id_tenant) ON DELETE CASCADE,
    id_professional UUID NOT NULL REFERENCES professionals(id_professional) ON DELETE CASCADE,
    status BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (id_tenant, id_professional)
);

-- Tabla: site_professionals
CREATE TABLE site_professionals (
    id_site_professional UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_site UUID NOT NULL REFERENCES sites(id_site) ON DELETE CASCADE,
    id_tenant_professional UUID NOT NULL REFERENCES tenant_professionals(id_tenant_professional) ON DELETE CASCADE,
    status BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (id_site, id_tenant_professional)
);

-- Tabla: site_service_professionals
CREATE TABLE site_service_professionals (
    id_site_service_professional UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_site_group_service UUID NOT NULL REFERENCES site_group_services(id_site_group_service) ON DELETE CASCADE, -- Referencia corregida a site_group_services
    id_professional UUID NOT NULL REFERENCES professionals(id_professional) ON DELETE CASCADE,
    status BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT unique_service_professional UNIQUE (id_site_group_service, id_professional)
);

-- -----------------------------------------------------------------------------
-- Bloque de Recursos Físicos
-- -----------------------------------------------------------------------------

CREATE TABLE consulting_rooms (
    id_consulting_room UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consulting_room_name VARCHAR(255) NOT NULL,
    code VARCHAR(255),
    description TEXT,
    id_site UUID NOT NULL REFERENCES sites(id_site) ON DELETE CASCADE,
    status BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Tabla: procedure_rooms
CREATE TABLE procedure_rooms (
    id_procedure_room UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    procedure_room_name VARCHAR(255) NOT NULL,
    code VARCHAR(255),
    description TEXT,
    id_site UUID NOT NULL REFERENCES sites(id_site) ON DELETE CASCADE,
    status BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Tabla: surgery_rooms
CREATE TABLE surgery_rooms (
    id_surgery_room UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    surgery_room_name VARCHAR(255) NOT NULL,
    code VARCHAR(255),
    description TEXT,
    id_site UUID NOT NULL REFERENCES sites(id_site) ON DELETE CASCADE,
    status BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Tabla: hospitalization_beds
CREATE TABLE hospitalization_beds (
    id_hospitalization_bed UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospitalization_bed_name VARCHAR(255) NOT NULL,
    code VARCHAR(255),
    description TEXT,
    id_site UUID NOT NULL REFERENCES sites(id_site) ON DELETE CASCADE,
    status BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Tabla: hospitalization_rooms
CREATE TABLE hospitalization_rooms (
    id_hospitalization_room UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospitalization_room_name VARCHAR(255) NOT NULL,
    code VARCHAR(255),
    description TEXT,
    id_site UUID NOT NULL REFERENCES sites(id_site) ON DELETE CASCADE,
    status BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Tabla: recovery_beds
CREATE TABLE recovery_beds (
    id_recovery_bed UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recovery_bed_name VARCHAR(255) NOT NULL,
    code VARCHAR(255),
    description TEXT,
    id_site UUID NOT NULL REFERENCES sites(id_site) ON DELETE CASCADE,
    status BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Tabla: recovery_rooms
CREATE TABLE recovery_rooms (
    id_recovery_room UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recovery_room_name VARCHAR(255) NOT NULL,
    code VARCHAR(255),
    description TEXT,
    id_site UUID NOT NULL REFERENCES sites(id_site) ON DELETE CASCADE,
    status BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Tabla: isolation_rooms
CREATE TABLE isolation_rooms (
    id_isolation_room UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    isolation_room_name VARCHAR(255) NOT NULL,
    code VARCHAR(255),
    description TEXT,
    id_site UUID NOT NULL REFERENCES sites(id_site) ON DELETE CASCADE,
    status BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Tabla: resource_schedules
CREATE TABLE resource_schedules (
    id_schedule UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day_of_week INTEGER NOT NULL,
    start_time VARCHAR(5) NOT NULL,
    end_time VARCHAR(5) NOT NULL,
    status BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    id_consulting_room UUID REFERENCES consulting_rooms(id_consulting_room) ON DELETE CASCADE,
    id_procedure_room UUID REFERENCES procedure_rooms(id_procedure_room) ON DELETE CASCADE,
    id_surgery_room UUID REFERENCES surgery_rooms(id_surgery_room) ON DELETE CASCADE,
    id_hospitalization_bed UUID REFERENCES hospitalization_beds(id_hospitalization_bed) ON DELETE CASCADE,
    id_recovery_bed UUID REFERENCES recovery_beds(id_recovery_bed) ON DELETE CASCADE,
    id_recovery_room UUID REFERENCES recovery_rooms(id_recovery_room) ON DELETE CASCADE,
    id_isolation_room UUID REFERENCES isolation_rooms(id_isolation_room) ON DELETE CASCADE,
    id_hospitalization_room UUID REFERENCES hospitalization_rooms(id_hospitalization_room) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- Bloque de Pacientes
-- -----------------------------------------------------------------------------

CREATE TABLE patients (
    id_patient UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id VARCHAR(255) UNIQUE NOT NULL,
    patient_first_name VARCHAR(255) NOT NULL,
    patient_second_name VARCHAR(255),
    patient_first_lastname VARCHAR(255) NOT NULL,
    patient_second_lastname VARCHAR(255),
    document_type VARCHAR(255) NOT NULL,
    gender VARCHAR(255),
    birthdate TIMESTAMP WITH TIME ZONE,
    id_country UUID REFERENCES countries(id_country) ON DELETE CASCADE,
    nationality VARCHAR(255),
    city VARCHAR(255),
    patient_address VARCHAR(255),
    patient_phone VARCHAR(255), -- Typos corregidos: patiente_phone -> patient_phone
    patient_email VARCHAR(255),
    civil_status VARCHAR(255),
    blood_type VARCHAR(255),
    status BOOLEAN DEFAULT TRUE NOT NULL,
    id_tenant UUID NOT NULL REFERENCES tenants(id_tenant) ON DELETE CASCADE,
    id_site UUID NOT NULL REFERENCES sites(id_site) ON DELETE CASCADE,
    id_eps UUID REFERENCES eps(id_eps) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Tabla: patient_allergies
CREATE TABLE patient_allergies (
    id_patient_allergy UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_patient UUID NOT NULL REFERENCES patients(id_patient) ON DELETE CASCADE,
    id_allergy UUID NOT NULL REFERENCES allergies(id_allergy) ON DELETE CASCADE,
    reaction TEXT,
    status BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (id_patient, id_allergy)
);

CREATE TABLE advisors (
    id_advisor UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advisor_name VARCHAR(255) NOT NULL,
    advisor_email VARCHAR(255),
    advisor_phone VARCHAR(255),
    id_tenant UUID NOT NULL REFERENCES tenants(id_tenant) ON DELETE CASCADE,
    id_site UUID NOT NULL REFERENCES sites(id_site) ON DELETE CASCADE,
    id_user UUID REFERENCES users(id_user) ON DELETE SET NULL,
    status BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Tabla: appointment_status
CREATE TABLE appointment_status (
    id_appointment_status UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_status_name VARCHAR(100) NOT NULL UNIQUE,
    appointment_status_description TEXT,
    appointment_status_created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    appointment_status_updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: appointments
CREATE TABLE appointments (
    id_appointment UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_patient UUID NOT NULL,
    id_professional UUID NOT NULL,
    id_medical_procedure UUID,
    id_consulting_room UUID,
    id_service UUID,
    id_site UUID NOT NULL,
    id_tenant UUID NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_start_time TIME NOT NULL,
    appointment_end_time TIME NOT NULL,
    appointment_duration INTEGER,
    appointment_notes TEXT,
    id_appointment_status UUID NOT NULL,
    appointment_created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    appointment_updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT fk_patient
        FOREIGN KEY (id_patient)
        REFERENCES patients(id_patient)
        ON DELETE CASCADE,

    CONSTRAINT fk_professional
        FOREIGN KEY (id_professional)
        REFERENCES professionals(id_professional)
        ON DELETE CASCADE,

    CONSTRAINT fk_medical_procedure
        FOREIGN KEY (id_medical_procedure)
        REFERENCES medical_procedures(id_medical_procedure)
        ON DELETE SET NULL,

    CONSTRAINT fk_consulting_room
        FOREIGN KEY (id_consulting_room)
        REFERENCES consulting_rooms(id_consulting_room)
        ON DELETE SET NULL,

    CONSTRAINT fk_service
        FOREIGN KEY (id_service)
        REFERENCES services(id_service)
        ON DELETE SET NULL,

    CONSTRAINT fk_site
        FOREIGN KEY (id_site)
        REFERENCES sites(id_site)
        ON DELETE CASCADE,

    CONSTRAINT fk_tenant
        FOREIGN KEY (id_tenant)
        REFERENCES tenants(id_tenant)
        ON DELETE CASCADE,

    CONSTRAINT fk_appointment_status
        FOREIGN KEY (id_appointment_status)
        REFERENCES appointment_status(id_appointment_status)
        ON DELETE RESTRICT
);

CREATE INDEX idx_appointments_patient ON appointments(id_patient);
CREATE INDEX idx_appointments_professional ON appointments(id_professional);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(id_appointment_status);
CREATE INDEX idx_appointments_site ON appointments(id_site);

-- Tabla: scheduled_surgery_status
CREATE TABLE scheduled_surgery_status (
    id_scheduled_surgery_status UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheduled_surgery_status_name VARCHAR(100) NOT NULL,
    description TEXT,
    status BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE UNIQUE INDEX ux_scheduled_surgery_status_name ON scheduled_surgery_status (scheduled_surgery_status_name);

-- Tabla: scheduled_surgeries
CREATE TABLE scheduled_surgeries (
    id_scheduled_surgery UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_patient UUID NOT NULL,
    id_surgery_room UUID NOT NULL,
    id_service UUID,
    id_site UUID NOT NULL,
    id_tenant UUID NOT NULL,
    surgery_date DATE NOT NULL,
    surgery_start_time TIME NOT NULL,
    surgery_end_time TIME,
    surgery_duration INTEGER,
    surgery_notes TEXT,
    id_scheduled_surgery_status UUID NOT NULL,
    id_advisor UUID,
    scheduled_surgery_created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    scheduled_surgery_updated_at TIMESTAMP,

    CONSTRAINT fk_scheduled_surgeries_patient
        FOREIGN KEY (id_patient)
        REFERENCES patients(id_patient),

    CONSTRAINT fk_scheduled_surgeries_surgery_room
        FOREIGN KEY (id_surgery_room)
        REFERENCES surgery_rooms(id_surgery_room),

    CONSTRAINT fk_scheduled_surgeries_service
        FOREIGN KEY (id_service)
        REFERENCES services(id_service),

    CONSTRAINT fk_scheduled_surgeries_site
        FOREIGN KEY (id_site)
        REFERENCES sites(id_site),

    CONSTRAINT fk_scheduled_surgeries_tenant
        FOREIGN KEY (id_tenant)
        REFERENCES tenants(id_tenant),

    CONSTRAINT fk_scheduled_surgeries_status
        FOREIGN KEY (id_scheduled_surgery_status)
        REFERENCES scheduled_surgery_status(id_scheduled_surgery_status),

    CONSTRAINT fk_scheduled_surgeries_advisor
        FOREIGN KEY (id_advisor)
        REFERENCES advisors(id_advisor)
);

CREATE INDEX idx_scheduled_surgeries_patient ON scheduled_surgeries(id_patient);
CREATE INDEX idx_scheduled_surgeries_date ON scheduled_surgeries(surgery_date);
CREATE INDEX idx_scheduled_surgeries_room ON scheduled_surgeries(id_surgery_room);
CREATE INDEX idx_scheduled_surgeries_status ON scheduled_surgeries(id_scheduled_surgery_status);

-- Tabla: scheduled_surgery_procedures
CREATE TABLE scheduled_surgery_procedures (
    id_scheduled_surgery_procedure UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_scheduled_surgery UUID NOT NULL,
    id_medical_procedure UUID NOT NULL,
    id_primary_professional UUID NOT NULL,
    id_assistant_professional UUID,
    procedure_order INTEGER DEFAULT 1,
    procedure_notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,

    CONSTRAINT fk_ssp_scheduled_surgery
        FOREIGN KEY (id_scheduled_surgery)
        REFERENCES scheduled_surgeries(id_scheduled_surgery)
        ON DELETE CASCADE,

    CONSTRAINT fk_ssp_medical_procedure
        FOREIGN KEY (id_medical_procedure)
        REFERENCES medical_procedures(id_medical_procedure),

    CONSTRAINT fk_ssp_primary_professional
        FOREIGN KEY (id_primary_professional)
        REFERENCES professionals(id_professional),

    CONSTRAINT fk_ssp_assistant_professional
        FOREIGN KEY (id_assistant_professional)
        REFERENCES professionals(id_professional)
);

CREATE INDEX idx_ssp_scheduled_surgery ON scheduled_surgery_procedures(id_scheduled_surgery);
CREATE INDEX idx_ssp_medical_procedure ON scheduled_surgery_procedures(id_medical_procedure);
CREATE INDEX idx_ssp_primary_professional ON scheduled_surgery_procedures(id_primary_professional);

-- =====================================================
-- SERVICE ORDER STATUS
-- =====================================================

CREATE TABLE service_order_status (
    id_service_order_status UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_order_status_name VARCHAR(100) NOT NULL,
    description TEXT,
    status BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

INSERT INTO service_order_status
(service_order_status_name, description)
VALUES
('OPEN', 'Orden creada'),
('IN_PROGRESS', 'Atencion en proceso'),
('COMPLETED', 'Servicio finalizado'),
('CANCELLED', 'Orden cancelada'),
('BILLED', 'Orden facturada');

-- =====================================================
-- SERVICE ORDERS
-- =====================================================

CREATE TABLE service_orders (
    id_service_order UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_order_number VARCHAR(255) UNIQUE NOT NULL,
    id_patient UUID NOT NULL REFERENCES patients(id_patient) ON DELETE CASCADE,
    id_insurance_company UUID REFERENCES insurance_companies(id_insurance_company) ON DELETE SET NULL,
    id_site_service_group UUID NOT NULL REFERENCES site_groups(id_site_group) ON DELETE RESTRICT,
    id_site_service UUID REFERENCES site_group_services(id_site_group_service) ON DELETE RESTRICT,
    id_appointment UUID REFERENCES appointments(id_appointment) ON DELETE SET NULL,
    id_scheduled_surgery UUID REFERENCES scheduled_surgeries(id_scheduled_surgery) ON DELETE SET NULL,
    id_professional UUID REFERENCES professionals(id_professional) ON DELETE SET NULL,
    id_assistant UUID REFERENCES professionals(id_professional) ON DELETE SET NULL,
    id_advisor UUID REFERENCES advisors(id_advisor) ON DELETE SET NULL,
    id_site UUID NOT NULL REFERENCES sites(id_site) ON DELETE CASCADE,
    id_tenant UUID NOT NULL REFERENCES tenants(id_tenant) ON DELETE CASCADE,
    id_user_created UUID NOT NULL REFERENCES users(id_user) ON DELETE RESTRICT,
    companion_name VARCHAR(255),
    companion_relationship VARCHAR(100),
    companion_phone VARCHAR(50),
    id_service_order_status UUID NOT NULL REFERENCES service_order_status(id_service_order_status) ON DELETE RESTRICT,
    service_order_notes TEXT,

    -- Facturación
    global_unit_price DECIMAL(12,2),
    global_tax_percentage DECIMAL(5,2),
    global_price DECIMAL(12,2),
    subtotal DECIMAL(12,2) DEFAULT 0,
    total_tax DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_service_orders_patient ON service_orders(id_patient);
CREATE INDEX idx_service_orders_professional ON service_orders(id_professional);
CREATE INDEX idx_service_orders_site ON service_orders(id_site);
CREATE INDEX idx_service_orders_status ON service_orders(id_service_order_status);
CREATE INDEX idx_service_orders_created_at ON service_orders(created_at);

-- =====================================================
-- SERVICE ORDER ITEMS
-- =====================================================

CREATE TABLE service_order_items (
    id_service_order_item UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_service_order UUID NOT NULL REFERENCES service_orders(id_service_order) ON DELETE CASCADE,
    id_medical_procedure UUID NOT NULL REFERENCES medical_procedures(id_medical_procedure) ON DELETE RESTRICT,
    id_professional UUID REFERENCES professionals(id_professional) ON DELETE SET NULL,
    professional_role VARCHAR(255),
    id_complexity UUID REFERENCES complexities(id_complexity) ON DELETE SET NULL,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10, 2),
    total_price DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_service_order_items_order ON service_order_items(id_service_order);
CREATE INDEX idx_service_order_items_procedure ON service_order_items(id_medical_procedure);

-- =====================================================
-- INSURANCE COMPANIES
-- =====================================================

CREATE TABLE insurance_companies (
    id_insurance_company UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    insurance_company_name VARCHAR(255) UNIQUE NOT NULL,
    insurance_company_address VARCHAR(255),
    insurance_company_phone VARCHAR(255),
    insurance_company_email VARCHAR(255),
    status BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- =====================================================
-- INSURANCE POLICIES
-- =====================================================

CREATE TABLE insurance_policies (
    id_insurance_policy UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_service_order UUID, 
    id_patient UUID NOT NULL,
    id_insurance_company UUID NOT NULL,
    policy_number VARCHAR(100) NOT NULL,
    policy_premium NUMERIC(12,2),
    policy_value_before_tax NUMERIC(12,2),
    policy_tax_percentage NUMERIC(5,2),
    policy_tax_amount NUMERIC(12,2),
    policy_total NUMERIC(12,2),
    policy_coverage_value NUMERIC(12,2),
    policy_holder_professional UUID REFERENCES professionals(id_professional) ON DELETE SET NULL,
    policy_insured_patient VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVADA',
    policy_status VARCHAR(50) DEFAULT 'CREATED',
    policy_issue_date DATE,
    policy_notes TEXT,
    id_site UUID NOT NULL REFERENCES sites(id_site) ON DELETE CASCADE,
    id_tenant UUID NOT NULL REFERENCES tenants(id_tenant) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT fk_policy_patient
        FOREIGN KEY (id_patient)
        REFERENCES patients(id_patient),

    CONSTRAINT fk_policy_company
        FOREIGN KEY (id_insurance_company)
        REFERENCES insurance_companies(id_insurance_company),

    CONSTRAINT fk_policy_service_order
        FOREIGN KEY (id_service_order)
        REFERENCES service_orders(id_service_order)
);

CREATE INDEX idx_insurance_policies_patient ON insurance_policies(id_patient);

-- =====================================================
-- RELACION PROCEDIMIENTO - POLIZA
-- =====================================================

CREATE TABLE service_order_item_policies (
    id_service_order_item_policy UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_service_order_item UUID NOT NULL,
    id_insurance_policy UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_item_policy_item
        FOREIGN KEY (id_service_order_item)
        REFERENCES service_order_items(id_service_order_item)
        ON DELETE CASCADE,

    CONSTRAINT fk_item_policy_policy
        FOREIGN KEY (id_insurance_policy)
        REFERENCES insurance_policies(id_insurance_policy)
);

-- =====================================================
-- ASSISTANCE RECORDS
-- =====================================================

CREATE TABLE assistance_records (
    id_assistance_record UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_service_order UUID REFERENCES service_orders(id_service_order) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE consent_templates (
    id_consent_template UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    consent_type VARCHAR(100),
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    id_site UUID,
    id_tenant UUID,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE informed_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_assistance_record UUID REFERENCES assistance_records(id_assistance_record) ON DELETE CASCADE, -- Corregida FK
    id_service_order UUID REFERENCES service_orders(id_service_order),
    id_service_order_item UUID REFERENCES service_order_items(id_service_order_item),
    id_template UUID REFERENCES consent_templates(id_consent_template), -- Corregida FK

    -- snapshot legal
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    variables JSONB DEFAULT '{}',

    -- datos de trazabilidad
    patient_name TEXT,
    professional_name TEXT,
    status VARCHAR(50) DEFAULT 'PENDING', 

    -- Firma Paciente
    signed_at TIMESTAMPTZ,
    signature_data TEXT,
    signature_hash VARCHAR(255),
    signer_ip VARCHAR(45),
    signer_certificate JSONB,

    -- Firma Profesional
    professional_signature_data TEXT,
    professional_signed_at TIMESTAMPTZ,
    professional_signature_hash VARCHAR(255),
    professional_signer_ip VARCHAR(45),

    -- Firma Ayudante
    assistant_signature_data TEXT,
    assistant_signed_at TIMESTAMPTZ,
    assistant_signature_hash VARCHAR(255),
    assistant_signer_ip VARCHAR(45),

    -- Firma Acompañante
    companion_signature_data TEXT,
    companion_signed_at TIMESTAMPTZ,
    companion_signature_hash VARCHAR(255),
    companion_signer_ip VARCHAR(45),

    -- Multi-tenant y Auditoría
    id_tenant UUID,
    id_site UUID,
    audit_trail JSONB DEFAULT '[]',
    document_url TEXT,

    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE assistance_record_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_assistance_record UUID REFERENCES assistance_records(id_assistance_record) ON DELETE CASCADE, -- Corregida FK
    document_type TEXT NOT NULL,
    template TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- PREOPBOUTIQUE
-- =====================================================

CREATE TABLE patient_preparations (
    id_patient_preparation UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_service_order UUID NOT NULL,
    id_professional UUID NOT NULL,
    preparation_datetime TIMESTAMPTZ NOT NULL DEFAULT now(),
    fasting_verified BOOLEAN,
    allergies_verified BOOLEAN,
    medical_order_verified BOOLEAN,
    iv_line_verified BOOLEAN,
    hand_hygiene BOOLEAN,
    ppe_used BOOLEAN,
    waste_segregation BOOLEAN,
    notes TEXT,
    id_site UUID NOT NULL,
    id_tenant UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),

    CONSTRAINT fk_patient_preparation_order
        FOREIGN KEY (id_service_order)
        REFERENCES service_orders(id_service_order)
        ON DELETE CASCADE,

    CONSTRAINT fk_patient_preparation_professional
        FOREIGN KEY (id_professional)
        REFERENCES professionals(id_professional)
);

