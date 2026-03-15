import { Link, useLocation } from "react-router-dom";
import { 
  FiGrid, 
  FiCalendar, 
  FiSearch, 
  FiCreditCard, 
  FiUser, 
  FiLogOut, 
  FiActivity,
  FiMenu,
  FiX
} from "react-icons/fi";
import { GiPill } from "react-icons/gi"; 
import { useState, useEffect } from "react";

function PatientSidebar({ onLogout }) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
      if (window.innerWidth > 1024) setIsOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { path: "/patient/dashboard", label: "Dashboard", icon: FiGrid },
    { path: "/patient/appointments", label: "My Appointments", icon: FiCalendar },
    { path: "/patient/find-doctor", label: "Find Doctors", icon: FiSearch },
    { path: "/patient/prescriptions", label: "Prescriptions", icon: GiPill },
    { path: "/patient/payments", label: "Payments", icon: FiCreditCard },
    { path: "/profile", label: "My profile", icon: FiUser }
  ];

  const isActive = (path) => location.pathname === path;

  const toggleSidebar = () => setIsOpen(!isOpen);

  const sidebarElement = (
    <aside style={{
      ...styles.sidebar,
      left: isMobile ? (isOpen ? '0' : '-256px') : '0',
    }}>
      <div style={styles.sidebarContent}>
        {/* Logo Block */}
        <div style={styles.logoBlock}>
          <div style={styles.logoIconBox}>
            <FiActivity style={styles.logoIcon} />
          </div>
          <div style={styles.logoTextBox}>
            <h2 style={styles.logoMainText}>Pubudu</h2>
            <p style={styles.logoSubText}>MEDICAL CENTER</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav style={styles.nav}>
          {menuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => isMobile && setIsOpen(false)}
                style={{
                  ...styles.navItem,
                  backgroundColor: active ? 'var(--primary-blue-light)' : 'transparent',
                  color: active ? 'var(--primary-blue)' : 'var(--slate-500)',
                }}
              >
                <item.icon style={{
                  ...styles.navIcon,
                  color: active ? 'var(--primary-blue)' : 'var(--slate-400)',
                }} />
                <span style={{
                  ...styles.navLabel,
                  fontWeight: active ? '700' : '500',
                }}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div style={styles.logoutContainer}>
          <button 
            onClick={onLogout} 
            style={styles.logoutButton}
          >
            <FiLogOut style={styles.logoutIcon} />
            <span style={styles.navLabel}>Log out</span>
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {isMobile && (
        <button onClick={toggleSidebar} style={styles.mobileToggle}>
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      )}
      {isMobile && isOpen && <div onClick={toggleSidebar} style={styles.overlay} />}
      {sidebarElement}
    </>
  );
}

const styles = {
  sidebar: {
    width: "256px",
    backgroundColor: "#FFFFFF",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    top: 0,
    borderRight: "1px solid var(--slate-200)",
    zIndex: 1000,
    transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  sidebarContent: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    padding: "32px 0"
  },
  logoBlock: {
    padding: "0 24px",
    marginBottom: '40px',
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  logoIconBox: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "var(--primary-blue)",
    flexShrink: 0,
  },
  logoIcon: {
    fontSize: "22px",
    color: "white"
  },
  logoTextBox: {
    display: "flex",
    flexDirection: "column",
  },
  logoMainText: {
    fontSize: "var(--text-lg)",
    fontWeight: "800",
    color: "var(--slate-900)",
    margin: 0,
    lineHeight: 1.1,
  },
  logoSubText: {
    fontSize: "9px",
    fontWeight: "700",
    color: "var(--primary-blue)",
    margin: 0,
    fontVariant: 'small-caps',
    letterSpacing: "0.5px"
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
    borderRadius: "12px",
    textDecoration: "none",
    fontSize: "var(--text-sm)",
    transition: "all 0.2s ease",
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
  },
  navIcon: {
    fontSize: "18px",
    flexShrink: 0
  },
  navLabel: {
    fontSize: "var(--text-sm)",
    fontFamily: "'Inter', sans-serif"
  },
  logoutContainer: {
    padding: "0 16px",
    marginTop: "auto",
  },
  logoutButton: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    borderRadius: "12px",
    color: "var(--accent-red)",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.2s ease",
    backgroundColor: "transparent",
    border: "none",
    textAlign: "left"
  },
  logoutIcon: {
    fontSize: "18px"
  },
  mobileToggle: {
    position: "fixed",
    top: "20px",
    left: "20px",
    zIndex: 1100,
    padding: "10px",
    borderRadius: "10px",
    backgroundColor: "white",
    border: "1px solid var(--slate-200)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "var(--shadow-soft)",
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    backdropFilter: "blur(4px)",
    zIndex: 900,
  }
};

export default PatientSidebar;
