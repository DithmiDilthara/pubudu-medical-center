import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { FiSearch, FiUser } from 'react-icons/fi';
import PatientSidebar from "../../components/PatientSidebar";
import PatientHeader from "../../components/PatientHeader";

import docM1 from "../../assets/doctor_m1.png";
import docM2 from "../../assets/doctor_m2.png";
import docF1 from "../../assets/doctor_f1.png";
import docF2 from "../../assets/doctor_f2.png";

const doctorImages = [docF1, docM1, docF2, docM2];

// Helper to get random image based on ID (deterministic)
const getDoctorImage = (id) => doctorImages[id % doctorImages.length];

const doctors = [
  {
    id: 1,
    name: "Dr. Anjali Silva",
    specialty: "Cardiology"
  },
  {
    id: 2,
    name: "Dr. Rohan Perera",
    specialty: "Pediatrics"
  },
  {
    id: 3,
    name: "Dr. Kavindi Fernando",
    specialty: "Dermatology"
  },
  {
    id: 4,
    name: "Dr. Chamara Rajapaksa",
    specialty: "Neurology"
  },
  {
    id: 5,
    name: "Dr. Dilini Gunawardena",
    specialty: "Orthopedics"
  },
  {
    id: 6,
    name: "Dr. Asanka Wijesinghe",
    specialty: "Ophthalmology"
  },
  {
    id: 7,
    name: "Dr. Thilini Jayawardena",
    specialty: "ENT"
  },
  {
    id: 8,
    name: "Dr. Nimal De Silva",
    specialty: "Psychiatry"
  },
  {
    id: 9,
    name: "Dr. Samadhi Perera",
    specialty: "Urology"
  },
  {
    id: 10,
    name: "Dr. Kamal Fernando",
    specialty: "Gastroenterology"
  }
];

