import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { FiSearch, FiUser, FiMail, FiPhone, FiMapPin, FiCreditCard, FiLock } from "react-icons/fi";
import ReceptionistSidebar from "../../components/ReceptionistSidebar";
import ReceptionistHeader from "../../components/ReceptionistHeader";

function AddPatient() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("nic");
  const [searchResult, setSearchResult] = useState(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);

  useEffect(() => {
    if (location.state?.showRegistration) {
      setShowRegistrationForm(true);
    }
  }, [location.state]);

  const [formData, setFormData] = useState({
    fullName: "",
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
  const [focusedField, setFocusedField] = useState(null);

  // Validation rules
  const validationRules = {
    fullName: {
      required: true,
      minLength: 3,
      pattern: /^[a-zA-Z\s.]+$/,
      messages: {
        required: "Full name is required",
        minLength: "Full name must be at least 3 characters",
        pattern: "Full name can only contain letters, spaces and periods"
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
      custom: (value) => {
        if (!value) return "NIC is required";
        if (value.length > 12) return "NIC cannot exceed 12 characters";
        if (!/^(?:\d{9}[vVxX]|\d{12})$/.test(value)) {
          return "Invalid NIC format (9 digits + V/X or 12 digits)";
        }
        return null;
      }
    },
    username: {
      required: true,
      custom: (value) => {
        if (!value) return "Username is required";
        if (value.length < 4 || value.length > 15) return "Username must be 4-15 characters";
        if (!/^[A-Z]/.test(value)) return "Username must start with a capital letter";
        if (!value.includes("_")) return "Username must include an underscore (_)";
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return "Only letters, numbers, and underscores allowed";
        return null;
      }
    },
    password: {
      required: true,
      custom: (value) => {
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])/.test(value)) {
          return "Must include uppercase, lowercase, a number, and a special character";
        }
        return null;
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

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search value");
      return;
    }

    const toastId = toast.loading("Searching for patient...");
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/receptionist/search-patient`, {
        params: { query: searchQuery, type: searchType },
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        if (response.data.exists) {
          toast.success("Patient is already registered!", { id: toastId });
          setSearchResult({
            exists: true,
            message: "Patient is already registered in the system!",
            data: response.data.data
          });
          setShowRegistrationForm(false);
        } else {
          toast.dismiss(toastId);
          toast((t) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontWeight: '500' }}>Patient is not existing in the system.</span>
              <button
                onClick={() => {
                  setShowRegistrationForm(true);
                  setSearchResult(null);
                  toast.dismiss(t.id);
                }}
                style={{
                  backgroundColor: '#0066CC',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '13px'
                }}
              >
                Proceed with Registration
              </button>
            </div>
          ), { duration: 6000, icon: 'ℹ️' });
          setSearchResult(null);
          setShowRegistrationForm(false);
        }
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search for patient.", { id: toastId });
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

  const handleSubmit = async (e) => {
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
        toast.error("Please fix all errors before submitting");
        setIsSubmitting(false);
        return;
      }

      // Prepare data for API
      const registrationData = {
        username: formData.username,
        password: formData.password,
        email: formData.email || null,
        contact_number: formData.phoneNumber ? parseInt(formData.phoneNumber.replace(/\D/g, "")) : null,
        full_name: formData.fullName,
        nic: formData.nic,
        gender: formData.gender.toUpperCase(),
        date_of_birth: formData.dateOfBirth || null,
        address: formData.address || null
      };

      const token = localStorage.getItem('token');
      const toastId = toast.loading("Registering patient...");
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/receptionist/register-patient`,
        registrationData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Patient registered successfully!", { id: toastId });

        // Reset form
        setFormData({
          fullName: "",
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
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(error.response?.data?.message || "An error occurred while registering the patient.", { id: toastId });
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
            {!showRegistrationForm && (
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
                  <div style={searchResult.exists ? styles.existsContainer : styles.notExistsContainer}>
                    <div style={{
                      ...styles.resultMessage,
                      ...(searchResult.exists ? styles.existsMessage : styles.notExistsMessage)
                    }}>
                      {searchResult.message}
                    </div>
                    {searchResult.exists && (
                      <button
                        onClick={() => navigate("/receptionist/appointments/new", { state: { patient: searchResult.data } })}
                        style={styles.bookNowButton}
                      >
                        Process to Booking Appointment
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Registration Form */}
            {showRegistrationForm && (
              <div style={styles.registrationSection}>
                <h2 style={styles.sectionTitle}>New Patient Registration</h2>

                <form onSubmit={handleSubmit} style={styles.form}>
                  <style>
                    {`
                      @keyframes slideDown {
                        from { opacity: 0; transform: translateY(-10px); }
                        to { opacity: 1; transform: translateY(0); }
                      }
                    `}
                  </style>

                  {/* Full Name */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Full Name <span style={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Enter full name"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      style={{
                        ...styles.input,
                        ...(touched.fullName && errors.fullName ? styles.inputError : {}),
                        ...(touched.fullName && !errors.fullName && formData.fullName ? styles.inputValid : {})
                      }}
                      required
                    />
                    {touched.fullName && errors.fullName && (
                      <span style={styles.errorText}>{errors.fullName}</span>
                    )}
                    {touched.fullName && !errors.fullName && formData.fullName && (
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
                      placeholder="Sayumi_manujana"
                      value={formData.username}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField("username")}
                      onBlur={(e) => {
                        handleBlur(e);
                        setFocusedField(null);
                      }}
                      style={{
                        ...styles.input,
                        ...(touched.username && errors.username ? styles.inputError : {}),
                        ...(touched.username && !errors.username && formData.username ? styles.inputValid : {})
                      }}
                      required
                    />
                    {focusedField === "username" && (
                      <div style={styles.hintsBox}>
                        <p style={styles.hintsTitle}>Requirements:</p>
                        <ul style={styles.hintsList}>
                          <li>4-15 characters long</li>
                          <li>Must start with a capital letter</li>
                          <li>Must include an underscore (_)</li>
                        </ul>
                      </div>
                    )}
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
                      onFocus={() => setFocusedField("password")}
                      onBlur={(e) => {
                        handleBlur(e);
                        setFocusedField(null);
                      }}
                      style={{
                        ...styles.input,
                        ...(touched.password && errors.password ? styles.inputError : {}),
                        ...(touched.password && !errors.password && formData.password ? styles.inputValid : {})
                      }}
                      required
                    />
                    {focusedField === "password" && (
                      <div style={styles.hintsBox}>
                        <p style={styles.hintsTitle}>Requirements:</p>
                        <ul style={styles.hintsList}>
                          <li>Minimum 8 characters</li>
                          <li>Include uppercase & lowercase</li>
                          <li>Include at least one number</li>
                          <li>Include at least one special character</li>
                        </ul>
                      </div>
                    )}
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
                          fullName: "",
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
    accentColor: "#0066CC"
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
    background: "linear-gradient(135deg, #0066CC 0%, #0052A3 100%)",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.3s",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    boxShadow: "0 4px 12px rgba(0, 102, 204, 0.3)"
  },
  resultMessage: {
    marginTop: "16px",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "14px",
    fontWeight: "600",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  existsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "20px"
  },
  notExistsContainer: {
    marginBottom: "20px"
  },
  bookNowButton: {
    padding: "12px 24px",
    backgroundColor: "#0066CC",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    alignSelf: "center",
    boxShadow: "0 4px 6px rgba(0, 102, 204, 0.2)",
    transition: "transform 0.2s",
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
    background: "linear-gradient(135deg, #0066CC 0%, #0052A3 100%)",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.3s",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    boxShadow: "0 4px 12px rgba(0, 102, 204, 0.3)"
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
  },
  hintsBox: {
    marginTop: "8px",
    padding: "12px",
    backgroundColor: "#FFFFFF",
    borderRadius: "8px",
    border: "1px solid #E5E7EB",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    zIndex: 10,
    animation: "slideDown 0.2s ease-out"
  },
  hintsTitle: {
    fontSize: "12px",
    color: "#4B5563",
    fontWeight: "600",
    marginBottom: "6px",
    margin: 0
  },
  hintsList: {
    margin: 0,
    paddingLeft: "18px",
    fontSize: "12px",
    color: "#6B7280",
    listStyleType: "disc"
  }
};

export default AddPatient;
