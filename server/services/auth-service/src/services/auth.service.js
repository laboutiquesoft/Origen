import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userRepository from '../repositories/user.repository.js';
import { AppError } from '@origen/common';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import config from '../config/config.js';

class AuthService {
    async login(email, password) {
        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new AppError('Invalid credentials', 401);
        }

        if (!user.status) {
            throw new AppError('User is inactive', 403);
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            throw new AppError('Invalid credentials', 401);
        }

        const token = this.generateToken(user);

        return {
            user: this.formatUserResponse(user),
            token
        };
    }

    async getCurrentUser(userId) {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new AppError('User not found', 404);
        }
        return this.formatUserResponse(user);
    }

    formatUserResponse(user) {
        const permissions = [...new Set(
            user.user_roles.flatMap(ur =>
                ur.role.role_permissions.map(rp =>
                    `${rp.permission.resource}:${rp.permission.action}`
                )
            )
        )];

        const roles = user.user_roles.map(ur => ur.role.name);
        const { password: _, ...userWithoutPassword } = user;

        const tenants = user.tenant ? [{
            ...user.tenant,
            id: user.tenant.id_tenant
        }] : [];

        const sites = user.user_sites?.map(us => us.site) || [];

        // Include user's assigned microservices
        const microservices = user.user_microservices?.map(um => ({
            id_microservice: um.microservice.id_microservice,
            code: um.microservice.code,
            name: um.microservice.name
        })) || [];

        return {
            ...userWithoutPassword,
            firstName: user.first_name,
            lastName: user.last_name,
            roles,
            permissions,
            tenants,
            sites,
            microservices
        };
    }

    generateToken(user) {
        const roles = user.user_roles.map(ur => ur.role.name);
        return jwt.sign(
            {
                id: user.id_user,
                roles: roles,
                tenantId: user.id_tenant
            },
            config.JWT_SECRET,
            { expiresIn: config.JWT_EXPIRES_IN }
        );
    }

    async switchContext(userId, tenantId, siteId) {
        const user = await userRepository.findById(userId);
        if (!user) throw new AppError('Usuario no encontrado', 404);

        const roles = user.user_roles.map(ur => ur.role.name);
        const isAllMighty = roles.includes('AllMighty');
        const isAdmin = roles.includes('Admin');
        const isSiteAdmin = roles.includes('SiteAdmin');

        // VALIDA TENANT
        if (!isAllMighty) {
            if (user.id_tenant !== tenantId) {
                throw new AppError('No tienes acceso a este tenant', 403);
            }
        }

        // VALIDA SITE
        if (siteId) {
            if (!isAllMighty && !isAdmin) {
                const hasSiteAccess = user.user_sites.some(us => us.id_site === siteId);
                if (!hasSiteAccess) {
                    throw new AppError('No tienes acceso a esta sede', 403);
                }
            }
        }

        // GENERAR CONTEXT TOKEN (Signed JWT)
        const contextToken = jwt.sign(
            {
                uid: user.id_user,
                tid: tenantId,
                sid: siteId || null,
                roles: roles
            },
            config.JWT_SECRET,
            { expiresIn: '30m' }
        );

        return { contextToken };
    }

    async sendEmail(options) {
        if (!config.SMTP.USER || config.SMTP.USER.includes('tu_contraseña')) {
            console.error('ERROR: SMTP_USER or SMTP_PASS not set correctly in .env file.');
        }

        const transporter = nodemailer.createTransport({
            host: config.SMTP.HOST || 'smtp.gmail.com',
            port: Number(config.SMTP.PORT) || 587,
            secure: false,
            auth: {
                user: config.SMTP.USER,
                pass: config.SMTP.PASS
            }
        });

        const mailOptions = {
            from: '"La Boutique Support" <' + config.SMTP.USER + '>',
            to: options.email,
            subject: options.subject,
            text: options.message
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log(`Email sent to ${options.email}`);
        } catch (error) {
            console.error("Error sending email:", error);
            throw error;
        }
    }

    async forgotPassword(email) {
        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new AppError('There is no user with that email address.', 404);
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const passwordResetToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

        await userRepository.update(user.id_user, {
            reset_password_token: passwordResetToken,
            reset_password_expires: passwordResetExpires
        });

        const resetUrl = `${config.CLIENT_URL}/reset-password/${resetToken}`;

        const message = `Forgot your password? Submit a PATCH request with your new password to: ${resetUrl}.\nIf you didn't forget your password, please ignore this email!`;

        try {
            await this.sendEmail({
                email: user.email,
                subject: 'Your password reset token (valid for 10 min)',
                message
            });

            return { message: 'Token sent to email!' };
        } catch (err) {
            await userRepository.update(user.id_user, {
                reset_password_token: null,
                reset_password_expires: null
            });
            throw new AppError('There was an error sending the email. Try again later!', 500);
        }
    }

    async resetPassword(token, password) {
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const user = await userRepository.findByResetToken(hashedToken);

        if (!user) {
            throw new AppError('Token is invalid or has expired', 400);
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        await userRepository.update(user.id_user, {
            password: hashedPassword,
            reset_password_token: null,
            reset_password_expires: null
        });

        const updatedUser = await userRepository.findById(user.id_user);

        const newToken = this.generateToken(updatedUser);

        return {
            status: 'success',
            token: newToken,
            user: this.formatUserResponse(updatedUser)
        };
    }
}

export default new AuthService();