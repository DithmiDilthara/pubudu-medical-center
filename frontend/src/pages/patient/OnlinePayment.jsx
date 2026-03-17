import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FiLock, FiCheckCircle, FiArrowLeft, FiShield, FiCreditCard, FiAlertTriangle } from 'react-icons/fi';
import { motion } from "framer-motion";
import PatientSidebar from "../../components/PatientSidebar";
import PatientHeader from "../../components/PatientHeader";

function OnlinePayment() {
  const navigate = useNavigate();
  const location = useLocation();
  const paymentData = location.state?.paymentData;
  const [isProcessing, setIsProcessing] = useState(false);

  if (!paymentData) {
    navigate("/patient/find-doctor");
    return null;
  }

  const { doctor, date, time, totalFee, appointmentId } = paymentData;

  const handlePayment = async () => {
    setIsProcessing(true);
    const toastId = toast.loading("Initiating secure payment...");

    try {
        const token = localStorage.getItem('token');
        const payload = appointmentId ? { appointment_id: appointmentId } : {
            amount: totalFee,
            transactionId: `TXN${Date.now()}`
        };

        const response = await axios.post(
            `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/payments/initiate`,
            payload,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
            toast.dismiss(toastId);
            const payData = response.data.data;

            if (payData.merchant_id) {
                const payment = {
                    sandbox: payData.sandbox,
                    merchant_id: payData.merchant_id,
                    return_url: payData.return_url,
                    cancel_url: payData.cancel_url,
                    notify_url: payData.notify_url,
                    order_id: payData.order_id,
                    items: payData.items,
                    amount: payData.amount,
                    currency: payData.currency,
                    hash: payData.hash,
                    first_name: payData.first_name,
                    last_name: payData.last_name,
                    email: payData.email,
                    phone: payData.phone,
                    address: payData.address,
                    city: payData.city,
                    country: payData.country,
                };

                window.payhere.onCompleted = async function onCompleted(orderId) {
                    const verifyToast = toast.loading("Verifying transaction...");
                    try {
                        await axios.post(
                            `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/payments/verify`,
                            { appointment_id: appointmentId, status: 'SUCCESS' },
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        toast.success("Payment verified successfully!", { id: verifyToast });
                        navigate("/patient/appointments");
                    } catch (err) {
                        toast.error("Verified by bank, but center update failed.", { id: verifyToast });
                        navigate("/patient/appointments");
                    }
                };

                window.payhere.onDismissed = () => {
                    toast.error("Payment modal closed");
                    setIsProcessing(false);
                };

                window.payhere.onError = (error) => {
                    toast.error("Secure Payment Error");
                    setIsProcessing(false);
                };

                window.payhere.startPayment(payment);
            } else {
                toast.success("Payment processed!");
                navigate("/patient/appointments");
            }
        }
    } catch (error) {
        toast.error("Failed to initiate secure tunnel", { id: toastId });
        setIsProcessing(false);
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
            style={styles.checkoutBody}
          >
            <div style={styles.checkoutHeader}>
                <button onClick={() => navigate(-1)} style={styles.backLink}>
                    <FiArrowLeft /> Back
                </button>
                <h1 style={styles.checkoutTitle}>Secure Checkout</h1>
                <p style={styles.checkoutSubtitle}>Finalize your appointment with a secure payment</p>
            </div>

            <div style={styles.gridContainer}>
                {/* Left: Summary */}
                <div style={styles.summaryCol}>
                    <div style={styles.whiteCard}>
                        <h3 style={styles.cardHeader}>Booking Summary</h3>
                        <div style={styles.doctorInfoRow}>
                            <div style={styles.miniAvatar}>{doctor.full_name?.charAt(0)}</div>
                            <div>
                                <h4 style={styles.docNameVal}>{doctor.full_name}</h4>
                                <p style={styles.docSpecVal}>{doctor.specialization}</p>
                            </div>
                        </div>
                        <div style={styles.detailGrid}>
                            <div style={styles.detailBox}>
                                <span style={styles.detailLabel}>Date</span>
                                <span style={styles.detailVal}>
                                    {new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </span>
                            </div>
                            <div style={styles.detailBox}>
                                <span style={styles.detailLabel}>Time Slot</span>
                                <span style={styles.detailVal}>{time}</span>
                            </div>
                        </div>
                    </div>

                    <div style={styles.billingSection}>
                        <h3 style={styles.cardHeader}>Payment Breakdown</h3>
                        <div style={styles.billRow}>
                            <span>Consultation Fee</span>
                            <span>LKR {Number(doctor.doctor_fee || 0).toLocaleString()}</span>
                        </div>
                        <div style={styles.billRow}>
                            <span>Center Service Charge</span>
                            <span>LKR {Number(doctor.center_fee || 600).toLocaleString()}</span>
                        </div>
                        <div style={styles.billDivider} />
                        <div style={styles.totalRow}>
                            <div style={styles.totalInfo}>
                                <span style={styles.totalTitle}>Total Due</span>
                                <span style={styles.totalSubtitle}>Securely processed via PayHere</span>
                            </div>
                            <span style={styles.totalVal}>LKR {Number(totalFee).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Right: Security/Action */}
                <div style={styles.actionCol}>
                    <div style={styles.securityBox}>
                        <div style={styles.securityTitle}>
                            <FiShield style={styles.shieldIcon} />
                            SSL Encryption Active
                        </div>
                        <p style={styles.securityText}>
                            Your connection to our payment gateway is encrypted and secure. 
                            Pubudu Medical Center does not store your card details.
                        </p>
                        <div style={styles.payLogos}>
                            <img src="https://www.payhere.lk/downloads/images/payhere_square_banner_dark.png" alt="PayHere" style={styles.payHereLogo} />
                        </div>
                    </div>

                    <button
                        onClick={handlePayment}
                        disabled={isProcessing}
                        style={{
                            ...styles.mainPayBtn,
                            opacity: isProcessing ? 0.7 : 1
                        }}
                    >
                        {isProcessing ? "Opening Secure Gateway..." : `Confirm & Pay LKR ${Number(totalFee).toLocaleString()}`}
                        {!isProcessing && <FiLock style={{ marginLeft: '10px' }} />}
                    </button>

                    <div style={styles.noticeBox}>
                        <FiAlertTriangle style={styles.alertIcon} />
                        <span>A non-refundable service fee of LKR 600 is applied to all online bookings.</span>
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
    padding: "40px",
    flex: 1,
    maxWidth: "1100px",
    margin: "0 auto",
    width: "100%"
  },
  checkoutBody: {
    display: "flex",
    flexDirection: "column",
    gap: "32px"
  },
  checkoutHeader: {
    textAlign: "center"
  },
  backLink: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: "#64748b",
    fontSize: "14px",
    fontWeight: "700",
    border: "none",
    background: "none",
    cursor: "pointer",
    marginBottom: "16px",
    margin: "0 auto 16px auto"
  },
  checkoutTitle: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#0f172a",
    margin: 0,
    letterSpacing: "-0.5px"
  },
  checkoutSubtitle: {
    fontSize: "16px",
    color: "#64748b",
    margin: 0
  },
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr",
    gap: "32px"
  },
  summaryCol: {
    display: "flex",
    flexDirection: "column",
    gap: "24px"
  },
  whiteCard: {
    backgroundColor: "white",
    borderRadius: "28px",
    padding: "32px",
    border: "1px solid #f1f5f9",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.02)"
  },
  cardHeader: {
    fontSize: "16px",
    fontWeight: "800",
    color: "#0f172a",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "24px"
  },
  doctorInfoRow: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginBottom: "28px",
    paddingBottom: "24px",
    borderBottom: "1px solid #f8fafc"
  },
  miniAvatar: {
    width: "56px",
    height: "56px",
    borderRadius: "16px",
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    fontWeight: "800"
  },
  docNameVal: {
    fontSize: "18px",
    fontWeight: "700",
    margin: 0
  },
  docSpecVal: {
    fontSize: "14px",
    color: "#2563eb",
    fontWeight: "600",
    margin: 0
  },
  detailGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px"
  },
  detailBox: {
    padding: "16px",
    backgroundColor: "#f8fafc",
    borderRadius: "16px"
  },
  detailLabel: {
    fontSize: "12px",
    color: "#94a3b8",
    fontWeight: "700",
    textTransform: "uppercase",
    display: "block",
    marginBottom: "4px"
  },
  detailVal: {
    fontSize: "14px",
    color: "#1e293b",
    fontWeight: "700"
  },
  billingSection: {
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
    alignItems: "center"
  },
  totalInfo: {
    display: "flex",
    flexDirection: "column"
  },
  totalTitle: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#0f172a"
  },
  totalSubtitle: {
    fontSize: "12px",
    color: "#94a3b8",
    fontWeight: "500"
  },
  totalVal: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#2563eb"
  },
  actionCol: {
    display: "flex",
    flexDirection: "column",
    gap: "24px"
  },
  securityBox: {
    backgroundColor: "#1e293b",
    borderRadius: "28px",
    padding: "32px",
    color: "white"
  },
  securityTitle: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "16px",
    fontWeight: "700",
    color: "#38bdf8",
    marginBottom: "16px"
  },
  shieldIcon: {
    fontSize: "20px"
  },
  securityText: {
    fontSize: "14px",
    lineHeight: "1.6",
    opacity: 0.7,
    marginBottom: "24px"
  },
  payLogos: {
    display: "flex",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: "20px",
    borderRadius: "16px"
  },
  payHereLogo: {
    height: "24px"
  },
  mainPayBtn: {
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
    boxShadow: "0 10px 30px -10px rgba(37, 99, 235, 0.5)",
    transition: "all 0.3s"
  },
  noticeBox: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px 20px",
    backgroundColor: "#fff7ed",
    borderRadius: "16px",
    border: "1px solid #ffedd5",
    color: "#9a3412",
    fontSize: "13px",
    fontWeight: "600",
    lineHeight: "1.4"
  },
  alertIcon: {
    fontSize: "20px",
    flexShrink: 0
  }
};

export default OnlinePayment;
