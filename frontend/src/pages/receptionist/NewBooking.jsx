import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { FiSearch, FiChevronLeft, FiChevronRight, FiAlertCircle } from "react-icons/fi";
import ReceptionistSidebar from "../../components/ReceptionistSidebar";
import ReceptionistHeader from "../../components/ReceptionistHeader";

function NewBooking() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);

  // Form data
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("nic"); // Add search type
  const [patientInfo, setPatientInfo] = useState({
    fullName: "",
    contactNumber: "",
    dateOfBirth: "",
    patientId: ""
  });

  // Handle passed state from search
  useEffect(() => {
    if (location.state?.patient) {
      const { full_name, user, date_of_birth, patient_id } = location.state.patient;
      setPatientInfo({
        fullName: full_name,
        contactNumber: user?.contact_number || "",
        dateOfBirth: date_of_birth,
        patientId: `PHE-${patient_id}` // Assuming a prefix for ID
      });
      setCurrentStep(2); // Skip search if patient passed
    }
  }, [location.state]);
  const [selectedService, setSelectedService] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");

  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [doctorAvailability, setDoctorAvailability] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Fetch doctors and specializations
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/doctors`);
        if (response.data.success) {
          setDoctors(response.data.data);
          // Extract unique specializations
          const specs = [...new Set(response.data.data.map(d => d.specialization))];
          setServices(specs);
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
        toast.error("Failed to load doctors list");
      }
    };
    fetchDoctors();
  }, []);

  // Fetch availability when doctor is selected
  useEffect(() => {
    if (selectedDoctor) {
      const fetchAvailability = async () => {
        try {
          const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/doctors/${selectedDoctor}/availability`);
          if (response.data.success) {
            setDoctorAvailability(response.data.data);
          }
        } catch (error) {
          console.error("Error fetching availability:", error);
        }
      };
      fetchAvailability();
    }
  }, [selectedDoctor]);

  // Fetch booked slots when date and doctor are selected
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      const fetchBookedSlots = async () => {
        try {
          // FIX: formattedDate should be local YYYY-MM-DD
          const year = selectedDate.getFullYear();
          const month = selectedDate.getMonth();
          const day = selectedDate.getDate();
          const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const token = localStorage.getItem('token');
          const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/appointments`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.data.success) {
            // Filter appointments for this doctor and date
            const relevant = response.data.data.filter(apt =>
              apt.doctor_id === parseInt(selectedDoctor) &&
              apt.appointment_date === formattedDate &&
              ['PENDING', 'CONFIRMED'].includes(apt.status)
            );
            setBookedSlots(relevant.map(apt => apt.time_slot));
          }
        } catch (error) {
          console.error("Error fetching booked slots:", error);
        }
      };
      fetchBookedSlots();
    }
  }, [selectedDoctor, selectedDate]);

  const handleLogout = () => {
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleSearchPatient = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter patient search query");
      return;
    }

    const toastId = toast.loading("Searching for patient...");
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/receptionist/search-patient`, {
        params: { query: searchQuery, type: searchType },
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        if (response.data.exists) {
          toast.success("Patient found!", { id: toastId });
          const patient = response.data.data;
          setPatientInfo({
            fullName: patient.full_name,
            contactNumber: patient.user?.contact_number || "",
            dateOfBirth: patient.date_of_birth || "",
            patientId: patient.patient_id, // Use actual numeric ID
            nic: patient.nic
          });
        } else {
          toast.dismiss(toastId);
          toast((t) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontWeight: '500' }}>Patient not registered.</span>
              <button
                onClick={() => {
                  navigate("/receptionist/patients/add", { state: { showRegistration: true } });
                  toast.dismiss(t.id);
                }}
                style={{
                  backgroundColor: '#0066CC',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '13px'
                }}
              >
                Register New Patient
              </button>
            </div>
          ), { duration: 6000, icon: 'ℹ️' });
          setPatientInfo({
            fullName: "",
            contactNumber: "",
            dateOfBirth: "",
            patientId: ""
          });
        }
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search for patient.", { id: toastId });
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!patientInfo.fullName) {
        toast.error("Please search and select a patient");
        return;
      }
    } else if (currentStep === 2) {
      if (!selectedService || !selectedDoctor) {
        toast.error("Please select service and doctor");
        return;
      }
    } else if (currentStep === 3) {
      if (!selectedDate) {
        toast.error("Please select a date");
        return;
      }
    } else if (currentStep === 4) {
      if (!selectedTime) {
        toast.error("Please select a time");
        return;
      }
    }

    setCurrentStep(prev => Math.min(prev + 1, 5));
  };

  const handleConfirmBooking = async () => {
    setIsLoading(true);
    const toastId = toast.loading("Booking appointment...");
    try {
      const token = localStorage.getItem('token');
      // FIX: formattedDate should be local YYYY-MM-DD
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const day = selectedDate.getDate();
      const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/appointments`, {
        doctor_id: parseInt(selectedDoctor),
        patient_id: patientInfo.patientId,
        appointment_date: formattedDate,
        time_slot: selectedTime
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success("Appointment booked successfully!", { id: toastId });
        navigate("/receptionist/appointments");
      }
    } catch (error) {
      console.error("Booking error:", error);
      toast.error(error.response?.data?.message || "Failed to book appointment", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayNow = async () => {
    // Similar to confirm but maybe handle differently?
    // For now, let's just confirm and set context for payment
    setIsLoading(true);
    const toastId = toast.loading("Preparing payment...");
    try {
      const token = localStorage.getItem('token');
      // FIX: formattedDate should be local YYYY-MM-DD
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const day = selectedDate.getDate();
      const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/appointments`, {
        doctor_id: parseInt(selectedDoctor),
        patient_id: patientInfo.patientId,
        appointment_date: formattedDate,
        time_slot: selectedTime
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.dismiss(toastId);
        const appointmentData = {
          patientName: patientInfo.fullName,
          patientId: `PHE-${patientInfo.patientId}`,
          dateOfService: formattedDate,
          service: selectedService,
          amount: 1500.00,
          appointment_id: response.data.data.appointment_id
        };

        navigate("/receptionist/payment", {
          state: { appointment: appointmentData }
        });
      }
    } catch (error) {
      console.error("Booking/Payment error:", error);
      toast.error(error.response?.data?.message || "Failed to initiate payment", { id: toastId });
    } finally {
      setIsLoading(false);
    }
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

  // Helper functions for availability (copied/adapted from DoctorDetails)
  const isDateAvailable = (day) => {
    if (!day) return false;
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const date = new Date(year, month, day);
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`; // Local date
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const dayName = days[date.getDay()];

    // Check specific date overrides first
    const specific = doctorAvailability.find(a => a.specific_date === formattedDate);
    if (specific) {
      return specific.session_name === 'Available' || specific.session_name === 'Half Day' || specific.session_name === 'Regular Session';
    }

    // Fallback to recurring
    return doctorAvailability.some(a => {
      if (!a.day_of_week || a.day_of_week.toUpperCase() !== dayName || a.specific_date) return false;
      if (a.end_date) {
        return formattedDate <= a.end_date;
      }
      return true;
    });
  };

  const getTimeSlotsForDay = (day) => {
    if (!day) return [];
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const date = new Date(year, month, day);
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`; // Local date
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const dayName = days[date.getDay()];

    // Specific date overrides take precedence
    let dayAvails = doctorAvailability.filter(a =>
      a.specific_date === formattedDate &&
      (a.session_name === 'Available' || a.session_name === 'Half Day' || a.session_name === 'Regular Session')
    );

    // If no specific override, use recurring
    if (dayAvails.length === 0) {
      dayAvails = doctorAvailability.filter(a => {
        if (!a.day_of_week || a.day_of_week.toUpperCase() !== dayName || a.specific_date) return false;
        if (a.end_date) {
          return formattedDate <= a.end_date;
        }
        return true;
      });
    }

    const slots = [];
    dayAvails.forEach(avail => {
      let current = new Date(`2024-01-01 ${avail.start_time}`);
      const end = new Date(`2024-01-01 ${avail.end_time}`);
      while (current < end) {
        slots.push(current.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
        current.setMinutes(current.getMinutes() + 30);
      }
    });

    return slots;
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

                <div style={styles.searchTypeContainer}>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="searchType"
                      value="nic"
                      checked={searchType === "nic"}
                      onChange={(e) => setSearchType(e.target.value)}
                      style={styles.radioInput}
                    />
                    NIC
                  </label>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="searchType"
                      value="phone"
                      checked={searchType === "phone"}
                      onChange={(e) => setSearchType(e.target.value)}
                      style={styles.radioInput}
                    />
                    Phone
                  </label>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="searchType"
                      value="name"
                      checked={searchType === "name"}
                      onChange={(e) => setSearchType(e.target.value)}
                      style={styles.radioInput}
                    />
                    Name
                  </label>
                </div>

                <div style={styles.searchContainer}>
                  <input
                    type="text"
                    placeholder={`Search by ${searchType}`}
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
                    onChange={(e) => {
                      setSelectedService(e.target.value);
                      setSelectedDoctor(""); // Reset doctor on service change
                    }}
                    style={styles.select}
                  >
                    <option value="">Select Service / Specialty</option>
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
                    disabled={!selectedService}
                  >
                    <option value="">Select Doctor</option>
                    {doctors
                      .filter(doc => doc.specialization === selectedService)
                      .map((doctor) => (
                        <option key={doctor.doctor_id} value={doctor.doctor_id}>
                          {doctor.full_name}
                        </option>
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
                    {getDaysInMonth(currentMonth).map((day, index) => {
                      const currentDayDate = day ? new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day) : null;
                      const hasAvailability = isDateAvailable(day);
                      const isPast = currentDayDate && currentDayDate < new Date().setHours(0, 0, 0, 0);

                      return (
                        <div
                          key={index}
                          onClick={() => day && !isPast && hasAvailability && handleDateSelect(day)}
                          style={{
                            ...styles.calendarDay,
                            ...(day ? styles.calendarDayActive : styles.calendarDayEmpty),
                            ...(isSelectedDate(day) ? styles.calendarDaySelected : {}),
                            ...(isPast || (day && !hasAvailability) ? { opacity: 0.3, cursor: 'not-allowed', backgroundColor: '#f9fafb' } : {}),
                            ...(day && hasAvailability && !isPast ? { borderColor: '#0066CC', color: '#0066CC', fontWeight: 'bold' } : {})
                          }}
                        >
                          {day || ''}
                          {day && hasAvailability && !isPast && <div style={{ fontSize: '8px', marginTop: '2px' }}>Active</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Select Time */}
            {currentStep >= 4 && (
              <div style={styles.stepSection}>
                <h2 style={styles.stepTitle}>Step 4: Select Time</h2>

                <div style={styles.timeSlotsContainer}>
                  {/* Added time range display */}
                  <div style={{ marginBottom: '16px', fontSize: '14px', color: '#4b5563' }}>
                    {(() => {
                      if (!selectedDate) return null;
                      const year = selectedDate.getFullYear();
                      const month = selectedDate.getMonth();
                      const day = selectedDate.getDate();
                      const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
                      const dayName = days[selectedDate.getDay()];

                      // Find matching availability
                      let avail = doctorAvailability.find(a =>
                        a.specific_date === formattedDate &&
                        (a.session_name === 'Available' || a.session_name === 'Half Day' || a.session_name === 'Regular Session')
                      );

                      if (!avail) {
                        avail = doctorAvailability.find(a =>
                          (!a.day_of_week || a.day_of_week.toUpperCase() === dayName) &&
                          !a.specific_date &&
                          (!a.end_date || formattedDate <= a.end_date)
                        );
                      }

                      if (avail) {
                        const formatTime = (t) => {
                          const [h, m] = t.split(':');
                          const date = new Date();
                          date.setHours(h, m);
                          return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                        };
                        return <span>Available: <strong>{formatTime(avail.start_time)} - {formatTime(avail.end_time)}</strong></span>;
                      }
                      return null;
                    })()}
                  </div>

                  {(() => {
                    const day = selectedDate ? selectedDate.getDate() : null;
                    const slots = getTimeSlotsForDay(day);

                    if (slots.length === 0) return <p style={{ gridColumn: 'span 3', textAlign: 'center', color: '#6b7280' }}>No slots available for this day</p>;

                    return slots.map((time) => {
                      const isBooked = bookedSlots.includes(time);
                      return (
                        <button
                          key={time}
                          type="button"
                          disabled={isBooked}
                          onClick={() => setSelectedTime(time)}
                          style={{
                            ...styles.timeSlot,
                            ...(selectedTime === time ? styles.timeSlotSelected : {}),
                            ...(isBooked ? { opacity: 0.4, cursor: 'not-allowed', backgroundColor: '#f3f4f6' } : {})
                          }}
                        >
                          {time} {isBooked && '(Full)'}
                        </button>
                      );
                    });
                  })()}
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
                      <small style={styles.confirmSmall}>(PHE-{patientInfo.patientId})</small>
                    </span>
                  </div>

                  <div style={styles.confirmRow}>
                    <span style={styles.confirmLabel}>Service</span>
                    <span style={styles.confirmValue}>{selectedService}</span>
                  </div>

                  <div style={styles.confirmRow}>
                    <span style={styles.confirmLabel}>Doctor</span>
                    <span style={styles.confirmValue}>
                      {doctors.find(d => d.doctor_id === parseInt(selectedDoctor))?.full_name}
                    </span>
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

          <div style={styles.footer}>
            <button
              onClick={() => navigate("/receptionist/dashboard")}
              style={styles.backButton}
            >
              Back
            </button>
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
  searchTypeContainer: {
    display: "flex",
    gap: "16px",
    marginBottom: "12px"
  },
  radioLabel: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "14px",
    color: "#374151",
    cursor: "pointer",
    fontWeight: "500"
  },
  radioInput: {
    cursor: "pointer",
    width: "16px",
    height: "16px",
    accentColor: "#0066CC"
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
  footer: {
    marginTop: "32px",
    display: "flex",
    justifyContent: "flex-end",
    paddingBottom: "32px"
  },
  backButton: {
    padding: "10px 24px",
    border: "none",
    borderRadius: "6px",
    background: "#0066CC",
    color: "white",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 2px 4px rgba(0, 102, 204, 0.2)",
    transition: "all 0.2s",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
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
