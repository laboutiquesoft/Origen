// src/entities/user.js

export default class User {
  constructor({
    id_user,
    email,
    password,
    first_name = null,
    last_name = null,
    signature = null,
    status = true,
    id_tenant = null,
    reset_password_token = null,
    reset_password_expires = null,
    created_at = null,
    updated_at = null
  }) {
    if (!email) throw new Error('Email is required');
    if (!password) throw new Error('Password is required');

    this.id = id_user;
    this.email = email;
    this.password = password;
    this.firstName = first_name;
    this.lastName = last_name;
    this.signature = signature;
    this.status = status;
    this.tenantId = id_tenant;
    this.resetPasswordToken = reset_password_token;
    this.resetPasswordExpires = reset_password_expires;
    this.createdAt = created_at;
    this.updatedAt = updated_at;
  }

  isActive() {
    return this.status === true;
  }

  belongsToTenant(tenantId) {
    return this.tenantId === tenantId;
  }

  hasSignature() {
    return Boolean(this.signature);
  }

  hasPasswordResetExpired() {
    if (!this.resetPasswordExpires) return true;
    return new Date() > new Date(this.resetPasswordExpires);
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      signature: this.signature,
      status: this.status,
      tenantId: this.tenantId
    };
  }
}