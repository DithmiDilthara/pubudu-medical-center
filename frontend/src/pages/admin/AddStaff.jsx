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
        // Doctor-specific
        specialization: '',
        qualification: '',
        experience_years: '',
        consultation_fee: '',
        bio: '',
        // Receptionist-specific
        shift: 'Morning'
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRoleChange = (e) => {
        const role = e.target.value;
        setRoleType(role);
        setFormData(prev => ({
            ...prev,
            role_name: role
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
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
                phone: formData.phone
            };

            // Add role-specific fields
            if (roleType === 'Doctor') {
                dataToSubmit.specialization = formData.specialization;
                dataToSubmit.qualification = formData.qualification;
                dataToSubmit.experience_years = formData.experience_years ? parseInt(formData.experience_years) : null;
                dataToSubmit.consultation_fee = formData.consultation_fee ? parseFloat(formData.consultation_fee) : null;
                dataToSubmit.bio = formData.bio;
            } else if (roleType === 'Receptionist') {
                dataToSubmit.shift = formData.shift;
            }

            const result = await addStaff(dataToSubmit);

            if (result.success) {
                setSuccess(`${roleType} account created successfully! Username: ${formData.username}`);
                // Reset form
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
                    bio: '',
                    shift: 'Morning'
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
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}
                                    required
                                />
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
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}
                                    required
                                />
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
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}
                                    required
                                    minLength="6"
                                />
                                <small style={{ color: '#666' }}>
                                    Staff member should change this password on first login
                                </small>
                            </div>

                            {/* Personal Information */}
                            <h3 style={{ marginTop: '24px', marginBottom: '16px', color: '#34495e' }}>
                                Personal Information
                            </h3>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleInputChange}
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
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleInputChange}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontSize: '14px'
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>

                            {/* Doctor-specific fields */}
                            {roleType === 'Doctor' && (
                                <>
                                    <h3 style={{ marginTop: '24px', marginBottom: '16px', color: '#34495e' }}>
                                        Professional Information
                                    </h3>

                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                            Specialization
                                        </label>
                                        <input
                                            type="text"
                                            name="specialization"
                                            value={formData.specialization}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Cardiology, Pediatrics"
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                border: '1px solid #ddd',
                                                borderRadius: '4px',
                                                fontSize: '14px'
                                            }}
                                        />
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
                                                Consultation Fee (LKR)
                                            </label>
                                            <input
                                                type="number"
                                                name="consultation_fee"
                                                value={formData.consultation_fee}
                                                onChange={handleInputChange}
                                                min="0"
                                                step="0.01"
                                                style={{
                                                    width: '100%',
                                                    padding: '10px',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '4px',
                                                    fontSize: '14px'
                                                }}
                                            />
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
                                            Shift
                                        </label>
                                        <select
                                            name="shift"
                                            value={formData.shift}
                                            onChange={handleInputChange}
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                border: '1px solid #ddd',
                                                borderRadius: '4px',
                                                fontSize: '14px'
                                            }}
                                        >
                                            <option value="Morning">Morning</option>
                                            <option value="Evening">Evening</option>
                                            <option value="Night">Night</option>
                                        </select>
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
                                            bio: '',
                                            shift: 'Morning'
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
