import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import Navigation from "../components/navigation";

function ConfirmBooking() {
  const navigate = useNavigate();
  const location = useLocation();
  const appointmentData = location.state?.appointmentData;

  const [notes, setNotes] = useState("");

  const handleLogout = () => {
    console.log("User logged out");
    navigate("/");
  };

  if (!appointmentData) {
    navigate("/patient/find-doctor");
    return null;
  }

  const { doctor, date, time } = appointmentData;

  // Fee calculation
  const doctorFee = 2500.00;
  const medicalCenterFee = 500.00;
  const totalFee = doctorFee + medicalCenterFee;

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  const formattedDate = `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;

  const handleConfirmBooking = () => {
    const booking = {
      id: Date.now(),
      doctor: doctor.name,
      specialty: doctor.specialty,
      date: date.toISOString(),
      time: time,
      status: "upcoming",
      fee: totalFee,
      notes: notes,
      bookedAt: new Date().toISOString()
    };

    // Get existing appointments from localStorage
    const existingAppointments = JSON.parse(localStorage.getItem("appointments") || "[]");
    
    // Add new appointment
    existingAppointments.push(booking);
    
    // Save to localStorage
    localStorage.setItem("appointments", JSON.stringify(existingAppointments));

    alert("Appointment confirmed successfully!");
    navigate("/patient/appointments");
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div style={styles.container}>
      <Navigation onLogout={handleLogout} />

      <main style={styles.mainContent}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.pageTitle}>Confirm Your Appointment</h1>
          <p style={styles.pageSubtitle}>Please review your appointment details before confirming</p>
        </div>

        {/* Main Card */}
        <div style={styles.confirmCard}>
          {/* Doctor Info Section */}
          <section style={styles.doctorSection}>
            <div style={styles.doctorHeader}>
              <div style={styles.doctorAvatar}>
                {doctor.name.charAt(3)}
              </div>
              <div>
                <h2 style={styles.doctorName}>{doctor.name}</h2>
                <p style={styles.doctorSpecialty}>{doctor.specialty}</p>
              </div>
            </div>
          </section>

          {/* Appointment Details */}
          <section style={styles.detailsSection}>
            <h3 style={styles.sectionTitle}>📋 Appointment Details</h3>
            
            <div style={styles.detailsGrid}>
              <div style={styles.detailCard}>
                <div style={styles.detailIcon}>📅</div>
                <div>
                  <p style={styles.detailLabel}>Date</p>
                  <p style={styles.detailValue}>{formattedDate}</p>
                </div>
              </div>

              <div style={styles.detailCard}>
                <div style={styles.detailIcon}>🕐</div>
                <div>
                  <p style={styles.detailLabel}>Time</p>
                  <p style={styles.detailValue}>{time}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Fee Breakdown */}
          <section style={styles.feeSection}>
            <h3 style={styles.sectionTitle}>💰 Fee Breakdown</h3>
            
            <div style={styles.feeBreakdown}>
              <div style={styles.feeItem}>
                <span style={styles.feeLabel}>Doctor Consultation Fee</span>
                <span style={styles.feeValue}>Rs. {doctorFee.toFixed(2)}</span>
              </div>
              
              <div style={styles.feeItem}>
                <span style={styles.feeLabel}>Medical Center Service Fee</span>
                <span style={styles.feeValue}>Rs. {medicalCenterFee.toFixed(2)}</span>
              </div>

              <div style={styles.feeDivider}></div>

              <div style={styles.feeTotalItem}>
                <span style={styles.feeTotalLabel}>Total Amount to Pay</span>
                <span style={styles.feeTotalValue}>Rs. {totalFee.toFixed(2)}</span>
              </div>
            </div>

            <div style={styles.paymentNote}>
              <span style={styles.noteIcon}>ℹ️</span>
              <p style={styles.noteText}>Payment can be made at the medical center on the day of your appointment</p>
            </div>
          </section>

          {/* Notes Section */}
          <section style={styles.notesSection}>
            <h3 style={styles.sectionTitle}>📝 Additional Notes (Optional)</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any special requests or notes for your appointment..."
              style={styles.notesTextarea}
              rows={4}
            />
          </section>

          {/* Action Buttons */}
          <div style={styles.actionButtons}>
            <button onClick={handleBack} style={styles.backButton}>
              ← Back
            </button>
            <button onClick={handleConfirmBooking} style={styles.confirmButton}>
              Confirm Booking
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)"
  },
  mainContent: {
    flex: 1,
    padding: "32px",
    maxWidth: "800px",
    width: "100%",
    margin: "0 auto"
  },
  header: {
    marginBottom: "32px",
    textAlign: "center"
  },
  pageTitle: {
    fontSize: "32px",
    fontWeight: "bold",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: "0 0 8px 0"
  },
  pageSubtitle: {
    fontSize: "15px",
    color: "#6b7280",
    margin: 0
  },
  confirmCard: {
    background: "white",
    borderRadius: "20px",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
    border: "1px solid rgba(102, 126, 234, 0.1)",
    overflow: "hidden"
  },
  doctorSection: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "32px"
  },
  doctorHeader: {
    display: "flex",
    alignItems: "center",
    gap: "20px"
  },
  doctorAvatar: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "rgba(255, 255, 255, 0.2)",
    border: "3px solid rgba(255, 255, 255, 0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "36px",
    fontWeight: "bold",
    color: "white",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
    flexShrink: 0
  },
  doctorName: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "white",
    margin: "0 0 4px 0"
  },
  doctorSpecialty: {
    fontSize: "16px",
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
    margin: 0
  },
  detailsSection: {
    padding: "32px"
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#1f2937",
    margin: "0 0 20px 0"
  },
  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px"
  },
  detailCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "20px",
    background: "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
    borderRadius: "12px",
    border: "2px solid rgba(102, 126, 234, 0.1)"
  },
  detailIcon: {
    fontSize: "32px",
    width: "56px",
    height: "56px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)"
  },
  detailLabel: {
    fontSize: "13px",
    color: "#6b7280",
    fontWeight: "500",
    margin: "0 0 4px 0",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  detailValue: {
    fontSize: "16px",
    color: "#1f2937",
    fontWeight: "700",
    margin: 0
  },
  feeSection: {
    padding: "0 32px 32px 32px"
  },
  feeBreakdown: {
    background: "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
    padding: "24px",
    borderRadius: "12px",
    border: "2px solid rgba(102, 126, 234, 0.15)"
  },
  feeItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0"
  },
  feeLabel: {
    fontSize: "15px",
    color: "#4b5563",
    fontWeight: "500"
  },
  feeValue: {
    fontSize: "16px",
    color: "#1f2937",
    fontWeight: "600"
  },
  feeDivider: {
    height: "2px",
    background: "linear-gradient(90deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%)",
    margin: "16px 0",
    borderRadius: "2px"
  },
  feeTotalItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "10px",
    marginTop: "12px"
  },
  feeTotalLabel: {
    fontSize: "16px",
    color: "white",
    fontWeight: "700"
  },
  feeTotalValue: {
    fontSize: "24px",
    color: "white",
    fontWeight: "800"
  },
  paymentNote: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    marginTop: "16px",
    padding: "16px",
    background: "#fef3c7",
    borderRadius: "10px",
    border: "1px solid #fbbf24"
  },
  noteIcon: {
    fontSize: "20px",
    flexShrink: 0
  },
  noteText: {
    fontSize: "14px",
    color: "#92400e",
    margin: 0,
    lineHeight: "1.5"
  },
  notesSection: {
    padding: "0 32px 32px 32px"
  },
  notesTextarea: {
    width: "100%",
    padding: "16px",
    fontSize: "15px",
    border: "2px solid #e5e7eb",
    borderRadius: "12px",
    resize: "vertical",
    fontFamily: "inherit",
    outline: "none",
    transition: "all 0.3s",
    boxSizing: "border-box"
  },
  actionButtons: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    padding: "24px 32px 32px 32px"
  },
  backButton: {
    padding: "14px 28px",
    fontSize: "15px",
    fontWeight: "600",
    color: "#667eea",
    background: "white",
    border: "2px solid #667eea",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.3s",
    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.15)"
  },
  confirmButton: {
    padding: "14px 32px",
    fontSize: "16px",
    fontWeight: "700",
    color: "white",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    boxShadow: "0 8px 24px rgba(102, 126, 234, 0.4)",
    transition: "all 0.3s",
    flex: 1
  }
};

export default ConfirmBooking;