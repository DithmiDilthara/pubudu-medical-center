import { FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

function AdminHeader({ adminName = "Admin User" }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <motion.header 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      style={styles.header}
    >
      {/* Page Info - Removed as requested */}
      <div style={styles.pageInfo}>
      </div>

      {/* Right Section: Actions & Profile */}
      <div style={styles.rightSection}>
        <div style={styles.portalBadge}>
          <div style={styles.pulseDot} />
          Admin Portal
        </div>

        <div style={styles.profileSection} onClick={() => navigate('/profile')}>
          <div style={styles.profileDetails}>
            <p style={styles.profileName}>{user?.username || adminName}</p>
            <p style={styles.roleLabel}>System Administrator</p>
          </div>
          <div style={styles.avatar}>
            {(user?.username || adminName)?.charAt(0).toUpperCase() || <FiUser style={styles.avatarIcon} />}
          </div>
          
        </div>
      </div>
    </motion.header>
  );
}

const styles = {
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 32px",
    backgroundColor: "white",
    borderBottom: "1px solid #f1f5f9",
    position: "sticky",
    top: 0,
    zIndex: 50,
    height: "100px",
  },
  pageInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  pageTitle: {
    fontSize: "24px",
    fontWeight: "800",
    color: "#0f172a",
    margin: 0,
    letterSpacing: "-0.5px",
  },
  pageSubtitle: {
    fontSize: "14px",
    color: "#64748b",
    margin: 0,
    fontWeight: "500"
  },
  rightSection: {
    display: "flex",
    alignItems: "center",
    gap: "24px"
  },
  portalBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 14px",
    borderRadius: "20px",
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    fontSize: "12px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    border: "1px solid rgba(37, 99, 235, 0.1)",
    fontFamily: "var(--font-accent)",
  },
  pulseDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: "#2563eb",
    boxShadow: "0 0 0 0 rgba(37, 99, 235, 0.4)",
    // Note: pulse animation is defined in index.css
  },
  profileSection: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    cursor: "pointer",
    padding: "8px 12px",
    borderRadius: "16px",
    transition: "all 0.2s ease",
  },
  profileDetails: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  },
  profileName: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#1e293b",
    margin: 0,
  },
  roleLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#94a3b8",
    margin: 0,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    fontFamily: "var(--font-main)",
  },
  avatar: {
    width: "44px",
    height: "44px",
    borderRadius: "14px",
    backgroundColor: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#2563eb",
    fontSize: "18px",
    fontWeight: "800",
    border: "2px solid #fff",
    boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.1)"
  },
  avatarIcon: {
    fontSize: "20px",
  },
  chevron: {
    color: "#94a3b8",
    fontSize: "16px",
  }
};

export default AdminHeader;
