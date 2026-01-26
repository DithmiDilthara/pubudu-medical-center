import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiCheck, FiX, FiActivity, FiAlertCircle } from "react-icons/fi";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    contact_number: "",
    full_name: "",
    nic: "",
    gender: "",
    date_of_birth: "",
    address: "",
    agreeTerms: false
  });

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
        } else if (value.length < 3) {
          error = "Username must be at least 3 characters";
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          error = "Username can only contain letters, numbers, and underscores";
        }
        break;

      case "password":
        if (!value) {
          error = "Password is required";
        } else if (value.length < 8) {
          error = "Password must be at least 8 characters";
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
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Please enter a valid email";
        }
        break;

      case "contact_number":
        if (value && !/^[0-9]{10}$/.test(value)) {
          error = "Contact number must be 10 digits";
        }
        break;

      case "full_name":
        if (!value.trim()) {
          error = "Full name is required";
        } else if (value.length < 2) {
          error = "Full name must be at least 2 characters";
        }
        break;

      case "nic":
        if (!value.trim()) {
          error = "NIC is required";
        } else if (!/^[0-9]{9}[vVxX]$/.test(value) && !/^[0-9]{12}$/.test(value)) {
          error = "Invalid NIC format";
        }
        break;

      case "gender":
        if (!value) {
          error = "Gender is required";
        }
        break;

      case "date_of_birth":
        if (value) {
          const birthDate = new Date(value);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          if (age < 18) {
            error = "Must be at least 18 years old";
          }
        }
        break;

      case "address":
        if (value && value.length < 5) {
          error = "Address must be at least 5 characters";
        }
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
      
      setFormData(prev => ({
        ...prev,
        [name]: fieldValue
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
      const requiredFields = ["username", "password", "confirmPassword", "full_name", "nic", "gender", "agreeTerms"];
      
      requiredFields.forEach(fieldName => {
        const error = validateField(fieldName, formData[fieldName]);
        if (error) {
          newErrors[fieldName] = error;
        }
      });

      // Validate optional fields if filled
      ["email", "contact_number", "date_of_birth", "address"].forEach(field => {
        if (formData[field]) {
          const error = validateField(field, formData[field]);
          if (error) {
            newErrors[field] = error;
          }
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

      // Prepare data for API
      const registrationData = {
        username: formData.username,
        password: formData.password,
        email: formData.email || null,
        contact_number: formData.contact_number ? parseInt(formData.contact_number) : null,
        full_name: formData.full_name,
        nic: formData.nic,
        gender: formData.gender,
        date_of_birth: formData.date_of_birth || null,
        address: formData.address || null
      };

      // Call registration API directly without auto-login
      const response = await axios.post(`${API_URL}/auth/register`, registrationData);

      if (response.data.success) {
        setSuccessMessage("Registration successful! Redirecting to login page...");
        
        setTimeout(() => {
          navigate("/");
        }, 2000);
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
        <div style={styles.formContainer}>
          <h2 style={styles.welcomeTitle}>Patient Registration</h2>
          <p style={styles.welcomeSubtitle}>Create your account to book appointments</p>

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
            {/* Personal Information Section */}
            <SectionHeader title="Personal Information" />

            <FormInput
              label="Full Name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              onBlur={handleBlur}
              touched={touched.full_name}
              error={errors.full_name}
              placeholder="John Doe"
              required
            />

            <div style={styles.formRow}>
              <FormInput
                label="NIC"
                name="nic"
                value={formData.nic}
                onChange={handleChange}
                onBlur={handleBlur}
                touched={touched.nic}
                error={errors.nic}
                placeholder="123456789V or 200012345678"
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
                  { value: "MALE", label: "Male" },
                  { value: "FEMALE", label: "Female" },
                  { value: "OTHER", label: "Other" }
                ]}
                required
                style={{ flex: 1 }}
              />
            </div>

            <FormInput
              label="Date of Birth"
              name="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={handleChange}
              onBlur={handleBlur}
              touched={touched.date_of_birth}
              error={errors.date_of_birth}
            />

            <FormInput
              label="Email (Optional)"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              touched={touched.email}
              error={errors.email}
              placeholder="john@example.com"
            />

            <FormInput
              label="Phone Number (Optional)"
              name="contact_number"
              type="tel"
              value={formData.contact_number}
              onChange={handleChange}
              onBlur={handleBlur}
              touched={touched.contact_number}
              error={errors.contact_number}
              placeholder="0771234567"
            />

            <FormInput
              label="Address (Optional)"
              name="address"
              value={formData.address}
              onChange={handleChange}
              onBlur={handleBlur}
              touched={touched.address}
              error={errors.address}
              placeholder="123 Main St, Colombo"
            />

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
              placeholder="john_doe"
              required
            />

            <div style={styles.formRow}>
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
                style={{ flex: 1, marginRight: "10px" }}
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
                style={{ flex: 1 }}
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
  generalError: { padding: "12px 15px", backgroundColor: "#fee", border: "1px solid #e74c3c", borderRadius: "8px", color: "#e74c3c", marginBottom: "20px", fontSize: "14px", fontWeight: "600", display: "flex", alignItems: "center" },
  successMessage: { padding: "12px 15px", backgroundColor: "#efe", border: "1px solid #27ae60", borderRadius: "8px", color: "#27ae60", marginBottom: "20px", fontSize: "14px", fontWeight: "600", display: "flex", alignItems: "center" },
  submitButton: { width: "100%", padding: "14px", backgroundColor: "#0066CC", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "600", cursor: "pointer", transition: "background-color 0.3s", marginBottom: "15px", fontFamily: "'Inter', 'Segoe UI', sans-serif" },
  submitButtonDisabled: { backgroundColor: "#a0a0a0", cursor: "not-allowed" },
  loginLink: { textAlign: "center" },
  loginText: { margin: "0", fontSize: "14px", color: "#666" },
  linkButton: { background: "none", border: "none", color: "#0066CC", cursor: "pointer", fontSize: "14px", textDecoration: "underline", padding: "0", fontFamily: "'Inter', 'Segoe UI', sans-serif" }
};

export default PatientRegistration;