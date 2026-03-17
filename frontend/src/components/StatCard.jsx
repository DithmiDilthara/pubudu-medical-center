import { motion } from "framer-motion";

function StatCard({ icon: Icon, label, value, color = "#2563eb", delay = 0 }) {
  const gradients = {
    "#2563eb": "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
    "#10b981": "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
    "#f59e0b": "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
    "#ef4444": "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
  };

  const bgGradient = gradients[color] || `linear-gradient(135deg, ${color}10 0%, ${color}20 100%)`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay, ease: "easeOut" }}
      style={{ ...styles.card, background: bgGradient }}
    >
      <div style={{ ...styles.iconContainer, backgroundColor: "white", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
        <Icon style={{ ...styles.icon, color: color }} />
      </div>
      <div style={styles.content}>
        <p style={styles.label}>{label}</p>
        <h3 style={styles.value}>{value}</h3>
      </div>
    </motion.div>
  );
}

const styles = {
  card: {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "20px",
    border: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    gap: "20px",
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  iconContainer: {
    width: "56px",
    height: "56px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  icon: {
    fontSize: "24px",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#64748b",
    margin: 0,
    fontFamily: "var(--font-main)",
  },
  value: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#0f172a",
    margin: 0,
    letterSpacing: "-0.5px",
    fontFamily: "var(--font-accent)",
  },
};

export default StatCard;
