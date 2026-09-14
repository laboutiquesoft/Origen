import userRepository from '../repositories/user.repository.js';
import bcrypt from 'bcrypt';
import { AppError } from '@origen/common';

class UserService {
    async createUser(data, currentUser) {
        // Enforce scoping
        const userRoles = currentUser.user_roles.map(ur => ur.role.name);
        if (!userRoles.includes('AllMighty')) {
            data.id_tenant = currentUser.id_tenant;
        }

        // Hash password
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }

        // El objeto data pasa directamente al repositorio con 'signature' si existe
        return await userRepository.create(data);
    }

    async getUserById(id) {
        const user = await userRepository.findById(id);
        if (!user) {
            throw new AppError('User not found', 404);
        }
        return user;
    }

    async getUserByEmail(email) {
        return await userRepository.findByEmail(email);
    }

    async getAllUsers(filters = {}, currentUser) {
        return await userRepository.findAll(filters);
    }

    async updateUser(id, data, currentUser) {
        const userRoles = currentUser.user_roles.map(ur => ur.role.name);
        if (!userRoles.includes('AllMighty')) {
            delete data.id_tenant; // Safety
        }

        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }
        
        return await userRepository.update(id, data);
    }

    async deleteUser(id) {
        return await userRepository.delete(id);
    }
}

export default new UserService();