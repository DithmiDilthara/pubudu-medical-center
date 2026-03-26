import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminHeader from '../../components/AdminHeader';
import AdminSidebar from '../../components/AdminSidebar';
import { motion } from 'framer-motion';

/**
 * AddStaff Component
 * Admin-only page to add new Doctor or Receptionist accounts
 */
const AddStaff = () => {
    const { addStaff, user } = useAuth();
    const adminName = user?.username || 'Admin';
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [roleType, setRoleType] = useState('Doctor');

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role_name: 'Doctor',
        first_name: '',
        last_name: '',
        phone: '',
        nic: '',
        gender: 'MALE',
        // Doctor-specific
        specialization: '',
        qualification: '',
        experience_years: '',
        consultation_fee: 1600, // Default 1000 + 600
        bio: '',
        shift: 'Morning'
    });

    const [formErrors, setFormErrors] = useState({});

    const specializations = [
      "General Physician", "Cardiology", "Neurology", "Pediatrics", "Dermatology",
      "Orthopedics", "ENT (Otolaryngology)", "Ophthalmology", "Obstetrics & Gynecology",
      "Psychiatry", "Radiology", "Oncology", "Nephrology", "Urology",
      "Gastroenterology", "Endocrinology", "Rheumatology", "Pulmonology",
      "Diabetology", "General Surgery", "Anesthesiology", "Pathology", "Vascular Surgery"
    ];

    const validateField = (name, value) => {
        let error = '';
        switch (name) {
            case 'first_name':
            case 'last_name':
                if (!value) error = 'Required';
                else if (value.length < 2) error = 'Too short';
                else if (!/^[a-zA-Z\s.]+$/.test(value)) error = 'Only letters/spaces allowed';
                break;
            case 'username':
                if (!value) error = 'Username is required';
                break;
            case 'email':
                if (!value) error = 'Email is required';
                else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email';
                break;
            case 'password':
                if (!value) error = 'Required';
                else if (value.length < 6) error = 'Min 6 characters';
                break;
            case 'phone':
                if (!value) error = 'Phone number is required';
                else {
                    const digits = value.replace(/\D/g, '');
                    const validPrefixes = ['070', '071', '072', '074', '075', '076', '077', '078'];
                    const prefix = digits.substring(0, 3);
                    if (digits.length !== 10) error = 'Must be exactly 10 digits';
                    else if (!digits.startsWith('07')) error = 'Must start with 07';
                    else if (!validPrefixes.includes(prefix)) error = 'Invalid mobile prefix';
                    else if (/(\d)\1{7,}/.test(digits)) error = 'Invalid pattern';
                }
                break;
            case 'nic':
                if (roleType === 'Receptionist') {
                    if (!value) error = 'NIC is required';
                    else {
                        const nic = value.trim().toUpperCase();
                        const oldNicRegex = /^[0-9]{9}[VX]$/;
                        const newNicRegex = /^[0-9]{12}$/;
                        if (!oldNicRegex.test(nic) && !newNicRegex.test(nic)) {
                            error = 'Invalid NIC format';
                        } else {
                            const digitsOnly = nic.replace(/[VX]/g, '');
                            if (/(\d)\1{8,}/.test(digitsOnly)) error = 'Invalid repeating pattern';
                            if (/012345678|123456789|987654321/.test(digitsOnly)) error = 'Sequential digits not allowed';
                        }
                    }
                }
                break;
            case 'specialization':
                if (roleType === 'Doctor' && !value) error = 'Please select specialization';
                break;
            case 'consultation_fee':
                if (roleType === 'Doctor') {
                    if (value === '' || value === null) error = 'Fee is required';
                    else if (Number(value) < 1600) error = 'Min fee LKR 1,600 (Doctor + Center)';
                }
                break;
            default:
                break;
        }
        return error;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        const error = validateField(name, value);
        setFormErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleRoleChange = (e) => {
        const role = e.target.value;
        setRoleType(role);
        setFormData(prev => ({
            ...prev,
            role_name: role
        }));
        setFormErrors({});
    };

    const validateForm = () => {
        const errors = {};
        Object.keys(formData).forEach(key => {
            const error = validateField(key, formData[key]);
            if (error) errors[key] = error;
        });
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Prepare data based on role
            const dataToSubmit = {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                role_name: formData.role_name,
                first_name: formData.first_name,
                last_name: formData.last_name,
                phone: formData.phone,
                gender: formData.gender
            };

            // Add role-specific fields
            if (roleType === 'Doctor') {
                dataToSubmit.specialization = formData.specialization;
                dataToSubmit.qualification = formData.qualification;
                dataToSubmit.experience_years = formData.experience_years ? parseInt(formData.experience_years) : null;
                dataToSubmit.consultation_fee = formData.consultation_fee ? parseFloat(formData.consultation_fee) : null;
                dataToSubmit.bio = formData.bio;
            } else if (roleType === 'Receptionist') {
                dataToSubmit.nic = formData.nic;
            }

            const result = await addStaff(dataToSubmit);

            if (result.success) {
                setSuccess(`${roleType} account created successfully! Credentials have been sent to their email.`);
                // Reset form
                setFormData({
                    username: '',
                    email: '',
                    password: '',
                    role_name: roleType,
                    first_name: '',
                    last_name: '',
                    phone: '',
                    nic: '',
                    gender: 'MALE',
                    specialization: '',
                    qualification: '',
                    experience_years: '',
                    consultation_fee: 1600,
                    bio: ''
                });
            } else {
                setError(result.error || 'Failed to create staff account');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <AdminSidebar />
            
            <div className="main-wrapper">
                <AdminHeader adminName={adminName} />
                
                <motion.div 
                    className="content-padding"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Header Title - Personalized Welcome */}
                    <div style={styles.headerTitleSection}>
                        <h1 style={styles.welcomeTitle}>Welcome back, Administrator!</h1>
                        <p style={styles.pageSubtitle}>Expand your medical team by adding new professional accounts.</p>
                    </div>
                    
                    {error && (
                        <div style={{
                            backgroundColor: '#fee',
                            border: '1px solid #fcc',
                            padding: '12px',
                            borderRadius: '4px',
                            marginBottom: '16px',
                            color: '#c33'
                        }}>
                            {error}
                        </div>
                    )}
                    
                    {success && (
                        <div style={{
                            backgroundColor: '#efe',
                            border: '1px solid #cfc',
                            padding: '12px',
                            borderRadius: '4px',
                            marginBottom: '16px',
                            color: '#3c3'
                        }}>
                            {success}
                        </div>
                    )}
                    
                    <div style={{
                        backgroundColor: 'white',
                        padding: '24px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        maxWidth: '800px'
                    }}>
                        <form onSubmit={handleSubmit}>
                            {/* Role Selection */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                    Staff Role *
                                </label>
                                <select
                                    value={roleType}
                                    onChange={handleRoleChange}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}
                                    required
                                >
                                    <option value="Doctor">Doctor</option>
                                    <option value="Receptionist">Receptionist</option>
                                </select>
                            </div>

                            {/* Basic Information */}
                            <h3 style={{ marginBottom: '16px', color: '#34495e' }}>Account Information</h3>
                            
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                    Username *
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: formErrors.username ? '1px solid #ef4444' : '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}
                                    required
                                />
                                {formErrors.username && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{formErrors.username}</p>}
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: formErrors.email ? '1px solid #ef4444' : '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}
                                    required
                                />
                                {formErrors.email && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{formErrors.email}</p>}
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                    Temporary Password *
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: formErrors.password ? '1px solid #ef4444' : '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}
                                    required
                                    minLength="6"
                                />
                                {formErrors.password && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{formErrors.password}</p>}
                                <small style={{ color: '#666' }}>
                                    Staff member should change this password on first login
                                </small>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                    Gender *
                                </label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}
                                >
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>

                            {/* Personal Information */}
                            <h3 style={{ marginTop: '24px', marginBottom: '16px', color: '#34495e' }}>
                                Personal Information
                            </h3>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                        First Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleInputChange}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            border: formErrors.first_name ? '1px solid #ef4444' : '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontSize: '14px'
                                        }}
                                        required
                                    />
                                    {formErrors.first_name && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{formErrors.first_name}</p>}
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                        Last Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleInputChange}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            border: formErrors.last_name ? '1px solid #ef4444' : '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontSize: '14px'
                                        }}
                                        required
                                    />
                                    {formErrors.last_name && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{formErrors.last_name}</p>}
                                </div>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: formErrors.phone ? '1px solid #ef4444' : '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}
                                    placeholder="0771234567"
                                    required
                                />
                                {formErrors.phone && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{formErrors.phone}</p>}
                            </div>

                            {/* Doctor-specific fields */}
                            {roleType === 'Doctor' && (
                                <>
                                    <h3 style={{ marginTop: '24px', marginBottom: '16px', color: '#34495e' }}>
                                        Professional Information
                                    </h3>

                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                            Specialization *
                                        </label>
                                        <select
                                            name="specialization"
                                            value={formData.specialization}
                                            onChange={handleInputChange}
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                border: formErrors.specialization ? '1px solid #ef4444' : '1px solid #ddd',
                                                borderRadius: '4px',
                                                fontSize: '14px'
                                            }}
                                            required
                                        >
                                            <option value="">Select Specialization</option>
                                            {specializations.map(spec => (
                                              <option key={spec} value={spec}>{spec}</option>
                                            ))}
                                        </select>
                                        {formErrors.specialization && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{formErrors.specialization}</p>}
                                    </div>

                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                            Qualification
                                        </label>
                                        <input
                                            type="text"
                                            name="qualification"
                                            value={formData.qualification}
                                            onChange={handleInputChange}
                                            placeholder="e.g., MBBS, MD"
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                border: '1px solid #ddd',
                                                borderRadius: '4px',
                                                fontSize: '14px'
                                            }}
                                        />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                                Years of Experience
                                            </label>
                                            <input
                                                type="number"
                                                name="experience_years"
                                                value={formData.experience_years}
                                                onChange={handleInputChange}
                                                min="0"
                                                style={{
                                                    width: '100%',
                                                    padding: '10px',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '4px',
                                                    fontSize: '14px'
                                                }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                                Consultation Fee (LKR) *
                                            </label>
                                            <input
                                                type="number"
                                                name="consultation_fee"
                                                value={formData.consultation_fee}
                                                onChange={handleInputChange}
                                                min="1600"
                                                step="1"
                                                style={{
                                                    width: '100%',
                                                    padding: '10px',
                                                    border: formErrors.consultation_fee ? '1px solid #ef4444' : '1px solid #ddd',
                                                    borderRadius: '4px',
                                                    fontSize: '14px'
                                                }}
                                                required
                                            />
                                            {formErrors.consultation_fee && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{formErrors.consultation_fee}</p>}
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                            Bio / Description
                                        </label>
                                        <textarea
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleInputChange}
                                            rows="4"
                                            placeholder="Brief description about the doctor..."
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                border: '1px solid #ddd',
                                                borderRadius: '4px',
                                                fontSize: '14px',
                                                fontFamily: 'inherit'
                                            }}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Receptionist-specific fields */}
                            {roleType === 'Receptionist' && (
                                <>
                                    <h3 style={{ marginTop: '24px', marginBottom: '16px', color: '#34495e' }}>
                                        Work Information
                                    </h3>

                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                            NIC *
                                        </label>
                                        <input
                                            type="text"
                                            name="nic"
                                            value={formData.nic}
                                            onChange={handleInputChange}
                                            placeholder="123456789V"
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                border: formErrors.nic ? '1px solid #ef4444' : '1px solid #ddd',
                                                borderRadius: '4px',
                                                fontSize: '14px'
                                            }}
                                            required
                                        />
                                        {formErrors.nic && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{formErrors.nic}</p>}
                                    </div>

                                </>
                            )}

                            {/* Submit Button */}
                            <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        padding: '12px 24px',
                                        backgroundColor: loading ? '#95a5a6' : '#3498db',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        fontSize: '16px',
                                        fontWeight: '500',
                                        cursor: loading ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {loading ? 'Creating Account...' : `Create ${roleType} Account`}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setFormData({
                                            username: '',
                                            email: '',
                                            password: '',
                                            role_name: roleType,
                                            first_name: '',
                                            last_name: '',
                                            phone: '',
                                            specialization: '',
                                            qualification: '',
                                            experience_years: '',
                                            consultation_fee: '',
                                            bio: ''
                                        });
                                        setError('');
                                        setSuccess('');
                                    }}
                                    style={{
                                        padding: '12px 24px',
                                        backgroundColor: '#ecf0f1',
                                        color: '#2c3e50',
                                        border: 'none',
                                        borderRadius: '4px',
                                        fontSize: '16px',
                                        fontWeight: '500',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Clear Form
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

const styles = {
    headerTitleSection: {
        marginBottom: "32px",
    },
    pageTitle: {
        fontSize: "28px",
        fontWeight: "800",
        color: "#0f172a",
        margin: "0 0 4px 0",
        letterSpacing: "-0.5px",
        fontFamily: "var(--font-accent)",
    },
    pageSubtitle: {
        fontSize: "16px",
        color: "#64748b",
        margin: 0,
        fontWeight: "500",
        fontFamily: "var(--font-main)",
    },
};

export default AddStaff;
