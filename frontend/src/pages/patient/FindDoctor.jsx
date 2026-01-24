import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { FiSearch, FiUser } from 'react-icons/fi';
import PatientSidebar from "../../components/PatientSidebar";
import PatientHeader from "../../components/PatientHeader";

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
                  <div key={doctor.id} style={styles.doctorCard}>
                    <div style={styles.doctorCardLeft}>
                      <div style={styles.doctorAvatar}>
                        {doctor.name.charAt(3)}
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
    background: 'linear-gradient(135deg, #f5f5f5 0%, #f9fafb 100%)',
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
  headerSection: {
    marginBottom: '28px'
  },
  pageTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: 0,
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  pageSubtitle: {
    fontSize: '15px',
    color: '#6b7280',
    margin: '8px 0 0 0',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  filterSection: {
    marginBottom: '24px',
    background: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(102, 126, 234, 0.1)'
  },
  searchContainer: {
    marginBottom: '16px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  searchIcon: {
    position: 'absolute',
    left: '16px',
    color: '#9ca3af',
    fontSize: '20px'
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px 12px 48px',
    fontSize: '15px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    outline: 'none',
    transition: 'all 0.3s',
    boxSizing: 'border-box',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  specialtyFilters: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px'
  },
  specialtyButton: {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '600',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    background: 'white',
    color: '#6b7280',
    cursor: 'pointer',
    transition: 'all 0.3s',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  specialtyButtonActive: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: '2px solid #667eea',
    boxShadow: '0 4px 10px rgba(102, 126, 234, 0.3)'
  },
  doctorsSection: {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(102, 126, 234, 0.1)'
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
    padding: '16px',
    border: '2px solid #f0f0f0',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%)',
    transition: 'all 0.3s'
  },
  doctorCardLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flex: 1
  },
  doctorAvatar: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'white',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
    flexShrink: 0,
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  doctorInfo: {
    flex: 1
  },
  doctorName: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1f2937',
    margin: '0 0 4px 0',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  doctorSpecialty: {
    fontSize: '14px',
    color: '#667eea',
    fontWeight: '600',
    margin: 0,
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  doctorCardRight: {
    display: 'flex',
    alignItems: 'center'
  },
  bookButton: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '700',
    color: 'white',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(102, 126, 234, 0.3)',
    transition: 'all 0.3s',
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  noResults: {
    textAlign: 'center',
    padding: '40px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  noResultsText: {
    fontSize: '16px',
    color: '#9ca3af',
    margin: 0,
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  }
};

export default FindDoctor;
