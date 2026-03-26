import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiCheck, FiAlertCircle, FiActivity, FiArrowLeft, FiRefreshCw } from "react-icons/fi";
import axios from "axios";
import hospitalBg from "../assets/hospital_clear.png";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function OtpVerification() {
  const location = useLocation();
  const navigate = useNavigate();
  const { otpToken: initialToken, email } = location.state || {};
  const [otpToken, setOtpToken] = useState(initialToken);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!initialToken || !email) {
      navigate("/register");
    }
  }, [initialToken, email, navigate]);

  useEffect(() => {
    let timer;
    if (resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCountdown]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Please enter the full 6-digit code");
      return;
    }

    setIsVerifying(true);
    setError("");
    try {
      const response = await axios.post(`${API_URL}/auth/verify-email`, {
        otpToken,
        otp: otpCode
      });

      if (response.data.success) {
        setSuccessMsg("Email verified successfully!");
        setTimeout(() => {
          navigate("/register/success", { state: { email } });
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError("");
    try {
      const response = await axios.post(`${API_URL}/auth/resend-otp`, { email });
      if (response.data.success) {
        setOtpToken(response.data.otpToken);
        setResendCountdown(60);
        setOtp(["", "", "", "", "", ""]);
        setSuccessMsg("A new code has been sent to your email.");
        setTimeout(() => setSuccessMsg(""), 5000);
      }
    } catch (err) {
      setError("Failed to resend code. Please try again later.");
    } finally {
      setIsResending(false);
    }
  };

  const maskedEmail = email ? email.replace(/^(.{2})(.*)(?=@)/, (gp1, gp2, gp3) => {
    return gp2 + "*".repeat(gp3.length);
  }) : "";

  return (
    <div style={styles.container}>
      <div style={styles.leftSide}>
        <div style={styles.leftBackground} />
        <div style={styles.formContainer}>
          <button onClick={() => navigate("/register")} style={styles.backBtn}>
            <FiArrowLeft /> Back to Registration
          </button>

          <h1 style={styles.title}>Verify Your Email</h1>
          <p style={styles.subtitle}>Enter the 6-digit code sent to <br /><span style={{fontWeight: 700, color: '#1f2937'}}>{maskedEmail}</span></p>

          {error && (
            <div style={styles.errorBanner}>
              <FiAlertCircle style={{ marginRight: "8px" }} />
              {error}
            </div>
          )}

          {successMsg && (
            <div style={styles.successBanner}>
              <FiCheck style={{ marginRight: "8px" }} />
              {successMsg}
            </div>
          )}

          <div style={styles.otpGrid}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                style={{
                    ...styles.otpInput,
                    ...(digit ? styles.otpInputActive : {}),
                    ...(error ? styles.otpInputError : {})
                }}
              />
            ))}
          </div>

          <button
            onClick={handleVerify}
            disabled={isVerifying || otp.join("").length !== 6}
            style={{
              ...styles.verifyBtn,
              ...(isVerifying || otp.join("").length !== 6 ? styles.verifyBtnDisabled : {})
            }}
          >
            {isVerifying ? "Verifying..." : "Verify Email"}
          </button>

          <div style={styles.resendContainer}>
            <p style={styles.resendText}>Didn't receive the code?</p>
            <button
              onClick={handleResend}
              disabled={resendCountdown > 0 || isResending}
              style={{
                ...styles.resendBtn,
                ...(resendCountdown > 0 || isResending ? styles.resendBtnDisabled : {})
              }}
            >
              {isResending ? "Sending..." : resendCountdown > 0 ? `Resend code in ${resendCountdown}s` : "Resend Code"}
            </button>
          </div>

          <p style={styles.securityNote}>
            ⚠️ <strong>Do not share this code with anyone.</strong> Pubudu Medical Center staff will never ask for your verification code.
          </p>
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
          <p style={styles.tagline}>Security & Verification</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    fontFamily: "'Inter', sans-serif",
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
    backgroundImage: `linear-gradient(rgba(37, 99, 235, 0.4), rgba(29, 78, 216, 0.5)), url(${hospitalBg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: 'blur(8px)',
    zIndex: 0
  },
  formContainer: {
    width: '100%',
    maxWidth: '500px',
    backgroundColor: 'white',
    padding: '48px',
    borderRadius: '24px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    zIndex: 1,
    textAlign: 'center'
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'none',
    border: 'none',
    color: '#6b7280',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    marginBottom: '24px',
    padding: 0
  },
  title: {
    fontSize: '30px',
    fontWeight: 800,
    color: '#111827',
    marginBottom: '12px'
  },
  subtitle: {
    color: '#6b7280',
    lineHeight: 1.6,
    marginBottom: '32px'
  },
  otpGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '12px',
    marginBottom: '32px'
  },
  otpInput: {
    width: '100%',
    height: '60px',
    fontSize: '24px',
    fontWeight: 700,
    textAlign: 'center',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    backgroundColor: '#f9fafb',
    outline: 'none',
    transition: 'all 0.2s ease'
  },
  otpInputActive: {
    borderColor: '#0066CC',
    backgroundColor: 'white',
    boxShadow: '0 0 0 4px rgba(0, 102, 204, 0.1)'
  },
  otpInputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2'
  },
  verifyBtn: {
    width: '100%',
    padding: '16px',
    backgroundColor: '#0066CC',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginBottom: '24px'
  },
  verifyBtnDisabled: {
    backgroundColor: '#93c5fd',
    cursor: 'not-allowed'
  },
  resendContainer: {
    marginBottom: '32px'
  },
  resendText: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '8px'
  },
  resendBtn: {
    background: 'none',
    border: 'none',
    color: '#0066CC',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    padding: 0
  },
  resendBtnDisabled: {
    color: '#9ca3af',
    cursor: 'not-allowed'
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    color: '#DC2626',
    padding: '12px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px'
  },
  successBanner: {
    backgroundColor: '#F0FDF4',
    color: '#16A34A',
    padding: '12px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px'
  },
  securityNote: {
    fontSize: '12px',
    color: '#6b7280',
    padding: '16px',
    backgroundColor: '#fffbeb',
    borderRadius: '10px',
    border: '1px solid #fef3c7',
    lineHeight: 1.5
  },
  rightSide: {
    flex: 3,
    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '60px',
    color: 'white'
  },
  rightContent: {
    textAlign: 'center'
  },
  logoContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '24px'
  },
  logoIcon: {
    width: '80px',
    height: '80px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoIconSvg: {
    fontSize: '40px',
    color: 'white'
  },
  centerName: {
    fontSize: '28px',
    fontWeight: 800,
    marginBottom: '8px'
  },
  tagline: {
    fontSize: '16px',
    opacity: 0.9
  }
};

export default OtpVerification;
