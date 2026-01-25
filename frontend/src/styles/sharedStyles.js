// Shared styles for consistent design across the application

export const sidebarStyles = {
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
    marginTop: "20px",
    borderTop: "1px solid #F3F4F6",
    paddingTop: "20px"
  },
  logoutButton: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "14px 18px",
    borderRadius: "12px",
    textDecoration: "none",
    color: "#EF4444",
    fontSize: "15px",
    fontWeight: "600",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
    backgroundColor: "transparent",
    border: "none"
  }
};

export const headerStyles = {
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "24px 40px",
    backgroundColor: "white",
    borderBottom: "1px solid #E5E7EB",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
    position: "sticky",
    top: 0,
    zIndex: 50
  },
  welcomeContainer: {
    display: "flex",
    alignItems: "center",
    gap: "16px"
  },
  welcomeText: {
    fontSize: "15px",
    color: "#6B7280",
    margin: 0,
    fontWeight: "600",
    fontFamily: "'Inter', sans-serif"
  },
  nameHighlight: {
    color: "#0066CC",
    fontWeight: "700"
  },
  avatar: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #0066CC 0%, #0052A3 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(0, 102, 204, 0.25)",
    border: "2px solid #E6F2FF"
  },
  avatarIcon: {
    fontSize: "20px",
    color: "white"
  }
};

export const containerStyles = {
  container: {
    display: "flex",
    flexDirection: "row",
    minHeight: "100vh",
    background: "#F9FAFB",
    fontFamily: "'Inter', sans-serif"
  },
  mainWrapper: {
    flex: 1,
    display: "flex",
    flexDirection: "column"
  },
  mainContent: {
    flex: 1,
    padding: "40px",
    maxWidth: "1400px",
    width: "100%",
    margin: "0 auto"
  }
};
