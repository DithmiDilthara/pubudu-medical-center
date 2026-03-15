import { FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

function DoctorHeader({ doctorName = "Dr. Kanya Ekanalyake" }) {
  const navigate = useNavigate();
  return (
    <header style={styles.header}>
      {/* Welcome Section */}
      <div style={styles.welcomeContainer} onClick={() => navigate('/profile')}>
        <p style={styles.welcomeText}>
          Welcome, <span style={styles.doctorName}>{doctorName}!</span>
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
    padding: "20px 40px",
    backgroundColor: "white",
    borderBottom: "1px solid var(--slate-100)",
    position: "sticky",
    top: 0,
    zIndex: 50,
    height: "80px",
  },
  welcomeContainer: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    cursor: "pointer"
  },
  welcomeText: {
    fontSize: "var(--text-sm)",
    color: "var(--slate-500)",
    margin: 0,
    fontWeight: "600",
    fontFamily: "'Inter', sans-serif"
  },
  doctorName: {
    color: "var(--primary-blue)",
    fontWeight: "700"
  },
  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "var(--primary-blue-light)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--primary-blue)",
  },
  avatarIcon: {
    fontSize: "20px",
    color: "white"
  }
};

export default DoctorHeader;
