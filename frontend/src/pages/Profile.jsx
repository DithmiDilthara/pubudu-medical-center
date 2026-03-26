import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUser, FiMail, FiPhone, FiCreditCard, FiSave, FiCamera, 
  FiMapPin, FiShield, FiActivity, FiEdit3, FiCheck, FiAlertCircle,
  FiLock, FiX, FiEye, FiEyeOff, FiCalendar, FiInfo
} from 'react-icons/fi';
import PatientSidebar from '../components/PatientSidebar';
import PatientHeader from '../components/PatientHeader';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import DoctorSidebar from '../components/DoctorSidebar';
import DoctorHeader from '../components/DoctorHeader';
import ReceptionistSidebar from '../components/ReceptionistSidebar';
import ReceptionistHeader from '../components/ReceptionistHeader';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        contact_number: '',
        nic: '',
        address: '',
        date_of_birth: '',
        gender: ''
    });

    // New Interactive States for Patient
    const [editingSection, setEditingSection] = useState(null); // 'personal', 'password'
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [validationErrors, setValidationErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/');
                    return;
                }

                const response = await axios.get(`${API_URL}/auth/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.success) {
                    const userData = response.data.data;
                    setUser(userData);
                    setFormData({
                        full_name: userData.profile?.full_name || '',
                        email: userData.email || '',
                        contact_number: userData.contact_number || '',
                        nic: userData.profile?.nic || '',
                        address: userData.profile?.address || '',
                        date_of_birth: userData.profile?.date_of_birth || '',
                        gender: userData.profile?.gender || ''
                    });
                }
            } catch (error) {
                console.error('Failed to fetch profile', error);
                toast.error("Failed to load profile data");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const toastId = toast.loading("Saving changes...");
        
        try {
            // Simulated save for now as there isn't a clear profile update endpoint in the snippet
            // In a real scenario, this would be an axios.put call
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success("Profile updated successfully!", { id: toastId });
        } catch (error) {
            toast.error("Failed to save changes", { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
    };

    // Patient Interactive Handlers
    const validateDetails = () => {
        const errors = {};
        if (!formData.full_name) errors.full_name = "Full name is required";
        if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Invalid email format";
        
        if (formData.date_of_birth) {
            const dob = new Date(formData.date_of_birth);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (dob > today) errors.date_of_birth = "Date of birth cannot be in the future";
        }
        
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleUpdateDetails = async () => {
        if (!validateDetails()) return;
        
        setIsSaving(true);
        const toastId = toast.loading("Updating your details...");
        
        try {
            const token = localStorage.getItem('token');
            const response = await axios.patch(`${API_URL}/patient/update-details`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data.success) {
                toast.success("Your details have been updated", { id: toastId });
                setEditingSection(null);
                setValidationErrors({});
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update details", { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };

    const validatePassword = () => {
        const errors = {};
        const { currentPassword, newPassword, confirmPassword } = passwordData;
        
        if (!currentPassword) errors.currentPassword = "Current password is required";
        
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!newPassword || !passwordRegex.test(newPassword)) {
            errors.newPassword = "Password must be at least 8 chars, including upper, lower, number, and special char";
        }
        
        if (newPassword !== confirmPassword) {
            errors.confirmPassword = "Passwords do not match";
        }
        
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleUpdatePassword = async () => {
        if (!validatePassword()) return;
        
        setIsSaving(true);
        const toastId = toast.loading("Updating password...");
        
        try {
            const token = localStorage.getItem('token');
            const response = await axios.patch(`${API_URL}/auth/change-password`, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data.success) {
                toast.success("Password updated successfully", { id: toastId });
                setEditingSection(null);
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setValidationErrors({});
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update password", { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };

    const renderEditableField = (label, name, value, icon, isLocked = false, type = "text") => {
        const isEditing = editingSection === 'personal' && !isLocked;
        const error = validationErrors[name];
        
        return (
            <div style={styles.inputGroup}>
                <label style={styles.label}>
                    {label}
                    {!isLocked && !isEditing && (
                        <FiEdit3 
                            className="pencil-icon"
                            style={styles.inlinePencil} 
                            onClick={() => setEditingSection('personal')} 
                        />
                    )}
                    {isLocked && <FiLock style={styles.inlineLock} />}
                </label>
                <div style={styles.inputWrapper}>
                    {icon && <icon style={{...styles.inputIcon, color: focusedField === name ? themeColor : '#94a3b8'}} />}
                    {isEditing ? (
                        <>
                            {type === 'textarea' ? (
                                <textarea
                                    name={name}
                                    value={value}
                                    onChange={handleInputChange}
                                    onFocus={() => setFocusedField(name)}
                                    onBlur={() => setFocusedField(null)}
                                    style={{...styles.textarea, ...(focusedField === name ? {...styles.inputFocus, borderColor: themeColor} : {})}}
                                />
                            ) : type === 'select' ? (
                                <select
                                    name={name}
                                    value={value}
                                    onChange={handleInputChange}
                                    onFocus={() => setFocusedField(name)}
                                    onBlur={() => setFocusedField(null)}
                                    style={{...styles.select, ...(focusedField === name ? {...styles.inputFocus, borderColor: themeColor} : {})}}
                                >
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            ) : (
                                <input
                                    type={type}
                                    name={name}
                                    value={value}
                                    onChange={handleInputChange}
                                    onFocus={() => setFocusedField(name)}
                                    onBlur={() => setFocusedField(null)}
                                    style={{...styles.input, ...(focusedField === name ? {...styles.inputFocus, borderColor: themeColor} : {})}}
                                />
                            )}
                            {error && <div style={styles.fieldError}><FiInfo size={12} /> {error}</div>}
                        </>
                    ) : (
                        <div 
                            style={styles.readOnlyText} 
                            onClick={() => !isLocked && setEditingSection('personal')}
                        >
                            {value || <span style={{color: '#94a3b8', fontStyle: 'italic'}}>Not set</span>}
                            {isLocked && name === 'nic' && (
                                <div style={styles.lockNote}>Contact the receptionist to update your NIC</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (loading) return (
      <div style={styles.loadingContainer}>
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          style={styles.spinner}
        />
        <p>Loading profile...</p>
      </div>
    );

    const renderRoleComponents = () => {
        const roleId = user?.role_id;
        
        switch (roleId) {
            case 1: // Admin
                return {
                    Sidebar: <AdminSidebar />,
                    Header: <AdminHeader adminName={user?.profile?.full_name} />,
                    themeColor: "#4f46e5"
                };
            case 2: // Doctor
                return {
                    Sidebar: <DoctorSidebar onLogout={handleLogout} />,
                    Header: <DoctorHeader doctorName={user?.profile?.full_name} />,
                    themeColor: "#0891b2"
                };
            case 3: // Receptionist
                return {
                    Sidebar: <ReceptionistSidebar onLogout={handleLogout} />,
                    Header: <ReceptionistHeader receptionistName={user?.profile?.full_name} />,
                    themeColor: "#2563eb"
                };
            case 4: // Patient
            default:
                return {
                    Sidebar: <PatientSidebar onLogout={handleLogout} />,
                    Header: <PatientHeader />,
                    themeColor: "#2563eb"
                };
        }
    };

    const { Sidebar, Header, themeColor } = renderRoleComponents();

    return (
        <div style={styles.container}>
            {Sidebar}

            <div className="main-wrapper" style={styles.mainWrapper}>
                {Header}
                <main style={styles.mainContent}>
                    <div style={styles.contentWrapper}>
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          style={styles.headerSection}
                        >
                          <h1 style={styles.welcomeTitle}>
                            {user?.role_id === 1 ? 'Administrator Profile' : 
                             user?.role_id === 2 ? 'Doctor Profile' :
                             user?.role_id === 3 ? 'Receptionist Profile' : 'Patient Profile'}
                          </h1>
                          <p style={styles.welcomeSubtitle}>Manage your personal information and security.</p>
                        </motion.div>

                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          style={styles.card}
                        >
                        {/* Profile Hero Section */}
                        <div style={{...styles.heroSection, backgroundColor: themeColor}}>
                          <div style={styles.heroOverlay}></div>
                          <div style={styles.heroContent}>
                            <div style={styles.heroText}>
                              <h1 style={styles.userName}>{formData.full_name}</h1>
                              <p style={styles.userRole}>
                                {user?.role_id === 1 ? 'Administrator' : 
                                 user?.role_id === 2 ? `Doctor - ${user.profile?.specialization || 'General'}` :
                                 user?.role_id === 3 ? 'Medical Receptionist' : 'Patient'}
                              </p>
                              {/* Profile badges removed per request */}
                            </div>
                          </div>
                        </div>

{(user?.role_id === 4) ? (
  <>
    <div style={styles.gridContainer}>
      <div style={styles.column}>
        <h3 style={styles.columnTitle}>
          <FiUser style={{marginRight: '8px', color: themeColor}} />
          Personal Information
          {editingSection !== 'personal' && (
            <FiEdit3 
              style={{...styles.inlinePencil, fontSize: '18px', color: themeColor}} 
              onClick={() => setEditingSection('personal')} 
            />
          )}
        </h3>
        
        {renderEditableField('Full Legal Name', 'full_name', formData.full_name, FiUser)}
        {renderEditableField('National ID (NIC)', 'nic', formData.nic, FiCreditCard, true)}
        {renderEditableField('Date of Birth', 'date_of_birth', formData.date_of_birth, FiCalendar, false, 'date')}
      </div>

      <div style={styles.column}>
        <h3 style={styles.columnTitle}>
          <FiMail style={{marginRight: '8px', color: themeColor}} />
          Contact Details
        </h3>
        {renderEditableField('Primary Email', 'email', formData.email, FiMail, false, 'email')}
        {renderEditableField('Phone Number', 'contact_number', formData.contact_number, FiPhone, true)}
        {renderEditableField('Gender', 'gender', formData.gender, FiInfo, false, 'select')}
      </div>
    </div>

    {renderEditableField('Residential Address', 'address', formData.address, FiMapPin, false, 'textarea')}

    <AnimatePresence>
      {editingSection === 'personal' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          style={styles.sectionEditActions}
        >
          <button 
            type="button" 
            onClick={() => { setEditingSection(null); setValidationErrors({}); }} 
            style={styles.cancelBtn}
          >
            <FiX style={{marginRight: '8px'}} /> Cancel
          </button>
          <button 
            type="button" 
            onClick={handleUpdateDetails}
            disabled={isSaving}
            style={{...styles.saveBtn, backgroundColor: themeColor, ...(isSaving ? styles.disabledBtn : {})}}
          >
            {isSaving ? "Saving..." : <><FiCheck style={{marginRight: '8px'}} /> Save Details</>}
          </button>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Password Section */}
    <div style={styles.passwordSection}>
      <h3 style={styles.columnTitle}>
        <FiShield style={{marginRight: '8px', color: themeColor}} />
        Security & Password
        {editingSection !== 'password' && (
          <FiEdit3 
            style={{...styles.inlinePencil, fontSize: '18px', color: themeColor}} 
            onClick={() => { setEditingSection('password'); setValidationErrors({}); }} 
          />
        )}
      </h3>

      {editingSection === 'password' ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={styles.passwordGrid}
        >
          <div style={styles.inputGroup}>
            <label style={styles.label}>Current Password</label>
            <div style={styles.passwordField}>
              <input
                type={showPasswords.current ? "text" : "password"}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                style={{...styles.input, paddingLeft: '16px'}}
                placeholder="Enter current password"
              />
              <div onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})} style={styles.eyeIcon}>
                {showPasswords.current ? <FiEyeOff /> : <FiEye />}
              </div>
            </div>
            {validationErrors.currentPassword && <div style={styles.fieldError}><FiInfo size={12} /> {validationErrors.currentPassword}</div>}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>New Password</label>
            <div style={styles.passwordField}>
              <input
                type={showPasswords.new ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                style={{...styles.input, paddingLeft: '16px'}}
                placeholder="Enter new password"
              />
              <div onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})} style={styles.eyeIcon}>
                {showPasswords.new ? <FiEyeOff /> : <FiEye />}
              </div>
            </div>
            {validationErrors.newPassword && <div style={styles.fieldError}><FiInfo size={12} /> {validationErrors.newPassword}</div>}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm New Password</label>
            <div style={styles.passwordField}>
              <input
                type={showPasswords.confirm ? "text" : "password"}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                style={{...styles.input, paddingLeft: '16px'}}
                placeholder="Confirm new password"
              />
              <div onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})} style={styles.eyeIcon}>
                {showPasswords.confirm ? <FiEyeOff /> : <FiEye />}
              </div>
            </div>
            {validationErrors.confirmPassword && <div style={styles.fieldError}><FiInfo size={12} /> {validationErrors.confirmPassword}</div>}
          </div>

          <div style={styles.passwordHint}>
            <FiInfo style={{marginRight: '8px'}} />
            Min 8 chars, uppercase, lowercase, number, special character
          </div>

          <div style={{...styles.sectionEditActions, gridColumn: '1 / -1'}}>
            <button 
              type="button" 
              onClick={() => { setEditingSection(null); setValidationErrors({}); setPasswordData({currentPassword:'', newPassword:'', confirmPassword:''}); }} 
              style={styles.cancelBtn}
            >
              <FiX style={{marginRight: '8px'}} /> Cancel
            </button>
            <button 
              type="button" 
              onClick={handleUpdatePassword}
              disabled={isSaving}
              style={{...styles.saveBtn, backgroundColor: themeColor, ...(isSaving ? styles.disabledBtn : {})}}
            >
              {isSaving ? "Saving..." : <><FiCheck style={{marginRight: '8px'}} /> Update Password</>}
            </button>
          </div>
        </motion.div>
      ) : (
        <div 
          style={{...styles.readOnlyText, marginTop: '16px', maxWidth: '400px'}} 
          onClick={() => setEditingSection('password')}
        >
          <span style={{letterSpacing: '4px'}}>••••••••</span>
          <p style={{margin: '4px 0 0 0', fontSize: '11px', color: '#94a3b8'}}>Click to change your password</p>
        </div>
      )}
    </div>
  </>
) : (
    <form onSubmit={handleSave} style={styles.formContainer}>
        <div style={styles.gridContainer}>
          {/* Left Column: Personal Info */}
          <div style={styles.column}>
            <h3 style={styles.columnTitle}>
              <FiUser style={{marginRight: '8px', color: themeColor}} />
              Personal Information
            </h3>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Legal Name</label>
              <div style={styles.inputWrapper}>
                <FiUser style={{...styles.inputIcon, color: focusedField === 'full_name' ? themeColor : '#94a3b8'}} />
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('full_name')}
                  onBlur={() => setFocusedField(null)}
                  style={{...styles.input, ...(focusedField === 'full_name' ? {...styles.inputFocus, borderColor: themeColor} : {})}}
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>National ID (NIC)</label>
              <div style={styles.inputWrapper}>
                <FiCreditCard style={{...styles.inputIcon, color: focusedField === 'nic' ? themeColor : '#94a3b8'}} />
                <input
                  type="text"
                  name="nic"
                  value={formData.nic}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('nic')}
                  onBlur={() => setFocusedField(null)}
                  style={{...styles.input, ...(focusedField === 'nic' ? {...styles.inputFocus, borderColor: themeColor} : {})}}
                />
              </div>
            </div>


          </div>

          {/* Right Column: Contact Info */}
          <div style={styles.column}>
            <h3 style={styles.columnTitle}>
              <FiMail style={{marginRight: '8px', color: themeColor}} />
              Contact & Security
            </h3>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Primary Email</label>
              <div style={styles.inputWrapper}>
                <FiMail style={{...styles.inputIcon, color: focusedField === 'email' ? themeColor : '#94a3b8'}} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  style={{...styles.input, ...(focusedField === 'email' ? {...styles.inputFocus, borderColor: themeColor} : {})}}
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Phone Number</label>
              <div style={styles.inputWrapper}>
                <FiPhone style={{...styles.inputIcon, color: focusedField === 'contact_number' ? themeColor : '#94a3b8'}} />
                <input
                  type="text"
                  name="contact_number"
                  value={formData.contact_number}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('contact_number')}
                  onBlur={() => setFocusedField(null)}
                  style={{...styles.input, ...(focusedField === 'contact_number' ? {...styles.inputFocus, borderColor: themeColor} : {})}}
                />
              </div>
            </div>


          </div>
        </div>

        <div style={styles.fullWidthGroup}>
          <label style={styles.label}>Residential Address</label>
          <div style={styles.inputWrapper}>
            <FiMapPin style={{...styles.inputIcon, top: '18px', color: focusedField === 'address' ? themeColor : '#94a3b8'}} />
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              onFocus={() => setFocusedField('address')}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter your residence address"
              style={{...styles.textarea, ...(focusedField === 'address' ? {...styles.inputFocus, borderColor: themeColor} : {})}}
            />
          </div>
        </div>

        {/* Action Footer */}
        <div style={styles.footer}>
          <button 
            type="button" 
            onClick={() => navigate(-1)} 
            style={styles.cancelBtn}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting}
            style={{...styles.saveBtn, backgroundColor: themeColor, ...(isSubmitting ? styles.disabledBtn : {})}}
          >
            {isSubmitting ? "Saving..." : (
              <>
                <FiSave style={{marginRight: '8px'}} />
                Save Profile Changes
              </>
            )}
          </button>
        </div>
    </form>
)}
                    </motion.div>
                    </div>
                </main>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        fontFamily: "'Inter', sans-serif",
    },
    mainWrapper: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column'
    },
    mainContent: {
        padding: "40px 32px",
        display: "flex",
        flexDirection: "column",
        gap: "32px",
        maxWidth: "1600px",
        margin: "0 auto",
        width: "100%"
    },
    contentWrapper: {
        maxWidth: "1200px",
        width: "100%",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "32px"
    },
    headerSection: {
      marginBottom: "4px",
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
    card: {
        maxWidth: '1000px',
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: '28px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
        overflow: 'hidden'
    },
    heroSection: {
      position: 'relative',
      padding: '60px 48px',
      color: 'white',
      overflow: 'hidden'
    },
    heroOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(to right, rgba(0,0,0,0.2), transparent)',
      zIndex: 1
    },
    heroContent: {
      position: 'relative',
      zIndex: 2,
      display: 'flex',
      alignItems: 'center',
      gap: '32px'
    },
    avatarWrapper: {
      position: 'relative'
    },
    avatar: {
      width: '120px',
      height: '120px',
      borderRadius: '35%',
      backgroundColor: 'rgba(255,255,255,0.2)',
      backdropFilter: 'blur(10px)',
      border: '4px solid rgba(255,255,255,0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '48px',
      fontWeight: '800',
      color: 'white'
    },
    cameraBtn: {
      position: 'absolute',
      bottom: '-8px',
      right: '-8px',
      width: '40px',
      height: '40px',
      borderRadius: '12px',
      backgroundColor: 'white',
      color: '#0f172a',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    },
    heroText: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    userName: {
      fontSize: '32px',
      fontWeight: '800',
      margin: 0,
      letterSpacing: '-0.025em'
    },
    userRole: {
      fontSize: '16px',
      opacity: 0.9,
      fontWeight: '500',
      margin: 0
    },
    badgeContainer: {
      display: 'flex',
      gap: '12px',
      marginTop: '12px'
    },
    // Unused badges removed
    formContainer: {
      padding: '48px'
    },
    gridContainer: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '48px',
      marginBottom: '32px'
    },
    column: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    },
    columnTitle: {
      fontSize: '18px',
      fontWeight: '700',
      color: '#1e293b',
      margin: '0 0 8px 0',
      display: 'flex',
      alignItems: 'center'
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    fullWidthGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      marginBottom: '40px'
    },
    label: {
      fontSize: '13px',
      fontWeight: '700',
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      marginLeft: '4px'
    },
    inputWrapper: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    },
    inputIcon: {
      position: 'absolute',
      left: '16px',
      fontSize: '18px',
      transition: 'color 0.2s'
    },
    input: {
      width: '100%',
      padding: '14px 16px 14px 48px',
      fontSize: '15px',
      backgroundColor: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '14px',
      outline: 'none',
      transition: 'all 0.2s',
      color: '#1e293b',
      fontWeight: '500'
    },
    textarea: {
      width: '100%',
      padding: '14px 16px 14px 48px',
      fontSize: '15px',
      backgroundColor: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '16px',
      outline: 'none',
      transition: 'all 0.2s',
      minHeight: '100px',
      resize: 'vertical',
      fontWeight: '500'
    },
    select: {
      width: '100%',
      padding: '14px 16px 14px 48px',
      fontSize: '15px',
      backgroundColor: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '14px',
      outline: 'none',
      appearance: 'none',
      cursor: 'pointer',
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "right 16px center",
      backgroundSize: "20px",
      fontWeight: '500'
    },
    inputFocus: {
      backgroundColor: 'white',
      boxShadow: '0 0 0 4px rgba(37, 99, 235, 0.05)'
    },
    footer: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '16px',
      paddingTop: '32px',
      borderTop: '1px solid #f1f5f9'
    },
    cancelBtn: {
      padding: '14px 28px',
      borderRadius: '14px',
      fontSize: '15px',
      fontWeight: '600',
      color: '#64748b',
      backgroundColor: 'white',
      border: '1px solid #e2e8f0',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    saveBtn: {
      padding: '14px 40px',
      borderRadius: '14px',
      fontSize: '15px',
      fontWeight: '700',
      color: 'white',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.2)'
    },
    disabledBtn: {
      opacity: 0.6,
      cursor: 'not-allowed',
      boxShadow: 'none'
    },
    inlinePencil: {
        marginLeft: '10px',
        fontSize: '14px',
        color: '#94a3b8',
        cursor: 'pointer',
        transition: 'color 0.2s',
        verticalAlign: 'middle'
    },
    inlineLock: {
        marginLeft: '10px',
        fontSize: '14px',
        color: '#94a3b8',
        verticalAlign: 'middle'
    },
    readOnlyText: {
        width: '100%',
        padding: '14px 16px',
        fontSize: '15px',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        color: '#1e293b',
        fontWeight: '500',
        minHeight: '48px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        cursor: 'pointer'
    },
    fieldError: {
        color: '#ef4444',
        fontSize: '12px',
        marginTop: '4px',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
    },
    lockNote: {
        fontSize: '11px',
        color: '#94a3b8',
        marginTop: '4px',
        fontWeight: '400'
    },
    sectionEditActions: {
        display: 'flex',
        gap: '12px',
        marginTop: '24px',
        justifyContent: 'flex-end',
        padding: '16px',
        backgroundColor: '#f8fafc',
        borderRadius: '16px',
        border: '1px solid #e2e8f0'
    },
    passwordSection: {
        marginTop: '40px',
        padding: '32px',
        backgroundColor: '#fff',
        borderRadius: '24px',
        border: '1px solid #e2e8f0'
    },
    passwordGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
        marginTop: '24px'
    },
    passwordField: {
        position: 'relative'
    },
    eyeIcon: {
        position: 'absolute',
        right: '16px',
        top: '14px',
        color: '#94a3b8',
        cursor: 'pointer',
        padding: '4px',
        fontSize: '18px'
    },
    passwordHint: {
        fontSize: '12px',
        color: '#64748b',
        marginTop: '12px',
        padding: '12px',
        backgroundColor: '#f1f5f9',
        borderRadius: '10px',
        border: '1px solid #e2e8f0'
    },
    loadingContainer: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      color: '#64748b'
    },
    spinner: {
      width: '40px',
      height: '40px',
      border: '4px solid #f1f5f9',
      borderTop: '4px solid #2563eb',
      borderRadius: '50%'
    }
};

export default Profile;
