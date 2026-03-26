import { useLocation, useNavigate } from "react-router-dom";
import { FiCheckCircle, FiArrowRight, FiActivity, FiMail, FiShield } from "react-icons/fi";
import hospitalBg from "../assets/hospital_clear.png";

function RegistrationSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { email } = location.state || {};

  if (!email) {
    // Redirect if direct access without state
    setTimeout(() => navigate("/register"), 0);
    return null;
  }

  return (
    <div style={styles.container}>
      <div style={styles.leftSide}>
        <div style={styles.leftBackground} />
        <div style={styles.formContainer}>
          <div style={styles.successIconContainer}>
            <FiCheckCircle style={styles.successIcon} />
          </div>

          <h1 style={styles.title}>Registration Successful!</h1>
          <p style={styles.subtitle}>Your email has been verified and your account is now active.</p>

          <div style={styles.infoCard}>
            <div style={styles.infoRow}>
              <FiMail style={styles.infoIcon} />
              <p style={styles.infoText}>
                A welcome email has been sent to <strong>{email}</strong> with your account details.
              </p>
            </div>
            <div style={styles.infoRow}>
              <FiShield style={styles.infoIconAlt} />
              <p style={styles.infoText}>
                ⚠️ <strong>Security Reminder:</strong> Please do not share your credentials with anyone.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/", { state: { message: "Account created successfully! You can now login." } })}
            style={styles.loginBtn}
          >
            Go to Login <FiArrowRight />
          </button>
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
          <p style={styles.tagline}>Welcome Aboard</p>
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
    maxWidth: '550px',
    backgroundColor: 'white',
    padding: '60px 48px',
    borderRadius: '24px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    zIndex: 1,
    textAlign: 'center'
  },
  successIconContainer: {
    width: '100px',
    height: '100px',
    backgroundColor: '#F0FDF4',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 32px'
  },
  successIcon: {
    fontSize: '60px',
    color: '#10B981'
  },
  title: {
    fontSize: '32px',
    fontWeight: 800,
    color: '#111827',
    marginBottom: '16px'
  },
  subtitle: {
    fontSize: '18px',
    color: '#6b7280',
    lineHeight: 1.6,
    marginBottom: '40px'
  },
  infoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: '16px',
    padding: '24px',
    textAlign: 'left',
    border: '1px solid #E5E7EB',
    marginBottom: '40px'
  },
  infoRow: {
    display: 'flex',
    gap: '16px',
    marginBottom: '20px'
  },
  infoIcon: {
    fontSize: '20px',
    color: '#0066CC',
    marginTop: '2px',
    flexShrink: 0
  },
  infoIconAlt: {
    fontSize: '20px',
    color: '#F59E0B',
    marginTop: '2px',
    flexShrink: 0
  },
  infoText: {
    fontSize: '15px',
    color: '#374151',
    lineHeight: 1.5,
    margin: 0
  },
  loginBtn: {
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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px'
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

export default RegistrationSuccess;
