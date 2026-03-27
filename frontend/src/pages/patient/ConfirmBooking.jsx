import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FiClipboard, FiCalendar, FiClock, FiCreditCard, FiInfo, FiFileText, FiArrowLeft, FiAlertCircle } from 'react-icons/fi';
import { motion } from "framer-motion";
import PatientSidebar from "../../components/PatientSidebar";
import PatientHeader from "../../components/PatientHeader";

function ConfirmBooking() {
  const navigate = useNavigate();
  const location = useLocation();
  const appointmentData = location.state?.appointmentData;

  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [nextNumber, setNextNumber] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  useEffect(() => {
    if (!appointmentData) {
      navigate("/patient/find-doctor");
      return;
    }

    const { doctor, date } = appointmentData;
    const doctorId = doctor.doctor_id || doctor.id;

    const fetchNextNumber = async () => {
      try {
        const token = localStorage.getItem('token');
        const localDate = new Date(date).toISOString().split('T')[0];
        const response = await axios.get(`${API_URL}/appointments/next-number`, {
          params: { doctor_id: doctorId, date: localDate },
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          setNextNumber(response.data.nextNumber);
        }
      } catch (error) {
        console.error("Error fetching next number:", error);
      }
    };

    fetchNextNumber();
  }, [appointmentData, navigate, API_URL]);

  if (!appointmentData) return null;

  const { doctor, date, time } = appointmentData;
  const doctorId = doctor.doctor_id || doctor.id;

  const totalFee = Number(doctor?.doctor_fee || 0) + Number(doctor?.center_fee || 600);

  const handlePayNow = async () => {
    setIsLoading(true);
    const toastId = toast.loading("Preparing checkout...");
    try {
      const token = localStorage.getItem('token');
      const localDate = new Date(date).toISOString().split('T')[0];

      const response = await axios.post(`${API_URL}/appointments`, {
        doctor_id: doctorId,
        appointment_date: localDate,
        time_slot: time,
        schedule_id: appointmentData.schedule_id,
        notes: notes,
        skipNotification: true
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.dismiss(toastId);
        navigate("/patient/payment", {
          state: {
            paymentData: {
              appointmentId: response.data.data.appointment_id,
              doctor, date, time, totalFee, notes,
              paymentStatus: response.data.data.payment_status
            }
          }
        });
      }
    } catch (error) {
      toast.error("Booking initialization failed", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    setIsLoading(true);
    const toastId = toast.loading("Confirming your slot...");
    try {
      const token = localStorage.getItem('token');
      const localDate = new Date(date).toISOString().split('T')[0];

      const response = await axios.post(`${API_URL}/appointments`, {
        doctor_id: doctorId,
        appointment_date: localDate,
        time_slot: time,
        schedule_id: appointmentData.schedule_id,
        notes: notes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success("Appointment Confirmed!", { id: toastId });
        navigate("/patient/appointments");
      }
    } catch (error) {
      toast.error("Confirmation failed", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <PatientSidebar onLogout={() => { localStorage.clear(); navigate('/'); }} />

      <div className="main-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <PatientHeader />

        <main style={styles.mainContent}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={styles.confirmWrapper}
          >
            <div style={styles.header}>
              <h1 style={styles.pageTitle}>Confirm Your Appointment</h1>
              <p style={styles.pageSubtitle}>Review and finalize your medical consultation details</p>
            </div>

            <div style={styles.gridContainer}>
                {/* Left: Summary */}
                <div style={styles.leftCol}>
                    <div style={styles.premiumCard}>
                        <div style={styles.docBanner}>
                            <div style={styles.largeAvatar}>{doctor.full_name?.charAt(0)}</div>
                            <div>
                                <h2 style={styles.docName}>{doctor.full_name}</h2>
                                <p style={styles.docSpec}>{doctor.specialization}</p>
                            </div>
                        </div>

                        <div style={styles.detailsGrid}>
                            <div style={styles.detailBox}>
                                <div style={styles.iconCircle}><FiCalendar /></div>
                                <div>
                                    <p style={styles.detLabel}>Date</p>
                                    <p style={styles.detVal}>{new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                </div>
                            </div>
                            <div style={styles.detailBox}>
                                <div style={styles.iconCircle}><FiClock /></div>
                                <div>
                                    <p style={styles.detLabel}>Time</p>
                                    <p style={styles.detVal}>{time}</p>
                                </div>
                            </div>
                            {nextNumber !== null && (
                                <div style={{...styles.detailBox, gridColumn: 'span 2', backgroundColor: '#f0fdf4', border: '1px solid #dcfce7'}}>
                                    <div style={{...styles.iconCircle, backgroundColor: '#10b981', color: 'white'}}><FiClipboard /></div>
                                    <div>
                                        <p style={{...styles.detLabel, color: '#059669'}}>Estimated Token</p>
                                        <p style={{...styles.detVal, color: '#065f46', fontSize: '20px'}}>#{nextNumber}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={styles.notesCard}>
                        <h3 style={styles.cardHeader}>Special Notes (Optional)</h3>
                        <textarea 
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Allergies, chronic conditions, or specific concerns..."
                            style={styles.styledTextarea}
                        />
                    </div>
                </div>

                {/* Right: Payment/Action */}
                <div style={styles.rightCol}>
                    <div style={styles.billingCard}>
                        <h3 style={styles.cardHeader}>Billing Summary</h3>
                        <div style={styles.billRow}>
                            <span>Consultation Fee</span>
                            <span>LKR {Number(doctor.doctor_fee).toLocaleString()}</span>
                        </div>
                        <div style={styles.billRow}>
                            <span>Service Charge</span>
                            <span>LKR {Number(doctor?.center_fee || 600).toLocaleString()}.00</span>
                        </div>
                        <div style={styles.billDivider} />
                        <div style={styles.totalRow}>
                            <span>Total Due</span>
                            <span>LKR {totalFee.toLocaleString()}</span>
                        </div>
                        <div style={styles.infoNotice}>
                            <FiInfo />
                            <span>Online payments are secured with PayHere SSL encryption.</span>
                        </div>
                    </div>

                    <div style={styles.actionStack}>
                        <button onClick={handlePayNow} disabled={isLoading} style={styles.primaryBtn}>
                            {isLoading ? "Processing..." : "Pay Online Now"}
                            <FiCreditCard />
                        </button>
                        <button onClick={handleConfirmBooking} disabled={isLoading} style={styles.secondaryBtn}>
                            Confirm & Pay at Clinic
                        </button>
                        <button onClick={() => navigate(-1)} style={styles.backBtn}>
                            Cancel and Go Back
                        </button>
                    </div>

                    <div style={styles.policyNotice}>
                        <FiAlertCircle />
                        <p>Cancellations within 24 hours of the appointment might not be eligible for a center fee refund.</p>
                    </div>
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
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
  },
  mainContent: {
    padding: "40px 32px",
    flex: 1,
    maxWidth: "1200px",
    margin: "0 auto",
    width: "100%"
  },
  confirmWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "32px"
  },
  header: {
    textAlign: "left"
  },
  pageTitle: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#0f172a",
    margin: 0,
    letterSpacing: "-0.5px"
  },
  pageSubtitle: {
    fontSize: "16px",
    color: "#64748b",
    margin: "4px 0 0 0"
  },
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr",
    gap: "32px"
  },
  leftCol: {
    display: "flex",
    flexDirection: "column",
    gap: "24px"
  },
  premiumCard: {
    backgroundColor: "white",
    borderRadius: "28px",
    padding: "32px",
    border: "1px solid #f1f5f9",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.02)"
  },
  docBanner: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
    marginBottom: "32px",
    paddingBottom: "32px",
    borderBottom: "1px solid #f8fafc"
  },
  largeAvatar: {
    width: "80px",
    height: "80px",
    borderRadius: "24px",
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
    fontWeight: "800"
  },
  docName: {
    fontSize: "24px",
    fontWeight: "800",
    margin: 0
  },
  docSpec: {
    fontSize: "15px",
    color: "#2563eb",
    fontWeight: "600",
    margin: "4px 0 0 0"
  },
  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px"
  },
  detailBox: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "20px",
    backgroundColor: "#f8fafc",
    borderRadius: "20px"
  },
  iconCircle: {
    width: "44px",
    height: "44px",
    borderRadius: "14px",
    backgroundColor: "white",
    color: "#94a3b8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px"
  },
  detLabel: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
    margin: 0
  },
  detVal: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#1e293b",
    margin: 0
  },
  notesCard: {
    backgroundColor: "white",
    borderRadius: "28px",
    padding: "32px",
    border: "1px solid #f1f5f9"
  },
  cardHeader: {
    fontSize: "15px",
    fontWeight: "800",
    color: "#0f172a",
    margin: "0 0 20px 0",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  styledTextarea: {
    width: "100%",
    height: "120px",
    padding: "16px",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    backgroundColor: "#f8fafc",
    fontSize: "14px",
    fontWeight: "500",
    outline: "none",
    resize: "none",
    fontFamily: "inherit"
  },
  rightCol: {
    display: "flex",
    flexDirection: "column",
    gap: "24px"
  },
  billingCard: {
    backgroundColor: "white",
    borderRadius: "28px",
    padding: "32px",
    border: "1px solid #f1f5f9"
  },
  billRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "15px",
    color: "#64748b",
    fontWeight: "600",
    marginBottom: "12px"
  },
  billDivider: {
    height: "1px",
    backgroundColor: "#f1f5f9",
    margin: "24px 0"
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "24px",
    fontWeight: "800",
    color: "#0f172a"
  },
  infoNotice: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "24px",
    padding: "12px 16px",
    backgroundColor: "#eff6ff",
    borderRadius: "12px",
    color: "#2563eb",
    fontSize: "12px",
    fontWeight: "600"
  },
  actionStack: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  primaryBtn: {
    padding: "20px",
    backgroundColor: "#2563eb",
    color: "white",
    borderRadius: "20px",
    border: "none",
    fontSize: "16px",
    fontWeight: "800",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    boxShadow: "0 10px 15px -3px rgba(37, 99, 235, 0.2)"
  },
  secondaryBtn: {
    padding: "18px",
    backgroundColor: "white",
    color: "#1e293b",
    borderRadius: "20px",
    border: "1px solid #e2e8f0",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
  },
  backBtn: {
    padding: "12px",
    color: "#64748b",
    background: "none",
    border: "none",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  policyNotice: {
    display: "flex",
    gap: "12px",
    padding: "20px",
    backgroundColor: "#fff7ed",
    borderRadius: "20px",
    border: "1px solid #ffedd5",
    color: "#9a3412",
    fontSize: "13px",
    lineHeight: "1.5"
  }
};

export default ConfirmBooking;
