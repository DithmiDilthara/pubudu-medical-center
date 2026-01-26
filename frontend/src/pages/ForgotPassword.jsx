import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FiArrowLeft, FiMail, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
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
            <div style={styles.card}>
                <button onClick={() => navigate(-1)} style={styles.backButton}>
                    <FiArrowLeft /> Back
                </button>

                <h2 style={styles.title}>Forgot Password</h2>
                <p style={styles.subtitle}>Enter your email address to receive reset instructions.</p>

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
                        <label style={styles.label}>Email Address</label>
                        <div style={styles.inputWrapper}>
                            <FiMail style={styles.inputIcon} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={styles.input}
                                placeholder="Enter your email"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        style={isSubmitting ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
                    >
                        {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <div style={styles.footer}>
                    Remember your password? <Link to="/" style={styles.link}>Login</Link>
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
        maxWidth: '450px',
        position: 'relative'
    },
    backButton: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        color: '#666',
        marginBottom: '20px',
        fontSize: '14px',
        padding: 0
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
        padding: '12px 12px 12px 40px',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        fontSize: '15px',
        outline: 'none',
        transition: 'border-color 0.2s',
        boxSizing: 'border-box'
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

export default ForgotPassword;
