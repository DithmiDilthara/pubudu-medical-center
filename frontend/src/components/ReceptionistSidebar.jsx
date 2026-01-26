import { Link, useLocation } from "react-router-dom";
import { FiHome, FiUsers, FiCalendar, FiCreditCard, FiLogOut, FiActivity, FiUser } from "react-icons/fi";

function ReceptionistSidebar({ onLogout }) {
  const location = useLocation();

  const menuItems = [
    { path: "/receptionist/dashboard", label: "Dashboard", icon: FiHome },
    { path: "/receptionist/patients", label: "Patients", icon: FiUsers },
    { path: "/receptionist/appointments", label: "Appointments", icon: FiCalendar },
    { path: "/receptionist/payment", label: "Payments", icon: FiCreditCard },
    { path: "/profile", label: "Profile", icon: FiUser }
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
            <p style={styles.roleText}>Receptionist Dashboard</p>
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
    width: "280px",
    backgroundColor: "#FFFFFF",
    minHeight: "100vh",
    boxShadow: "2px 0 20px rgba(0, 0, 0, 0.04)",
    display: "flex",
    flexDirection: "column",
    position: "sticky",
    top: 0,
    left: 0,
    borderRight: "1px solid #E5E7EB",
    zIndex: 100
  },
  sidebarContent: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    padding: "28px 0"
  },
  logoSection: {
    padding: "0 24px",
    marginBottom: "40px",
    display: "flex",
    alignItems: "center",
    gap: "14px"
  },
  logoCircle: {
    width: "52px",
    height: "52px",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #0066CC 0%, #0052A3 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 4px 12px rgba(0, 102, 204, 0.25)"
  },
  logoIcon: {
    fontSize: "26px",
    color: "white"
  },
  logoText: {
    fontSize: "19px",
    fontWeight: "800",
    color: "#111827",
    margin: 0,
    letterSpacing: "-0.3px",
    fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif"
  },
  roleText: {
    fontSize: "12px",
    color: "#6B7280",
    margin: 0,
    fontWeight: "600",
    fontFamily: "'Inter', sans-serif",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    padding: "0 20px",
    flex: 1
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "14px 18px",
    borderRadius: "12px",
    textDecoration: "none",
    color: "#6B7280",
    fontSize: "15px",
    fontWeight: "600",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
    backgroundColor: "transparent",
    border: "none",
    position: "relative"
  },
  navItemActive: {
    backgroundColor: "#E6F2FF",
    color: "#0066CC",
    fontWeight: "700",
    boxShadow: "0 2px 8px rgba(0, 102, 204, 0.1)"
  },
  navIcon: {
    fontSize: "21px"
  },
  navLabel: {
    fontSize: "15px",
    fontFamily: "'Inter', sans-serif"
  },
  logoutContainer: {
    padding: "0 20px",
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
    color: "#EF4444",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
    width: "100%",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  }
};

export default ReceptionistSidebar;
