import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FiLock, FiCheckCircle, FiArrowLeft, FiShield } from 'react-icons/fi';
import PatientSidebar from "../../components/PatientSidebar";
import PatientHeader from "../../components/PatientHeader";

function OnlinePayment() {
  const navigate = useNavigate();
  const location = useLocation();
  const paymentData = location.state?.paymentData;
  const [isProcessing, setIsProcessing] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

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

      // If we don't have an appointmentId (coming from ConfirmBooking), we might need to create the appointment first.
      // But based on current flow, usually we just initiate payment. Let's initiate it.
      // We will assume `appointmentId` is passed if navigating from Appointments page.
      const payload = appointmentId ? { appointment_id: appointmentId } : {
        amount: totalFee,
        transactionId: `TXN${Date.now()}`
      };

      const endpoint = appointmentId
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/payments/initiate`
        : `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/patient/payment`; // Fallback if no appointmentId

      const response = await axios.post(
        endpoint,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.dismiss(toastId);
        const payData = response.data.data;

        // If it's the actual PayHere initiate response
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
            console.log("Payment completed. OrderID:" + orderId);
            const verifyToast = toast.loading("Verifying payment...");

            try {
              // Call local backend verify since webhook won't work on localhost
              await axios.post(
                `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/payments/verify`,
                { appointment_id: appointmentId, status: 'SUCCESS' },
                { headers: { Authorization: `Bearer ${token}` } }
              );

              toast.success("Payment completed successfully!", { id: verifyToast });
              navigate("/patient/appointments");
            } catch (err) {
              console.error("Verification failed", err);
              toast.error("Payment verified by PayHere, but local save failed.", { id: verifyToast });
              navigate("/patient/appointments");
            }
          };

          window.payhere.onDismissed = function onDismissed() {
            toast.error("Payment dismissed");
            setIsProcessing(false);
          };

          window.payhere.onError = function onError(error) {
            console.log("Error:" + error);
            toast.error("Payment Error: " + error);
            setIsProcessing(false);
          };

          window.payhere.startPayment(payment);
        } else {
          // Fallback old logic if it directly succeeded locally
          toast.success("Payment successful!");
          navigate("/patient/appointments");
        }
      }
    } catch (error) {
      console.error("Payment initiation failed:", error);
      toast.error(error.response?.data?.message || "Failed to start payment process", { id: toastId });
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div style={styles.container}>
      <PatientSidebar onLogout={handleLogout} />

      <div className="main-wrapper">
        <PatientHeader patientName="Dithmi" />

        <main className="content-padding">
          {/* Header */}
          <div style={styles.header}>
            <h1 style={styles.pageTitle}>Secure Checkout</h1>
            <p style={styles.pageSubtitle}>Pay easily and securely using PayHere</p>
          </div>

          {/* Changed 'paymentContainer' to flex-column to stack cards */}
          <div style={styles.paymentContainer}>

            {/* Payment Details Card (Top) */}
            <div style={styles.card}>
              <h3 style={styles.sectionTitle}>Payment Details</h3>
              <p style={styles.detailsText}>
                You are proceeding to pay for your appointment with <strong>{doctor.name || doctor.full_name}</strong>.<br />
                Clicking the "Pay Securely" button will open the PayHere interface where you can securely enter your credit/debit card information.
              </p>

              <div style={styles.securityNotice}>
                <div style={styles.shieldIconContainer}>
                  <FiShield size={20} color="#059669" />
                </div>
                <div>
                  <p style={styles.securityTitle}>SSL Secured Payment</p>
                  <p style={styles.securityText}>
                    Your payment is verified and processed by PayHere. We do not store any of your card information on our servers.
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Summary Card (Bottom) */}
            <div style={styles.card}>
              <h3 style={styles.sectionTitle}>Payment Summary</h3>

              <div style={styles.summarySection}>
                <h4 style={styles.summaryLabel}>APPOINTMENT DETAILS</h4>
                <div style={styles.summaryItem}>
                  <span style={styles.summaryKey}>Doctor:</span>
                  <span style={styles.summaryValue}>{doctor.name || doctor.full_name}</span>
                </div>
                <div style={styles.summaryItem}>
                  <span style={styles.summaryKey}>Date:</span>
                  <span style={styles.summaryValue}>
                    {new Date(date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div style={styles.summaryItem}>
                  <span style={styles.summaryKey}>Time:</span>
                  <span style={styles.summaryValue}>{time}</span>
                </div>
                {appointmentId && (
                  <div style={styles.summaryItem}>
                    <span style={styles.summaryKey}>Reference ID:</span>
                    <span style={styles.summaryValue}>#{appointmentId}</span>
                  </div>
                )}
              </div>

              <div style={styles.totalBlock}>
                <span style={styles.totalLabel}>Total Amount</span>
                <span style={styles.totalAmount}>LKR {Number(totalFee).toFixed(2)}</span>
              </div>

              <button
                onClick={handlePayment}
                disabled={isProcessing}
                style={{
                  ...styles.payButton,
                  ...(isProcessing ? styles.payButtonDisabled : {})
                }}
              >
                {isProcessing ? (
                  <>Processing...</>
                ) : (
                  <>
                    <FiCheckCircle size={20} style={{ marginRight: '8px' }} />
                    Pay Securely (LKR {Number(totalFee).toFixed(2)})
                  </>
                )}
              </button>

              <button onClick={handleBack} style={styles.backButton}>
                <FiArrowLeft style={{ marginRight: '8px' }} />
                Back
              </button>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'row',
    minHeight: '100vh',
    background: '#f8fafc',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  mainWrapper: {
    // Handled by .main-wrapper
  },
  mainContent: {
    // Handled by .content-padding
  },
  header: {
    marginBottom: '32px',
    textAlign: 'center'
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#0066CC',
    margin: '0 0 8px 0'
  },
  pageSubtitle: {
    fontSize: '15px',
    color: '#6b7280',
    margin: 0
  },
  paymentContainer: {
    display: 'flex',
    flexDirection: 'column', // Stacks the cards vertically
    gap: '24px',
    alignItems: 'stretch'
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e2e8f0'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '20px',
  },
  detailsText: {
    fontSize: '15px',
    color: '#4b5563',
    lineHeight: '1.6',
    marginBottom: '24px'
  },
  securityNotice: {
    display: 'flex',
    gap: '12px',
    padding: '16px',
    background: '#f0fdf4',
    borderRadius: '12px',
    border: '1px solid #bbf7d0',
    alignItems: 'flex-start'
  },
  shieldIconContainer: {
    marginTop: '2px'
  },
  securityTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#059669',
    margin: '0 0 4px 0'
  },
  securityText: {
    fontSize: '13px',
    color: '#047857',
    margin: 0,
    lineHeight: '1.5'
  },
  summarySection: {
    marginBottom: '24px'
  },
  summaryLabel: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#6b7280',
    marginBottom: '16px',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    fontSize: '14px'
  },
  summaryKey: {
    color: '#6b7280',
    fontWeight: '500'
  },
  summaryValue: {
    color: '#111827',
    fontWeight: '600',
    textAlign: 'right'
  },
  totalBlock: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    background: '#f0f7ff',
    borderRadius: '8px',
    marginBottom: '24px'
  },
  totalLabel: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#374151'
  },
  totalAmount: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#0066CC'
  },
  payButton: {
    width: '100%',
    padding: '16px',
    background: '#0066CC',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    marginBottom: '16px'
  },
  payButtonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed'
  },
  backButton: {
    width: '100%',
    padding: '12px',
    background: 'transparent',
    color: '#6b7280',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s'
  }
};

export default OnlinePayment;

