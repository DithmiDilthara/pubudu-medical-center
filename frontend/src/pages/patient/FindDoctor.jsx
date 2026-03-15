import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { FiSearch, FiUser, FiClock, FiPlus } from 'react-icons/fi';
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

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/doctors`);
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
  }, []);

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

  return (
    <div style={styles.container}>
      <PatientSidebar onLogout={handleLogout} />

      <div className="main-wrapper">
        <PatientHeader patientName="Dithmi" />

        <main className="content-padding">
          {/* Search Section */}
          <section style={styles.searchSection}>
            <div style={styles.searchBarWrapper}>
              <div style={styles.inputIconBox}>
                <FiSearch style={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search by doctor name or specialty..."
                  value={typedSearch}
                  onChange={(e) => setTypedSearch(e.target.value)}
                  style={styles.searchInput}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <button onClick={handleSearch} style={styles.searchBtn}>
                Search
              </button>
            </div>
          </section>

          {/* Specialty Filter Section */}
          <section style={styles.filterSection}>
            <div style={styles.chipsWrapper}>
              {specialties.map(specialty => (
                <button
                  key={specialty}
                  onClick={() => setSelectedSpecialty(specialty)}
                  style={{
                    ...styles.chip,
                    backgroundColor: selectedSpecialty === specialty ? '#0066CC' : '#FFFFFF',
                    color: selectedSpecialty === specialty ? '#FFFFFF' : '#4B5563',
                    borderColor: selectedSpecialty === specialty ? '#0066CC' : '#E5E7EB',
                  }}
                >
                  {specialty}
                </button>
              ))}
            </div>
          </section>

          {/* Doctors Grid Section */}
          <section style={styles.gridSection}>
            {isLoading ? (
              <div style={styles.loadingBox}>Loading available doctors...</div>
            ) : filteredDoctors.length > 0 ? (
              <div style={styles.doctorGrid}>
                {filteredDoctors.map((doctor) => (
                  <div key={doctor.doctor_id} style={styles.doctorCard}>
                    {/* Card Top */}
                    <div style={styles.cardTop}>
                      <div style={styles.avatarContainer}>
                        <img
                          src={getDoctorImage(doctor.doctor_id)}
                          alt={doctor.full_name}
                          style={styles.avatarImg}
                        />
                        <div style={styles.onlineDot} />
                      </div>
                      <div style={styles.doctorMeta}>
                        <h3 style={styles.cardName}>{doctor.full_name}</h3>
                        <p style={styles.cardSpecialty}>{doctor.specialization}</p>
                      </div>
                    </div>

                    <div style={styles.slotInfo}>
                      <FiClock style={styles.slotIcon} />
                      <span style={styles.slotText}>Next available: Today, 5:00 PM</span>
                    </div>

                    <div style={styles.divider} />

                    {/* Card Bottom */}
                    <div style={styles.cardBottom}>
                      <div style={styles.feeBox}>
                        <span style={styles.feeLabel}>Fee:</span>
                        <span style={styles.feeAmount}>LKR {Number(doctor.doctor_fee).toLocaleString()}</span>
                      </div>
                      <button
                        onClick={() => handleBookAppointment(doctor)}
                        style={styles.channelBtn}
                      >
                        Channel Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.noResultsBox}>
                <FiSearch size={48} style={{ color: '#D1D5DB', marginBottom: '16px' }} />
                <p>No doctors found matching your criteria.</p>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: 'var(--slate-50)',
    fontFamily: "'Inter', sans-serif",
  },
  mainWrapper: {
    // Handled by .main-wrapper
  },
  mainContent: {
    // Handled by .content-padding
  },
  searchSection: {
    marginBottom: '24px',
    backgroundColor: 'white',
    padding: '32px',
    borderRadius: 'var(--radius-2xl)',
    boxShadow: 'var(--shadow-soft)',
    border: '1px solid var(--slate-100)',
  },
  searchBarWrapper: {
    display: 'flex',
    gap: '12px',
    width: '100%',
  },
  inputIconBox: {
    position: 'relative',
    flex: 1,
  },
  searchIcon: {
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9CA3AF',
    fontSize: '20px',
  },
  searchInput: {
    width: '100%',
    padding: '16px 16px 16px 52px',
    borderRadius: '12px',
    border: '1px solid var(--slate-200)',
    fontSize: 'var(--text-base)',
    outline: 'none',
    transition: 'all 0.2s ease',
    backgroundColor: 'white',
  },
  searchBtn: {
    padding: '0 32px',
    backgroundColor: 'var(--primary-blue)',
    color: 'white',
    borderRadius: '12px',
    border: 'none',
    fontSize: 'var(--text-sm)',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  filterSection: {
    marginBottom: '40px',
  },
  chipsWrapper: {
    display: 'flex',
    gap: '10px',
    overflowX: 'auto',
    paddingBottom: '8px',
    scrollbarWidth: 'none', // For Firefox
    msOverflowStyle: 'none', // For IE/Edge
  },
  chip: {
    padding: '12px 28px',
    borderRadius: '100px',
    border: '1px solid var(--slate-200)',
    fontSize: 'var(--text-sm)',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s ease',
  },
  gridSection: {
    minHeight: '400px',
  },
  doctorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '24px',
  },
  doctorCard: {
    backgroundColor: 'white',
    borderRadius: '20px',
    border: '1px solid var(--slate-200)',
    padding: '24px',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    cursor: 'pointer',
  },
  cardTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '20px',
  },
  avatarContainer: {
    position: 'relative',
    width: '64px',
    height: '64px',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid #E6F2FF',
  },
  onlineDot: {
    position: 'absolute',
    bottom: '2px',
    right: '2px',
    width: '12px',
    height: '12px',
    backgroundColor: '#22C55E',
    borderRadius: '50%',
    border: '2px solid white',
  },
  doctorMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  cardName: {
    fontSize: 'var(--text-lg)',
    fontWeight: '800',
    color: 'var(--slate-900)',
    margin: 0,
  },
  cardSpecialty: {
    fontSize: 'var(--text-sm)',
    color: 'var(--primary-blue)',
    fontWeight: '600',
    margin: 0,
  },
  slotInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '20px',
    padding: '8px 12px',
    backgroundColor: '#F9FAFB',
    borderRadius: '10px',
  },
  slotIcon: {
    fontSize: '14px',
    color: '#6B7280',
  },
  slotText: {
    fontSize: 'var(--text-xs)',
    color: 'var(--slate-600)',
    fontWeight: '500',
  },
  divider: {
    height: '1px',
    backgroundColor: '#F3F4F6',
    margin: '0 -24px 20px -24px',
  },
  cardBottom: {
    marginTop: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  feeBox: {
    display: 'flex',
    flexDirection: 'column',
  },
  feeLabel: {
    fontSize: '12px',
    color: '#9CA3AF',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  feeAmount: {
    fontSize: 'var(--text-lg)',
    fontWeight: '800',
    color: 'var(--slate-900)',
  },
  channelBtn: {
    padding: '12px 24px',
    backgroundColor: 'var(--primary-blue)',
    color: 'white',
    borderRadius: '12px',
    border: 'none',
    fontSize: 'var(--text-sm)',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  loadingBox: {
    textAlign: 'center',
    padding: '80px',
    color: '#6B7280',
  },
  noResultsBox: {
    textAlign: 'center',
    padding: '80px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: '#9CA3AF',
  },
};

export default FindDoctor;
