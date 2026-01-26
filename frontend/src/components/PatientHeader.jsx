import { FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

function PatientHeader({ patientName = "Dithmi" }) {
  const navigate = useNavigate();
  return (
    <header style={styles.header}>
      {/* Welcome Section */}
      <div style={styles.welcomeContainer} onClick={() => navigate('/profile')}>
        <p style={styles.welcomeText}>
          Welcome, <span style={styles.patientName}>{patientName}!</span>
        </p>
        <div style={styles.avatar}>
          <FiUser style={styles.avatarIcon} />
        </div>
      </div>
    </header>
  );
}

const styles = {
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "24px 40px",
    backgroundColor: "white",
    borderBottom: "1px solid #E5E7EB",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
    position: "sticky",
    top: 0,
    zIndex: 50
  },
  welcomeContainer: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    cursor: "pointer"
  },
  welcomeText: {
    fontSize: "15px",
    color: "#6B7280",
    margin: 0,
    fontWeight: "600",
    fontFamily: "'Inter', sans-serif"
  },
  patientName: {
    color: "#0066CC",
    fontWeight: "700"
  },
  avatar: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #0066CC 0%, #0052A3 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(0, 102, 204, 0.25)",
    border: "2px solid #E6F2FF"
  },
  avatarIcon: {
    fontSize: "20px",
    color: "white"
  }
};

export default PatientHeader;
