import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiAlertCircle, FiCheck, FiX, FiActivity } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({
      ...touched,
      [name]: true
    });
    validateField(name, formData[name]);
  };

  const validateField = (fieldName, value) => {
    let error = '';

    switch (fieldName) {
      case 'username':
        if (!value.trim()) {
          error = 'Username is required';
        } else if (value.trim().length < 3) {
          error = 'Username must be at least 3 characters';
        }
        break;

      case 'password':
        if (!value) {
          error = 'Password is required';
        } else if (value.length < 6) {
          error = 'Password must be at least 6 characters';
        }
        break;

      default:
        break;
    }

    if (error) {
      setErrors(prev => ({ ...prev, [fieldName]: error }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }

    return error === '';
  };

  const validateForm = () => {
    const usernameValid = validateField('username', formData.username);
    const passwordValid = validateField('password', formData.password);

    setTouched({
      username: true,
      password: true
    });

    return usernameValid && passwordValid;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setGeneralError('');

    if (validateForm()) {
      try {
        const result = await login(formData.username, formData.password);

        if (result.success) {
          const user = result.user;
          
          // Navigate based on role
          const roleId = user.role_id;
          const roleRoutes = {
            1: '/admin/dashboard',
            2: '/doctor/dashboard',
            3: '/receptionist/dashboard',
            4: '/patient/dashboard'
          };

          navigate(roleRoutes[roleId] || '/patient/dashboard');
        } else {
          setGeneralError(result.error || 'Login failed. Please check your credentials.');
        }
      } catch (error) {
        setGeneralError('An error occurred during login. Please try again.');
      }
    } else {
      setGeneralError('Please fix the errors before submitting');
    }

    setIsSubmitting(false);
  };

  const handleForgotPassword = () => {
    alert('Forgot Password feature - Coming soon!');
  };

  const handleSignupRedirect = () => {
    navigate('/register');
  };

  return (
    <div style={styles.container}>
      <div style={styles.leftSide}>
        <div style={styles.formContainer}>
          <h2 style={styles.welcomeTitle}>Welcome to Pubudu Medical Center</h2>
          <p style={styles.welcomeSubtitle}>Please login to continue</p>

          {generalError && (
            <div style={styles.generalError}>
              <FiAlertCircle style={{ marginRight: '8px' }} />
              {generalError}
            </div>
          )}

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Username <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              onBlur={handleBlur}
              style={{
                ...styles.input,
                ...(touched.username && errors.username ? styles.inputError : {}),
                ...(touched.username && !errors.username && formData.username ? styles.inputSuccess : {})
              }}
              placeholder="Enter your username"
              disabled={isSubmitting}
            />
            {touched.username && errors.username && (
              <span style={styles.errorMessage}>
                <FiAlertCircle style={styles.messageIcon} /> {errors.username}
              </span>
            )}
            {touched.username && !errors.username && formData.username && (
              <span style={styles.successMessage}>
                <FiCheck style={styles.messageIcon} /> Valid username
              </span>
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Password <span style={styles.required}>*</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              style={{
                ...styles.input,
                ...(touched.password && errors.password ? styles.inputError : {}),
                ...(touched.password && !errors.password && formData.password ? styles.inputSuccess : {})
              }}
              placeholder="Enter your password"
              disabled={isSubmitting}
            />
            {touched.password && errors.password && (
              <span style={styles.errorMessage}>
                <FiAlertCircle style={styles.messageIcon} /> {errors.password}
              </span>
            )}
            {touched.password && !errors.password && formData.password && (
              <span style={styles.successMessage}>
                <FiCheck style={styles.messageIcon} /> Valid password
              </span>
            )}
            
            {formData.password && (
              <div style={styles.passwordRequirements}>
                <p style={styles.requirementsTitle}>Password must contain:</p>
                <div style={styles.requirement}>
                  {/(?=.*[a-z])/.test(formData.password) ? (
                    <FiCheck style={styles.checkmark} />
                  ) : (
                    <FiX style={styles.cross} />
                  )}
                  <span>At least one lowercase letter</span>
                </div>
                <div style={styles.requirement}>
                  {/(?=.*[A-Z])/.test(formData.password) ? (
                    <FiCheck style={styles.checkmark} />
                  ) : (
                    <FiX style={styles.cross} />
                  )}
                  <span>At least one uppercase letter</span>
                </div>
                <div style={styles.requirement}>
                  {/(?=.*\d)/.test(formData.password) ? (
                    <FiCheck style={styles.checkmark} />
                  ) : (
                    <FiX style={styles.cross} />
                  )}
                  <span>At least one number</span>
                </div>
                <div style={styles.requirement}>
                  {/(?=.*[@#$!%*?&])/.test(formData.password) ? (
                    <FiCheck style={styles.checkmark} />
                  ) : (
                    <FiX style={styles.cross} />
                  )}
                  <span>At least one special character (@, #, $, !, %, *, ?, &)</span>
                </div>
                <div style={styles.requirement}>
                  {formData.password.length >= 8 ? (
                    <FiCheck style={styles.checkmark} />
                  ) : (
                    <FiX style={styles.cross} />
                  )}
                  <span>Minimum 8 characters</span>
                </div>
              </div>
            )}
          </div>

          <div style={styles.forgotPassword}>
            <button 
              type="button" 
              onClick={handleForgotPassword}
              style={styles.linkButton}
              disabled={isSubmitting}
            >
              Forgot Password?
            </button>
          </div>

          <button 
            type="button" 
            onClick={handleSubmit}
            style={{
              ...styles.loginButton,
              ...(isSubmitting ? styles.loginButtonDisabled : {})
            }}
            disabled={isSubmitting}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 102, 204, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 102, 204, 0.3)';
              }
            }}
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>

          <div style={styles.signupLink}>
            <p style={styles.signupText}>
              Don't have an account?{' '}
              <button 
                type="button"
                onClick={handleSignupRedirect}
                style={styles.linkButton}
                disabled={isSubmitting}
              >
                Sign Up
              </button>
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
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px 60px',
    backgroundColor: '#FFFFFF'
  },
  rightSide: {
    flex: 1,
    background: 'linear-gradient(135deg, #0066CC 0%, #0052A3 100%)',
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
    maxWidth: '440px'
  },
  welcomeTitle: {
    textAlign: 'left',
    marginBottom: '8px',
    fontSize: '32px',
    color: '#111827',
    fontWeight: '800',
    letterSpacing: '-0.5px',
    fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif"
  },
  welcomeSubtitle: {
    textAlign: 'left',
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
  successMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#059669',
    fontSize: '13px',
    marginTop: '8px',
    fontWeight: '500'
  },
  messageIcon: {
    fontSize: '14px',
    flexShrink: 0
  },
  passwordRequirements: {
    marginTop: '12px',
    padding: '16px',
    backgroundColor: '#F9FAFB',
    borderRadius: '10px',
    border: '1px solid #E5E7EB'
  },
  requirementsTitle: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#4B5563',
    marginBottom: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  requirement: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '13px',
    color: '#6B7280',
    marginBottom: '6px',
    fontWeight: '500'
  },
  checkmark: {
    color: '#10B981',
    marginRight: '10px',
    fontSize: '16px',
    flexShrink: 0
  },
  cross: {
    color: '#EF4444',
    marginRight: '10px',
    fontSize: '16px',
    flexShrink: 0
  },
  forgotPassword: {
    textAlign: 'right',
    marginBottom: '24px'
  },
  radioGroup: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    marginTop: '10px'
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#4B5563',
    padding: '12px 16px',
    backgroundColor: '#F9FAFB',
    borderRadius: '10px',
    border: '2px solid #E5E7EB',
    transition: 'all 0.2s',
    fontWeight: '600'
  },
  radio: {
    marginRight: '10px',
    cursor: 'pointer',
    width: '18px',
    height: '18px',
    accentColor: '#0066CC'
  },
  radioText: {
    fontWeight: '600'
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
  }
};

export default Login;