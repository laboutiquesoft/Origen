import authService from '../services/auth.service.js';

class AuthController {
    async login(req, res, next) {
        try {
            let { email, password } = req.body;

            // Normalize email
            email = email.toLowerCase().trim();

            const { user, token } = await authService.login(email, password);

            // Secure Cookie options
            const cookieOptions = {
                expires: new Date(
                    Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN || 1) * 24 * 60 * 60 * 1000
                ),
                httpOnly: true,
                secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
            };

            res.cookie('jwt', token, cookieOptions);

            res.status(200).json({
                status: 'success',
                token,
                data: {
                    user: user
                },
            });
        } catch (error) {
            next(error);
        }
    }

    async getCurrentUser(req, res, next) {
        try {
            if (!req.user) {
                return res.status(200).json({
                    status: 'success',
                    data: { user: null }
                });
            }
            const user = await authService.getCurrentUser(req.user.id_user);
            res.status(200).json({
                status: 'success',
                data: { user }
            });
        } catch (error) {
            next(error);
        }
    }

    async switchContext(req, res, next) {
        try {
            const { tenantId, siteId } = req.body;
            const userId = req.user.id_user;

            const { contextToken } = await authService.switchContext(userId, tenantId, siteId);

            // Set Context Cookie (short lived: 30 minutes)
            const cookieOptions = {
                expires: new Date(Date.now() + 30 * 60 * 1000),
                httpOnly: true,
                secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
            };

            res.cookie('ctx', contextToken, cookieOptions);

            res.status(200).json({
                status: 'success',
                data: { contextToken }
            });
        } catch (error) {
            next(error);
        }
    }

    logout(req, res) {
        res.cookie('jwt', 'loggedout', {
            expires: new Date(Date.now() + 10 * 1000),
            httpOnly: true,
        });
        res.cookie('ctx', 'loggedout', {
            expires: new Date(Date.now() + 10 * 1000),
            httpOnly: true,
        });
        res.status(200).json({ status: 'success' });
    }

    async forgotPassword(req, res, next) {
        try {
            const result = await authService.forgotPassword(req.body.email);
            res.status(200).json({ status: 'success', message: result.message });
        } catch (error) {
            next(error);
        }
    }

    async resetPassword(req, res, next) {
        try {
            const result = await authService.resetPassword(req.params.token, req.body.password);

            const cookieOptions = {
                expires: new Date(
                    Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN || 1) * 24 * 60 * 60 * 1000
                ),
                httpOnly: true,
                secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
            };
            res.cookie('jwt', result.token, cookieOptions);

            res.status(200).json({
                status: 'success',
                token: result.token,
                data: {
                    user: result.user
                },
                message: 'Password reset successful'
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new AuthController();