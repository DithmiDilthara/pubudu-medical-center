import { FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function ReceptionistHeader({ receptionistName = "Receptionist" }) {
  const navigate = useNavigate();

  return (
    <motion.header 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      style={styles.header}
    >
      {/* Page Info Placeholder (Matches PatientHeader structure) */}
      <div style={styles.pageInfo}>
        <h1 style={styles.pageTitle}></h1>
        <p style={styles.pageSubtitle}></p>
      </div>

      {/* Right Section: Actions & Profile */}
      <div style={styles.rightSection}>
        <div style={styles.portalBadge}>
          <div style={styles.pulseDot} />
          Receptionist Portal
        </div>

        <div style={styles.profileSection} onClick={() => navigate('/profile')}>
          <div style={styles.profileDetails}>
            <p style={styles.profileName}>{receptionistName}</p>
          </div>
          <div style={styles.avatar}>
            {receptionistName.charAt(0).toUpperCase()}
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
    backgroundColor: "#f5f3ff",
    color: "#7c3aed",
    fontSize: "12px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    border: "1px solid rgba(124, 58, 237, 0.1)"
  },
  pulseDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: "#7c3aed",
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
  avatar: {
    width: "44px",
    height: "44px",
    borderRadius: "14px",
    backgroundColor: "#f5f3ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#7c3aed",
    fontSize: "18px",
    fontWeight: "800",
    border: "2px solid #fff",
    boxShadow: "0 4px 6px -1px rgba(124, 58, 237, 0.1)"
  },
  chevron: {
    color: "#94a3b8",
    fontSize: "16px",
  }
};

export default ReceptionistHeader;

