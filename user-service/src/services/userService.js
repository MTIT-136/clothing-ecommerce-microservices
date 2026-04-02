const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');

const SALT_ROUNDS = 10;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function assertValidObjectId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('Invalid user ID');
    err.code = 'INVALID_ID';
    throw err;
  }
}

function validationDetail(message) {
  return { message };
}

function throwValidation(message, details) {
  const err = new Error(message);
  err.code = 'VALIDATION_ERROR';
  err.details = details;
  throw err;
}

function mapMongooseError(err) {
  if (err.code === 11000) {
    const duplicate = new Error('Email already registered');
    duplicate.code = 'DUPLICATE_EMAIL';
    return duplicate;
  }
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message).join(', ');
    const validationErr = new Error(messages);
    validationErr.code = 'VALIDATION_ERROR';
    validationErr.details = err.errors;
    return validationErr;
  }
  return err;
}

function stripPassword(user) {
  if (!user) return user;
  const out = { ...user };
  delete out.password;
  return out;
}

function assertPlainPassword(password, fieldLabel = 'Password') {
  if (typeof password !== 'string') {
    throwValidation(`${fieldLabel} must be a string`, {
      password: validationDetail(`${fieldLabel} must be a string`),
    });
  }
  const trimmed = password.trim();
  if (trimmed.length < 8) {
    throwValidation(`${fieldLabel} must be at least 8 characters`, {
      password: validationDetail(`${fieldLabel} must be at least 8 characters`),
    });
  }
}

function assertValidEmailFormat(email, fieldKey = 'email') {
  if (!EMAIL_REGEX.test(email)) {
    throwValidation('Please provide a valid email address', {
      [fieldKey]: validationDetail('Please provide a valid email address'),
    });
  }
}

async function registerUser(data) {
  const { name, email, password, role } = data || {};

  if (typeof name !== 'string' || !name.trim()) {
    throwValidation('Name is required', {
      name: validationDetail('Name is required'),
    });
  }
  if (typeof email !== 'string' || !email.trim()) {
    throwValidation('Email is required', {
      email: validationDetail('Email is required'),
    });
  }
  if (
    password === undefined ||
    password === null ||
    (typeof password === 'string' && password.trim() === '')
  ) {
    throwValidation('Password is required', {
      password: validationDetail('Password is required'),
    });
  }

  assertPlainPassword(password);
  const trimmedName = name.trim();
  const trimmedEmail = email.trim().toLowerCase();
  assertValidEmailFormat(trimmedEmail);

  const hashedPassword = await bcrypt.hash(password.trim(), SALT_ROUNDS);

  try {
    const user = await User.create({
      name: trimmedName,
      email: trimmedEmail,
      password: hashedPassword,
      ...(role !== undefined ? { role } : {}),
    });
    return stripPassword(user.toObject());
  } catch (err) {
    throw mapMongooseError(err);
  }
}

async function getAllUsers() {
  try {
    const users = await User.find().sort({ createdAt: -1 }).lean();
    return users.map((u) => stripPassword(u));
  } catch (err) {
    throw mapMongooseError(err);
  }
}

async function getUserById(id) {
  assertValidObjectId(id);

  try {
    const user = await User.findById(id).lean();
    if (!user) {
      const notFound = new Error('User not found');
      notFound.code = 'NOT_FOUND';
      throw notFound;
    }
    return stripPassword(user);
  } catch (err) {
    if (err.code === 'NOT_FOUND' || err.code === 'INVALID_ID') throw err;
    throw mapMongooseError(err);
  }
}

async function updateUser(id, updates) {
  assertValidObjectId(id);

  const allowed = ['name', 'email', 'role', 'password'];
  const patch = {};
  for (const key of allowed) {
    if (updates[key] !== undefined) {
      patch[key] = updates[key];
    }
  }

  if (Object.keys(patch).length === 0) {
    const err = new Error('No valid fields to update');
    err.code = 'NO_UPDATES';
    throw err;
  }

  if (patch.password !== undefined) {
    assertPlainPassword(patch.password);
    patch.password = await bcrypt.hash(patch.password.trim(), SALT_ROUNDS);
  }
  if (typeof patch.name === 'string') {
    patch.name = patch.name.trim();
    if (!patch.name) {
      throwValidation('Name cannot be empty', {
        name: validationDetail('Name cannot be empty'),
      });
    }
  }
  if (typeof patch.email === 'string') {
    patch.email = patch.email.trim().toLowerCase();
    if (!patch.email) {
      throwValidation('Email cannot be empty', {
        email: validationDetail('Email cannot be empty'),
      });
    }
    assertValidEmailFormat(patch.email);
  }

  try {
    const user = await User.findByIdAndUpdate(id, patch, {
      new: true,
      runValidators: true,
    }).lean();

    if (!user) {
      const notFound = new Error('User not found');
      notFound.code = 'NOT_FOUND';
      throw notFound;
    }
    return stripPassword(user);
  } catch (err) {
    if (err.code === 'NOT_FOUND' || err.code === 'INVALID_ID' || err.code === 'NO_UPDATES') {
      throw err;
    }
    throw mapMongooseError(err);
  }
}

async function deleteUser(id) {
  assertValidObjectId(id);

  try {
    const user = await User.findByIdAndDelete(id).lean();
    if (!user) {
      const notFound = new Error('User not found');
      notFound.code = 'NOT_FOUND';
      throw notFound;
    }
    return stripPassword(user);
  } catch (err) {
    if (err.code === 'NOT_FOUND' || err.code === 'INVALID_ID') throw err;
    throw mapMongooseError(err);
  }
}

module.exports = {
  registerUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
