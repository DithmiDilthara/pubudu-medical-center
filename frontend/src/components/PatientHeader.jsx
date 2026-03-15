import { FiUser, FiChevronDown } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function PatientHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const getPageContext = () => {
    const path = location.pathname;
    const name = user?.full_name?.split(' ')[0] || "User";

    switch (path) {
      case "/patient/dashboard":
        return { 
          title: `welcome ${name}! 👋`, 
          subtitle: "Check your health status and upcoming appointments." 
        };
      case "/patient/appointments":
        return { 
          title: "My Appointments", 
          subtitle: "Manage your upcoming and past appointments." 
        };
      case "/patient/find-doctor":
      case "/patient/channel-doctor":
        return { 
          title: "Find Doctors", 
          subtitle: "Browse and channel doctors online." 
        };
      case "/patient/prescriptions":
        return { 
          title: "My Prescriptions", 
          subtitle: "View and manage your prescriptions." 
        };
      case "/patient/payments":
        return { 
          title: "Payment History", 
          subtitle: "View your billing and payment records." 
        };
      case "/profile":
        return { 
          title: "My profile", 
          subtitle: "Manage your account." 
        };
      default:
        return { title: "Pubudu Medical", subtitle: "Excellence in Care" };
    }
  };

  const { title, subtitle } = getPageContext();

  return (
    <header style={styles.header}>
      {/* Page Info */}
      <div style={styles.pageInfo}>
        <h1 style={styles.pageTitle}>{title}</h1>
        <p style={styles.pageSubtitle}>{subtitle}</p>
      </div>

      {/* Right Section: Profile */}
      <div style={styles.profileSection} onClick={() => navigate('/profile')}>
        <div style={styles.profileDetails}>
          <p style={styles.profileName}>{user?.full_name || "Kasun Pe"}</p>
          <p style={styles.patientId}>patient ID: #PMC-{user?.patient_id || "8492"}</p>
        </div>
        <div style={styles.avatar}>
          <FiUser style={styles.avatarIcon} />
        </div>
        <FiChevronDown style={styles.chevron} />
      </div>
    </header>
  );
}

const styles = {
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 40px",
    backgroundColor: "white",
    borderBottom: "1px solid var(--slate-100)",
    position: "sticky",
    top: 0,
    zIndex: 50,
    height: "80px",
  },
  pageInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  pageTitle: {
    fontSize: "var(--text-xl)",
    fontWeight: "700",
    color: "var(--slate-900)",
    margin: 0,
    textTransform: "none",
  },
  pageSubtitle: {
    fontSize: "var(--text-sm)",
    color: "var(--slate-500)",
    margin: 0,
  },
  profileSection: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
    padding: "6px 12px",
    borderRadius: "12px",
    transition: "background-color 0.2s ease",
  },
  profileDetails: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  },
  profileName: {
    fontSize: "var(--text-sm)",
    fontWeight: "700",
    color: "var(--slate-900)",
    margin: 0,
  },
  patientId: {
    fontSize: "var(--text-xs)",
    fontWeight: "600",
    color: "var(--slate-500)",
    margin: 0,
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
  },
  chevron: {
    color: "var(--slate-400)",
    fontSize: "16px",
  }
};

export default PatientHeader;
