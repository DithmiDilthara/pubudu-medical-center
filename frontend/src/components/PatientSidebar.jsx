import { Link, useLocation } from "react-router-dom";
import { FiHome, FiUsers, FiCalendar, FiUser, FiLogOut, FiActivity } from "react-icons/fi";

function PatientSidebar({ onLogout }) {
  const location = useLocation();

  const menuItems = [
    { path: "/patient/dashboard", label: "Dashboard", icon: FiHome },
    { path: "/patient/find-doctor", label: "Find Doctor", icon: FiUsers },
    { path: "/patient/appointments", label: "Appointments", icon: FiCalendar },
    { path: "/patient/profile", label: "Profile", icon: FiUser }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside style={styles.sidebar}>
      <div style={styles.sidebarContent}>
        {/* Logo Section */}
        <div style={styles.logoSection}>
          <div style={styles.logoCircle}>
            <FiActivity style={styles.logoIcon} />
          </div>
          <div>
            <h2 style={styles.logoText}>Pubudu Medical</h2>
            <p style={styles.roleText}>Patient Portal</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav style={styles.nav}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                ...styles.navItem,
                ...(isActive(item.path) ? styles.navItemActive : {})
              }}
            >
              <item.icon style={styles.navIcon} />
              <span style={styles.navLabel}>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Logout Button at Bottom */}
        <div style={styles.logoutContainer}>
          <button onClick={onLogout} style={styles.logoutButton}>
            <FiLogOut style={styles.navIcon} />
            <span style={styles.navLabel}>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: "260px",
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
    boxShadow: "2px 0 10px rgba(0, 0, 0, 0.05)",
    display: "flex",
    flexDirection: "column",
    position: "sticky",
    top: 0,
    left: 0,
    borderRight: "1px solid #e5e7eb"
  },
  sidebarContent: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    padding: "24px 0"
  },
  logoSection: {
    padding: "0 20px",
    marginBottom: "32px",
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  logoCircle: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #8b9dff 0%, #9b7bc8 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  },
  logoIcon: {
    fontSize: "24px",
    color: "white"
  },
  logoText: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#1f2937",
    margin: 0,
    letterSpacing: "0.3px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  roleText: {
    fontSize: "12px",
    color: "#6b7280",
    margin: 0,
    fontWeight: "500",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    padding: "0 16px",
    flex: 1
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    borderRadius: "8px",
    textDecoration: "none",
    color: "#4b5563",
    fontSize: "15px",
    fontWeight: "500",
    transition: "all 0.2s",
    cursor: "pointer",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    backgroundColor: "transparent",
    border: "none"
  },
  navItemActive: {
    backgroundColor: "#8b9dff",
    color: "white",
    fontWeight: "600"
  },
  navIcon: {
    fontSize: "20px"
  },
  navLabel: {
    fontSize: "15px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  logoutContainer: {
    padding: "0 16px",
    marginTop: "auto",
    paddingTop: "16px"
  },
  logoutButton: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    borderRadius: "8px",
    backgroundColor: "transparent",
    border: "none",
    color: "#4b5563",
    fontSize: "15px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
    width: "100%",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  }
};

export default PatientSidebar;
