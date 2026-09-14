export default class Microservice {
    constructor({
        id_microservice,
        microservice_name,
        code,
        description = null
    }) {
        if (!microservice_name) throw new Error('Microservice name is required');
        if (!code) throw new Error('Microservice code is required');

        this.id = id_microservice;
        this.microservice_name = microservice_name;
        this.code = code;
        this.description = description;
    }
}