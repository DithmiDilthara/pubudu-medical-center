import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FiLock, FiEye, FiEyeOff, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const validateField = (name, value) => {
        let fieldError = '';
        if (name === 'newPassword') {
            if (!value) {
                fieldError = 'Password is required';
            } else if (value.length < 8) {
                fieldError = 'Password must be at least 8 characters';
            } else if (!/[A-Z]/.test(value)) {
                fieldError = 'Password must contain at least one uppercase letter';
            } else if (!/[0-9]/.test(value)) {
                fieldError = 'Password must contain at least one number';
            } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
                fieldError = 'Password must contain at least one special character';
            }
        } else if (name === 'confirmPassword') {
            if (!value) {
                fieldError = 'Please confirm your password';
            } else if (value !== formData.newPassword) {
                fieldError = 'Passwords do not match';
            }
        }

        setErrors(prev => ({ ...prev, [name]: fieldError }));
        return fieldError === '';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (touched[name]) {
            validateField(name, value);
        }

        // Real-time matching check if typing in newPassword and confirmPassword already touched
        if (name === 'newPassword' && touched.confirmPassword) {
            setErrors(prev => ({
                ...prev,
                confirmPassword: value !== formData.confirmPassword ? 'Passwords do not match' : ''
            }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        validateField(name, value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        // Validate all fields
        const isNewValid = validateField('newPassword', formData.newPassword);
        const isConfirmValid = validateField('confirmPassword', formData.confirmPassword);

        setTouched({ newPassword: true, confirmPassword: true });

        if (!isNewValid || !isConfirmValid) {
            setError('Please fix the errors before submitting');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await axios.post(`${API_URL}/auth/reset-password`, {
                token,
                newPassword: formData.newPassword
            });

            if (response.data.success) {
                setMessage('Password reset successful! You can now login.');
                setTimeout(() => {
                    navigate('/');
                }, 3000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password. Token may be invalid or expired.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const passwordRequirements = [
        { label: 'At least 8 characters', met: formData.newPassword.length >= 8 },
        { label: 'One uppercase letter', met: /[A-Z]/.test(formData.newPassword) },
        { label: 'One number', met: /[0-9]/.test(formData.newPassword) },
        { label: 'One special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword) }
    ];

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Reset Password</h2>
                <p style={styles.subtitle}>Enter your new password below.</p>

                {message && (
                    <div style={styles.successMessage}>
                        <FiCheckCircle style={{ marginRight: '8px' }} />
                        {message}
                    </div>
                )}

                {error && (
                    <div style={styles.errorMessage}>
                        <FiAlertCircle style={{ marginRight: '8px' }} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>New Password</label>
                        <div style={styles.inputWrapper}>
                            <FiLock style={styles.inputIcon} />
                            <input
                                type={showPassword ? "text" : "password"}
                                name="newPassword"
                                required
                                value={formData.newPassword}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                style={{
                                    ...styles.input,
                                    ...(touched.newPassword && errors.newPassword ? styles.inputError : {}),
                                    ...(touched.newPassword && !errors.newPassword && formData.newPassword ? styles.inputSuccess : {})
                                }}
                                placeholder="Enter new password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={styles.eyeButton}
                            >
                                {showPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                        {touched.newPassword && errors.newPassword && (
                            <span style={styles.fieldErrorMessage}>{errors.newPassword}</span>
                        )}
                    </div>

                    <div style={styles.requirementsContainer}>
                        <p style={styles.requirementsTitle}>Password must contain:</p>
                        {passwordRequirements.map((req, index) => (
                            <div key={index} style={{
                                ...styles.requirement,
                                color: req.met ? '#10B981' : '#6B7280'
                            }}>
                                {req.met ? <FiCheckCircle style={{ marginRight: '6px' }} /> : <FiAlertCircle style={{ marginRight: '6px' }} />}
                                {req.label}
                            </div>
                        ))}
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Confirm Password</label>
                        <div style={styles.inputWrapper}>
                            <FiLock style={styles.inputIcon} />
                            <input
                                type={showPassword ? "text" : "password"}
                                name="confirmPassword"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                style={{
                                    ...styles.input,
                                    ...(touched.confirmPassword && errors.confirmPassword ? styles.inputError : {}),
                                    ...(touched.confirmPassword && !errors.confirmPassword && formData.confirmPassword ? styles.inputSuccess : {})
                                }}
                                placeholder="Confirm new password"
                            />
                        </div>
                        {touched.confirmPassword && errors.confirmPassword && (
                            <span style={styles.fieldErrorMessage}>{errors.confirmPassword}</span>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        style={isSubmitting ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
                    >
                        {isSubmitting ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>

                <div style={styles.footer}>
                    <Link to="/" style={styles.link}>Back to Login</Link>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        fontFamily: "'Inter', sans-serif"
    },
    card: {
        background: 'white',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
        width: '100%',
        maxWidth: '450px'
    },
    title: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#333',
        marginBottom: '10px',
        textAlign: 'center'
    },
    subtitle: {
        color: '#666',
        textAlign: 'center',
        marginBottom: '30px',
        fontSize: '15px'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    label: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#333'
    },
    inputWrapper: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center'
    },
    inputIcon: {
        position: 'absolute',
        left: '12px',
        color: '#999',
        fontSize: '18px'
    },
    input: {
        width: '100%',
        padding: '12px 40px',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        fontSize: '15px',
        outline: 'none',
        transition: 'all 0.2s',
        boxSizing: 'border-box'
    },
    inputError: {
        borderColor: '#EF4444',
        backgroundColor: '#FEF2F2'
    },
    inputSuccess: {
        borderColor: '#10B981',
        backgroundColor: '#F0FDF4'
    },
    fieldErrorMessage: {
        color: '#DC2626',
        fontSize: '12px',
        marginTop: '4px',
        fontWeight: '500'
    },
    requirementsContainer: {
        backgroundColor: '#F9FAFB',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid #E5E7EB',
        marginBottom: '10px'
    },
    requirementsTitle: {
        fontSize: '12px',
        fontWeight: '700',
        color: '#4B5563',
        marginBottom: '8px',
        textTransform: 'uppercase'
    },
    requirement: {
        display: 'flex',
        alignItems: 'center',
        fontSize: '13px',
        marginBottom: '4px',
        transition: 'color 0.2s'
    },
    eyeButton: {
        position: 'absolute',
        right: '12px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#666',
        fontSize: '18px',
        padding: 0
    },
    button: {
        padding: '14px',
        background: '#0056b3',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background 0.2s'
    },
    buttonDisabled: {
        background: '#ccc',
        cursor: 'not-allowed'
    },
    footer: {
        marginTop: '25px',
        textAlign: 'center',
        fontSize: '14px',
        color: '#666'
    },
    link: {
        color: '#0056b3',
        textDecoration: 'none',
        fontWeight: '600'
    },
    successMessage: {
        background: '#d4edda',
        color: '#155724',
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '20px',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center'
    },
    errorMessage: {
        background: '#f8d7da',
        color: '#721c24',
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '20px',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center'
    }
};

export default ResetPassword;
