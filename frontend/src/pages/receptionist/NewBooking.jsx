import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import ReceptionistSidebar from "../../components/ReceptionistSidebar";
import ReceptionistHeader from "../../components/ReceptionistHeader";

function NewBooking() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  
  // Form data
  const [searchQuery, setSearchQuery] = useState("");
  const [patientInfo, setPatientInfo] = useState({
    fullName: "",
    contactNumber: "",
    dateOfBirth: "",
    patientId: ""
  });
  const [selectedService, setSelectedService] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  
  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date(2024, 7)); // August 2024
  
  // Sample data (replace with API calls)
  const services = [
    "General Consultation",
    "Cardiology",
    "Dermatology",
    "Pediatrics",
    "Orthopedics"
  ];
  
  const doctors = [
    "Dr. Kavindi Fernando",
    "Dr. Asanka Wijesinghe",
    "Dr. Nimal De Silva",
    "Dr. Anjali Silva",
    "Dr. Rohan Perera"
  ];
  
  const timeSlots = [
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "12:30 PM"
  ];

  const handleLogout = () => {
    console.log("Receptionist logged out");
    navigate("/");
  };

  const handleSearchPatient = () => {
    if (!searchQuery.trim()) {
      alert("Please enter patient name or ID");
      return;
    }
    
    // Simulate patient search (replace with actual API call)
    // For demo, populate with sample data
    setPatientInfo({
      fullName: "Priyani Aththanayake",
      contactNumber: "0771234567",
      dateOfBirth: "1990-05-15",
      patientId: "PHE-8067"
    });
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!patientInfo.fullName) {
        alert("Please search and select a patient");
        return;
      }
    } else if (currentStep === 2) {
      if (!selectedService || !selectedDoctor) {
        alert("Please select service and doctor");
        return;
      }
    } else if (currentStep === 3) {
      if (!selectedDate) {
        alert("Please select a date");
        return;
      }
    } else if (currentStep === 4) {
      if (!selectedTime) {
        alert("Please select a time");
        return;
      }
    }
    
    setCurrentStep(prev => Math.min(prev + 1, 5));
  };

  const handleConfirmBooking = () => {
    const bookingData = {
      patient: patientInfo,
      service: selectedService,
      doctor: selectedDoctor,
      date: selectedDate,
      time: selectedTime
    };
    
    console.log("Booking confirmed (Pay Later):", bookingData);
    alert("Appointment booked successfully! Payment pending.");
    
    // Navigate to appointments list
    navigate("/receptionist/appointments");
  };

  const handlePayNow = () => {
    const appointmentData = {
      patientName: patientInfo.fullName,
      patientId: patientInfo.patientId,
      dateOfService: selectedDate?.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      service: selectedService,
      amount: 1500.00
    };

    navigate("/receptionist/payment", {
      state: { appointment: appointmentData }
    });
  };

  const handleCancel = () => {
    navigate("/receptionist/dashboard");
  };

  // Calendar functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateSelect = (day) => {
    if (day) {
      const selected = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      setSelectedDate(selected);
    }
  };

  const isSelectedDate = (day) => {
    if (!day || !selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth.getMonth() &&
      selectedDate.getFullYear() === currentMonth.getFullYear()
    );
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <ReceptionistSidebar onLogout={handleLogout} />

      {/* Main Content */}
      <div style={styles.mainWrapper}>
        {/* Header */}
        <ReceptionistHeader receptionistName="Sarah Johnson" />

        {/* Page Content */}
        <main style={styles.mainContent}>
          <div style={styles.contentCard}>
            <h1 style={styles.pageTitle}>New Booking</h1>

            {/* Step 1: Patient Information */}
            {currentStep >= 1 && (
              <div style={styles.stepSection}>
                <h2 style={styles.stepTitle}>Step 1: Patient Information</h2>
                
                <div style={styles.searchContainer}>
                  <input
                    type="text"
                    placeholder="Search for existing patient"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={styles.searchInput}
                  />
                  <button onClick={handleSearchPatient} style={styles.searchButton}>
                    <FiSearch />
                  </button>
                </div>

                {patientInfo.fullName && (
                  <div style={styles.patientInfoBox}>
                    <div style={styles.infoRow}>
                      <label style={styles.infoLabel}>Patient Full Name</label>
                      <input
                        type="text"
                        value={patientInfo.fullName}
                        readOnly
                        style={styles.readOnlyInput}
                      />
                    </div>
                    <div style={styles.infoRow}>
                      <label style={styles.infoLabel}>Contact Number</label>
                      <input
                        type="text"
                        value={patientInfo.contactNumber}
                        readOnly
                        style={styles.readOnlyInput}
                      />
                    </div>
                    <div style={styles.infoRow}>
                      <label style={styles.infoLabel}>Date of Birth (YYYY-MM-DD)</label>
                      <input
                        type="text"
                        value={patientInfo.dateOfBirth}
                        readOnly
                        style={styles.readOnlyInput}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Service & Doctor */}
            {currentStep >= 2 && (
              <div style={styles.stepSection}>
                <h2 style={styles.stepTitle}>Step 2: Service & Doctor</h2>
                
                <div style={styles.formGroup}>
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    style={styles.select}
                  >
                    <option value="">Select Service</option>
                    {services.map((service) => (
                      <option key={service} value={service}>{service}</option>
                    ))}
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <select
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    style={styles.select}
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map((doctor) => (
                      <option key={doctor} value={doctor}>{doctor}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Step 3: Availability */}
            {currentStep >= 3 && (
              <div style={styles.stepSection}>
                <h2 style={styles.stepTitle}>Step 3: Availability</h2>
                
                <div style={styles.calendarContainer}>
                  <div style={styles.calendarHeader}>
                    <button onClick={handlePrevMonth} style={styles.calendarNavButton}>
                      <FiChevronLeft />
                    </button>
                    <span style={styles.calendarMonth}>
                      {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={handleNextMonth} style={styles.calendarNavButton}>
                      <FiChevronRight />
                    </button>
                  </div>
                  
                  <div style={styles.calendarGrid}>
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                      <div key={index} style={styles.calendarDayHeader}>{day}</div>
                    ))}
                    {getDaysInMonth(currentMonth).map((day, index) => (
                      <div
                        key={index}
                        onClick={() => handleDateSelect(day)}
                        style={{
                          ...styles.calendarDay,
                          ...(day ? styles.calendarDayActive : styles.calendarDayEmpty),
                          ...(isSelectedDate(day) ? styles.calendarDaySelected : {})
                        }}
                      >
                        {day || ''}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Select Time */}
            {currentStep >= 4 && (
              <div style={styles.stepSection}>
                <h2 style={styles.stepTitle}>Step 4: Select Time</h2>
                
                <div style={styles.timeSlotsContainer}>
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      style={{
                        ...styles.timeSlot,
                        ...(selectedTime === time ? styles.timeSlotSelected : {})
                      }}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Confirm Booking */}
            {currentStep >= 5 && (
              <div style={styles.stepSection}>
                <h2 style={styles.stepTitle}>Step 5: Confirm Booking</h2>
                
                <div style={styles.confirmationBox}>
                  <div style={styles.confirmRow}>
                    <span style={styles.confirmLabel}>Patient</span>
                    <span style={styles.confirmValue}>
                      {patientInfo.fullName}<br />
                      <small style={styles.confirmSmall}>({patientInfo.patientId})</small>
                    </span>
                  </div>
                  
                  <div style={styles.confirmRow}>
                    <span style={styles.confirmLabel}>Service</span>
                    <span style={styles.confirmValue}>{selectedService}</span>
                  </div>
                  
                  <div style={styles.confirmRow}>
                    <span style={styles.confirmLabel}>Doctor</span>
                    <span style={styles.confirmValue}>{selectedDoctor}</span>
                  </div>
                  
                  <div style={styles.confirmRow}>
                    <span style={styles.confirmLabel}>Date & Time</span>
                    <span style={styles.confirmValue}>
                      {selectedDate?.toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}, {selectedTime}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={styles.actionButtons}>
              <button onClick={handleCancel} style={styles.cancelButton}>
                Cancel
              </button>
              {currentStep < 5 ? (
                <button onClick={handleNext} style={styles.nextButton}>
                  Next
                </button>
              ) : (
                <div style={styles.paymentButtonsContainer}>
                  <button onClick={handleConfirmBooking} style={styles.payLaterButton}>
                    Pay Later
                  </button>
                  <button onClick={handlePayNow} style={styles.payNowButton}>
                    Pay Now
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    backgroundColor: "#f9fafb"
  },
  mainWrapper: {
    flex: 1,
    display: "flex",
    flexDirection: "column"
  },
  mainContent: {
    flex: 1,
    padding: "32px",
    overflow: "auto"
  },
  contentCard: {
    maxWidth: "700px",
    margin: "0 auto",
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "32px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
  },
  pageTitle: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1f2937",
    margin: 0,
    marginBottom: "32px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  stepSection: {
    marginBottom: "32px",
    paddingBottom: "24px",
    borderBottom: "1px solid #f3f4f6"
  },
  stepTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1f2937",
    margin: 0,
    marginBottom: "16px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  searchContainer: {
    display: "flex",
    gap: "12px",
    marginBottom: "16px"
  },
  searchInput: {
    flex: 1,
    padding: "12px 16px",
    fontSize: "15px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    outline: "none",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  searchButton: {
    padding: "12px 20px",
    fontSize: "18px",
    color: "#6b7280",
    backgroundColor: "white",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  patientInfoBox: {
    marginTop: "16px"
  },
  infoRow: {
    marginBottom: "16px"
  },
  infoLabel: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#6b7280",
    display: "block",
    marginBottom: "6px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  readOnlyInput: {
    width: "100%",
    padding: "10px 14px",
    fontSize: "15px",
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
    backgroundColor: "#f9fafb",
    color: "#374151",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    boxSizing: "border-box"
  },
  formGroup: {
    marginBottom: "16px"
  },
  select: {
    width: "100%",
    padding: "12px 16px",
    fontSize: "15px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    outline: "none",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    backgroundColor: "white",
    cursor: "pointer",
    boxSizing: "border-box"
  },
  calendarContainer: {
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "16px"
  },
  calendarHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "16px"
  },
  calendarNavButton: {
    padding: "8px",
    fontSize: "18px",
    color: "#6b7280",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center"
  },
  calendarMonth: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1f2937",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  calendarGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "4px"
  },
  calendarDayHeader: {
    textAlign: "center",
    fontSize: "13px",
    fontWeight: "600",
    color: "#6b7280",
    padding: "8px 0",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  calendarDay: {
    textAlign: "center",
    padding: "12px 0",
    fontSize: "14px",
    borderRadius: "6px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  calendarDayActive: {
    cursor: "pointer",
    color: "#374151",
    border: "1px solid #e5e7eb"
  },
  calendarDayEmpty: {
    color: "transparent",
    cursor: "default",
    border: "none"
  },
  calendarDaySelected: {
    backgroundColor: "#0066CC",
    color: "white",
    fontWeight: "600",
    border: "1px solid #0066CC"
  },
  timeSlotsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px"
  },
  timeSlot: {
    padding: "12px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
    backgroundColor: "white",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    cursor: "pointer",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    transition: "all 0.2s"
  },
  timeSlotSelected: {
    backgroundColor: "#0066CC",
    color: "white",
    border: "1px solid #0066CC",
    fontWeight: "600"
  },
  confirmationBox: {
    backgroundColor: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "20px"
  },
  confirmRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "16px",
    paddingBottom: "16px",
    borderBottom: "1px solid #e5e7eb"
  },
  confirmLabel: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#6b7280",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  confirmValue: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1f2937",
    textAlign: "right",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  confirmSmall: {
    fontSize: "12px",
    color: "#6b7280",
    fontWeight: "400"
  },
  actionButtons: {
    display: "flex",
    gap: "16px",
    marginTop: "32px"
  },
  cancelButton: {
    flex: 1,
    padding: "14px 32px",
    fontSize: "15px",
    fontWeight: "600",
    color: "#6b7280",
    backgroundColor: "white",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    cursor: "pointer",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  nextButton: {
    flex: 1,
    padding: "14px 32px",
    fontSize: "15px",
    fontWeight: "600",
    color: "white",
    background: "linear-gradient(135deg, #0066CC 0%, #0052A3 100%)",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    boxShadow: "0 4px 12px rgba(0, 102, 204, 0.3)"
  },
  confirmButton: {
    flex: 1,
    padding: "14px 32px",
    fontSize: "15px",
    fontWeight: "600",
    color: "white",
    background: "linear-gradient(135deg, #0066CC 0%, #0052A3 100%)",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    boxShadow: "0 4px 12px rgba(0, 102, 204, 0.3)"
  },
  paymentButtonsContainer: {
    flex: 1,
    display: "flex",
    gap: "12px"
  },
  payLaterButton: {
    flex: 1,
    padding: "14px 24px",
    fontSize: "15px",
    fontWeight: "600",
    color: "#0066CC",
    backgroundColor: "white",
    border: "2px solid #0066CC",
    borderRadius: "8px",
    cursor: "pointer",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    transition: "all 0.2s ease"
  },
  payNowButton: {
    flex: 1,
    padding: "14px 32px",
    fontSize: "15px",
    fontWeight: "600",
    color: "white",
    background: "linear-gradient(135deg, #0066CC 0%, #0052A3 100%)",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    boxShadow: "0 4px 12px rgba(0, 102, 204, 0.3)"
  }
};

export default NewBooking;
