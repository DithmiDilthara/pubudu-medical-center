// Input validation utilities

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate NIC format (Sri Lankan NIC)
// Supports both old format (9 digits + V/X) and new format (12 digits)
export const isValidNIC = (nic) => {
  const oldNICRegex = /^[0-9]{9}[vVxX]$/;
  const newNICRegex = /^[0-9]{12}$/;
  return oldNICRegex.test(nic) || newNICRegex.test(nic);
};

// Validate contact number (10 digits)
export const isValidContactNumber = (number) => {
  const contactRegex = /^[0-9]{10}$/;
  return contactRegex.test(number.toString());
};

// Validate username (3-50 characters, alphanumeric and underscore)
export const isValidUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,50}$/;
  return usernameRegex.test(username);
};

// Validate password strength
export const isValidPassword = (password) => {
  // Minimum 6 characters
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters' };
  }
  return { valid: true };
};

// Validate date format (YYYY-MM-DD)
export const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

// Validate license number format
export const isValidLicenseNo = (licenseNo) => {
  // Alphanumeric, 5-50 characters
  const licenseRegex = /^[a-zA-Z0-9]{5,50}$/;
  return licenseRegex.test(licenseNo);
};

// Sanitize input to prevent XSS
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

// Validate patient registration data
export const validatePatientRegistration = (data) => {
  const errors = {};

  // Username validation
  if (!data.username) {
    errors.username = 'Username is required';
  } else if (!isValidUsername(data.username)) {
    errors.username = 'Username must be 3-50 characters, alphanumeric and underscore only';
  }

  // Password validation
  if (!data.password) {
    errors.password = 'Password is required';
  } else {
    const passwordCheck = isValidPassword(data.password);
    if (!passwordCheck.valid) {
      errors.password = passwordCheck.message;
    }
  }

  // Email validation (optional)
  if (data.email && !isValidEmail(data.email)) {
    errors.email = 'Invalid email format';
  }

  // Contact number validation (optional)
  if (data.contact_number && !isValidContactNumber(data.contact_number)) {
    errors.contact_number = 'Contact number must be 10 digits';
  }

  // Full name validation
  if (!data.full_name) {
    errors.full_name = 'Full name is required';
  } else if (data.full_name.length < 2) {
    errors.full_name = 'Full name must be at least 2 characters';
  }

  // NIC validation
  if (!data.nic) {
    errors.nic = 'NIC is required';
  } else if (!isValidNIC(data.nic)) {
    errors.nic = 'Invalid NIC format';
  }

  // Gender validation (optional)
  if (data.gender && !['MALE', 'FEMALE', 'OTHER'].includes(data.gender)) {
    errors.gender = 'Invalid gender value';
  }

  // Date of birth validation (optional)
  if (data.date_of_birth && !isValidDate(data.date_of_birth)) {
    errors.date_of_birth = 'Invalid date format';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Validate login data
export const validateLogin = (data) => {
  const errors = {};

  if (!data.username) {
    errors.username = 'Username is required';
  }

  if (!data.password) {
    errors.password = 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
