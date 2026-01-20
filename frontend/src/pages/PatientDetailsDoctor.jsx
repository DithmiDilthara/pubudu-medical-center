import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DoctorHeader from '../components/DoctorHeader';

function PatientDetailsDoctor() {
  const navigate = useNavigate();
  const location = useLocation();
  const patientId = location.state?.patientId || 'PHE-3456';

  const [consultationNote, setConsultationNote] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [medication, setMedication] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [duration, setDuration] = useState('');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Sample patient data
  const patientData = {
    name: 'Milan Abeywardena',
    id: patientId,
    dob: '1985-08-15',
    phone: '+94 777 345 654',
    email: 'milan.gk2025@gmail.com',
    address: 'No. 24, Galle Road, Colombo 03',
    pastDiagnoses: 'Hypertension, Type 2 Diabetes',
    medications: 'Metformin, Lisinopril',
    labResults: 'Recent blood work normal',
    allergies: 'Penicillin, Aspirin'
  };

  const consultationHistory = [
    {
      id: 1,
      doctor: 'Dr. Manoj Herath',
      date: '2024-07-26',
      rating: 5,
      notes: 'Patient presented with symptoms of fatigue and increased thirst. Blood pressure was elevated at 140/90. Blood work confirmed Type 2 Diabetes. Started on Metformin 500mg twice daily. Advised on diet and exercise. Follow-up in 3 months.'
    }
  ];

  const handleSaveConsultation = () => {
    console.log('Saving consultation...', {
      consultationNote,
      diagnosis,
      followUpDate,
      medication,
      dosage,
      frequency,
      duration
    });
    alert('Consultation notes saved successfully!');
  };

  return (
    <div style={styles.container}>
      <DoctorHeader />

      <main style={styles.mainContent}>
        {/* Back Button */}
        <button onClick={handleBack} style={styles.backButton}>
          ← Back
        </button>

        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.pageTitle}>Patient Details</h1>
        </div>

        <div style={styles.contentGrid}>
          {/* Left Column - Patient Info */}
          <div style={styles.leftColumn}>
            {/* Patient Profile */}
            <section style={styles.card}>
              <div style={styles.profileHeader}>
                <div style={styles.avatar}>{patientData.name.charAt(0)}</div>
                <div>
                  <h2 style={styles.patientName}>{patientData.name}</h2>
                  <p style={styles.patientId}>Patient ID: {patientData.id}</p>
                  <p style={styles.patientDob}>Date of Birth: {patientData.dob}</p>
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section style={styles.card}>
              <h3 style={styles.cardTitle}>Contact Information</h3>
              <div style={styles.infoGrid}>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Phone</span>
                  <span style={styles.infoValue}>{patientData.phone}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Email</span>
                  <span style={styles.infoValue}>{patientData.email}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Address</span>
                  <span style={styles.infoValue}>{patientData.address}</span>
                </div>
              </div>
            </section>

            {/* Medical History */}
            <section style={styles.card}>
              <h3 style={styles.cardTitle}>Medical History</h3>
              <div style={styles.infoGrid}>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Past Diagnoses</span>
                  <span style={styles.infoValue}>{patientData.pastDiagnoses}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Medications</span>
                  <span style={styles.infoValue}>{patientData.medications}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Lab Results</span>
                  <span style={styles.infoValue}>{patientData.labResults}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Allergies</span>
                  <span style={styles.infoValue}>{patientData.allergies}</span>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column - Consultation Notes */}
          <div style={styles.rightColumn}>
            {/* Previous Consultation Notes */}
            <section style={styles.card}>
              <h3 style={styles.cardTitle}>Consultation Notes</h3>
              {consultationHistory.map((consult) => (
                <div key={consult.id} style={styles.consultationItem}>
                  <div style={styles.consultHeader}>
                    <span style={styles.doctorName}>{consult.doctor}</span>
                    <span style={styles.consultDate}>{consult.date}</span>
                  </div>
                  <div style={styles.rating}>
                    {'★'.repeat(consult.rating)}
                  </div>
                  <p style={styles.consultNotes}>{consult.notes}</p>
                </div>
              ))}
            </section>

            {/* Add New Consultation Notes */}
            <section style={styles.card}>
              <h3 style={styles.cardTitle}>Add New Consultation Notes</h3>
              <textarea
                value={consultationNote}
                onChange={(e) => setConsultationNote(e.target.value)}
                placeholder="Enter consultation notes..."
                style={styles.textarea}
                rows={5}
              />

              <input
                type="text"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Update Diagnosis (if any)"
                style={styles.input}
              />

              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                placeholder="Set Follow-up Appointment (Date)"
                style={styles.input}
              />
            </section>

            {/* Prescriptions */}
            <section style={styles.card}>
              <h3 style={styles.cardTitle}>Prescriptions</h3>
              <input
                type="text"
                value={medication}
                onChange={(e) => setMedication(e.target.value)}
                placeholder="Search for Medication"
                style={styles.input}
              />

              <input
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="Dosage (e.g., 500mg)"
                style={styles.input}
              />

              <input
                type="text"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                placeholder="Frequency (e.g., twice daily)"
                style={styles.input}
              />

              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Duration (e.g., 30 days)"
                style={styles.input}
              />

              <button onClick={handleSaveConsultation} style={styles.saveButton}>
                Save Consultation
              </button>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)'
  },
  mainContent: {
    flex: 1,
    padding: '32px',
    maxWidth: '1600px',
    width: '100%',
    margin: '0 auto'
  },
  backButton: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#667eea',
    background: 'white',
    border: '2px solid #667eea',
    borderRadius: '10px',
    cursor: 'pointer',
    marginBottom: '24px',
    transition: 'all 0.3s'
  },
  header: {
    marginBottom: '24px'
  },
  pageTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: 0
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: '400px 1fr',
    gap: '24px'
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(102, 126, 234, 0.1)'
  },
  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '36px',
    fontWeight: 'bold',
    color: 'white',
    flexShrink: 0
  },
  patientName: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: '0 0 4px 0'
  },
  patientId: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0 0 4px 0'
  },
  patientDob: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '16px',
    marginTop: 0
  },
  infoGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  infoLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#6b7280'
  },
  infoValue: {
    fontSize: '15px',
    color: '#1f2937'
  },
  consultationItem: {
    padding: '16px',
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
    borderRadius: '10px',
    border: '1px solid rgba(102, 126, 234, 0.1)',
    marginBottom: '16px'
  },
  consultHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  doctorName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1f2937'
  },
  consultDate: {
    fontSize: '13px',
    color: '#6b7280'
  },
  rating: {
    color: '#f59e0b',
    fontSize: '14px',
    marginBottom: '8px'
  },
  consultNotes: {
    fontSize: '14px',
    color: '#374151',
    lineHeight: '1.6',
    margin: 0
  },
  textarea: {
    width: '100%',
    padding: '12px',
    fontSize: '15px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    resize: 'vertical',
    fontFamily: 'inherit',
    outline: 'none',
    marginBottom: '12px',
    boxSizing: 'border-box'
  },
  input: {
    width: '100%',
    padding: '12px',
    fontSize: '15px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    outline: 'none',
    marginBottom: '12px',
    boxSizing: 'border-box'
  },
  saveButton: {
    width: '100%',
    padding: '14px',
    fontSize: '16px',
    fontWeight: '700',
    color: 'white',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
    transition: 'all 0.3s',
    marginTop: '8px'
  }
};

export default PatientDetailsDoctor;
