export default class Country {
    constructor({
        id_country,
        country_code,
        country_name,
        demonym,
        flag,
        status = true,
        created_at = null,
        updated_at = null
    }) {
        if (!country_code) throw new Error('Country code is required');
        if (!country_name) throw new Error('Country name is required');

        this.id_country = id_country;
        this.country_code = country_code;
        this.country_name = country_name;
        this.demonym = demonym;
        this.flag = flag;
        this.status = status;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}