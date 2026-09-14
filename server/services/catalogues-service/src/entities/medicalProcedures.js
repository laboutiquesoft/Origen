export default class MedicalProcedure {
    constructor({
        id_medical_procedure,
        medical_procedure_name,
        description = null,
        id_cups,
        status = true,
        created_at = null,
        updated_at = null,
        cups = null,
        service_procedures = []
    }) {
        if (!medical_procedure_name) throw new Error('Medical procedure name is required');
        if (!id_cups) throw new Error('Medical procedure CUPS ID is required');

        this.id_medical_procedure = id_medical_procedure;
        this.medical_procedure_name = medical_procedure_name;
        this.description = description;
        this.id_cups = id_cups;
        this.status = status;
        this.created_at = created_at;
        this.updated_at = updated_at;
        this.cups = cups;
        this.service_procedures = service_procedures;
    }
}