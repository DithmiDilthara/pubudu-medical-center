import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { FiSearch, FiChevronLeft, FiChevronRight, FiAlertCircle, FiArrowRight, FiArrowLeft, FiCheck, FiUser, FiCalendar, FiClock, FiActivity, FiShield } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import ReceptionistSidebar from "../../components/ReceptionistSidebar";
import ReceptionistHeader from "../../components/ReceptionistHeader";

function NewBooking() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const steps = ["Patient", "Service", "Availability", "Time", "Confirm"];

  // Form data
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("nic"); //  search type
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
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");

  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [doctorAvailability, setDoctorAvailability] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [nextQueueNumber, setNextQueueNumber] = useState(null);
  const [receptionistName, setReceptionistName] = useState("Receptionist");

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Fetch doctors and specializations
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/doctors`);
        if (response.data.success) {
          const doctorsList = response.data.data;
          setDoctors(doctorsList);

          // Extract unique specializations
          const specs = [...new Set(doctorsList.map(d => d.specialization))];
          setServices(specs);

          // Handle Pre-selection from URL (?doctor=ID)
          const queryParams = new URLSearchParams(location.search);
          const preSelectedId = queryParams.get('doctor');

          if (preSelectedId && doctorsList.length > 0) {
            const doc = doctorsList.find(d => d.doctor_id === parseInt(preSelectedId));
            if (doc) {
              setSelectedDoctor(doc.doctor_id.toString());
              setSelectedService(doc.specialization);
              // Note: We don't skip to step 2 here because we still need to identify the patient at step 1
            }
          }
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
        toast.error("Failed to load doctors list");
      }
    };
    fetchDoctors();
  }, []);

  // Fetch receptionist profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          setReceptionistName(response.data.data.profile.full_name);
        }
      } catch (error) {
        console.error("Error fetching receptionist profile:", error);
      }
    };
    fetchProfile();
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

  // Fetch next queue number when reaching step 5
  useEffect(() => {
    if (currentStep === 5 && selectedDoctor && selectedDate) {
      const fetchNextQueueNumber = async () => {
        try {
          const year = selectedDate.getFullYear();
          const month = selectedDate.getMonth();
          const day = selectedDate.getDate();
          const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

          const token = localStorage.getItem('token');
          const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/appointments/next-number`, {
            params: { doctor_id: selectedDoctor, date: formattedDate },
            headers: { Authorization: `Bearer ${token}` }
          });

          if (response.data.success) {
            setNextQueueNumber(response.data.nextNumber);
          }
        } catch (error) {
          console.error("Error fetching next queue number:", error);
        }
      };
      fetchNextQueueNumber();
    }
  }, [currentStep, selectedDoctor, selectedDate]);

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
      if (!selectedSession) {
        toast.error("Please select a session");
        return;
      }
    }

    setCurrentStep(prev => Math.min(prev + 1, 5));
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleConfirmBooking = async () => {
    setIsLoading(true);
    const toastId = toast.loading("Booking appointment...");
    try {
      const token = localStorage.getItem('token');
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const day = selectedDate.getDate();
      const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/appointments`, {
        doctor_id: parseInt(selectedDoctor),
        patient_id: patientInfo.patientId,
        appointment_date: formattedDate,
        time_slot: selectedSession.timeRange,
        schedule_id: selectedSession.id
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
    setIsLoading(true);
    const toastId = toast.loading("Preparing payment...");
    try {
      const token = localStorage.getItem('token');
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const day = selectedDate.getDate();
      const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/appointments`, {
        doctor_id: parseInt(selectedDoctor),
        patient_id: patientInfo.patientId,
        appointment_date: formattedDate,
        time_slot: selectedSession.timeRange,
        schedule_id: selectedSession.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.dismiss(toastId);
        const selectedDocObj = doctors.find(d => d.doctor_id === parseInt(selectedDoctor));
        const docFee = Number(selectedDocObj?.doctor_fee || 0);
        const centerFee = Number(selectedDocObj?.center_fee || 600);
        const totalAmount = docFee + centerFee;

        const appointmentData = {
          patientName: patientInfo.fullName,
          patientId: `PHE-${patientInfo.patientId}`,
          dateOfService: formattedDate,
          service: selectedService,
          amount: totalAmount,
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
      setSelectedSession(null);
      setSelectedTime("");
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

    // 1. Check for specific date entries first (Overrides/Exclusions)
    const specificActive = doctorAvailability.filter(a => a.schedule_date === formattedDate && a.status === 'ACTIVE' && !a.is_exclusion);
    const exclusions = doctorAvailability.filter(a => a.schedule_date === formattedDate && a.is_exclusion && a.status === 'CANCELLED');

    if (exclusions.length > 0) return false; // Hard block for cancelled days
    if (specificActive.length > 0) return true; // Available for specific date

    // 2. Check for recurring slots
    return doctorAvailability.some(a => {
      if (!a.day_of_week || a.day_of_week.toUpperCase() !== dayName || a.schedule_date) return false;
      if (a.status !== 'ACTIVE') return false; // Ensure recurring is ACTIVE
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
      a.schedule_date === formattedDate && a.status === 'ACTIVE' && !a.is_exclusion
    );

    // If no specific override, use recurring
    if (dayAvails.length === 0) {
      dayAvails = doctorAvailability.filter(a => {
        if (!a.day_of_week || a.day_of_week.toUpperCase() !== dayName || a.schedule_date) return false;
        if (a.status !== 'ACTIVE') return false; // Ensure recurring is ACTIVE
        if (a.end_date) {
          return formattedDate <= a.end_date;
        }
        return true;
      });
    }

    return dayAvails.map(avail => ({
      id: avail.schedule_id,
      timeRange: `${avail.start_time} - ${avail.end_time}`
    }));
  };

  const isSelectedDate = (day) => {
    if (!day || !selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth.getMonth() &&
      selectedDate.getFullYear() === currentMonth.getFullYear()
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div style={styles.container}>
      <ReceptionistSidebar onLogout={handleLogout} />

      <motion.div
        className="main-wrapper"
        style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <ReceptionistHeader receptionistName={receptionistName} />

        <main className="content-padding" style={{ flex: 1, overflowY: 'auto' }}>
          <motion.div variants={itemVariants} style={styles.contentCard}>
            {/* Header */}
            <motion.header variants={itemVariants} style={styles.pageHeader}>
              <h1 style={styles.welcomeTitle}>New Booking</h1>
              <p style={styles.welcomeSubtitle}>Follow the steps below to schedule a new patient appointment securely.</p>
            </motion.header>

            {/* Stepper Wizard */}
            <div style={styles.stepperContainer}>
              {steps.map((stepName, index) => {
                const stepNum = index + 1;
                const isActive = currentStep === stepNum;
                const isCompleted = currentStep > stepNum;

                return (
                  <div key={stepNum} style={styles.stepWrapper}>
                    {/* Line behind circles */}
                    {index < steps.length - 1 && (
                      <div
                        style={{
                          ...styles.stepLine,
                          ...(isCompleted ? styles.stepLineCompleted : isActive ? styles.stepLineActive : {})
                        }}
                      />
                    )}

                    <div style={styles.stepIndicator}>
                      <motion.div
                        initial={false}
                        animate={{
                          scale: isActive ? 1.1 : 1,
                          backgroundColor: isCompleted ? "#10b981" : isActive ? "#2563eb" : "#ffffff",
                          borderColor: isCompleted ? "#10b981" : isActive ? "#2563eb" : "#e2e8f0",
                          color: isCompleted || isActive ? "#ffffff" : "#94a3b8"
                        }}
                        style={styles.stepCircle}
                      >
                        {isCompleted ? <FiCheck size={18} /> : stepNum}
                      </motion.div>
                      <span
                        style={{
                          ...styles.stepLabel,
                          ...(isActive || isCompleted ? styles.stepLabelActive : {})
                        }}
                      >
                        {stepName}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Content Section with Transitions */}
            <div style={styles.stepSection}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  {/* Step 1: Patient Information */}
                  {currentStep === 1 && (
                    <div>
                      <div style={styles.stepHeader}>
                        <div style={styles.stepIcon}><FiUser /></div>
                        <h2 style={styles.stepTitle}>Identify Patient</h2>
                      </div>

                      <div style={styles.searchBox}>
                        <div style={styles.searchTypeContainer}>
                          {["nic", "phone", "name"].map(type => (
                            <div
                              key={type}
                              onClick={() => setSearchType(type)}
                              style={{
                                ...styles.searchTab,
                                ...(searchType === type ? styles.searchTabActive : styles.searchTabInactive)
                              }}
                            >
                              {type.toUpperCase()}
                            </div>
                          ))}
                        </div>

                        <div style={styles.searchInputWrapper}>
                          <FiSearch style={styles.searchIcon} />
                          <input
                            type="text"
                            placeholder={`Enter patient ${searchType}...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearchPatient()}
                            style={styles.searchInput}
                          />
                          <button
                            onClick={handleSearchPatient}
                            style={{
                              position: "absolute",
                              right: "8px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              backgroundColor: "#2563eb",
                              color: "white",
                              border: "none",
                              borderRadius: "8px",
                              padding: "8px 16px",
                              fontSize: "14px",
                              fontWeight: "600",
                              cursor: "pointer",
                              transition: "all 0.2s"
                            }}
                          >
                            Search
                          </button>
                        </div>
                      </div>

                      {patientInfo.fullName && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          style={styles.patientResultCard}
                        >
                          <div style={styles.avatar}>
                            {patientInfo.fullName.split(" ").map(n => n[0]).join("").toUpperCase()}
                          </div>
                          <div>
                            <h3 style={styles.patientName}>{patientInfo.fullName}</h3>
                            <div style={styles.patientDetail}>
                              ID: PHE-{patientInfo.patientId} • NIC: {patientInfo.nic || 'N/A'} • {patientInfo.contactNumber}
                            </div>
                          </div>
                          <div style={{ marginLeft: "auto", color: "#10b981" }}>
                            <FiCheck size={24} />
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* Step 2: Service & Doctor */}
                  {currentStep === 2 && (
                    <div>
                      <div style={styles.stepHeader}>
                        <div style={styles.stepIcon}><FiActivity /></div>
                        <h2 style={styles.stepTitle}>Select Service & Specialist</h2>
                      </div>

                      <div style={styles.selectionGrid}>
                        <div>
                          <label style={styles.selectLabel}>Service / Specialty</label>
                          <select
                            value={selectedService}
                            onChange={(e) => {
                              setSelectedService(e.target.value);
                              setSelectedDoctor("");
                            }}
                            style={{
                              ...styles.customSelect,
                              backgroundColor: new URLSearchParams(location.search).get('doctor') ? '#f8fafc' : 'white',
                              cursor: new URLSearchParams(location.search).get('doctor') ? 'not-allowed' : 'pointer'
                            }}
                            disabled={!!new URLSearchParams(location.search).get('doctor')}
                          >
                            <option value="">Choose Service</option>
                            {services.map((service) => (
                              <option key={service} value={service}>{service}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label style={styles.selectLabel}>Specialist / Doctor</label>
                          <select
                            value={selectedDoctor}
                            onChange={(e) => setSelectedDoctor(e.target.value)}
                            style={{
                              ...styles.customSelect,
                              backgroundColor: new URLSearchParams(location.search).get('doctor') ? '#f8fafc' : 'white',
                              cursor: new URLSearchParams(location.search).get('doctor') ? 'not-allowed' : 'pointer'
                            }}
                            disabled={!selectedService || !!new URLSearchParams(location.search).get('doctor')}
                          >
                            <option value="">Choose Doctor</option>
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
                    </div>
                  )}

                  {/* Step 3: Availability */}
                  {currentStep === 3 && (
                    <div>
                      <div style={styles.stepHeader}>
                        <div style={styles.stepIcon}><FiCalendar /></div>
                        <h2 style={styles.stepTitle}>Select Appointment Date</h2>
                      </div>

                      <div style={styles.calendarCard}>
                        <div style={styles.calendarHeader}>
                          <button onClick={handlePrevMonth} style={styles.navBtn}><FiChevronLeft /></button>
                          <span style={styles.monthTitle}>
                            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                          </span>
                          <button onClick={handleNextMonth} style={styles.navBtn}><FiChevronRight /></button>
                        </div>

                        <div style={styles.calendarBody}>
                          <div style={styles.dayNames}>
                            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
                              <div key={d} style={styles.dayName}>{d}</div>
                            ))}
                          </div>

                          <div style={styles.daysGrid}>
                            {getDaysInMonth(currentMonth).map((day, index) => {
                              const currentDayDate = day ? new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day) : null;
                              const hasAvailability = isDateAvailable(day);
                              const isPast = currentDayDate && currentDayDate < new Date().setHours(0, 0, 0, 0);

                              return (
                                <div
                                  key={index}
                                  onClick={() => day && !isPast && hasAvailability && handleDateSelect(day)}
                                  style={{
                                    ...styles.dayCell,
                                    ...(day ? {} : { visibility: 'hidden' }),
                                    ...(hasAvailability && !isPast ? styles.dayAvailable : styles.dayDisabled),
                                    ...(isSelectedDate(day) ? styles.daySelected : {})
                                  }}
                                >
                                  {day}
                                  {hasAvailability && !isPast && !isSelectedDate(day) && (
                                    <div style={{ position: 'absolute', bottom: '4px', width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#2563eb' }} />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Select Time */}
                  {currentStep === 4 && (
                    <div>
                      <div style={styles.stepHeader}>
                        <div style={styles.stepIcon}><FiClock /></div>
                        <h2 style={styles.stepTitle}>Choose Time Slot</h2>
                      </div>

                      <div style={{ marginBottom: "20px", padding: "12px", backgroundColor: "#f0f9ff", borderRadius: "12px", border: "1px solid #e0f2fe", fontSize: "14px", color: "#0369a1", display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiAlertCircle />
                        <span>Showing available slots for {selectedDate?.toLocaleDateString()}</span>
                      </div>

                      <div style={styles.timeGrid}>
                        {(() => {
                          const day = selectedDate ? selectedDate.getDate() : null;
                          const sessions = getTimeSlotsForDay(day);

                          if (sessions.length === 0) return <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#64748b', padding: '40px' }}>No available sessions for this date.</p>;

                          return sessions.map((session) => (
                            <button
                              key={session.id}
                              onClick={() => {
                                setSelectedSession(session);
                                setSelectedTime(session.timeRange);
                              }}
                              style={{
                                ...styles.timeBtn,
                                ...(selectedSession?.id === session.id ? styles.timeBtnActive : {}),
                                gridColumn: 'span 2',
                                textAlign: 'left',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}
                            >
                              <span style={{ fontWeight: 700 }}>{session.timeRange}</span>
                            </button>
                          ));
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Step 5: Confirm Booking */}
                  {currentStep === 5 && (
                    <div>
                      <div style={styles.stepHeader}>
                        <div style={styles.stepIcon}><FiShield /></div>
                        <h2 style={styles.stepTitle}>Confirm Details</h2>
                      </div>

                      <div style={styles.confirmCard}>
                        <div style={styles.confirmItem}>
                          <span style={styles.confirmLabel}>Patient Name</span>
                          <span style={styles.confirmValue}>{patientInfo.fullName}</span>
                        </div>
                        <div style={styles.confirmItem}>
                          <span style={styles.confirmLabel}>Patient ID</span>
                          <span style={styles.confirmValue}>PHE-{patientInfo.patientId}</span>
                        </div>
                        <div style={styles.confirmItem}>
                          <span style={styles.confirmLabel}>Specialist</span>
                          <span style={styles.confirmValue}>
                            {doctors.find(d => d.doctor_id === parseInt(selectedDoctor))?.full_name}
                          </span>
                        </div>
                        <div style={styles.confirmItem}>
                          <span style={styles.confirmLabel}>Service</span>
                          <span style={styles.confirmValue}>{selectedService}</span>
                        </div>
                        <div style={styles.confirmItem}>
                          <span style={styles.confirmLabel}>Appointment</span>
                          <span style={styles.confirmValue}>
                            {selectedDate?.toLocaleDateString()} • {selectedSession?.timeRange}
                          </span>
                        </div>
                        {nextQueueNumber !== null && (
                          <div style={{ ...styles.confirmItem, borderBottom: 'none', color: '#10b981' }}>
                            <span style={{ ...styles.confirmLabel, color: '#059669', fontWeight: '700' }}>Queue Number</span>
                            <span style={{ fontSize: '20px', fontWeight: '800' }}>#{nextQueueNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom Footer Actions */}
            <div style={styles.footer}>
              <button
                onClick={currentStep === 1 ? () => navigate("/receptionist/dashboard") : handlePrevious}
                style={styles.btnSecondary}
              >
                <FiArrowLeft /> {currentStep === 1 ? "Cancel" : "Back"}
              </button>

              {currentStep < 5 ? (
                <button
                  onClick={handleNext}
                  disabled={
                    (currentStep === 1 && !patientInfo.fullName) ||
                    (currentStep === 2 && (!selectedService || !selectedDoctor)) ||
                    (currentStep === 3 && !selectedDate) ||
                    (currentStep === 4 && !selectedTime)
                  }
                  style={{
                    ...styles.btnPrimary,
                    ...((currentStep === 1 && !patientInfo.fullName) ||
                      (currentStep === 2 && (!selectedService || !selectedDoctor)) ||
                      (currentStep === 3 && !selectedDate) ||
                      (currentStep === 4 && !selectedTime) ? styles.btnDisabled : {})
                  }}
                >
                  Continue <FiArrowRight />
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '12px', flex: 1, marginLeft: '20px' }}>
                  <button onClick={handleConfirmBooking} style={styles.payLaterBtn}>
                    Book & Pay Later
                  </button>
                  <button onClick={handlePayNow} style={styles.payNowBtn}>
                    Confirm & Pay Now
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </main>
      </motion.div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f8fafc", // slate-50/50
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
  },
  contentCard: {
    maxWidth: "1400px",
    width: "100%",
    margin: "0 auto 40px auto",
    backgroundColor: "transparent",
    padding: "0",
    boxShadow: "none",
    border: "none",
    display: "flex",
    flexDirection: "column",
    gap: "32px"
  },
  pageHeader: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    marginBottom: "32px"
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
  stepperContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "48px",
    padding: "0 20px",
    position: "relative"
  },
  stepWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
    position: "relative"
  },
  stepIndicator: {
    zIndex: 2,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px"
  },
  stepCircle: {
    width: "40px",
    height: "40px",
    borderRadius: "12px", // Squircle style
    backgroundColor: "white",
    border: "2px solid #e2e8f0",
    color: "#94a3b8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "15px",
    fontWeight: "700",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
  },
  stepCircleActive: {
    borderColor: "#2563eb",
    color: "white",
    backgroundColor: "#2563eb",
    boxShadow: "0 8px 16px -4px rgba(37, 99, 235, 0.25)",
    transform: "scale(1.1)"
  },
  stepCircleCompleted: {
    borderColor: "#10b981",
    backgroundColor: "#10b981",
    color: "white",
    boxShadow: "0 4px 12px -2px rgba(16, 185, 129, 0.2)"
  },
  stepLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#94a3b8",
    transition: "color 0.3s ease",
    textAlign: "center"
  },
  stepLabelActive: {
    color: "#0f172a"
  },
  stepLine: {
    position: "absolute",
    top: "20px",
    left: "50%",
    width: "100%",
    height: "2px",
    backgroundColor: "#e2e8f0",
    zIndex: 1,
    transition: "background-color 0.5s ease"
  },
  stepLineActive: {
    backgroundColor: "#2563eb"
  },
  stepLineCompleted: {
    backgroundColor: "#10b981"
  },
  stepSection: {
    backgroundColor: "white",
    borderRadius: "24px",
    padding: "40px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
    borderLeft: "6px solid #2563eb",
    minHeight: "400px"
  },
  stepHeader: {
    marginBottom: "24px",
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  stepIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px"
  },
  stepTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#0f172a",
    margin: 0
  },
  // Search Styles
  searchBox: {
    backgroundColor: "#f8fafc",
    padding: "24px",
    borderRadius: "20px",
    border: "1px solid #e2e8f0",
    marginBottom: "24px"
  },
  searchTypeContainer: {
    display: "flex",
    gap: "12px",
    marginBottom: "20px"
  },
  searchTab: {
    padding: "8px 16px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
    border: "1px solid transparent"
  },
  searchTabActive: {
    backgroundColor: "white",
    color: "#2563eb",
    border: "1px solid #e2e8f0",
    boxShadow: "0 2px 4px rgba(15, 23, 42, 0.05)"
  },
  searchTabInactive: {
    color: "#64748b",
    backgroundColor: "transparent"
  },
  searchInputWrapper: {
    display: "flex",
    position: "relative"
  },
  searchInput: {
    width: "100%",
    padding: "14px 16px 14px 48px",
    fontSize: "15px",
    border: "2px solid #e2e8f0",
    borderRadius: "14px",
    outline: "none",
    transition: "all 0.2s ease",
    backgroundColor: "white",
    color: "#1e293b"
  },
  searchInputFocus: {
    borderColor: "#2563eb",
    boxShadow: "0 0 0 4px rgba(37, 99, 235, 0.1)"
  },
  searchIcon: {
    position: "absolute",
    left: "16px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#94a3b8",
    fontSize: "18px"
  },
  patientResultCard: {
    padding: "20px",
    borderRadius: "16px",
    backgroundColor: "#f0fdf4",
    border: "1px solid #dcfce7",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginTop: "16px"
  },
  avatar: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    backgroundColor: "#dcfce7",
    color: "#166534",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: "700"
  },
  patientName: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#065f46",
    margin: "0 0 4px 0"
  },
  patientDetail: {
    fontSize: "13px",
    color: "#166534",
    opacity: 0.8
  },
  // Selection Styles
  selectionGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px"
  },
  selectLabel: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#475569",
    marginBottom: "8px",
    display: "block"
  },
  customSelect: {
    width: "100%",
    padding: "14px 16px",
    fontSize: "15px",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    backgroundColor: "#f8fafc",
    color: "#0f172a",
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 16px center",
    backgroundSize: "20px",
    cursor: "pointer",
    outline: "none",
    transition: "all 0.2s"
  },
  // Calendar Styles
  calendarCard: {
    border: "2px solid #2563eb",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 10px 15px -3px rgba(37, 99, 235, 0.1)",
    margin: "0 auto",
    width: "100%",
    maxWidth: "500px" // Medium size
  },
  calendarHeader: {
    padding: "16px",
    backgroundColor: "#2563eb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
  },
  navBtn: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    border: "none",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s"
  },
  monthTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: "0.01em"
  },
  calendarBody: {
    padding: "12px",
    backgroundColor: "white"
  },
  dayNames: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    marginBottom: "8px"
  },
  dayName: {
    textAlign: "center",
    fontSize: "10px",
    fontWeight: "700",
    color: "#94a3b8"
  },
  daysGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "4px"
  },
  dayCell: {
    aspectRatio: "1.1",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "12px",
    fontSize: "15px", // Medium font
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
    position: "relative"
  },
  dayAvailable: {
    backgroundColor: "#eff6ff",
    color: "#2563eb"
  },
  daySelected: {
    backgroundColor: "#2563eb !important",
    color: "white !important",
    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)"
  },
  dayDisabled: {
    color: "#000000",
    opacity: 0.2,
    cursor: "not-allowed"
  },
  // Time Styles
  timeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
    gap: "12px"
  },
  timeBtn: {
    padding: "12px 10px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "600",
    border: "1px solid #e2e8f0",
    backgroundColor: "white",
    color: "#475569",
    cursor: "pointer",
    transition: "all 0.2s"
  },
  timeBtnActive: {
    backgroundColor: "#2563eb",
    color: "white",
    borderColor: "#2563eb",
    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)"
  },
  // Confirmation Styles
  confirmCard: {
    backgroundColor: "#f8fafc",
    borderRadius: "20px",
    border: "1px solid #e2e8f0",
    padding: "24px"
  },
  confirmItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 0",
    borderBottom: "1px solid #e2e8f0"
  },
  confirmLabel: {
    color: "#64748b",
    fontSize: "14px",
    fontWeight: "500"
  },
  confirmValue: {
    color: "#0f172a",
    fontSize: "15px",
    fontWeight: "700",
    textAlign: "right"
  },
  // Footer
  footer: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "40px"
  },
  btnSecondary: {
    padding: "12px 24px",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: "600",
    color: "#64748b",
    backgroundColor: "white",
    border: "1px solid #e2e8f0",
    cursor: "pointer",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  btnPrimary: {
    padding: "12px 32px",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: "700",
    color: "white",
    background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
    border: "none",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 10px 15px -3px rgba(37, 99, 235, 0.25)"
  },
  btnDisabled: {
    backgroundColor: "#e2e8f0",
    color: "#94a3b8",
    cursor: "not-allowed",
    boxShadow: "none"
  },
  payLaterBtn: {
    flex: 1,
    padding: "14px",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: "700",
    color: "#2563eb",
    backgroundColor: "white",
    border: "2px solid #2563eb",
    cursor: "pointer",
    transition: "all 0.2s"
  },
  payNowBtn: {
    flex: 1,
    padding: "14px",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: "700",
    color: "white",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    border: "none",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 10px 15px -3px rgba(16, 185, 129, 0.25)"
  }
};

export default NewBooking;
