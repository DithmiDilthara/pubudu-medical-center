import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { FiSearch, FiUser, FiClock, FiPlus, FiFilter, FiChevronRight, FiCheckCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from "framer-motion";
import PatientSidebar from "../../components/PatientSidebar";
import PatientHeader from "../../components/PatientHeader";

import docM1 from "../../assets/doctor_m1.png";
import docM2 from "../../assets/doctor_m2.png";
import docF1 from "../../assets/doctor_f1.png";
import docF2 from "../../assets/doctor_f2.png";

const doctorImages = [docF1, docM1, docF2, docM2];

// Helper to get random image based on ID (deterministic)
const getDoctorImage = (id) => doctorImages[id % doctorImages.length];

function FindDoctor() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [typedSearch, setTypedSearch] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get(`${API_URL}/doctors`);
        if (response.data.success) {
          setDoctors(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDoctors();
  }, [API_URL]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleBookAppointment = (doctor) => {
    navigate("/patient/channel-doctor", { state: { doctor } });
  };

  const handleSearch = () => {
    setSearchTerm(typedSearch);
  };

  const specialties = ["All", "Cardiology", "Dermatology", "Neurology", "Orthopedic", "General", "Pediatrics"];

  const filteredDoctors = doctors.filter(doctor => {
    const name = doctor.full_name || "";
    const specialty = doctor.specialization || "";
    const search = searchTerm.toLowerCase();

    const matchesSearch = name.toLowerCase().includes(search) || specialty.toLowerCase().includes(search);
    const matchesSpecialty = selectedSpecialty === "All" || specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div style={styles.container}>
      <PatientSidebar onLogout={handleLogout} />

      <div className="main-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <PatientHeader patientName="Dithmi" />

        <main style={styles.mainContent}>
          <div style={styles.contentWrapper}>
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={styles.headerSection}
          >
            <h1 style={styles.welcomeTitle}>Find Doctors</h1>
            <p style={styles.welcomeSubtitle}>Browse specializations and book your next session.</p>
          </motion.div>

          {/* Search Header */}
          <motion.section 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={styles.searchSection}
          >
            <div style={styles.searchBarWrapper}>
              <div style={styles.inputGroup}>
                <FiSearch style={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search doctors by name, specialty, or hospital..."
                  value={typedSearch}
                  onChange={(e) => setTypedSearch(e.target.value)}
                  style={styles.searchInput}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <button onClick={handleSearch} style={styles.searchBtn}>
                Find Nearest Doctor
              </button>
            </div>
          </motion.section>

          {/* Specialty Filters */}
          <motion.section 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={styles.filterSection}
          >
            <div style={styles.filterHeader}>
              <FiFilter style={{ color: "#2563eb" }} />
              <span style={styles.filterTitle}>Filter by Specialty</span>
            </div>
            <div style={styles.chipsWrapper}>
              {specialties.map(specialty => (
                <button
                  key={specialty}
                  onClick={() => setSelectedSpecialty(specialty)}
                  style={{
                    ...styles.chip,
                    backgroundColor: selectedSpecialty === specialty ? '#2563eb' : 'white',
                    color: selectedSpecialty === specialty ? 'white' : '#64748b',
                    borderColor: selectedSpecialty === specialty ? '#2563eb' : '#e2e8f0',
                    boxShadow: selectedSpecialty === specialty ? '0 4px 12px rgba(37, 99, 235, 0.2)' : 'none'
                  }}
                >
                  {specialty}
                </button>
              ))}
            </div>
          </motion.section>

          {/* Doctors Grid */}
          <motion.section 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={styles.gridSection}
          >
            {isLoading ? (
              <div style={styles.loadingBox}>
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  style={styles.spinner}
                />
                <p>Retrieving healthcare specialist list...</p>
              </div>
            ) : filteredDoctors.length > 0 ? (
              <div style={styles.doctorGrid}>
                {filteredDoctors.map((doctor) => (
                  <motion.div 
                    key={doctor.doctor_id} 
                    variants={cardVariants}
                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                    style={styles.doctorCard}
                  >
                    <div style={styles.cardInfo}>
                      <div style={styles.avatarWrapper}>
                        <img
                          src={getDoctorImage(doctor.doctor_id)}
                          alt={doctor.full_name}
                          style={styles.avatarImg}
                        />
                        <div style={styles.statusPing} />
                      </div>
                      <div style={styles.doctorMeta}>
                        <div style={styles.verifiedBadge}>
                          <FiCheckCircle style={{ marginRight: '4px' }} />
                          Verified
                        </div>
                        <h3 style={styles.doctorName}>{doctor.full_name}</h3>
                        <p style={styles.specialtyText}>{doctor.specialization}</p>
                      </div>
                    </div>

                    <div style={styles.availabilityBox}>
                      <FiClock style={styles.clockIcon} />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span>Next availability: <span style={{ fontWeight: '700', color: '#0f172a' }}>
                          {doctor.availability && doctor.availability.length > 0 
                            ? `${doctor.availability[0].day_of_week}, ${doctor.availability[0].start_time}` 
                            : 'No schedule set'}
                        </span></span>
                        <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: '600' }}>
                          Next Appointment No: {doctor.next_appointment_number || 1}
                        </span>
                      </div>
                    </div>

                    <div style={styles.cardDivider} />

                    <div style={styles.cardFooter}>
                      <div style={styles.feeSection}>
                        <p style={styles.feeLabel}>Total Channeling Fee</p>
                        <p style={styles.feeValue}>LKR {(Number(doctor.doctor_fee) + Number(doctor.center_fee || 0)).toLocaleString()}</p>
                      </div>
                      <button
                        onClick={() => handleBookAppointment(doctor)}
                        style={styles.bookBtn}
                      >
                        Book Now
                        <FiChevronRight style={{ marginLeft: '4px' }} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div style={styles.noResultsBox}>
                <div style={styles.emptyIcon}>
                  <FiSearch />
                </div>
                <h3>No specialists found</h3>
                <p>Try adjusting your search terms or specialty filters.</p>
              </div>
            )}
          </motion.section>
          </div>
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
    fontFamily: "'Inter', sans-serif",
  },
  mainContent: {
    padding: "40px 32px",
    display: "flex",
    flexDirection: "column",
    gap: "32px",
    maxWidth: "1600px",
    margin: "0 auto",
    width: "100%"
  },
  headerSection: {
    marginBottom: "4px",
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
  contentWrapper: {
    maxWidth: "1200px",
    width: "100%",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "32px"
  },
  searchSection: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '28px',
    border: '1px solid #f1f5f9',
    boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
  },
  searchBarWrapper: {
    display: 'flex',
    gap: '16px',
    maxWidth: '900px',
    margin: '0 auto'
  },
  inputGroup: {
    position: 'relative',
    flex: 1,
  },
  searchIcon: {
    position: 'absolute',
    left: '20px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#94a3b8',
    fontSize: '20px',
  },
  searchInput: {
    width: '100%',
    padding: '18px 24px 18px 60px',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    fontSize: '16px',
    outline: 'none',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    backgroundColor: '#f8fafc',
    color: '#0f172a',
    fontWeight: '500'
  },
  searchBtn: {
    padding: '0 32px',
    backgroundColor: '#2563eb',
    color: 'white',
    borderRadius: '16px',
    border: 'none',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.2)'
  },
  filterSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  filterHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    paddingLeft: '4px'
  },
  chipsWrapper: {
    display: 'flex',
    gap: '12px',
    overflowX: 'auto',
    paddingBottom: '8px',
    scrollbarWidth: 'none',
  },
  chip: {
    padding: '12px 28px',
    borderRadius: '100px',
    border: '1px solid',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  gridSection: {
    minHeight: '500px',
  },
  doctorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '28px',
  },
  doctorCard: {
    backgroundColor: 'white',
    borderRadius: '24px',
    border: '1px solid #f1f5f9',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
  },
  cardInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '24px',
  },
  avatarWrapper: {
    position: 'relative',
    width: '72px',
    height: '72px',
    flexShrink: 0
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: '20px',
    objectFit: 'cover',
    backgroundColor: '#f8fafc'
  },
  statusPing: {
    position: 'absolute',
    bottom: '-4px',
    right: '-4px',
    width: '14px',
    height: '14px',
    backgroundColor: '#22c55e',
    borderRadius: '50%',
    border: '3px solid white',
  },
  doctorMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  verifiedBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '11px',
    fontWeight: '700',
    color: '#2563eb',
    backgroundColor: '#eff6ff',
    padding: '4px 8px',
    borderRadius: '6px',
    alignSelf: 'flex-start',
    marginBottom: '2px'
  },
  doctorName: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
    letterSpacing: '-0.01em'
  },
  specialtyText: {
    fontSize: '14px',
    color: '#64748b',
    fontWeight: '500',
    margin: 0,
  },
  availabilityBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 16px',
    backgroundColor: '#f8fafc',
    borderRadius: '14px',
    fontSize: '13px',
    color: '#64748b',
    marginBottom: '24px',
  },
  clockIcon: {
    fontSize: '16px',
    color: '#2563eb',
  },
  cardDivider: {
    height: '1px',
    backgroundColor: '#f1f5f9',
    margin: '0 -24px 20px -24px',
  },
  cardFooter: {
    marginTop: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  feeSection: {
    display: 'flex',
    flexDirection: 'column',
  },
  feeLabel: {
    fontSize: '11px',
    color: '#94a3b8',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  feeValue: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0
  },
  bookBtn: {
    padding: '12px 20px',
    backgroundColor: '#2563eb',
    color: 'white',
    borderRadius: '14px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.1)'
  },
  loadingBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '100px',
    color: '#64748b',
    gap: '16px'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #2563eb',
    borderRadius: '50%'
  },
  noResultsBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '100px',
    textAlign: 'center',
    color: '#94a3b8'
  },
  emptyIcon: {
    width: '64px',
    height: '64px',
    borderRadius: '20px',
    backgroundColor: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    marginBottom: '20px'
  }
};

export default FindDoctor;
