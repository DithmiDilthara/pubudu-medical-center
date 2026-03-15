import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiMail, FiPhone, FiMapPin, FiCreditCard, FiLock, FiCalendar, FiActivity, FiShield, FiAlertCircle, FiCheck } from "react-icons/fi";
import ReceptionistSidebar from "../../components/ReceptionistSidebar";
import ReceptionistHeader from "../../components/ReceptionistHeader";
import { useAuth } from "../../context/AuthContext";

function AddPatient() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const receptionistName = user?.profile?.full_name || user?.username || "Receptionist";
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

  const validateField = (fieldName, value) => {
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
  };

  const validateAllFields = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    return newErrors;
  };

  const handleLogout = () => {
    navigate("/");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const allTouched = {};
    Object.keys(formData).forEach(key => { allTouched[key] = true; });
    setTouched(allTouched);

    const validationErrors = validateAllFields();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please fix all errors before submitting");
      setIsSubmitting(false);
      return;
    }

    const toastId = toast.loading("Registering patient...");
    try {
      const registrationData = {
        username: formData.username,
        password: formData.password,
        email: formData.email || null,
        phone: formData.phoneNumber ? formData.phoneNumber.replace(/\D/g, "") : null,
        full_name: formData.fullName,
        nic: formData.nic,
        gender: formData.gender.toUpperCase(),
        date_of_birth: formData.dateOfBirth || null,
        address: formData.address || null
      };

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/receptionist/register-patient`,
        registrationData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Patient registered successfully!", { id: toastId });
        navigate("/receptionist/patients");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred during registration.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <ReceptionistSidebar onLogout={handleLogout} />

      <div className="main-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
        <ReceptionistHeader receptionistName={receptionistName} />

        <main className="content-padding" style={{ flex: 1, overflowY: 'auto', padding: '40px 20px' }}>
          <div style={styles.pageHeaderWrapper}>
            <h1 style={styles.welcomeTitle}>Patient Registration</h1>
            <p style={styles.welcomeSubtitle}>Enter the patient's information to register them in the system securely.</p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={styles.contentCard}
          >
            <form onSubmit={handleSubmit}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                style={styles.section}
              >
                <div style={styles.sectionHeader}>
                  <div style={styles.sectionIcon}><FiUser /></div>
                  <h2 style={styles.sectionTitle}>Personal Details</h2>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Full Name <span style={styles.required}>*</span></label>
                  <div style={styles.inputWrapper}>
                    <FiUser style={{...styles.inputIcon, color: focusedField === 'fullName' ? '#2563eb' : '#94a3b8'}} />
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Enter patient's full name"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField('fullName')}
                      onBlur={(e) => { handleBlur(e); setFocusedField(null); }}
                      style={{
                        ...styles.input,
                        ...(focusedField === 'fullName' ? styles.inputFocus : {}),
                        ...(touched.fullName && errors.fullName ? styles.errorInput : {})
                      }}
                    />
                    {touched.fullName && !errors.fullName && formData.fullName && <div style={styles.validBadge}><FiCheck /></div>}
                  </div>
                  {touched.fullName && errors.fullName && <div style={styles.errorText}><FiAlertCircle /> {errors.fullName}</div>}
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Date of Birth <span style={styles.required}>*</span></label>
                    <div style={styles.inputWrapper}>
                      <FiCalendar style={{...styles.inputIcon, color: focusedField === 'dateOfBirth' ? '#2563eb' : '#94a3b8'}} />
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('dateOfBirth')}
                        onBlur={(e) => { handleBlur(e); setFocusedField(null); }}
                        style={{
                          ...styles.input,
                          ...(focusedField === 'dateOfBirth' ? styles.inputFocus : {}),
                          ...(touched.dateOfBirth && errors.dateOfBirth ? styles.errorInput : {})
                        }}
                      />
                    </div>
                    {touched.dateOfBirth && errors.dateOfBirth && <div style={styles.errorText}><FiAlertCircle /> {errors.dateOfBirth}</div>}
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Gender <span style={styles.required}>*</span></label>
                    <div style={styles.inputWrapper}>
                      <FiActivity style={{...styles.inputIcon, color: focusedField === 'gender' ? '#2563eb' : '#94a3b8'}} />
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('gender')}
                        onBlur={(e) => { handleBlur(e); setFocusedField(null); }}
                        style={{
                          ...styles.select,
                          ...(focusedField === 'gender' ? styles.inputFocus : {}),
                          ...(touched.gender && errors.gender ? styles.errorInput : {})
                        }}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    {touched.gender && errors.gender && <div style={styles.errorText}><FiAlertCircle /> {errors.gender}</div>}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                style={styles.section}
              >
                <div style={styles.sectionHeader}>
                  <div style={styles.sectionIcon}><FiMapPin /></div>
                  <h2 style={styles.sectionTitle}>Contact Information</h2>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Physical Address <span style={styles.required}>*</span></label>
                  <div style={styles.inputWrapper}>
                    <FiMapPin style={{...styles.inputIcon, top: '18px', color: focusedField === 'address' ? '#2563eb' : '#94a3b8'}} />
                    <textarea
                      name="address"
                      placeholder="Enter patient's residence address"
                      value={formData.address}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField('address')}
                      onBlur={(e) => { handleBlur(e); setFocusedField(null); }}
                      style={{
                        ...styles.textarea,
                        ...(focusedField === 'address' ? styles.inputFocus : {}),
                        ...(touched.address && errors.address ? styles.errorInput : {})
                      }}
                    />
                  </div>
                  {touched.address && errors.address && <div style={styles.errorText}><FiAlertCircle /> {errors.address}</div>}
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Phone Number <span style={styles.required}>*</span></label>
                    <div style={styles.inputWrapper}>
                      <FiPhone style={{...styles.inputIcon, color: focusedField === 'phoneNumber' ? '#2563eb' : '#94a3b8'}} />
                      <input
                        type="tel"
                        name="phoneNumber"
                        placeholder="07X XXX XXXX"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('phoneNumber')}
                        onBlur={(e) => { handleBlur(e); setFocusedField(null); }}
                        style={{
                          ...styles.input,
                          ...(focusedField === 'phoneNumber' ? styles.inputFocus : {}),
                          ...(touched.phoneNumber && errors.phoneNumber ? styles.errorInput : {})
                        }}
                      />
                      {touched.phoneNumber && !errors.phoneNumber && formData.phoneNumber && <div style={styles.validBadge}><FiCheck /></div>}
                    </div>
                    {touched.phoneNumber && errors.phoneNumber && <div style={styles.errorText}><FiAlertCircle /> {errors.phoneNumber}</div>}
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Email Address <span style={styles.required}>*</span></label>
                    <div style={styles.inputWrapper}>
                      <FiMail style={{...styles.inputIcon, color: focusedField === 'email' ? '#2563eb' : '#94a3b8'}} />
                      <input
                        type="email"
                        name="email"
                        placeholder="patient@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('email')}
                        onBlur={(e) => { handleBlur(e); setFocusedField(null); }}
                        style={{
                          ...styles.input,
                          ...(focusedField === 'email' ? styles.inputFocus : {}),
                          ...(touched.email && errors.email ? styles.errorInput : {})
                        }}
                      />
                      {touched.email && !errors.email && formData.email && <div style={styles.validBadge}><FiCheck /></div>}
                    </div>
                    {touched.email && errors.email && <div style={styles.errorText}><FiAlertCircle /> {errors.email}</div>}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                style={styles.section}
              >
                <div style={styles.sectionHeader}>
                  <div style={styles.sectionIcon}><FiShield /></div>
                  <h2 style={styles.sectionTitle}>Security & Credentials</h2>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>NIC Number <span style={styles.required}>*</span></label>
                  <div style={styles.inputWrapper}>
                    <FiCreditCard style={{...styles.inputIcon, color: focusedField === 'nic' ? '#2563eb' : '#94a3b8'}} />
                    <input
                      type="text"
                      name="nic"
                      placeholder="Enter 9 or 12 digit NIC"
                      value={formData.nic}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField('nic')}
                      onBlur={(e) => { handleBlur(e); setFocusedField(null); }}
                      style={{
                        ...styles.input,
                        ...(focusedField === 'nic' ? styles.inputFocus : {}),
                        ...(touched.nic && errors.nic ? styles.errorInput : {})
                      }}
                    />
                    {touched.nic && !errors.nic && formData.nic && <div style={styles.validBadge}><FiCheck /></div>}
                  </div>
                  {touched.nic && errors.nic && <div style={styles.errorText}><FiAlertCircle /> {errors.nic}</div>}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Portal Username <span style={styles.required}>*</span></label>
                  <div style={styles.inputWrapper}>
                    <FiUser style={{...styles.inputIcon, color: focusedField === 'username' ? '#2563eb' : '#94a3b8'}} />
                    <input
                      type="text"
                      name="username"
                      placeholder="e.g., Jane_Doe"
                      value={formData.username}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField('username')}
                      onBlur={(e) => { handleBlur(e); setFocusedField(null); }}
                      style={{
                        ...styles.input,
                        ...(focusedField === 'username' ? styles.inputFocus : {}),
                        ...(touched.username && errors.username ? styles.errorInput : {})
                      }}
                    />
                  </div>
                  <AnimatePresence>
                    {focusedField === 'username' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={styles.hintsBox}
                      >
                        <div style={styles.hintsTitle}>Username Requirements:</div>
                        <ul style={styles.hintsList}>
                          <li>• 4-15 characters long</li>
                          <li>• Must start with a capital letter</li>
                          <li>• Must include an underscore (_)</li>
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {touched.username && errors.username && <div style={styles.errorText}><FiAlertCircle /> {errors.username}</div>}
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Password <span style={styles.required}>*</span></label>
                    <div style={styles.inputWrapper}>
                      <FiLock style={{...styles.inputIcon, color: focusedField === 'password' ? '#2563eb' : '#94a3b8'}} />
                      <input
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('password')}
                        onBlur={(e) => { handleBlur(e); setFocusedField(null); }}
                        style={{
                          ...styles.input,
                          ...(focusedField === 'password' ? styles.inputFocus : {}),
                          ...(touched.password && errors.password ? styles.errorInput : {})
                        }}
                      />
                    </div>
                    <AnimatePresence>
                      {focusedField === 'password' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          style={styles.hintsBox}
                        >
                          <div style={styles.hintsTitle}>Password Requirements:</div>
                          <ul style={styles.hintsList}>
                            <li>• Minimum 8 characters</li>
                            <li>• Upper & Lowercase</li>
                            <li>• Include a number & special symbol</li>
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {touched.password && errors.password && <div style={styles.errorText}><FiAlertCircle /> {errors.password}</div>}
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Confirm Password <span style={styles.required}>*</span></label>
                    <div style={styles.inputWrapper}>
                      <FiLock style={{...styles.inputIcon, color: focusedField === 'confirmPassword' ? '#2563eb' : '#94a3b8'}} />
                      <input
                        type="password"
                        name="confirmPassword"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('confirmPassword')}
                        onBlur={(e) => { handleBlur(e); setFocusedField(null); }}
                        style={{
                          ...styles.input,
                          ...(focusedField === 'confirmPassword' ? styles.inputFocus : {}),
                          ...(touched.confirmPassword && errors.confirmPassword ? styles.errorInput : {})
                        }}
                      />
                    </div>
                    {touched.confirmPassword && errors.confirmPassword && <div style={styles.errorText}><FiAlertCircle /> {errors.confirmPassword}</div>}
                  </div>
                </div>
              </motion.div>

              <div style={styles.footer}>
                <button type="button" onClick={() => navigate("/receptionist/dashboard")} style={styles.btnSecondary}>Discard</button>
                <button type="submit" disabled={isSubmitting} style={{ ...styles.btnPrimary, ...(isSubmitting ? styles.btnDisabled : {}) }}>
                  {isSubmitting ? "Registering..." : "Register Patient"}
                </button>
              </div>
            </form>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    fontFamily: "'Inter', sans-serif"
  },
  contentCard: {
    maxWidth: "1000px",
    width: "95%",
    margin: "0 auto 40px auto",
    backgroundColor: "white",
    borderRadius: "28px",
    padding: "32px 48px",
    boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.05)",
    border: "2px solid #3b82f6"
  },
  pageHeaderWrapper: {
    maxWidth: "1000px",
    width: "95%",
    margin: "0 auto 32px auto",
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  },
  headerTitleSection: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    marginBottom: "40px"
  },
  welcomeTitle: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#0f172a",
    margin: "0 0 8px 0",
    letterSpacing: "-1px",
  },
  welcomeSubtitle: {
    fontSize: "16px",
    color: "#64748b",
    margin: 0,
    fontWeight: "500"
  },
  section: {
    marginBottom: "32px",
    padding: "32px",
    backgroundColor: "#f8fafc",
    borderRadius: "24px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 2px 10px rgba(0,0,0,0.01)"
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "24px",
    paddingBottom: "16px",
    borderBottom: "1px solid #f1f5f9"
  },
  sectionIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px"
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1e293b",
    margin: 0
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
    marginBottom: "20px"
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "20px",
    position: "relative"
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#475569",
    marginLeft: "4px"
  },
  required: {
    color: "#ef4444",
    marginLeft: "4px"
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center"
  },
  inputIcon: {
    position: "absolute",
    left: "16px",
    color: "#94a3b8",
    fontSize: "18px",
    transition: "color 0.2s"
  },
  input: {
    width: "100%",
    padding: "14px 16px 14px 48px",
    fontSize: "15px",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    outline: "none",
    transition: "all 0.2s",
    color: "#1e293b"
  },
  inputFocus: {
    borderColor: "#2563eb",
    backgroundColor: "white",
    boxShadow: "0 0 0 4px rgba(37, 99, 235, 0.1)"
  },
  textarea: {
    width: "100%",
    padding: "14px 16px 14px 48px",
    fontSize: "15px",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    outline: "none",
    transition: "all 0.2s",
    minHeight: "100px",
    resize: "vertical"
  },
  select: {
    width: "100%",
    padding: "14px 16px 14px 48px",
    fontSize: "15px",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    outline: "none",
    appearance: "none",
    cursor: "pointer",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 16px center",
    backgroundSize: "20px"
  },
  errorInput: {
    borderColor: "#fca5a5",
    backgroundColor: "#fef2f2"
  },
  errorText: {
    fontSize: "12px",
    color: "#ef4444",
    fontWeight: "500",
    marginTop: "4px",
    marginLeft: "12px",
    display: "flex",
    alignItems: "center",
    gap: "4px"
  },
  validBadge: {
    position: "absolute",
    right: "16px",
    color: "#10b981",
    fontSize: "18px",
    display: "flex"
  },
  hintsBox: {
    marginTop: "8px",
    padding: "16px",
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    fontSize: "13px"
  },
  hintsTitle: {
    fontWeight: "700",
    color: "#475569",
    marginBottom: "8px",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.05em"
  },
  hintsList: {
    margin: 0,
    paddingLeft: "20px",
    color: "#64748b",
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "16px",
    marginTop: "24px",
    paddingTop: "32px",
    borderTop: "1px solid #f1f5f9"
  },
  btnSecondary: {
    padding: "14px 28px",
    borderRadius: "14px",
    fontSize: "15px",
    fontWeight: "600",
    color: "#64748b",
    backgroundColor: "white",
    border: "1px solid #e2e8f0",
    cursor: "pointer",
    transition: "all 0.2s"
  },
  btnPrimary: {
    padding: "14px 40px",
    borderRadius: "14px",
    fontSize: "15px",
    fontWeight: "700",
    color: "white",
    background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
    border: "none",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 10px 15px -3px rgba(37, 99, 235, 0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px"
  },
  btnDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
    boxShadow: "none"
  }
};

export default AddPatient;
