import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { FiCreditCard, FiLock, FiCheckCircle, FiAlertCircle, FiArrowLeft, FiShield } from 'react-icons/fi';
import PatientSidebar from "../../components/PatientSidebar";
import PatientHeader from "../../components/PatientHeader";

function OnlinePayment() {
  const navigate = useNavigate();
  const location = useLocation();
  const paymentData = location.state?.paymentData;

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  const handleLogout = () => {
    console.log("User logged out");
    navigate("/");
  };

  if (!paymentData) {
    navigate("/patient/find-doctor");
    return null;
  }

  const { doctor, date, time, totalFee, notes } = paymentData;

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, '');
    const match = cleaned.match(/.{1,4}/g);
    return match ? match.join(' ') : cleaned;
  };

  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\s/g, '');
    if (value.length <= 16 && /^\d*$/.test(value)) {
      setCardNumber(formatCardNumber(value));
    }
  };

  const handleExpiryDateChange = (e) => {
    let value = e.target.value.replace(/\//g, '');
    if (value.length <= 4 && /^\d*$/.test(value)) {
      if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2);
      }
      setExpiryDate(value);
    }
  };

  const handleCvvChange = (e) => {
    const value = e.target.value;
    if (value.length <= 3 && /^\d*$/.test(value)) {
      setCvv(value);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (paymentMethod === "card") {
      if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) {
        newErrors.cardNumber = "Please enter a valid 16-digit card number";
      }
      if (!cardName || cardName.trim().length < 3) {
        newErrors.cardName = "Please enter the cardholder name";
      }
      if (!expiryDate || expiryDate.length !== 5) {
        newErrors.expiryDate = "Please enter valid expiry date (MM/YY)";
      }
      if (!cvv || cvv.length !== 3) {
        newErrors.cvv = "Please enter a valid 3-digit CVV";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    // Simulate payment gateway processing
    setTimeout(() => {
      // Create booking after successful payment
      const booking = {
        id: Date.now(),
        doctor: doctor.name,
        specialty: doctor.specialty,
        date: date.toISOString(),
        time: time,
        status: "upcoming",
        fee: totalFee,
        notes: notes,
        bookedAt: new Date().toISOString(),
        paymentStatus: "paid",
        paymentMethod: paymentMethod,
        paymentDate: new Date().toISOString(),
        transactionId: `TXN${Date.now()}`
      };

      // Get existing appointments from localStorage
      const existingAppointments = JSON.parse(localStorage.getItem("appointments") || "[]");

      // Add new appointment
      existingAppointments.push(booking);

      // Save to localStorage
      localStorage.setItem("appointments", JSON.stringify(existingAppointments));

      setIsProcessing(false);

      // Show success message and redirect
      alert("Payment successful! Your appointment has been confirmed.");
      navigate("/patient/appointments");
    }, 2000);
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div style={styles.container}>
      <PatientSidebar onLogout={handleLogout} />

      <div style={styles.mainWrapper}>
        <PatientHeader patientName="Dithmi" />

        <main style={styles.mainContent}>
          {/* Header */}
          <div style={styles.header}>
            <FiLock size={40} style={styles.lockIcon} />
            <h1 style={styles.pageTitle}>Secure Payment</h1>
            <p style={styles.pageSubtitle}>Your payment information is encrypted and secure</p>
          </div>

          <div style={styles.paymentContainer}>
            {/* Left Column - Payment Form */}
            <div style={styles.paymentFormColumn}>
              <div style={styles.card}>
                {/* Payment Method Selection */}
                <section style={styles.section}>
                  <h3 style={styles.sectionTitle}>Select Payment Method</h3>
                  <div style={styles.paymentMethods}>
                    <button
                      onClick={() => setPaymentMethod("card")}
                      style={{
                        ...styles.methodButton,
                        ...(paymentMethod === "card" ? styles.methodButtonActive : {})
                      }}
                    >
                      <FiCreditCard size={24} />
                      <span>Credit/Debit Card</span>
                    </button>
                  </div>
                </section>

                {/* Card Details Form */}
                {paymentMethod === "card" && (
                  <section style={styles.section}>
                    <h3 style={styles.sectionTitle}>Card Details</h3>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Card Number</label>
                      <div style={styles.inputWrapper}>
                        <FiCreditCard style={styles.inputIcon} />
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="1234 5678 9012 3456"
                          style={{
                            ...styles.input,
                            ...(errors.cardNumber ? styles.inputError : {})
                          }}
                        />
                      </div>
                      {errors.cardNumber && <span style={styles.errorText}>{errors.cardNumber}</span>}
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Cardholder Name</label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="sayumi manujana"
                        style={{
                          ...styles.input,
                          ...(errors.cardName ? styles.inputError : {})
                        }}
                      />
                      {errors.cardName && <span style={styles.errorText}>{errors.cardName}</span>}
                    </div>

                    <div style={styles.formRow}>
                      <div style={{ ...styles.formGroup, flex: 1 }}>
                        <label style={styles.label}>Expiry Date</label>
                        <input
                          type="text"
                          value={expiryDate}
                          onChange={handleExpiryDateChange}
                          placeholder="MM/YY"
                          style={{
                            ...styles.input,
                            ...(errors.expiryDate ? styles.inputError : {})
                          }}
                        />
                        {errors.expiryDate && <span style={styles.errorText}>{errors.expiryDate}</span>}
                      </div>

                      <div style={{ ...styles.formGroup, flex: 1 }}>
                        <label style={styles.label}>CVV</label>
                        <input
                          type="text"
                          value={cvv}
                          onChange={handleCvvChange}
                          placeholder="123"
                          style={{
                            ...styles.input,
                            ...(errors.cvv ? styles.inputError : {})
                          }}
                        />
                        {errors.cvv && <span style={styles.errorText}>{errors.cvv}</span>}
                      </div>
                    </div>
                  </section>
                )}

                {/* Security Notice */}
                <div style={styles.securityNotice}>
                  <FiShield size={20} color="#059669" />
                  <div>
                    <p style={styles.securityTitle}>Secure Payment</p>
                    <p style={styles.securityText}>
                      Your payment is processed through a secure, encrypted connection
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div style={styles.summaryColumn}>
              <div style={styles.card}>
                <h3 style={styles.sectionTitle}>Payment Summary</h3>

                <div style={styles.summarySection}>
                  <h4 style={styles.summaryLabel}>Appointment Details</h4>
                  <div style={styles.summaryItem}>
                    <span style={styles.summaryKey}>Doctor:</span>
                    <span style={styles.summaryValue}>{doctor.name}</span>
                  </div>
                  <div style={styles.summaryItem}>
                    <span style={styles.summaryKey}>Specialty:</span>
                    <span style={styles.summaryValue}>{doctor.specialty}</span>
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
                </div>

                <div style={styles.summaryDivider}></div>

                <div style={styles.summarySection}>
                  <h4 style={styles.summaryLabel}>Fee Breakdown</h4>
                  <div style={styles.summaryItem}>
                    <span style={styles.summaryKey}>Doctor Fee:</span>
                    <span style={styles.summaryValue}>LKR 2,500.00</span>
                  </div>
                  <div style={styles.summaryItem}>
                    <span style={styles.summaryKey}>Service Fee:</span>
                    <span style={styles.summaryValue}>LKR 500.00</span>
                  </div>
                </div>

                <div style={styles.summaryDivider}></div>

                <div style={styles.totalSection}>
                  <span style={styles.totalLabel}>Total Amount</span>
                  <span style={styles.totalAmount}>LKR {totalFee.toFixed(2)}</span>
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
                      <FiCheckCircle size={20} />
                      Pay LKR {totalFee.toFixed(2)}
                    </>
                  )}
                </button>

                <button onClick={handleBack} style={styles.backButton}>
                  <FiArrowLeft />
                  Back to Confirmation
                </button>
              </div>
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
    background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  mainWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  mainContent: {
    flex: 1,
    padding: '32px',
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto'
  },
  header: {
    marginBottom: '40px',
    textAlign: 'center'
  },
  lockIcon: {
    color: '#10b981',
    marginBottom: '16px'
  },
  pageTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #0066CC 0%, #0052A3 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: '0 0 8px 0'
  },
  pageSubtitle: {
    fontSize: '15px',
    color: '#6b7280',
    margin: 0
  },
  paymentContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 400px',
    gap: '32px',
    alignItems: 'start'
  },
  paymentFormColumn: {
    flex: 1
  },
  summaryColumn: {
    position: 'sticky',
    top: '100px'
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(0, 102, 204, 0.1)'
  },
  section: {
    marginBottom: '32px'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center'
  },
  paymentMethods: {
    display: 'flex',
    gap: '16px'
  },
  methodButton: {
    flex: 1,
    padding: '20px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    background: 'white',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#6b7280',
    transition: 'all 0.2s'
  },
  methodButtonActive: {
    borderColor: '#0066CC',
    background: 'linear-gradient(135deg, rgba(0, 102, 204, 0.1) 0%, rgba(0, 82, 163, 0.1) 100%)',
    color: '#0066CC'
  },
  formGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '8px'
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  inputIcon: {
    position: 'absolute',
    left: '16px',
    color: '#9ca3af',
    fontSize: '20px'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '15px',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    outline: 'none',
    transition: 'all 0.2s',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  inputError: {
    borderColor: '#ef4444'
  },
  formRow: {
    display: 'flex',
    gap: '16px'
  },
  errorText: {
    display: 'block',
    fontSize: '13px',
    color: '#ef4444',
    marginTop: '4px'
  },
  securityNotice: {
    display: 'flex',
    gap: '12px',
    padding: '16px',
    background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
    borderRadius: '12px',
    border: '1px solid rgba(5, 150, 105, 0.2)'
  },
  securityTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#059669',
    margin: '0 0 4px 0'
  },
  securityText: {
    fontSize: '13px',
    color: '#047857',
    margin: 0
  },
  summarySection: {
    marginBottom: '20px'
  },
  summaryLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
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
  summaryDivider: {
    height: '1px',
    background: '#e5e7eb',
    margin: '20px 0'
  },
  totalSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    background: 'linear-gradient(135deg, rgba(0, 102, 204, 0.1) 0%, rgba(0, 82, 163, 0.1) 100%)',
    borderRadius: '12px',
    marginBottom: '24px'
  },
  totalLabel: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#374151'
  },
  totalAmount: {
    fontSize: '24px',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #0066CC 0%, #0052A3 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  payButton: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, #0066CC 0%, #0052A3 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.3s',
    marginBottom: '12px'
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
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s'
  }
};

export default OnlinePayment;
