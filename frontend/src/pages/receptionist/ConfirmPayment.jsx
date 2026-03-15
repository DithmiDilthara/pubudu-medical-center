import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUser, FiCreditCard, FiCalendar, FiClock, 
  FiArrowLeft, FiCheckCircle, FiInfo, FiActivity,
  FiDollarSign, FiHash, FiPhone, FiMail
} from 'react-icons/fi';
import ReceptionistSidebar from '../../components/ReceptionistSidebar';
import ReceptionistHeader from '../../components/ReceptionistHeader';

function ConfirmPayment() {
  const navigate = useNavigate();
  const location = useLocation();
  const appointment = location.state?.appointment;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [receptionistName, setReceptionistName] = useState("Receptionist");

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  useEffect(() => {
    // If no appointment data is present, redirect back
    if (!appointment) {
      toast.error("No appointment selected for payment");
      navigate('/receptionist/payment');
      return;
    }

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const profileRes = await axios.get(`${API_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (profileRes.data.success) {
          setReceptionistName(profileRes.data.data.profile.full_name);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, [appointment, navigate, API_URL]);

  if (!appointment) return null;

  const doctorFee = Number(appointment.doctor?.doctor_fee || 0);
  const centerFee = Number(appointment.doctor?.center_fee || 0);
  const totalAmount = doctorFee + centerFee;

  const handleConfirmPayment = async () => {
    setIsSubmitting(true);
    const toastId = toast.loading("Processing final payment...");

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_URL}/appointments/${appointment.appointment_id}/status`,
        { 
          payment_status: 'PAID',
          payment_method: paymentMethod.toUpperCase()
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Payment processed successfully!", { id: toastId });
        // Small delay before redirecting for better UX
        setTimeout(() => {
          navigate('/receptionist/payment');
        }, 1200);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to process payment", { id: toastId });
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div style={styles.container}>
      <ReceptionistSidebar onLogout={() => { localStorage.clear(); navigate("/"); }} />

      <div className="main-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <ReceptionistHeader receptionistName={receptionistName} />

        <main style={styles.mainContent}>
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            style={styles.contentCard}
          >
            {/* Header with Back Button */}
            <div style={styles.headerRow}>
              <button 
                onClick={() => navigate('/receptionist/payment')}
                style={styles.backBtn}
              >
                <FiArrowLeft />
              </button>
              <div>
                <h1 style={styles.welcomeTitle}>Confirm Payment</h1>
                <p style={styles.welcomeSubtitle}>Review and finalize the billing for this appointment securely.</p>
              </div>
            </div>

            <div style={styles.gridContainer}>
              {/* Left Column: Summary Details */}
              <div style={styles.detailsColumn}>
                <motion.section variants={itemVariants} style={styles.detailsGroup}>
                  <div style={styles.groupHeader}>
                    <FiUser style={styles.groupIcon} />
                    <h2 style={styles.groupTitle}>Patient Information</h2>
                  </div>
                  <div style={styles.infoGrid}>
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>Full Name</span>
                      <span style={styles.infoValue}>{appointment.patient?.full_name}</span>
                    </div>
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>Patient ID</span>
                      <span style={styles.infoValue}>#{appointment.patient?.patient_id}</span>
                    </div>
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>Phone</span>
                      <span style={styles.infoValue}>{appointment.patient?.phone || "N/A"}</span>
                    </div>
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>Email</span>
                      <span style={styles.infoValue}>{appointment.patient?.email || "N/A"}</span>
                    </div>
                  </div>
                </motion.section>

                <motion.section variants={itemVariants} style={styles.detailsGroup}>
                  <div style={styles.groupHeader}>
                    <FiCalendar style={styles.groupIcon} />
                    <h2 style={styles.groupTitle}>Appointment Details</h2>
                  </div>
                  <div style={styles.infoGrid}>
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>Doctor</span>
                      <span style={styles.infoValue}>{appointment.doctor?.full_name}</span>
                    </div>
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>Specialization</span>
                      <span style={styles.infoValue}>{appointment.doctor?.specialization || "General"}</span>
                    </div>
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>Date</span>
                      <span style={styles.infoValue}>{appointment.appointment_date}</span>
                    </div>
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>Appointment ID</span>
                      <span style={styles.infoValue}>#{appointment.appointment_id}</span>
                    </div>
                  </div>
                </motion.section>
              </div>

              {/* Right Column: Payment & Breakdown */}
              <div style={styles.paymentColumn}>
                <motion.section variants={itemVariants} style={styles.breakdownCard}>
                  <h2 style={styles.breakdownTitle}>Financial Summary</h2>
                  
                  <div style={styles.breakdownRow}>
                    <span>Doctor Consultation Fee</span>
                    <span>LKR {doctorFee.toLocaleString()}</span>
                  </div>
                  <div style={styles.breakdownRow}>
                    <span>Center Service Charge</span>
                    <span>LKR {centerFee.toLocaleString()}</span>
                  </div>
                  
                  <div style={styles.divider}></div>
                  
                  <div style={styles.totalRow}>
                    <span>Total Payable</span>
                    <span>LKR {totalAmount.toLocaleString()}</span>
                  </div>

                  <div style={styles.paymentMethodSection}>
                    <p style={styles.methodLabel}>Select Payment Method</p>
                    <div style={styles.methodGrid}>
                      <button 
                        onClick={() => setPaymentMethod('Cash')}
                        style={{
                          ...styles.methodBtn,
                          ...(paymentMethod === 'Cash' ? styles.methodBtnActive : {})
                        }}
                      >
                        <FiDollarSign /> Cash
                      </button>
                      <button 
                        onClick={() => setPaymentMethod('Card')}
                        style={{
                          ...styles.methodBtn,
                          ...(paymentMethod === 'Card' ? styles.methodBtnActive : {})
                        }}
                      >
                        <FiCreditCard /> Card
                      </button>
                    </div>
                  </div>

                  <button 
                    onClick={handleConfirmPayment}
                    disabled={isSubmitting}
                    style={{
                      ...styles.confirmBtn,
                      ...(isSubmitting ? styles.btnDisabled : {})
                    }}
                  >
                    {isSubmitting ? "Processing..." : "Confirm & Finalize Payment"}
                  </button>

                  <div style={styles.guaranteeBox}>
                    <FiCheckCircle style={styles.guaranteeIcon} />
                    <p>This action will mark the appointment as paid and update the hospital's financial records.</p>
                  </div>
                </motion.section>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    fontFamily: "'Inter', sans-serif"
  },
  mainContent: {
    flex: 1,
    padding: "40px 24px",
    display: "flex",
    justifyContent: "center",
    overflowY: "auto"
  },
  contentCard: {
    width: "100%",
    maxWidth: "1000px",
    backgroundColor: "white",
    borderRadius: "28px",
    padding: "40px",
    boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.05)",
    border: "2px solid #3b82f6"
  },
  welcomeTitle: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#0f172a",
    margin: "0 0 8px 0",
    letterSpacing: "-1px",
  },
  welcomeSubtitle: {
    fontSize: "16px",
    color: "#64748b",
    margin: 0,
    fontWeight: "500"
  },
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr",
    gap: "40px"
  },
  detailsColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "32px"
  },
  detailsGroup: {
    backgroundColor: "#f8fafc",
    borderRadius: "20px",
    padding: "24px",
    border: "1px solid #f1f5f9"
  },
  groupHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px"
  },
  groupIcon: {
    fontSize: "20px",
    color: "#2563eb"
  },
  groupTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#334155",
    margin: 0
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px"
  },
  infoItem: {
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  },
  infoLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.05em"
  },
  infoValue: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#1e293b"
  },
  paymentColumn: {
    display: "flex",
    flexDirection: "column"
  },
  breakdownCard: {
    backgroundColor: "#1e293b",
    color: "white",
    borderRadius: "24px",
    padding: "32px",
    boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.2)"
  },
  breakdownTitle: {
    fontSize: "20px",
    fontWeight: "700",
    marginBottom: "24px"
  },
  breakdownRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "14px",
    color: "#94a3b8",
    marginBottom: "16px"
  },
  divider: {
    height: "1px",
    backgroundColor: "rgba(255,255,255,0.1)",
    margin: "8px 0 24px 0"
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "22px",
    fontWeight: "800",
    color: "white",
    marginBottom: "32px"
  },
  paymentMethodSection: {
    marginBottom: "32px"
  },
  methodLabel: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#94a3b8",
    marginBottom: "16px"
  },
  methodGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px"
  },
  methodBtn: {
    padding: "12px",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.1)",
    backgroundColor: "transparent",
    color: "#94a3b8",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "all 0.2s"
  },
  methodBtnActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
    color: "white",
    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)"
  },
  confirmBtn: {
    width: "100%",
    padding: "16px",
    borderRadius: "16px",
    border: "none",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "white",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 10px 15px -3px rgba(16, 185, 129, 0.25)"
  },
  btnDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
    boxShadow: "none"
  },
  guaranteeBox: {
    marginTop: "24px",
    padding: "16px",
    borderRadius: "16px",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    display: "flex",
    gap: "12px"
  },
  guaranteeIcon: {
    color: "#10b981",
    fontSize: "20px",
    flexShrink: 0,
    marginTop: "2px"
  },
  "@media (max-width: 900px)": {
    gridContainer: {
      gridTemplateColumns: "1fr"
    },
    contentCard: {
      padding: "24px"
    }
  }
};

export default ConfirmPayment;
