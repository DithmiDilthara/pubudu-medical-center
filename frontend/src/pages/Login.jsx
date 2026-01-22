import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    userType: 'receptionist'
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        } else if (value.trim().length > 50) {
          error = 'Username must not exceed 50 characters';
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          error = 'Username can only contain letters, numbers, and underscores';
        }
        break;

      case 'password':
        if (!value) {
          error = 'Password is required';
        } else if (value.length < 8) {
          error = 'Password must be at least 8 characters';
        } else if (value.length > 100) {
          error = 'Password must not exceed 100 characters';
        } else if (!/(?=.*[a-z])/.test(value)) {
          error = 'Password must contain at least one lowercase letter';
        } else if (!/(?=.*[A-Z])/.test(value)) {
          error = 'Password must contain at least one uppercase letter';
        } else if (!/(?=.*\d)/.test(value)) {
          error = 'Password must contain at least one number';
        } else if (!/(?=.*[@#$!%*?&])/.test(value)) {
          error = 'Password must contain at least one special character (@, #, $, !, %, *, ?, &)';
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

    if (validateForm()) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Login Data:', formData);
      
      // Store user info in localStorage
      localStorage.setItem('userType', formData.userType);
      localStorage.setItem('username', formData.username);
      
      const roleNames = {
        doctor: 'Doctor',
        patient: 'Patient',
        receptionist: 'Receptionist'
      };
      
      alert(`✅ Login Successful!\n\nUsername: ${formData.username}\nRole: ${roleNames[formData.userType]}`);
      
      // Navigate based on user type
      if (formData.userType === 'doctor') {
        navigate('/doctor/dashboard');
      } else if (formData.userType === 'receptionist') {
        navigate('/receptionist/dashboard');
      } else {
        navigate('/patient/dashboard');
      }
    } else {
      alert('❌ Please fix the errors before submitting');
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

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Login As <span style={styles.required}>*</span>
            </label>
            <div style={styles.radioGroup}>
              <label style={styles.radioLabel}>
                <input
                  type="radio"
                  name="userType"
                  value="receptionist"
                  checked={formData.userType === 'receptionist'}
                  onChange={handleChange}
                  style={styles.radio}
                />
                <span style={styles.radioText}>Receptionist</span>
              </label>
              <label style={styles.radioLabel}>
                <input
                  type="radio"
                  name="userType"
                  value="patient"
                  checked={formData.userType === 'patient'}
                  onChange={handleChange}
                  style={styles.radio}
                />
                <span style={styles.radioText}>Patient</span>
              </label>
              <label style={styles.radioLabel}>
                <input
                  type="radio"
                  name="userType"
                  value="doctor"
                  checked={formData.userType === 'doctor'}
                  onChange={handleChange}
                  style={styles.radio}
                />
                <span style={styles.radioText}>Doctor</span>
              </label>
            </div>
          </div>

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
              <span style={styles.errorMessage}>⚠️ {errors.username}</span>
            )}
            {touched.username && !errors.username && formData.username && (
              <span style={styles.successMessage}>✓ Valid username</span>
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
              <span style={styles.errorMessage}>⚠️ {errors.password}</span>
            )}
            {touched.password && !errors.password && formData.password && (
              <span style={styles.successMessage}>✓ Valid password</span>
            )}
            
            {formData.password && (
              <div style={styles.passwordRequirements}>
                <p style={styles.requirementsTitle}>Password must contain:</p>
                <div style={styles.requirement}>
                  <span style={/(?=.*[a-z])/.test(formData.password) ? styles.checkmark : styles.cross}>
                    {/(?=.*[a-z])/.test(formData.password) ? '✓' : '✗'}
                  </span>
                  <span>At least one lowercase letter</span>
                </div>
                <div style={styles.requirement}>
                  <span style={/(?=.*[A-Z])/.test(formData.password) ? styles.checkmark : styles.cross}>
                    {/(?=.*[A-Z])/.test(formData.password) ? '✓' : '✗'}
                  </span>
                  <span>At least one uppercase letter</span>
                </div>
                <div style={styles.requirement}>
                  <span style={/(?=.*\d)/.test(formData.password) ? styles.checkmark : styles.cross}>
                    {/(?=.*\d)/.test(formData.password) ? '✓' : '✗'}
                  </span>
                  <span>At least one number</span>
                </div>
                <div style={styles.requirement}>
                  <span style={/(?=.*[@#$!%*?&])/.test(formData.password) ? styles.checkmark : styles.cross}>
                    {/(?=.*[@#$!%*?&])/.test(formData.password) ? '✓' : '✗'}
                  </span>
                  <span>At least one special character (@, #, $, !, %, *, ?, &)</span>
                </div>
                <div style={styles.requirement}>
                  <span style={formData.password.length >= 8 ? styles.checkmark : styles.cross}>
                    {formData.password.length >= 8 ? '✓' : '✗'}
                  </span>
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
            <div style={styles.logoIcon}>+</div>
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
    fontFamily: 'Arial, sans-serif'
  },
  leftSide: {
    flex: 3,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: '40px'
  },
  rightSide: {
    flex: 1,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px',
    color: 'white'
  },
  rightContent: {
    textAlign: 'center',
    maxWidth: '500px'
  },
  logoContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '30px'
  },
  logoIcon: {
    width: '120px',
    height: '120px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '72px',
    color: 'white',
    fontWeight: 'bold',
    border: '3px solid white'
  },
  centerName: {
    fontSize: '36px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: 'white'
  },
  tagline: {
    fontSize: '18px',
    marginBottom: '50px',
    color: 'rgba(255, 255, 255, 0.9)'
  },
  quoteContainer: {
    marginTop: '60px',
    padding: '30px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '15px',
    backdropFilter: 'blur(10px)'
  },
  quote: {
    fontSize: '24px',
    fontStyle: 'italic',
    marginBottom: '15px',
    fontWeight: '500'
  },
  quoteSubtext: {
    fontSize: '16px',
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: '1.6'
  },
  formContainer: {
    width: '100%',
    maxWidth: '450px'
  },
  welcomeTitle: {
    textAlign: 'center',
    marginBottom: '10px',
    fontSize: '28px',
    color: '#333',
    fontWeight: 'bold'
  },
  welcomeSubtitle: {
    textAlign: 'center',
    marginBottom: '30px',
    fontSize: '16px',
    color: '#666'
  },
  formGroup: {
    marginBottom: '25px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    color: '#555',
    fontWeight: '500'
  },
  required: {
    color: '#e74c3c'
  },
  input: {
    width: '100%',
    padding: '12px 15px',
    fontSize: '15px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    boxSizing: 'border-box',
    transition: 'all 0.3s',
    outline: 'none'
  },
  inputError: {
    borderColor: '#e74c3c',
    backgroundColor: '#fff5f5'
  },
  inputSuccess: {
    borderColor: '#27ae60',
    backgroundColor: '#f0fff4'
  },
  errorMessage: {
    display: 'block',
    color: '#e74c3c',
    fontSize: '13px',
    marginTop: '6px',
    fontWeight: '500'
  },
  successMessage: {
    display: 'block',
    color: '#27ae60',
    fontSize: '13px',
    marginTop: '6px',
    fontWeight: '500'
  },
  passwordRequirements: {
    marginTop: '12px',
    padding: '12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    border: '1px solid #e0e0e0'
  },
  requirementsTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#666',
    marginBottom: '8px'
  },
  requirement: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '12px',
    color: '#666',
    marginBottom: '4px'
  },
  checkmark: {
    color: '#27ae60',
    fontWeight: 'bold',
    marginRight: '8px',
    fontSize: '14px'
  },
  cross: {
    color: '#e74c3c',
    fontWeight: 'bold',
    marginRight: '8px',
    fontSize: '14px'
  },
  forgotPassword: {
    textAlign: 'right',
    marginBottom: '20px'
  },
  radioGroup: {
    display: 'flex',
    gap: '24px',
    marginTop: '8px'
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    fontSize: '15px',
    color: '#555'
  },
  radio: {
    marginRight: '8px',
    cursor: 'pointer',
    width: '18px',
    height: '18px',
    accentColor: '#667eea'
  },
  radioText: {
    fontWeight: '500'
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#667eea',
    cursor: 'pointer',
    fontSize: '14px',
    textDecoration: 'underline',
    padding: '0'
  },
  loginButton: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    marginBottom: '20px'
  },
  loginButtonDisabled: {
    backgroundColor: '#a0a0a0',
    cursor: 'not-allowed'
  },
  signupLink: {
    textAlign: 'center'
  },
  signupText: {
    margin: '0',
    fontSize: '14px',
    color: '#666'
  }
};

export default Login;