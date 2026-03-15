import { Link, useLocation } from "react-router-dom";
import { FiHome, FiUsers, FiCalendar, FiCreditCard, FiLogOut, FiActivity, FiUser, FiChevronRight } from "react-icons/fi";
import { motion } from "framer-motion";

function ReceptionistSidebar({ onLogout }) {
  const location = useLocation();

  const menuItems = [
    { path: "/receptionist/dashboard", label: "Dashboard", icon: FiHome },
    { path: "/receptionist/patients", label: "Patients", icon: FiUsers },
    { path: "/receptionist/appointments", label: "Appointments", icon: FiCalendar },
    { path: "/receptionist/payment", label: "Payments", icon: FiCreditCard },
    { path: "/profile", label: "My Profile", icon: FiUser }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside style={styles.sidebar}>
      <div style={styles.sidebarContent}>
        {/* Logo Section */}
        <div style={styles.logoSection}>
          <div style={styles.logoSquare}>
            <FiActivity style={styles.logoIcon} />
          </div>
          <div style={styles.logoTextContainer}>
            <h2 style={styles.logoText}>Pubudu</h2>
            <p style={styles.roleText}>Medical Center</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav style={styles.nav}>
          <div style={styles.menuLabel}>Main Menu</div>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                ...styles.navItem,
                ...(isActive(item.path) ? styles.navItemActive : {})
              }}
            >
              <div style={{...styles.iconWrapper, ...(isActive(item.path) ? styles.iconWrapperActive : {})}}>
                <item.icon style={{...styles.navIcon, ...(isActive(item.path) ? styles.navIconActive : {})}} />
              </div>
              <span style={styles.navLabel}>{item.label}</span>
              {isActive(item.path) && (
                <motion.div 
                  layoutId="activeIndicator"
                  style={styles.activeIndicator} 
                />
              )}
              {isActive(item.path) && <FiChevronRight style={styles.activeArrow} />}
            </Link>
          ))}
        </nav>

        {/* Logout Section */}
        <div style={styles.footer}>
          <div style={styles.divider}></div>
          <button onClick={onLogout} style={styles.logoutButton}>
            <div style={styles.logoutIconWrapper}>
              <FiLogOut style={styles.logoutIcon} />
            </div>
            <span style={styles.logoutLabel}>Logout Session</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: "280px",
    backgroundColor: "#ffffff",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    top: 0,
    left: 0,
    borderRight: "1px solid #f1f5f9",
    zIndex: 1000,
    boxShadow: "4px 0 24px rgba(15, 23, 42, 0.02)"
  },
  sidebarContent: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    padding: "32px 0"
  },
  logoSection: {
    padding: "0 32px",
    marginBottom: "48px",
    display: "flex",
    alignItems: "center",
    gap: "16px"
  },
  logoSquare: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 8px 16px -4px rgba(37, 99, 235, 0.3)"
  },
  logoIcon: {
    fontSize: "22px",
    color: "white"
  },
  logoTextContainer: {
    display: "flex",
    flexDirection: "column"
  },
  logoText: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#0f172a",
    margin: 0,
    letterSpacing: "-0.5px",
    lineHeight: 1.1
  },
  roleText: {
    fontSize: "12px",
    color: "#64748b",
    margin: 0,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "1px"
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    padding: "0 16px",
    flex: 1
  },
  menuLabel: {
    padding: "0 16px 12px 16px",
    fontSize: "11px",
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.05em"
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    borderRadius: "14px",
    textDecoration: "none",
    color: "#64748b",
    fontSize: "14px",
    fontWeight: "600",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    marginBottom: "2px"
  },
  navItemActive: {
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    fontWeight: "700"
  },
  iconWrapper: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s"
  },
  iconWrapperActive: {
    backgroundColor: "white",
    boxShadow: "0 2px 4px rgba(37, 99, 235, 0.06)"
  },
  navIcon: {
    fontSize: "18px",
    color: "#94a3b8"
  },
  navIconActive: {
    color: "#2563eb"
  },
  navLabel: {
    flex: 1
  },
  activeIndicator: {
    position: "absolute",
    left: "-16px",
    width: "4px",
    height: "24px",
    backgroundColor: "#2563eb",
    borderRadius: "0 4px 4px 0"
  },
  activeArrow: {
    fontSize: "14px",
    opacity: 0.5
  },
  footer: {
    marginTop: "auto",
    padding: "0 16px"
  },
  divider: {
    height: "1px",
    backgroundColor: "#f1f5f9",
    margin: "0 16px 24px 16px"
  },
  logoutButton: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px 16px",
    borderRadius: "14px",
    backgroundColor: "#fff1f2",
    border: "none",
    color: "#e11d48",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.2s",
    width: "100%",
    textAlign: "left"
  },
  logoutIconWrapper: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    backgroundColor: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 4px rgba(225, 29, 72, 0.06)"
  },
  logoutIcon: {
    fontSize: "18px"
  },
  logoutLabel: {
    flex: 1
  }
};

export default ReceptionistSidebar;
