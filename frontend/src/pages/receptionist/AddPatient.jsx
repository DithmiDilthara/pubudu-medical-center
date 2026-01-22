import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiUser, FiMail, FiPhone, FiMapPin, FiCreditCard, FiLock } from "react-icons/fi";
import ReceptionistSidebar from "../../components/ReceptionistSidebar";
import ReceptionistHeader from "../../components/ReceptionistHeader";

function AddPatient() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("nic");
  const [searchResult, setSearchResult] = useState(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    phoneNumber: "",
    email: "",
    nic: "",
    username: "",
    password: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation rules
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
          if (birthDate > today) return "Date of birth cannot be in the future";
          const age = today.getFullYear() - birthDate.getFullYear();
          return age >= 0 ? null : "Invalid date of birth";
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
    address: {
      required: true,
      minLength: 5,
      messages: {
        required: "Address is required",
        minLength: "Address must be at least 5 characters"
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
    username: {
      required: true,
      minLength: 3,
      pattern: /^[a-zA-Z0-9_]+$/,
      messages: {
        required: "Username is required",
        minLength: "Username must be at least 3 characters",
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
    }
  };

  // Validate field function
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

  // Validate all fields
  const validateAllFields = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    return newErrors;
  };

  const handleLogout = () => {
    console.log("Receptionist logged out");
    navigate("/");
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      alert("Please enter a search value");
      return;
    }

    // Simulate patient search (replace with actual API call)
    // For demo, we'll assume patient doesn't exist
    const patientExists = false; // This would come from your backend

    if (patientExists) {
      setSearchResult({
        exists: true,
        message: "Patient is already registered in the system!"
      });
      setShowRegistrationForm(false);
    } else {
      setSearchResult({
        exists: false,
        message: "Patient is not registered. Please proceed with registration."
      });
      setShowRegistrationForm(true);
    }
  };

  const handleInputChange = (e) => {
    try {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));

      // Clear error when user starts typing
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: ""
        }));
      }
    } catch (error) {
      console.error("Error handling input change:", error);
    }
  };

  const handleBlur = (e) => {
    try {
      const { name, value } = e.target;
      setTouched(prev => ({ ...prev, [name]: true }));
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    } catch (error) {
      console.error("Error handling blur:", error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // Mark all fields as touched
      const allTouched = {};
      Object.keys(formData).forEach(key => {
        allTouched[key] = true;
      });
      setTouched(allTouched);

      // Validate all fields
      const validationErrors = validateAllFields();
      setErrors(validationErrors);

      // Check if there are any errors
      if (Object.keys(validationErrors).length > 0) {
        alert("Please fix all errors before submitting");
        setIsSubmitting(false);
        return;
      }

      // Submit form data (replace with actual API call)
      console.log("Registering patient:", formData);
      alert("Patient registered successfully!");
      
      // Reset form
      setFormData({
        title: "",
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        gender: "",
        address: "",
        phoneNumber: "",
        email: "",
        nic: "",
        username: "",
        password: "",
        confirmPassword: ""
      });
      setErrors({});
      setTouched({});
      setSearchQuery("");
      setSearchResult(null);
      setShowRegistrationForm(false);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred while registering the patient. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <ReceptionistSidebar onLogout={handleLogout} />

      {/* Main Content */}
      <div style={styles.mainWrapper}>
        {/* Header */}
        <ReceptionistHeader receptionistName="Sarah Johnson" />

        {/* Page Content */}
        <main style={styles.mainContent}>
          <div style={styles.contentCard}>
            <h1 style={styles.pageTitle}>Add New Patient</h1>

            {/* Search Section */}
            <div style={styles.searchSection}>
              <h2 style={styles.sectionTitle}>Search Patient</h2>
              <p style={styles.sectionSubtitle}>
                Check if patient is already registered
              </p>

              <div style={styles.searchContainer}>
                <div style={styles.searchTypeContainer}>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="searchType"
                      value="nic"
                      checked={searchType === "nic"}
                      onChange={(e) => setSearchType(e.target.value)}
                      style={styles.radioInput}
                    />
                    NIC Number
                  </label>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="searchType"
                      value="phone"
                      checked={searchType === "phone"}
                      onChange={(e) => setSearchType(e.target.value)}
                      style={styles.radioInput}
                    />
                    Phone Number
                  </label>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="searchType"
                      value="name"
                      checked={searchType === "name"}
                      onChange={(e) => setSearchType(e.target.value)}
                      style={styles.radioInput}
                    />
                    Name
                  </label>
                </div>

                <div style={styles.searchInputContainer}>
                  <FiSearch style={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder={`Enter patient ${searchType === "nic" ? "NIC number" : searchType === "phone" ? "phone number" : "name"}`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={styles.searchInput}
                  />
                  <button onClick={handleSearch} style={styles.searchButton}>
                    Search
                  </button>
                </div>
              </div>

              {/* Search Result Message */}
              {searchResult && (
                <div style={{
                  ...styles.resultMessage,
                  ...(searchResult.exists ? styles.existsMessage : styles.notExistsMessage)
                }}>
                  {searchResult.message}
                </div>
              )}
            </div>

            {/* Registration Form */}
            {showRegistrationForm && (
              <div style={styles.registrationSection}>
                <h2 style={styles.sectionTitle}>New Patient Registration</h2>
                
                <form onSubmit={handleSubmit} style={styles.form}>
                  {/* Title */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Title <span style={styles.required}>*</span>
                    </label>
                    <select
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      style={{
                        ...styles.select,
                        ...(touched.title && errors.title ? styles.inputError : {}),
                        ...(touched.title && !errors.title && formData.title ? styles.inputValid : {})
                      }}
                      required
                    >
                      <option value="">Mr. / Mrs. / Ms. / Rev</option>
                      <option value="Mr">Mr.</option>
                      <option value="Mrs">Mrs.</option>
                      <option value="Ms">Ms.</option>
                      <option value="Rev">Rev.</option>
                    </select>
                    {touched.title && errors.title && (
                      <span style={styles.errorText}>{errors.title}</span>
                    )}
                    {touched.title && !errors.title && formData.title && (
                      <span style={styles.validText}>✓</span>
                    )}
                  </div>

                  {/* First Name */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      First Name <span style={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      placeholder="Enter first name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      style={{
                        ...styles.input,
                        ...(touched.firstName && errors.firstName ? styles.inputError : {}),
                        ...(touched.firstName && !errors.firstName && formData.firstName ? styles.inputValid : {})
                      }}
                      required
                    />
                    {touched.firstName && errors.firstName && (
                      <span style={styles.errorText}>{errors.firstName}</span>
                    )}
                    {touched.firstName && !errors.firstName && formData.firstName && (
                      <span style={styles.validText}>✓</span>
                    )}
                  </div>

                  {/* Last Name */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Last Name <span style={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Enter last name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      style={{
                        ...styles.input,
                        ...(touched.lastName && errors.lastName ? styles.inputError : {}),
                        ...(touched.lastName && !errors.lastName && formData.lastName ? styles.inputValid : {})
                      }}
                      required
                    />
                    {touched.lastName && errors.lastName && (
                      <span style={styles.errorText}>{errors.lastName}</span>
                    )}
                    {touched.lastName && !errors.lastName && formData.lastName && (
                      <span style={styles.validText}>✓</span>
                    )}
                  </div>

                  {/* Date of Birth & Gender */}
                  <div style={styles.formRow}>
                    <div style={styles.formGroupHalf}>
                      <label style={styles.label}>
                        Date of Birth <span style={styles.required}>*</span>
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        placeholder="YYYY-MM-DD"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        style={{
                          ...styles.input,
                          ...(touched.dateOfBirth && errors.dateOfBirth ? styles.inputError : {}),
                          ...(touched.dateOfBirth && !errors.dateOfBirth && formData.dateOfBirth ? styles.inputValid : {})
                        }}
                        required
                      />
                      {touched.dateOfBirth && errors.dateOfBirth && (
                        <span style={styles.errorText}>{errors.dateOfBirth}</span>
                      )}
                      {touched.dateOfBirth && !errors.dateOfBirth && formData.dateOfBirth && (
                        <span style={styles.validText}>✓</span>
                      )}
                    </div>
                    <div style={styles.formGroupHalf}>
                      <label style={styles.label}>
                        Gender <span style={styles.required}>*</span>
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        style={{
                          ...styles.select,
                          ...(touched.gender && errors.gender ? styles.inputError : {}),
                          ...(touched.gender && !errors.gender && formData.gender ? styles.inputValid : {})
                        }}
                        required
                      >
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      {touched.gender && errors.gender && (
                        <span style={styles.errorText}>{errors.gender}</span>
                      )}
                      {touched.gender && !errors.gender && formData.gender && (
                        <span style={styles.validText}>✓</span>
                      )}
                    </div>
                  </div>

                  {/* Address */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Address <span style={styles.required}>*</span>
                    </label>
                    <textarea
                      name="address"
                      placeholder="Enter full address"
                      value={formData.address}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      style={{
                        ...styles.textarea,
                        ...(touched.address && errors.address ? styles.inputError : {}),
                        ...(touched.address && !errors.address && formData.address ? styles.inputValid : {})
                      }}
                      rows="3"
                      required
                    />
                    {touched.address && errors.address && (
                      <span style={styles.errorText}>{errors.address}</span>
                    )}
                    {touched.address && !errors.address && formData.address && (
                      <span style={styles.validText}>✓</span>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Phone Number <span style={styles.required}>*</span>
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      placeholder="Enter phone number"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      style={{
                        ...styles.input,
                        ...(touched.phoneNumber && errors.phoneNumber ? styles.inputError : {}),
                        ...(touched.phoneNumber && !errors.phoneNumber && formData.phoneNumber ? styles.inputValid : {})
                      }}
                      required
                    />
                    {touched.phoneNumber && errors.phoneNumber && (
                      <span style={styles.errorText}>{errors.phoneNumber}</span>
                    )}
                    {touched.phoneNumber && !errors.phoneNumber && formData.phoneNumber && (
                      <span style={styles.validText}>✓</span>
                    )}
                  </div>

                  {/* Email Address */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Email Address <span style={styles.required}>*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter email address"
                      value={formData.email}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      style={{
                        ...styles.input,
                        ...(touched.email && errors.email ? styles.inputError : {}),
                        ...(touched.email && !errors.email && formData.email ? styles.inputValid : {})
                      }}
                      required
                    />
                    {touched.email && errors.email && (
                      <span style={styles.errorText}>{errors.email}</span>
                    )}
                    {touched.email && !errors.email && formData.email && (
                      <span style={styles.validText}>✓</span>
                    )}
                  </div>

                  {/* National NIC Number */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      National NIC Number <span style={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      name="nic"
                      placeholder="Enter NIC number"
                      value={formData.nic}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      style={{
                        ...styles.input,
                        ...(touched.nic && errors.nic ? styles.inputError : {}),
                        ...(touched.nic && !errors.nic && formData.nic ? styles.inputValid : {})
                      }}
                      required
                    />
                    {touched.nic && errors.nic && (
                      <span style={styles.errorText}>{errors.nic}</span>
                    )}
                    {touched.nic && !errors.nic && formData.nic && (
                      <span style={styles.validText}>✓</span>
                    )}
                  </div>

                  {/* Username */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Username <span style={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      name="username"
                      placeholder="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      style={{
                        ...styles.input,
                        ...(touched.username && errors.username ? styles.inputError : {}),
                        ...(touched.username && !errors.username && formData.username ? styles.inputValid : {})
                      }}
                      required
                    />
                    {touched.username && errors.username && (
                      <span style={styles.errorText}>{errors.username}</span>
                    )}
                    {touched.username && !errors.username && formData.username && (
                      <span style={styles.validText}>✓</span>
                    )}
                  </div>

                  {/* Password */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Password <span style={styles.required}>*</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Enter New Password"
                      value={formData.password}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      style={{
                        ...styles.input,
                        ...(touched.password && errors.password ? styles.inputError : {}),
                        ...(touched.password && !errors.password && formData.password ? styles.inputValid : {})
                      }}
                      required
                    />
                    {touched.password && errors.password && (
                      <span style={styles.errorText}>{errors.password}</span>
                    )}
                    {touched.password && !errors.password && formData.password && (
                      <span style={styles.validText}>✓</span>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Confirm Password <span style={styles.required}>*</span>
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm new password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      style={{
                        ...styles.input,
                        ...(touched.confirmPassword && errors.confirmPassword ? styles.inputError : {}),
                        ...(touched.confirmPassword && !errors.confirmPassword && formData.confirmPassword ? styles.inputValid : {})
                      }}
                      required
                    />
                    {touched.confirmPassword && errors.confirmPassword && (
                      <span style={styles.errorText}>{errors.confirmPassword}</span>
                    )}
                    {touched.confirmPassword && !errors.confirmPassword && formData.confirmPassword && (
                      <span style={styles.validText}>✓</span>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div style={styles.buttonContainer}>
                    <button 
                      type="submit" 
                      style={{
                        ...styles.submitButton,
                        ...(isSubmitting ? styles.submitButtonDisabled : {})
                      }}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Registering..." : "Register Patient"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowRegistrationForm(false);
                        setSearchResult(null);
                        setSearchQuery("");
                        setFormData({
                          title: "",
                          firstName: "",
                          lastName: "",
                          dateOfBirth: "",
                          gender: "",
                          address: "",
                          phoneNumber: "",
                          email: "",
                          nic: "",
                          username: "",
                          password: "",
                          confirmPassword: ""
                        });
                        setErrors({});
                        setTouched({});
                      }}
                      style={styles.cancelButton}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    backgroundColor: "#f9fafb"
  },
  mainWrapper: {
    flex: 1,
    display: "flex",
    flexDirection: "column"
  },
  mainContent: {
    flex: 1,
    padding: "32px",
    overflow: "auto"
  },
  contentCard: {
    maxWidth: "900px",
    margin: "0 auto",
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "32px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
  },
  pageTitle: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1f2937",
    margin: 0,
    marginBottom: "32px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  searchSection: {
    marginBottom: "32px",
    paddingBottom: "32px",
    borderBottom: "2px solid #f3f4f6"
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#374151",
    margin: 0,
    marginBottom: "8px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  sectionSubtitle: {
    fontSize: "14px",
    color: "#6b7280",
    margin: 0,
    marginBottom: "20px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  searchContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  searchTypeContainer: {
    display: "flex",
    gap: "24px"
  },
  radioLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    color: "#374151",
    fontWeight: "500",
    cursor: "pointer",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  radioInput: {
    cursor: "pointer",
    accentColor: "#8b9dff"
  },
  searchInputContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    position: "relative"
  },
  searchIcon: {
    position: "absolute",
    left: "16px",
    fontSize: "20px",
    color: "#9ca3af",
    pointerEvents: "none"
  },
  searchInput: {
    flex: 1,
    padding: "12px 16px 12px 48px",
    fontSize: "15px",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    outline: "none",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    transition: "all 0.2s"
  },
  searchButton: {
    padding: "12px 32px",
    fontSize: "15px",
    fontWeight: "600",
    color: "white",
    background: "linear-gradient(135deg, #8b9dff 0%, #9b7bc8 100%)",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.3s",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    boxShadow: "0 4px 12px rgba(139, 157, 255, 0.3)"
  },
  resultMessage: {
    marginTop: "16px",
    padding: "16px",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "600",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  existsMessage: {
    backgroundColor: "#fef2f2",
    color: "#dc2626",
    border: "2px solid #fca5a5"
  },
  notExistsMessage: {
    backgroundColor: "#f0fdf4",
    color: "#16a34a",
    border: "2px solid #86efac"
  },
  registrationSection: {
    marginTop: "32px"
  },
  form: {
    marginTop: "24px"
  },
  formGroup: {
    marginBottom: "20px"
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginBottom: "20px"
  },
  formGroupHalf: {
    display: "flex",
    flexDirection: "column"
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "8px",
    display: "block",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    fontSize: "15px",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    outline: "none",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    transition: "all 0.2s",
    boxSizing: "border-box"
  },
  inputError: {
    borderColor: "#e74c3c",
    backgroundColor: "#fff5f5"
  },
  inputValid: {
    borderColor: "#27ae60",
    backgroundColor: "#f0fff4"
  },
  select: {
    width: "100%",
    padding: "12px 16px",
    fontSize: "15px",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    outline: "none",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    transition: "all 0.2s",
    backgroundColor: "white",
    cursor: "pointer",
    boxSizing: "border-box"
  },
  textarea: {
    width: "100%",
    padding: "12px 16px",
    fontSize: "15px",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    outline: "none",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    transition: "all 0.2s",
    resize: "vertical",
    boxSizing: "border-box"
  },
  required: {
    color: "#e74c3c",
    marginLeft: "4px"
  },
  errorText: {
    display: "block",
    color: "#e74c3c",
    fontSize: "13px",
    marginTop: "6px",
    fontWeight: "600",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  validText: {
    display: "block",
    color: "#27ae60",
    fontSize: "13px",
    marginTop: "6px",
    fontWeight: "bold",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  buttonContainer: {
    display: "flex",
    gap: "16px",
    marginTop: "32px"
  },
  submitButton: {
    flex: 1,
    padding: "14px 32px",
    fontSize: "16px",
    fontWeight: "600",
    color: "white",
    background: "linear-gradient(135deg, #8b9dff 0%, #9b7bc8 100%)",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.3s",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    boxShadow: "0 4px 12px rgba(139, 157, 255, 0.3)"
  },
  submitButtonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed"
  },
  cancelButton: {
    flex: 1,
    padding: "14px 32px",
    fontSize: "16px",
    fontWeight: "600",
    color: "#6b7280",
    backgroundColor: "white",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.3s",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  }
};

export default AddPatient;
