import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiCheck, FiX, FiActivity, FiAlertCircle, FiEye, FiEyeOff } from "react-icons/fi";
import axios from "axios";
import hospitalBg from "../assets/hospital_clear.png";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Reusable FormInput Component (inline)
const FormInput = ({ label, name, type = "text", value, onChange, onBlur, placeholder, touched, error, required, disabled, style, showPassword, onTogglePassword, hints }) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasError = touched && error;
  const isValid = touched && !error && value;
  const isPassword = type === "password";

  return (
    <div style={{ marginBottom: "16px", ...style }}>
      <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "#374151", fontWeight: "600" }}>
        {label} {required && <span style={{ color: "#EF4444" }}>*</span>}
      </label>
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <input
          type={isPassword ? (showPassword ? "text" : "password") : type}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={(e) => {
            setIsFocused(false);
            if (onBlur) onBlur(e);
          }}
          onFocus={(e) => {
            setIsFocused(true);
            if (!disabled) {
              e.target.style.borderColor = "#0066CC";
              e.target.style.backgroundColor = "#FFFFFF";
              e.target.style.boxShadow = "0 0 0 4px rgba(0, 102, 204, 0.1)";
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          style={{
            width: "100%",
            padding: isPassword ? "13px 45px 13px 16px" : "13px 16px",
            fontSize: "15px",
            border: "2px solid #E5E7EB",
            borderRadius: "10px",
            boxSizing: "border-box",
            transition: "all 0.2s ease",
            outline: "none",
            fontFamily: "'Inter', sans-serif",
            backgroundColor: disabled ? "#F3F4F6" : "#F9FAFB",
            color: "#111827",
            cursor: disabled ? "not-allowed" : "text",
            ...(hasError && { borderColor: "#EF4444", backgroundColor: "#FEF2F2" }),
            ...(isValid && { borderColor: "#10B981", backgroundColor: "#F0FDF4" }),
            ...(isFocused && !hasError && { borderColor: "#0066CC", backgroundColor: "#FFFFFF", boxShadow: "0 0 0 4px rgba(0, 102, 204, 0.1)" })
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={onTogglePassword}
            style={{
              position: "absolute",
              right: "12px",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#6B7280",
              fontSize: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              zIndex: 2
            }}
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        )}
      </div>
      {hints && isFocused && (
        <div style={{
          marginTop: "8px",
          padding: "12px",
          backgroundColor: "#FFFFFF",
          borderRadius: "10px",
          border: "1px solid #E5E7EB",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          zIndex: 10,
          animation: "slideDown 0.2s ease-out"
        }}>
          <p style={{ fontSize: "12px", color: "#4B5563", fontWeight: "600", marginBottom: "6px" }}>Requirements:</p>
          <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12px", color: "#6B7280", listStyleType: "disc" }}>
            {hints.map((hint, index) => (
              <li key={index} style={{ marginBottom: "3px" }}>{hint}</li>
            ))}
          </ul>
        </div>
      )}
      {hasError && <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#DC2626", fontSize: "13px", marginTop: "8px", fontWeight: "500" }}> <FiAlertCircle /> {error}</span>}
      {isValid && (
        <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#059669", fontSize: "13px", marginTop: "8px", fontWeight: "500" }}>
          <FiCheck style={{ fontSize: "14px" }} />
        </span>
      )}
    </div>
  );
};

// Reusable FormSelect Component (inline)
const FormSelect = ({ label, name, value, onChange, onBlur, options, touched, error, required, disabled, style }) => {
  const hasError = touched && error;
  const isValid = touched && !error && value;

  return (
    <div style={{ marginBottom: "12px", ...style }}>
      <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", color: "#555", fontWeight: "600" }}>
        {label} {required && <span style={{ color: "#e74c3c" }}>*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        style={{
          width: "100%",
          padding: "13px 16px",
          fontSize: "15px",
          border: "2px solid #E5E7EB",
          borderRadius: "10px",
          boxSizing: "border-box",
          transition: "all 0.2s ease",
          outline: "none",
          fontFamily: "'Inter', sans-serif",
          backgroundColor: disabled ? "#F3F4F6" : "#F9FAFB",
          color: "#111827",
          cursor: "pointer",
          ...(hasError && { borderColor: "#EF4444", backgroundColor: "#FEF2F2" }),
          ...(isValid && { borderColor: "#10B981", backgroundColor: "#F0FDF4" })
        }}
        onFocus={(e) => {
          if (!disabled) {
            e.target.style.borderColor = "#0066CC";
            e.target.style.backgroundColor = "#FFFFFF";
            e.target.style.boxShadow = "0 0 0 4px rgba(0, 102, 204, 0.1)";
          }
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hasError && <span style={{ display: "block", color: "#e74c3c", fontSize: "13px", marginTop: "6px", fontWeight: "600" }}> {error}</span>}
      {isValid && (
        <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#27ae60", fontSize: "13px", marginTop: "6px", fontWeight: "bold" }}>
          <FiCheck style={{ fontSize: "14px" }} />
        </span>
      )}
    </div>
  );
};

// Reusable FormCheckbox Component (inline)
const FormCheckbox = ({ label, name, checked, onChange, onBlur, error, required, disabled }) => {
  return (
    <>
      <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "15px", gap: "10px" }}>
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          style={{ marginTop: "4px", cursor: "pointer", width: "18px", height: "18px", flexShrink: 0, accentColor: "#0066CC" }}
        />
        <label style={{ fontSize: "14px", color: "#555", lineHeight: "1.5", cursor: "pointer" }}>
          {label} {required && <span style={{ color: "#e74c3c" }}>*</span>}
        </label>
      </div>
      {error && <span style={{ display: "block", color: "#e74c3c", fontSize: "13px", marginTop: "-10px", marginBottom: "10px", fontWeight: "600" }}> {error}</span>}
    </>
  );
};

// Section Header Component
const SectionHeader = ({ icon, title }) => (
  <div style={styles.sectionHeader}>
    <span style={styles.sectionIcon}>{icon}</span>
    <h3 style={styles.sectionTitle}>{title}</h3>
  </div>
);

function PatientRegistration() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    contact_number: "",
    full_name: "",
    patient_type: "ADULT",
    nic: "",
    guardian_name: "",
    guardian_contact: "",
    guardian_relationship: "",
    gender: "",
    date_of_birth: "",
    address: "",
    blood_group: "",
    allergies: "",
    agreeTerms: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Validation rules
  const validateField = (fieldName, value) => {
    let error = "";

    switch (fieldName) {
      case "username":
        if (!value.trim()) {
          error = "Username is required";
        } else if (value.length < 4 || value.length > 15) {
          error = "Username must be between 4 and 15 characters";
        } else if (!/^[A-Z]/.test(value)) {
          error = "Username must start with a capital letter";
        } else if (!value.includes("_")) {
          error = "Username must include an underscore (_)";
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          error = "Username can only contain letters, numbers, and underscores";
        }
        break;

      case "password":
        if (!value) {
          error = "Password is required";
        } else if (value.length < 8) {
          error = "Password must be at least 8 characters";
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])/.test(value)) {
          error = "Password must include uppercase, lowercase, a number, and a special character";
        }
        break;

      case "confirmPassword":
        if (!value) {
          error = "Please confirm your password";
        } else if (value !== formData.password) {
          error = "Passwords do not match";
        }
        break;

      case "email":
        if (!value) {
          error = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Please enter a valid email";
        } else if (!value.toLowerCase().endsWith('@gmail.com')) {
          error = "Only @gmail.com emails are allowed";
        }
        break;

      case "contact_number":
        if (!value) {
          error = "Phone number is required";
        } else {
          const digits = value.replace(/\D/g, "");
          const validPrefixes = ['070', '071', '072', '074', '075', '076', '077', '078'];
          const prefix = digits.substring(0, 3);
          
          if (digits.length !== 10) error = "Phone number must be exactly 10 digits";
          else if (!digits.startsWith('07')) error = "Phone number must start with 07";
          else if (!validPrefixes.includes(prefix)) error = "Invalid Sri Lankan mobile prefix";
          else if (/(\d)\1{7,}/.test(digits)) error = "Too many repeating digits";
          else if (/0123456|1234567|2345678|3456789/.test(digits)) error = "Sequential numbers not allowed";
        }
        break;

      case "full_name":
        if (!value.trim()) {
          error = "Full name is required";
        } else if (value.length < 3) {
          error = "Full name must be at least 3 characters";
        } else if (!/^[a-zA-Z\s.]+$/.test(value)) {
          error = "Full name can only contain letters, spaces and periods";
        }
        break;

      case "nic":
        if (formData.patient_type === 'ADULT') {
          if (!value.trim()) {
            error = "NIC is required";
          } else {
            const nic = value.trim().toUpperCase();
            const oldNicRegex = /^[0-9]{9}[VX]$/;
            const newNicRegex = /^[0-9]{12}$/;
            
            if (!oldNicRegex.test(nic) && !newNicRegex.test(nic)) {
              error = "Invalid NIC format (e.g., 123456789V or 12 digits)";
            } else {
              const digitsOnly = nic.replace(/[VX]/g, '');
              if (/(\d)\1{8,}/.test(digitsOnly)) error = "Invalid repeating pattern";
              if (/012345678|123456789|987654321/.test(digitsOnly)) error = "Sequential digits not allowed";
            }
          }
        }
        break;

      case "guardian_name":
        if (formData.patient_type === 'CHILD') {
          if (!value.trim()) error = "Guardian name is required";
          else if (value.length < 3) error = "Guardian name must be at least 3 characters";
          else if (!/^[a-zA-Z\s.]+$/.test(value)) error = "Guardian name can only contain letters, spaces and periods";
        }
        break;

      case "guardian_contact":
        if (formData.patient_type === 'CHILD') {
          if (!value.trim()) error = "Guardian contact is required";
          else {
            const digits = value.replace(/\D/g, "");
            if (digits.length !== 10) error = "Phone number must be exactly 10 digits";
            else if (!digits.startsWith('07')) error = "Phone number must start with 07";
          }
        }
        break;

      case "guardian_relationship":
        if (formData.patient_type === 'CHILD') {
          if (!value.trim()) error = "Guardian relationship is required";
        }
        break;

      case "gender":
        if (!value) {
          error = "Gender is required";
        }
        break;

      case "date_of_birth":
        if (!value) {
          error = "Date of birth is required";
        } else {
          const birthDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (birthDate > today) {
            error = "Birth date cannot be in the future";
          } else {
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
              age--;
            }

            if (formData.patient_type === 'ADULT' && age < 18) {
              error = "Adult patients must be 18 years or older";
            } else if (formData.patient_type === 'CHILD' && age >= 18) {
              error = "Child patients must be under 18 years old";
            }
          }
        }
        break;

      case "address":
        if (!value.trim()) {
          error = "Address is required";
        } else if (value.length < 5) {
          error = "Address must be at least 5 characters";
        }
        break;

      case "blood_group":
        // Optional but if provided, it's already from select
        break;

      case "allergies":
        // Optional
        break;

      case "agreeTerms":
        if (!value) {
          error = "You must agree to the terms and conditions";
        }
        break;
    }

    return error;
  };

  const handleChange = (e) => {
    try {
      const { name, value, type, checked } = e.target;
      const fieldValue = type === "checkbox" ? checked : value;

      setFormData(prev => {
        const updated = { ...prev, [name]: fieldValue };
        // Clear type-specific fields when switching patient_type
        if (name === 'patient_type') {
          if (fieldValue === 'ADULT') {
            updated.guardian_name = '';
            updated.guardian_contact = '';
            updated.guardian_relationship = '';
          } else {
            updated.nic = '';
          }
          // Clear errors for type-specific fields
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.nic;
            delete newErrors.guardian_name;
            delete newErrors.guardian_contact;
            delete newErrors.guardian_relationship;
            delete newErrors.date_of_birth; // Force re-validation of age if type changes
            return newErrors;
          });
        }
        return updated;
      });

      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: ""
        }));
      }

      setGeneralError("");
    } catch (error) {
      console.error("Error in handleChange:", error);
      setGeneralError("An error occurred while updating the form");
    }
  };

  const handleBlur = (e) => {
    try {
      const { name } = e.target;
      setTouched(prev => ({
        ...prev,
        [name]: true
      }));

      const error = validateField(name, formData[name]);
      if (error) {
        setErrors(prev => ({
          ...prev,
          [name]: error
        }));
      }
    } catch (error) {
      console.error("Error in handleBlur:", error);
    }
  };

  const validateForm = () => {
    try {
      const newErrors = {};
      let requiredFields = ["username", "password", "confirmPassword", "full_name", "gender", "email", "contact_number", "date_of_birth", "address", "agreeTerms"];

      // Add conditional required fields
      if (formData.patient_type === 'ADULT') {
        requiredFields.push('nic');
      } else {
        requiredFields.push('guardian_name', 'guardian_contact', 'guardian_relationship');
      }

      requiredFields.forEach(field => {
        const error = validateField(field, formData[field]);
        if (error) {
          newErrors[field] = error;
        }
      });

      setErrors(newErrors);

      const allTouched = requiredFields.reduce((acc, field) => {
        acc[field] = true;
        return acc;
      }, {});
      setTouched(allTouched);

      return Object.keys(newErrors).length === 0;
    } catch (error) {
      console.error("Validation error:", error);
      setGeneralError("An error occurred during validation");
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setGeneralError("");
    setSuccessMessage("");

    try {
      if (!validateForm()) {
        setGeneralError("Please fix all errors before submitting");
        return;
      }

      if (!formData.agreeTerms) {
        setErrors(prev => ({ ...prev, agreeTerms: "You must agree to the terms and conditions" }));
        setGeneralError("Please agree to the terms and conditions");
        return;
      }

      // Prepare data for API
      const registrationData = {
        username: formData.username,
        password: formData.password,
        email: formData.email || null,
        phone: formData.contact_number || null,
        full_name: formData.full_name,
        patient_type: formData.patient_type,
        nic: formData.patient_type === 'ADULT' ? formData.nic : null,
        guardian_name: formData.patient_type === 'CHILD' ? formData.guardian_name : null,
        guardian_contact: formData.patient_type === 'CHILD' ? formData.guardian_contact : null,
        guardian_relationship: formData.patient_type === 'CHILD' ? formData.guardian_relationship : null,
        gender: formData.gender,
        date_of_birth: formData.date_of_birth || null,
        address: formData.address || null,
        blood_group: formData.blood_group || null,
        allergies: formData.allergies || null
      };

      const response = await axios.post(`${API_URL}/auth/register-patient`, registrationData);

      if (response.data.success) {
        setSuccessMessage("Registration successful! Redirecting to email verification...");

        setTimeout(() => {
          navigate("/register/verify", { 
            state: { 
              otpToken: response.data.otpToken,
              email: formData.email 
            } 
          });
        }, 1500);
      } else {
        setGeneralError(response.data.message || "Registration failed. Please try again.");
      }

    } catch (error) {
      setGeneralError(error.response?.data?.message || error.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.leftSide}>
        <div style={styles.leftBackground} />
        <div style={styles.formContainer}>
          {/* Form Title */}
          <h1 style={styles.welcomeTitle}>Create Account</h1>
          <p style={styles.welcomeSubtitle}>Join Pubudu Medical Center patient portal</p>

          <style>
            {`
                @keyframes slideDown {
                  from { opacity: 0; transform: translateY(-10px); }
                  to { opacity: 1; transform: translateY(0); }
                }
              `}
          </style>

          {generalError && (
            <div style={styles.generalError}>
              <FiAlertCircle style={{ marginRight: "8px" }} />
              {generalError}
            </div>
          )}
          {successMessage && (
            <div style={styles.successMessage}>
              <FiCheck style={{ marginRight: "8px" }} />
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* 1. Account Type Selection (Always First) */}
            <div style={{ 
              marginBottom: "24px", 
              padding: "20px", 
              backgroundColor: "#F9FAFB", 
              borderRadius: "12px", 
              border: "1px solid #E5E7EB" 
            }}>
              <label style={{ display: "block", marginBottom: "12px", fontSize: "14px", color: "#374151", fontWeight: "600" }}>
                Select Account Type <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <div style={{ display: "flex", gap: "12px" }}>
                {['ADULT', 'CHILD'].map(type => (
                  <label key={type} style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "12px",
                    borderRadius: "10px",
                    border: `2px solid ${formData.patient_type === type ? '#0066CC' : '#E5E7EB'}`,
                    backgroundColor: formData.patient_type === type ? '#F0F7FF' : '#FFFFFF',
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    fontWeight: formData.patient_type === type ? "600" : "400",
                    color: formData.patient_type === type ? '#0066CC' : '#6B7280',
                    fontSize: "14px"
                  }}>
                    <input
                      type="radio"
                      name="patient_type"
                      value={type}
                      checked={formData.patient_type === type}
                      onChange={handleChange}
                      style={{ display: "none" }}
                    />
                    {type === 'ADULT' ? ' Adults Account (Age 18+)' : 'Child Account (Under 18)'}
                  </label>
                ))}
              </div>
            </div>

            {/* 2. Guardian Details (Only for Child, comes FIRST) */}
            {formData.patient_type === 'CHILD' && (
              <>
                <SectionHeader title="Guardian Information" />
                <div style={styles.gridContainer}>
                  <FormInput
                    label="Guardian Name"
                    name="guardian_name"
                    value={formData.guardian_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    touched={touched.guardian_name}
                    error={errors.guardian_name}
                    placeholder="John Doe"
                    required
                    style={{ gridColumn: "1 / -1" }}
                  />
                  <FormInput
                    label="Guardian Contact"
                    name="guardian_contact"
                    value={formData.guardian_contact}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    touched={touched.guardian_contact}
                    error={errors.guardian_contact}
                    placeholder="0771234567"
                    required
                  />
                  <FormSelect
                    label="Guardian Relationship"
                    name="guardian_relationship"
                    value={formData.guardian_relationship}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    touched={touched.guardian_relationship}
                    error={errors.guardian_relationship}
                    options={[
                      { value: "", label: "Select Relationship" },
                      { value: "Father", label: "Father" },
                      { value: "Mother", label: "Mother" },
                      { value: "Guardian", label: "Guardian" }
                    ]}
                    required
                  />
                </div>
              </>
            )}

            {/* 3. Patient Details (Renamed from Personal Information) */}
            <SectionHeader title={formData.patient_type === 'ADULT' ? "Patient Details" : "Child Information"} />

            <div style={styles.gridContainer}>
              <FormInput
                label="Full Name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                onBlur={handleBlur}
                touched={touched.full_name}
                error={errors.full_name}
                placeholder="Sayumi Manujana"
                required
                style={{ gridColumn: "1 / -1" }}
              />

              {/* Conditional: NIC for Adult */}
              {formData.patient_type === 'ADULT' && (
                <FormInput
                  label="NIC"
                  name="nic"
                  value={formData.nic}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  touched={touched.nic}
                  error={errors.nic}
                  placeholder="123456789V"
                  required
                  style={{ gridColumn: "1 / -1" }}
                />
              )}

              <FormSelect
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                onBlur={handleBlur}
                touched={touched.gender}
                error={errors.gender}
                options={[
                  { value: "", label: "Select Gender" },
                  { value: "MALE", label: "Male" },
                  { value: "FEMALE", label: "Female" },
                  { value: "OTHER", label: "Other" }
                ]}
                required
              />

              <FormInput
                label="Date of Birth"
                name="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={handleChange}
                onBlur={handleBlur}
                touched={touched.date_of_birth}
                error={errors.date_of_birth}
                required
              />

              <FormInput
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                touched={touched.email}
                error={errors.email}
                placeholder="sayumi@example.com"
                required
              />

              <FormInput
                label="Phone Number"
                name="contact_number"
                type="tel"
                value={formData.contact_number}
                onChange={handleChange}
                onBlur={handleBlur}
                touched={touched.contact_number}
                error={errors.contact_number}
                placeholder="0771234567"
                required
              />

              <FormInput
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                onBlur={handleBlur}
                touched={touched.address}
                error={errors.address}
                placeholder="123 Main St, Colombo"
                required
              />

              <FormSelect
                label="Blood Group"
                name="blood_group"
                value={formData.blood_group}
                onChange={handleChange}
                onBlur={handleBlur}
                touched={touched.blood_group}
                error={errors.blood_group}
                options={[
                  { value: "", label: "Select Blood Group" },
                  { value: "A+", label: "A+" },
                  { value: "A-", label: "A-" },
                  { value: "B+", label: "B+" },
                  { value: "B-", label: "B-" },
                  { value: "O+", label: "O+" },
                  { value: "O-", label: "O-" },
                  { value: "AB+", label: "AB+" },
                  { value: "AB-", label: "AB-" }
                ]}
              />

              <FormInput
                label="Allergies / Medical Conditions"
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                onBlur={handleBlur}
                touched={touched.allergies}
                error={errors.allergies}
                placeholder="Peanuts, Penicillin, etc. (Optional)"
              />
            </div>


            {/* Account Details Section */}
            <SectionHeader title="Account Information" />

            <div style={styles.gridContainer}>
              <FormInput
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                onBlur={handleBlur}
                touched={touched.username}
                error={errors.username}
                placeholder="Sayumi_manujana"
                required
                style={{ gridColumn: "1 / -1" }}
                hints={[
                  "4-15 characters long",
                  "Must start with a capital letter",
                  "Must include an underscore (_)"
                ]}
              />

              <FormInput
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                touched={touched.password}
                error={errors.password}
                placeholder="••••••••"
                required
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
                hints={[
                  "Minimum 8 characters",
                  "Include uppercase & lowercase",
                  "Include at least one number",
                  "Include at least one special character"
                ]}
              />

              <FormInput
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                touched={touched.confirmPassword}
                error={errors.confirmPassword}
                placeholder="••••••••"
                required
                showPassword={showConfirmPassword}
                onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            </div>

            <div style={styles.divider}></div>

            <FormCheckbox
              label="I agree to the Terms of Service and Privacy Policy"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.agreeTerms}
              required
            />

            <button
              type="submit"
              style={{
                ...styles.submitButton,
                ...(isSubmitting ? styles.submitButtonDisabled : {})
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Registering..." : "Create Account"}
            </button>

            <div style={styles.loginLink}>
              <p style={styles.loginText}>
                Already have an account?{" "}
                <Link to="/" style={styles.linkButton}>
                  Login
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      <div style={styles.rightSide}>
        <div style={styles.rightContent}>
          <div style={styles.logoContainer}>
            <div style={styles.logoIcon}>
              <FiActivity style={styles.logoIconSvg} />
            </div>
          </div>
          <h1 style={styles.centerName}>Pubudu Medical Center</h1>
          <p style={styles.tagline}>E-Channeling System</p>
          <div style={styles.quoteContainer}>
            <p style={styles.quote}>"Your Health, Our Priority"</p>
            <p style={styles.quoteSubtext}>
              Providing quality healthcare services with care and compassion
            </p>
          </div>
        </div>
      </div>
    </div >
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    backgroundColor: '#F9FAFB'
  },
  leftSide: {
    flex: 7,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px 60px',
    position: 'relative',
    overflow: 'hidden'
  },
  leftBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `linear-gradient(rgba(37, 99, 235, 0.4), rgba(29, 78, 216, 0.5)), url(${hospitalBg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: 'blur(8px)',
    zIndex: 0
  },
  rightSide: {
    flex: 3,
    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '60px',
    color: 'white',
    position: 'relative',
    overflow: 'hidden'
  },
  rightContent: {
    textAlign: 'center',
    maxWidth: '500px',
    position: 'relative',
    zIndex: 2
  },
  logoContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '40px'
  },
  logoIcon: {
    width: '100px',
    height: '100px',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    border: '3px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(10px)'
  },
  logoIconSvg: {
    fontSize: '52px'
  },
  centerName: {
    fontSize: '32px',
    fontWeight: '700',
    marginBottom: '12px',
    color: 'white',
    letterSpacing: '-0.5px',
    fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif"
  },
  tagline: {
    fontSize: '16px',
    marginBottom: '50px',
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '500'
  },
  quoteContainer: {
    marginTop: '80px',
    padding: '32px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  },
  quote: {
    fontSize: '22px',
    fontStyle: 'italic',
    marginBottom: '12px',
    fontWeight: '600',
    lineHeight: '1.4'
  },
  quoteSubtext: {
    fontSize: '15px',
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: '1.6',
    margin: 0
  },
  formContainer: {
    width: '100%',
    maxWidth: '850px',
    backgroundColor: '#FFFFFF',
    padding: '40px',
    borderRadius: '24px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    border: '1px solid rgba(0,0,0,0.05)',
    position: 'relative',
    zIndex: 1,
    maxHeight: '95vh',
    overflowY: 'auto'
  },
  welcomeTitle: {
    textAlign: 'center',
    marginBottom: '8px',
    fontSize: '32px',
    color: '#111827',
    fontWeight: '800',
    letterSpacing: '-0.5px',
    fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif"
  },
  welcomeSubtitle: {
    textAlign: 'center',
    marginBottom: '36px',
    fontSize: '15px',
    color: '#6B7280',
    fontWeight: '500'
  },
  generalError: {
    padding: '12px 16px',
    backgroundColor: '#FEE2E2',
    border: '1px solid #EF4444',
    borderRadius: '8px',
    color: '#DC2626',
    marginBottom: '20px',
    fontSize: '14px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center'
  },
  successMessage: {
    padding: '12px 16px',
    backgroundColor: '#F0FDF4',
    border: '1px solid #10B981',
    borderRadius: '8px',
    color: '#059669',
    marginBottom: '20px',
    fontSize: '14px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center'
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    marginTop: "16px",
    marginBottom: "12px",
    paddingBottom: "8px",
    borderBottom: "2px solid #E5E7EB"
  },
  sectionIcon: {
    fontSize: "20px",
    marginRight: "8px",
    color: "#0066CC"
  },
  sectionTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "700",
    color: "#111827"
  },
  divider: {
    height: "1px",
    backgroundColor: "#E5E7EB",
    margin: "16px 0"
  },
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px 16px"
  },
  submitButton: {
    width: "100%",
    padding: "16px",
    backgroundColor: "#2563eb",
    color: "white",
    borderRadius: "12px",
    border: "none",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 10px 15px -3px rgba(37, 99, 235, 0.2)",
    marginTop: "20px"
  },
  submitButtonDisabled: {
    background: '#9CA3AF',
    cursor: 'not-allowed',
    boxShadow: 'none'
  },
  loginLink: { textAlign: 'center', paddingTop: '20px', borderTop: '1px solid #E5E7EB' },
  loginText: { margin: "0", fontSize: "14px", color: "#6B7280", fontWeight: "500" },
  linkButton: { background: "none", border: "none", color: "#0066CC", cursor: "pointer", fontSize: "14px", textDecoration: "none", padding: "0", fontFamily: "'Inter', sans-serif", fontWeight: "600" }
};

export default PatientRegistration;