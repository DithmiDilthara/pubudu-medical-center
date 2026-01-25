import { useState } from "react";
import { Link } from "react-router-dom";
import { FiCheck, FiX, FiActivity } from "react-icons/fi";

// Reusable FormInput Component (inline)
const FormInput = ({ label, name, type = "text", value, onChange, onBlur, placeholder, touched, error, required, disabled, style }) => {
  const hasError = touched && error;
  const isValid = touched && !error && value;

  return (
    <div style={{ marginBottom: "20px", ...style }}>
      <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "#555", fontWeight: "600" }}>
        {label} {required && <span style={{ color: "#e74c3c" }}>*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          width: "100%",
          padding: "12px 15px",
          fontSize: "15px",
          border: "2px solid #ddd",
          borderRadius: "8px",
          boxSizing: "border-box",
          transition: "all 0.3s ease",
          outline: "none",
          fontFamily: "'Inter', 'Segoe UI', sans-serif",
          backgroundColor: disabled ? "#f5f5f5" : "#fff",
          cursor: disabled ? "not-allowed" : "text",
          ...(hasError && { borderColor: "#e74c3c", backgroundColor: "#fff5f5" }),
          ...(isValid && { borderColor: "#27ae60", backgroundColor: "#f0fff4" })
        }}
      />
      {hasError && <span style={{ display: "block", color: "#e74c3c", fontSize: "13px", marginTop: "6px", fontWeight: "600" }}>{error}</span>}
      {isValid && (
        <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#27ae60", fontSize: "13px", marginTop: "6px", fontWeight: "bold" }}>
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
    <div style={{ marginBottom: "20px", ...style }}>
      <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "#555", fontWeight: "600" }}>
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
          padding: "12px 15px",
          fontSize: "15px",
          border: "2px solid #ddd",
          borderRadius: "8px",
          boxSizing: "border-box",
          transition: "all 0.3s ease",
          outline: "none",
          fontFamily: "'Inter', 'Segoe UI', sans-serif",
          backgroundColor: disabled ? "#f5f5f5" : "#fff",
          cursor: "pointer",
          ...(hasError && { borderColor: "#e74c3c", backgroundColor: "#fff5f5" }),
          ...(isValid && { borderColor: "#27ae60", backgroundColor: "#f0fff4" })
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
  const [formData, setFormData] = useState({
    title: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    email: "",
    nic: "",
    phoneNumber: "",
    address: "",
    username: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Reusable validation rules
  const validationRules = {
    title: {
      required: true,
      message: "Title is required"
    },
    firstName: {
      required: true,
      minLength: 2,
      pattern: /^[a-zA-Z\s]+$/,
      messages: {
        required: "First name is required",
        minLength: "First name must be at least 2 characters",
        pattern: "First name can only contain letters"
      }
    },
    lastName: {
      required: true,
      minLength: 2,
      pattern: /^[a-zA-Z\s]+$/,
      messages: {
        required: "Last name is required",
        minLength: "Last name must be at least 2 characters",
        pattern: "Last name can only contain letters"
      }
    },
    dateOfBirth: {
      required: true,
      custom: (value) => {
        try {
          const birthDate = new Date(value);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          return age >= 18 ? null : "Must be at least 18 years old";
        } catch (error) {
          return "Invalid date format";
        }
      },
      message: "Date of birth is required"
    },
    gender: {
      required: true,
      message: "Gender is required"
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      messages: {
        required: "Email is required",
        pattern: "Please enter a valid email"
      }
    },
    nic: {
      required: true,
      minLength: 10,
      messages: {
        required: "NIC is required",
        minLength: "NIC must be at least 10 characters"
      }
    },
    phoneNumber: {
      required: true,
      custom: (value) => {
        try {
          const digits = value.replace(/\D/g, "");
          return digits.length === 10 ? null : "Phone number must be 10 digits";
        } catch (error) {
          return "Invalid phone number";
        }
      },
      message: "Phone number is required"
    },
    address: {
      required: true,
      minLength: 5,
      messages: {
        required: "Address is required",
        minLength: "Address must be at least 5 characters"
      }
    },
    username: {
      required: true,
      minLength: 3,
      pattern: /^[a-zA-Z0-9_]+$/,
      messages: {
        required: "Username is required",
        minLength: "Username must be at least 8 characters",
        pattern: "Username can only contain letters, numbers, and underscores"
      }
    },
    password: {
      required: true,
      minLength: 8,
      custom: (value) => {
        try {
          if (!value) return null;
          if (!/(?=.*[a-z])/.test(value)) return "Must contain lowercase letters";
          if (!/(?=.*[A-Z])/.test(value)) return "Must contain uppercase letters";
          if (!/(?=.*\d)/.test(value)) return "Must contain numbers";
          if (!/(?=.*[@#$!%*?&])/.test(value)) return "Must contain special characters";
          return null;
        } catch (error) {
          return "Password validation error";
        }
      },
      messages: {
        required: "Password is required",
        minLength: "Password must be at least 8 characters"
      }
    },
    confirmPassword: {
      required: true,
      custom: (value) => {
        return value !== formData.password ? "Passwords do not match" : null;
      },
      message: "Please confirm your password"
    },
    agreeTerms: {
      custom: (value) => {
        return !value ? "You must agree to the terms and conditions" : null;
      },
      message: "You must agree to the terms"
    }
  };

  // Reusable validation function with try-catch
  const validateField = (fieldName, value) => {
    try {
      const rule = validationRules[fieldName];
      if (!rule) return "";

      if (rule.required && (!value || (typeof value === "string" && !value.trim()))) {
        return rule.messages?.required || rule.message || "This field is required";
      }

      if (rule.minLength && value?.length < rule.minLength) {
        return rule.messages?.minLength || `Minimum ${rule.minLength} characters required`;
      }

      if (rule.pattern && value && !rule.pattern.test(value)) {
        return rule.messages?.pattern || "Invalid format";
      }

      if (rule.custom) {
        const customError = rule.custom(value);
        if (customError) return customError;
      }

      return "";
    } catch (error) {
      console.error(`Validation error for field ${fieldName}:`, error);
      return "Validation error occurred";
    }
  };

  const handleChange = (e) => {
    try {
      const { name, value, type, checked } = e.target;
      
      setFormData(prev => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value
      }));

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
      
      Object.keys(validationRules).forEach(fieldName => {
        const error = validateField(fieldName, formData[fieldName]);
        if (error) {
          newErrors[fieldName] = error;
        }
      });

      setErrors(newErrors);
      
      const allTouched = Object.keys(validationRules).reduce((acc, field) => {
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

      await new Promise(resolve => setTimeout(resolve, 1500));

      setSuccessMessage("✅ Patient Registration Successful! Redirecting to login...");
      console.log("Registration Data:", formData);
      
      setFormData({
        title: "",
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        gender: "",
        email: "",
        nic: "",
        phoneNumber: "",
        address: "",
        username: "",
        password: "",
        confirmPassword: "",
        agreeTerms: false
      });
      setTouched({});

      setTimeout(() => {
        window.location.href = "/";
      }, 2000);

    } catch (error) {
      console.error("Submission error:", error);
      setGeneralError(error.message || "An error occurred during registration. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordStrength = formData.password ? (
    <div style={styles.passwordRequirements}>
      <p style={styles.requirementsTitle}>Password Requirements:</p>
      <div style={styles.requirement}>
        {/(?=.*[a-z])/.test(formData.password) ? (
          <FiCheck style={styles.checkmark} />
        ) : (
          <FiX style={styles.cross} />
        )}
        <span>Lowercase letter</span>
      </div>
      <div style={styles.requirement}>
        {/(?=.*[A-Z])/.test(formData.password) ? (
          <FiCheck style={styles.checkmark} />
        ) : (
          <FiX style={styles.cross} />
        )}
        <span>Uppercase letter</span>
      </div>
      <div style={styles.requirement}>
        {/(?=.*\d)/.test(formData.password) ? (
          <FiCheck style={styles.checkmark} />
        ) : (
          <FiX style={styles.cross} />
        )}
        <span>Number</span>
      </div>
      <div style={styles.requirement}>
        {/(?=.*[@#$!%*?&])/.test(formData.password) ? (
          <FiCheck style={styles.checkmark} />
        ) : (
          <FiX style={styles.cross} />
        )}
        <span>Special character (@, #, $, !, %, *, ?, &)</span>
      </div>
      <div style={styles.requirement}>
        {formData.password.length >= 8 ? (
          <FiCheck style={styles.checkmark} />
        ) : (
          <FiX style={styles.cross} />
        )}
        <span>Minimum 8 characters</span>
      </div>
    </div>
  ) : null;

  return (
    <div style={styles.container}>
      <div style={styles.leftSide}>
        <div style={styles.formContainer}>
          <h2 style={styles.welcomeTitle}>Patient Registration</h2>
          <p style={styles.welcomeSubtitle}>Create your account to book appointments</p>

          {generalError && <div style={styles.generalError}>{generalError}</div>}
          {successMessage && <div style={styles.successMessage}>{successMessage}</div>}

          <form onSubmit={handleSubmit}>
            {/* Personal Information Section */}
            <SectionHeader title="Personal Information" />

            <div style={styles.formRow}>
              <FormSelect
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                onBlur={handleBlur}
                touched={touched.title}
                error={errors.title}
                options={[
                  { value: "", label: "Select Title" },
                  { value: "Mr", label: "Mr" },
                  { value: "Mrs", label: "Mrs" },
                  { value: "Miss", label: "Miss" },
                  { value: "Dr", label: "Dr" }
                ]}
                required
                style={{ flex: 1, marginRight: "10px" }}
              />
              <FormInput
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                touched={touched.firstName}
                error={errors.firstName}
                placeholder="sayumi"
                required
                style={{ flex: 1, marginRight: "10px" }}
              />
              <FormInput
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                touched={touched.lastName}
                error={errors.lastName}
                placeholder="manujana"
                required
                style={{ flex: 1 }}
              />
            </div>

            <div style={styles.formRow}>
              <FormInput
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                onBlur={handleBlur}
                touched={touched.dateOfBirth}
                error={errors.dateOfBirth}
                required
                style={{ flex: 1, marginRight: "10px" }}
              />
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
                  { value: "Male", label: "Male" },
                  { value: "Female", label: "Female" },
                  { value: "Other", label: "Other" }
                ]}
                required
                style={{ flex: 1 }}
              />
            </div>

            <div style={styles.formRow}>
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
                style={{ flex: 1, marginRight: "10px" }}
              />
              <FormInput
                label="NIC"
                name="nic"
                value={formData.nic}
                onChange={handleChange}
                onBlur={handleBlur}
                touched={touched.nic}
                error={errors.nic}
                placeholder="1234567890V"
                required
                style={{ flex: 1 }}
              />
            </div>

            <div style={styles.formRow}>
              <FormInput
                label="Phone Number"
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                touched={touched.phoneNumber}
                error={errors.phoneNumber}
                placeholder="0771234567"
                required
                style={{ flex: 1, marginRight: "10px" }}
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
                style={{ flex: 1 }}
              />
            </div>

            {/* Account Details Section */}
            <SectionHeader  title="Account Information" />

            <FormInput
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              onBlur={handleBlur}
              touched={touched.username}
              error={errors.username}
              placeholder="Sayumi_01"
              required
            />

            <FormInput
              label="Create Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              touched={touched.password}
              error={errors.password}
              placeholder="••••••••"
              required
            />

            {passwordStrength}

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
            />

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
              Quick, easy, and secure patient registration for quality healthcare services
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", display: "flex", fontFamily: "'Inter', 'Segoe UI', sans-serif" },
  leftSide: { flex: 3, display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#f5f5f5", padding: "40px", overflowY: "auto" },
  rightSide: { flex: 1, background: "linear-gradient(135deg, #0066CC 0%, #0052A3 100%)", display: "flex", justifyContent: "center", alignItems: "center", padding: "40px", color: "white", minHeight: "100vh" },
  rightContent: { textAlign: "center", maxWidth: "500px" },
  logoContainer: { display: "flex", justifyContent: "center", marginBottom: "30px" },
  logoIcon: { width: "120px", height: "120px", backgroundColor: "rgba(255, 255, 255, 0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", border: "3px solid white" },
  logoIconSvg: { fontSize: "72px" },
  centerName: { fontSize: "36px", fontWeight: "bold", marginBottom: "10px", color: "white" },
  tagline: { fontSize: "18px", marginBottom: "50px", color: "rgba(255, 255, 255, 0.9)" },
  quoteContainer: { marginTop: "60px", padding: "30px", backgroundColor: "rgba(255, 255, 255, 0.1)", borderRadius: "15px", backdropFilter: "blur(10px)" },
  quote: { fontSize: "24px", fontStyle: "italic", marginBottom: "15px", fontWeight: "500" },
  quoteSubtext: { fontSize: "16px", color: "rgba(255, 255, 255, 0.9)", lineHeight: "1.6" },
  formContainer: { width: "100%", maxWidth: "700px", backgroundColor: "white", padding: "40px", borderRadius: "12px", boxShadow: "0 10px 40px rgba(0,0,0,0.08)" },
  welcomeTitle: { textAlign: "center", marginBottom: "10px", fontSize: "28px", color: "#333", fontWeight: "bold" },
  welcomeSubtitle: { textAlign: "center", marginBottom: "30px", fontSize: "15px", color: "#666" },
  
  // Section Header Styles
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    marginTop: "25px",
    marginBottom: "20px",
    paddingBottom: "12px",
    borderBottom: "2px solid #333"
  },
  sectionIcon: {
    fontSize: "24px",
    marginRight: "10px"
  },
  sectionTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "700",
    color: "#333"
  },
  
  divider: {
    height: "1px",
    backgroundColor: "#e0e0e0",
    margin: "25px 0"
  },
  
  formRow: { display: "flex", gap: "0", marginBottom: "0" },
  generalError: { padding: "12px 15px", backgroundColor: "#fee", border: "1px solid #e74c3c", borderRadius: "8px", color: "#e74c3c", marginBottom: "20px", fontSize: "14px", fontWeight: "600" },
  successMessage: { padding: "12px 15px", backgroundColor: "#efe", border: "1px solid #27ae60", borderRadius: "8px", color: "#27ae60", marginBottom: "20px", fontSize: "14px", fontWeight: "600" },
  passwordRequirements: { marginTop: "15px", marginBottom: "20px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px", border: "1px solid #e0e0e0" },
  requirementsTitle: { fontSize: "13px", fontWeight: "700", color: "#333", marginBottom: "10px" },
  requirement: { display: "flex", alignItems: "center", fontSize: "13px", color: "#555", marginBottom: "6px" },
  checkmark: { color: "#27ae60", marginRight: "8px", fontSize: "16px", flexShrink: 0 },
  cross: { color: "#e74c3c", marginRight: "8px", fontSize: "16px", flexShrink: 0 },
  submitButton: { width: "100%", padding: "14px", backgroundColor: "#0066CC", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "600", cursor: "pointer", transition: "background-color 0.3s", marginBottom: "15px", fontFamily: "'Inter', 'Segoe UI', sans-serif" },
  submitButtonDisabled: { backgroundColor: "#a0a0a0", cursor: "not-allowed" },
  loginLink: { textAlign: "center" },
  loginText: { margin: "0", fontSize: "14px", color: "#666" },
  linkButton: { background: "none", border: "none", color: "#0066CC", cursor: "pointer", fontSize: "14px", textDecoration: "underline", padding: "0", fontFamily: "'Inter', 'Segoe UI', sans-serif" }
};

export default PatientRegistration;