import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FiLock, FiEye, FiEyeOff, FiCheck, FiX, FiAlertCircle, FiActivity, FiArrowLeft } from 'react-icons/fi';

import hospitalBg from '../assets/hospital_clear.png';

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
    const [touched, setTouched] = useState({});

    const passwordRequirements = [
        { id: 'length', label: '8+ characters', met: formData.newPassword.length >= 8 },
        { id: 'upper', label: 'One uppercase letter', met: /[A-Z]/.test(formData.newPassword) },
        { id: 'number', label: 'One number', met: /[0-9]/.test(formData.newPassword) },
        { id: 'special', label: 'One special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword) }
    ];

    const allRequirementsMet = passwordRequirements.every(req => req.met);

    const validateForm = () => {
        if (!allRequirementsMet) return 'Please meet all password requirements';
        if (formData.newPassword !== formData.confirmPassword) return 'Passwords do not match';
        return '';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setError('');
        setMessage('');

        const formError = validateForm();
        if (formError) {
            setError(formError);
            setTouched({ newPassword: true, confirmPassword: true });
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

    return (
        <div style={styles.container}>
            <div style={styles.leftSide}>
                <div style={styles.leftBackground} />
                <div style={styles.formContainer}>
                    <button onClick={() => navigate('/')} style={styles.backButton}>
                        <FiArrowLeft /> Back to Login
                    </button>

                    <h2 style={styles.welcomeTitle}>Reset Password</h2>
                    <p style={styles.welcomeSubtitle}>Set a strong new password for your account.</p>

                    {message && (
                        <div style={{
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
                        }}>
                            <FiCheck style={{ marginRight: '8px' }} />
                            {message}
                        </div>
                    )}

                    {error && (
                        <div style={styles.generalError}>
                            <FiAlertCircle style={{ marginRight: '8px' }} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                New Password <span style={styles.required}>*</span>
                            </label>
                            <div style={styles.inputWrapper}>
                                <FiLock style={styles.inputIcon} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    style={{
                                        ...styles.input,
                                        paddingLeft: '45px',
                                        paddingRight: '45px',
                                        ...(touched.newPassword && !allRequirementsMet ? styles.inputError : {}),
                                        ...(allRequirementsMet ? styles.inputSuccess : {})
                                    }}
                                    placeholder="Create new password"
                                    disabled={isSubmitting}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={styles.eyeButton}
                                >
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>

                        <div style={styles.requirementsCard}>
                            <p style={styles.requirementsTitle}>Security Requirements</p>
                            <div style={styles.requirementsGrid}>
                                {passwordRequirements.map((req) => (
                                    <div key={req.id} style={{
                                        ...styles.requirement,
                                        color: req.met ? '#059669' : '#6B7280'
                                    }}>
                                        {req.met ? <FiCheck style={styles.reqIcon} /> : <FiAlertCircle style={styles.reqIcon} />}
                                        {req.label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                Confirm New Password <span style={styles.required}>*</span>
                            </label>
                            <div style={styles.inputWrapper}>
                                <FiLock style={styles.inputIcon} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    style={{
                                        ...styles.input,
                                        paddingLeft: '45px',
                                        ...(touched.confirmPassword && formData.newPassword !== formData.confirmPassword ? styles.inputError : {}),
                                        ...(touched.confirmPassword && formData.newPassword === formData.confirmPassword && formData.confirmPassword ? styles.inputSuccess : {})
                                    }}
                                    placeholder="Repeate new password"
                                    disabled={isSubmitting}
                                />
                            </div>
                            {touched.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                                <span style={styles.errorMessage}>
                                    <FiAlertCircle style={styles.messageIcon} /> Passwords do not match
                                </span>
                            )}
                        </div>

                        <button
                            type="submit"
                            style={{
                                ...styles.loginButton,
                                ...(isSubmitting ? styles.loginButtonDisabled : {})
                            }}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Updating Password...' : 'Reset Password'}
                        </button>
                    </form>

                    <div style={styles.signupLink}>
                        <p style={styles.signupText}>
                            Having trouble?{' '}
                            <Link to="/" style={styles.linkButton}>Contact Support</Link>
                        </p>
                    </div>
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
                        <p style={styles.quote}>
                            "Your Health, Our Priority"
                        </p>
                        <p style={styles.quoteSubtext}>
                            Providing quality healthcare services with care and compassion
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

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
        backgroundImage: `linear-gradient(rgba(0, 102, 204, 0.4), rgba(0, 82, 163, 0.5)), url(${hospitalBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(8px)',
        zIndex: 0
    },
    rightSide: {
        flex: 3,
        background: 'linear-gradient(135deg, #4DA6FF 0%, #0066CC 100%)',
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
        maxWidth: '480px',
        backgroundColor: '#FFFFFF',
        padding: '48px',
        borderRadius: '24px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: '1px solid rgba(0,0,0,0.05)',
        position: 'relative',
        zIndex: 1
    },
    backButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'none',
        border: 'none',
        color: '#6B7280',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '14px',
        marginBottom: '24px',
        padding: 0
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
    formGroup: {
        marginBottom: '20px'
    },
    label: {
        display: 'block',
        marginBottom: '8px',
        fontSize: '14px',
        color: '#374151',
        fontWeight: '600'
    },
    required: {
        color: '#EF4444'
    },
    inputWrapper: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center'
    },
    inputIcon: {
        position: 'absolute',
        left: '16px',
        color: '#9CA3AF',
        fontSize: '18px',
        zIndex: 2
    },
    input: {
        width: '100%',
        padding: '13px 16px',
        fontSize: '15px',
        border: '2px solid #E5E7EB',
        borderRadius: '10px',
        boxSizing: 'border-box',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        outline: 'none',
        fontFamily: "'Inter', sans-serif",
        color: '#111827',
        backgroundColor: '#FFFFFF'
    },
    inputError: {
        borderColor: '#EF4444',
        backgroundColor: '#FEF2F2'
    },
    inputSuccess: {
        borderColor: '#10B981',
        backgroundColor: '#F0FDF4'
    },
    eyeButton: {
        position: 'absolute',
        right: '12px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#6B7280',
        fontSize: '20px',
        display: 'flex',
        alignItems: 'center',
        zIndex: 2
    },
    requirementsCard: {
        backgroundColor: '#F9FAFB',
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid #E5E7EB',
        marginBottom: '24px'
    },
    requirementsTitle: {
        fontSize: '12px',
        fontWeight: '800',
        color: '#4B5563',
        marginBottom: '12px',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
    },
    requirementsGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px'
    },
    requirement: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '12px',
        fontWeight: '600'
    },
    reqIcon: {
        fontSize: '14px'
    },
    errorMessage: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        color: '#DC2626',
        fontSize: '13px',
        marginTop: '8px',
        fontWeight: '500'
    },
    messageIcon: {
        fontSize: '14px'
    },
    loginButton: {
        width: '100%',
        padding: '14px',
        background: 'linear-gradient(135deg, #0066CC 0%, #0052A3 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        fontSize: '16px',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'all 0.2s',
        marginBottom: '24px',
        boxShadow: '0 4px 12px rgba(0, 102, 204, 0.3)'
    },
    loginButtonDisabled: {
        background: '#9CA3AF',
        cursor: 'not-allowed',
        boxShadow: 'none'
    },
    signupLink: {
        textAlign: 'center',
        paddingTop: '20px',
        borderTop: '1px solid #E5E7EB'
    },
    signupText: {
        margin: '0',
        fontSize: '14px',
        color: '#6B7280',
        fontWeight: '500'
    },
    linkButton: {
        background: 'none',
        border: 'none',
        color: '#0066CC',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600'
    }
};

export default ResetPassword;