function FindDoctor() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");

  const handleLogout = () => {
    console.log("User logged out");
    navigate("/");
  };

  const handleBookAppointment = (doctor) => {
    navigate("/patient/doctor-details", { state: { doctor } });
  };

  const specialties = ["All", ...new Set(doctors.map(d => d.specialty))];

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === "All" || doctor.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div style={styles.container}>
      <PatientSidebar onLogout={handleLogout} />

      <div style={styles.mainWrapper}>
        <PatientHeader patientName="Dithmi" />

        <main style={styles.mainContent}>
          <div style={styles.headerSection}>
            <div>
              <h1 style={styles.pageTitle}>Our Doctors</h1>
              <p style={styles.pageSubtitle}>
                Choose a doctor to view their availability and book an appointment
              </p>
            </div>
          </div>

          <section style={styles.filterSection}>
            <div style={styles.searchContainer}>
              <FiSearch style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by doctor name or specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
                onFocus={(e) => {
                  e.target.style.borderColor = '#0066CC';
                  e.target.style.boxShadow = '0 0 0 3px rgba(0, 102, 204, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E5E7EB';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div style={styles.specialtyFilters}>
              {specialties.map(specialty => (
                <button
                  key={specialty}
                  onClick={() => setSelectedSpecialty(specialty)}
                  style={{
                    ...styles.specialtyButton,
                    ...(selectedSpecialty === specialty ? styles.specialtyButtonActive : {})
                  }}
                  onMouseEnter={(e) => {
                    if (selectedSpecialty !== specialty) {
                      e.currentTarget.style.borderColor = '#0066CC';
                      e.currentTarget.style.color = '#0066CC';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedSpecialty !== specialty) {
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.color = '#6B7280';
                    }
                  }}
                >
                  {specialty}
                </button>
              ))}
            </div>
          </section>

          <section style={styles.doctorsSection}>
            {filteredDoctors.length > 0 ? (
              <div style={styles.doctorsList}>
                {filteredDoctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    style={styles.doctorCard}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                      e.currentTarget.style.borderColor = '#0066CC';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                      e.currentTarget.style.borderColor = '#F3F4F6';
                    }}
                  >
                    <div style={styles.doctorCardLeft}>
                      <div style={styles.doctorAvatar}>
                        <img
                          src={getDoctorImage(doctor.id)}
                          alt={doctor.name}
                          style={styles.doctorAvatarImg}
                        />
                      </div>
                      <div style={styles.doctorInfo}>
                        <h3 style={styles.doctorName}>{doctor.name}</h3>
                        <p style={styles.doctorSpecialty}>{doctor.specialty}</p>
                      </div>
                    </div>
                    <div style={styles.doctorCardRight}>
                      <button
                        onClick={() => handleBookAppointment(doctor)}
                        style={styles.bookButton}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 102, 204, 0.35)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 102, 204, 0.25)';
                        }}
                      >
                        <FiUser style={{ marginRight: '8px' }} />
                        Book Appointment
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.noResults}>
                <FiSearch size={48} style={{ color: '#9ca3af', marginBottom: '12px' }} />
                <p style={styles.noResultsText}>No doctors found matching your search.</p>
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
    flexDirection: 'row',
    minHeight: '100vh',
    background: '#F9FAFB',
    fontFamily: "'Inter', sans-serif"
  },
  mainWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  mainContent: {
    flex: 1,
    padding: '40px',
    maxWidth: '1400px',
    width: '100%',
    margin: '0 auto'
  },
  headerSection: {
    marginBottom: '32px'
  },
  pageTitle: {
    fontSize: '36px',
    fontWeight: '800',
    color: '#111827',
    margin: 0,
    fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
    letterSpacing: '-0.5px'
  },
  pageSubtitle: {
    fontSize: '16px',
    color: '#6B7280',
    margin: '10px 0 0 0',
    fontFamily: "'Inter', sans-serif",
    fontWeight: '500'
  },
  filterSection: {
    marginBottom: '28px',
    background: 'white',
    padding: '28px',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    border: '1px solid #E5E7EB'
  },
  searchContainer: {
    marginBottom: '20px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  searchIcon: {
    position: 'absolute',
    left: '18px',
    color: '#9CA3AF',
    fontSize: '20px'
  },
  searchInput: {
    width: '100%',
    padding: '14px 18px 14px 52px',
    fontSize: '15px',
    border: '2px solid #E5E7EB',
    borderRadius: '12px',
    outline: 'none',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    boxSizing: 'border-box',
    fontFamily: "'Inter', sans-serif",
    color: '#111827',
    backgroundColor: '#FFFFFF'
  },
  specialtyFilters: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px'
  },
  specialtyButton: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    border: '2px solid #E5E7EB',
    borderRadius: '10px',
    background: 'white',
    color: '#6B7280',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    fontFamily: "'Inter', sans-serif"
  },
  specialtyButtonActive: {
    background: 'linear-gradient(135deg, #0066CC 0%, #0052A3 100%)',
    color: 'white',
    border: '2px solid #0066CC',
    boxShadow: '0 4px 12px rgba(0, 102, 204, 0.25)'
  },
  doctorsSection: {
    background: 'white',
    padding: '32px',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    border: '1px solid #E5E7EB'
  },
  doctorsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  doctorCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px',
    border: '1px solid #F3F4F6',
    borderRadius: '14px',
    background: '#FFFFFF',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
  },
  doctorCardLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
    flex: 1
  },
  doctorAvatar: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #0066CC 0%, #0052A3 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'white',
    boxShadow: '0 4px 12px rgba(0, 102, 204, 0.25)',
    flexShrink: 0,
    fontFamily: "'Inter', sans-serif",
    border: '3px solid #E6F2FF',
    overflow: 'hidden',
    padding: 0
  },
  doctorAvatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  doctorInfo: {
    flex: 1
  },
  doctorName: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 6px 0',
    fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif"
  },
  doctorSpecialty: {
    fontSize: '14px',
    color: '#0066CC',
    fontWeight: '600',
    margin: 0,
    fontFamily: "'Inter', sans-serif",
    backgroundColor: '#E6F2FF',
    padding: '4px 12px',
    borderRadius: '6px',
    display: 'inline-block'
  },
  doctorCardRight: {
    display: 'flex',
    alignItems: 'center'
  },
  bookButton: {
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: '700',
    color: 'white',
    background: 'linear-gradient(135deg, #0066CC 0%, #0052A3 100%)',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0, 102, 204, 0.25)',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    fontFamily: "'Inter', sans-serif"
  },
  noResults: {
    textAlign: 'center',
    padding: '60px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  noResultsText: {
    fontSize: '16px',
    color: '#9CA3AF',
    margin: 0,
    fontFamily: "'Inter', sans-serif",
    fontWeight: '500'
  }
};

export default FindDoctor;
