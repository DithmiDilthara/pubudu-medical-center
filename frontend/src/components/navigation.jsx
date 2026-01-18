import { Link, useLocation } from "react-router-dom";

const navItems = [
  { path: "/patient/dashboard", label: "Home" },
  { path: "/patient/find-doctor", label: "Doctors" },
  { path: "/patient/appointments", label: "Appointments" },
  { path: "/patient/profile", label: "Profile" }
];

function Navigation({ onLogout }) {
  const { pathname } = useLocation();

  return (
    <header style={styles.wrapper}>
      <div style={styles.bar}>
        <Link to="/patient/dashboard" style={styles.brand}>
          <span style={styles.brandIcon}>🩺</span>
          <div>
            <div style={styles.brandTitle}>Pubudu Medical Center</div>
            <div style={styles.brandSubtitle}>E-Channeling System</div>
          </div>
        </Link>

        <nav style={styles.menu}>
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                ...styles.menuItem,
                ...(pathname === item.path ? styles.menuItemActive : {})
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div style={styles.actions}>
          <button type="button" style={styles.iconButton} title="Notifications">
            🔔
          </button>
          <div style={styles.avatar} title="Dithmi">D</div>
          <button type="button" onClick={onLogout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

const styles = {
  wrapper: {
    position: "sticky",
    top: 0,
    zIndex: 1000,
    background: "#ffffff",
    boxShadow: "0 6px 20px rgba(0,0,0,0.08)"
  },
  bar: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "12px 24px",
    display: "flex",
    alignItems: "center",
    gap: "24px"
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    textDecoration: "none"
  },
  brandIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: "linear-gradient(135deg,#667eea,#764ba2)",
    display: "grid",
    placeItems: "center",
    fontSize: "18px",
    color: "#fff",
    boxShadow: "0 6px 16px rgba(102,126,234,0.35)"
  },
  brandTitle: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#111"
  },
  brandSubtitle: {
    fontSize: "12px",
    color: "#666",
    marginTop: "2px"
  },
  menu: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    marginLeft: "auto",
    marginRight: "auto"
  },
  menuItem: {
    padding: "8px 12px",
    fontSize: "14px",
    fontWeight: 600,
    color: "#444",
    textDecoration: "none",
    borderRadius: "6px",
    transition: "all 0.2s ease"
  },
  menuItemActive: {
    color: "#667eea",
    backgroundColor: "rgba(102,126,234,0.12)"
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },
  iconButton: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    background: "#f5f7fb",
    cursor: "pointer",
    fontSize: "16px"
  },
  avatar: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    background: "#f0c2a4",
    display: "grid",
    placeItems: "center",
    fontWeight: 700,
    color: "#3b2c24"
  },
  logoutButton: {
    padding: "9px 14px",
    borderRadius: "10px",
    border: "1px solid #e74c3c",
    background: "#e74c3c",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 6px 14px rgba(231,76,60,0.25)"
  }
};

export default Navigation;