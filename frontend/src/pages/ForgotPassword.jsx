import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FiArrowLeft, FiMail, FiCheck, FiX, FiAlertCircle, FiActivity } from 'react-icons/fi';

import hospitalBg from '../assets/hospital_clear.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [touched, setTouched] = useState(false);

    const validateEmail = (val) => {
        if (!val) return 'Email is required';
        if (!/\S+@\S+\.\S+/.test(val)) return 'Invalid email format';
        return '';
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        
        const emailError = validateEmail(email);
        if (emailError) {
            setError(emailError);
            setTouched(true);
            return;
        }

        setIsSubmitting(true);
        setError('');
        setMessage('');

        try {
            const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
            if (response.data.success) {
                setMessage('Password reset instructions sent to your email.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to process request. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.leftSide}>
                <div style={styles.leftBackground} />
                <div style={styles.formContainer}>
                    <button onClick={() => navigate(-1)} style={styles.backButton}>
                        <FiArrowLeft /> Back to Login
                    </button>

                    <h2 style={styles.welcomeTitle}>Forgot Password</h2>
                    <p style={styles.welcomeSubtitle}>Enter your email address to receive reset instructions.</p>

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
                            <button 
                                onClick={() => setMessage('')}
                                style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#059669' }}
                            >
                                <FiX />
                            </button>
                        </div>
                    )}

                    {error && (
                        <div style={styles.generalError}>
                            <FiAlertCircle style={{ marginRight: '8px' }} />
                            {error}
                        </div>
                    )}

                    <div style={styles.formGroup}>
                        <label style={styles.label}>
                            Email Address <span style={styles.required}>*</span>
                        </label>
                        <div style={styles.inputWrapper}>
                            <FiMail style={styles.inputIcon} />
                            <input
                                type="email"
                                name="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (touched) setError(validateEmail(e.target.value));
                                }}
                                onBlur={() => setTouched(true)}
                                style={{
                                    ...styles.input,
                                    paddingLeft: '45px',
                                    ...(touched && error ? styles.inputError : {}),
                                    ...(touched && !error && email ? styles.inputSuccess : {})
                                }}
                                placeholder="Enter your registered email"
                                disabled={isSubmitting}
                            />
                        </div>
                        {touched && error && (
                            <span style={styles.errorMessage}>
                                <FiAlertCircle style={styles.messageIcon} /> {error}
                            </span>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        style={{
                            ...styles.loginButton,
                            ...(isSubmitting ? styles.loginButtonDisabled : {})
                        }}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Sending Request...' : 'Send Reset Link'}
                    </button>

                    <div style={styles.signupLink}>
                        <p style={styles.signupText}>
                            Remembered your password?{' '}
                            <Link to="/" style={styles.linkButton}>Login</Link>
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
        padding: 0,
        transition: 'color 0.2s'
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
        marginBottom: '24px'
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
    inputIcon: {
        position: 'absolute',
        left: '16px',
        color: '#9CA3AF',
        fontSize: '18px',
        zIndex: 2
    },
    inputWrapper: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center'
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
        fontSize: '14px',
        flexShrink: 0
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
        fontFamily: "'Inter', sans-serif",
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
        textDecoration: 'none',
        padding: '0',
        fontFamily: "'Inter', sans-serif",
        fontWeight: '600',
        transition: 'color 0.2s'
    }
};

export default ForgotPassword;

