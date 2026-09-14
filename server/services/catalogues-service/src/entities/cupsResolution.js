
export default class CupsResolution {
    constructor({
        id_resolution,
        resolution_number,
        publication_date, 
        effective_date,    
        end_date = null,   
        status = true,
        created_at = null,
        updated_at = null
    }) {
        if (!resolution_number) throw new Error('Resolution number is required');
        if (!publication_date) throw new Error('Publication date is required');
        if (!effective_date) throw new Error('Effective date is required');

        this.id_resolution = id_resolution;
        this.resolution_number = resolution_number;
        this.publication_date = publication_date;
        this.effective_date = effective_date;
        this.end_date = end_date;
        this.status = status;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}