import { FiUser } from "react-icons/fi";

function AdminHeader({ adminName = "Admin User" }) {
  return (
    <header style={styles.header}>
      {/* Welcome Section */}
      <div style={styles.welcomeContainer}>
        <p style={styles.welcomeText}>
          Welcome, <span style={styles.adminName}>{adminName}!</span>
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
    padding: "20px 32px",
    backgroundColor: "white",
    borderBottom: "1px solid #e5e7eb",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)"
  },
  welcomeContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  welcomeText: {
    fontSize: "15px",
    color: "#6b7280",
    margin: 0,
    fontWeight: "500",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  adminName: {
    color: "#8b9dff",
    fontWeight: "700"
  },
  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #8b9dff 0%, #9b7bc8 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  avatarIcon: {
    fontSize: "20px",
    color: "white"
  }
};

export default AdminHeader;
