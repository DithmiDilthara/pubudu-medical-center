import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FiArrowLeft, FiUser, FiPhone, FiMail, FiMapPin, FiFileText, FiStar, FiPlus, FiTrash2 } from 'react-icons/fi';
import DoctorHeader from '../../components/DoctorHeader';
import DoctorSidebar from '../../components/DoctorSidebar';

function PatientDetailsDoctor() {
  const navigate = useNavigate();
  const location = useLocation();
  const rawId = location.state?.patientId || '1';
  const patientId = rawId.toString().replace('PHE-', '');

  const [consultationNote, setConsultationNote] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  
  // Single medication input state
  const [medication, setMedication] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [duration, setDuration] = useState('');
  
  // List of medications added
  const [medicationsList, setMedicationsList] = useState([]);

  const [activeAppointmentId, setActiveAppointmentId] = useState(location.state?.appointment_id || null);
  const [patientData, setPatientData] = useState(null);
  const [consultationHistory, setConsultationHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchPatientData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');

        // Fetch patient demographics
        const profileRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/doctors/patient/${patientId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (profileRes.data.success) {
          setPatientData(profileRes.data.data);
        }

        // Fetch medical history (Prescriptions)
        const historyRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/clinical/history/${patientId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (historyRes.data.success) {
          const formattedHistory = historyRes.data.data.map(item => ({
            id: item.prescription_id,
            doctor: item.appointment?.doctor?.full_name || 'Unknown Doctor',
            date: item.created_at ? new Date(item.created_at).toISOString().split('T')[0] : 'Unknown Date',
            rating: 5, 
            notes: `Diagnosis: ${item.diagnosis}\nNotes: ${item.notes}\nMedications: ${item.medications}`,
            appointment_id: item.appointment_id
          }));
          setConsultationHistory(formattedHistory);
        }

        // Fetch appointments to find an active one if not provided in state
        if (!activeAppointmentId) {
            const apptsRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/appointments`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (apptsRes.data.success) {
                const patientAppts = apptsRes.data.data.filter(a => 
                    a.patient_id === parseInt(patientId) && 
                    ['PENDING', 'CONFIRMED'].includes(a.status)
                );
                if (patientAppts.length > 0) {
                    setActiveAppointmentId(patientAppts[0].appointment_id);
                }
            }
        }

      } catch (error) {
        console.error("Error fetching patient details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (patientId) {
      fetchPatientData();
    }
  }, [patientId]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleAddMedication = () => {
    if (!medication) {
      alert("Please enter a medication name.");
      return;
    }
    const newMed = {
      id: Date.now(),
      name: medication,
      dosage,
      frequency,
      duration
    };
    setMedicationsList([...medicationsList, newMed]);
    // Clear individual inputs
    setMedication('');
    setDosage('');
    setFrequency('');
    setDuration('');
  };

  const handleRemoveMedication = (id) => {
    setMedicationsList(medicationsList.filter(m => m.id !== id));
  };

  const handleSaveConsultation = async () => {
    if (!consultationNote || !diagnosis) {
      alert("Please enter diagnosis and clinical notes.");
      return;
    }

    let finalMedsList = [...medicationsList];
    if (medication && !finalMedsList.some(m => m.name === medication)) {
        finalMedsList.push({
            id: Date.now(),
            name: medication,
            dosage,
            frequency,
            duration
        });
    }

    if (finalMedsList.length === 0) {
        alert("Please add at least one medication.");
        return;
    }

    if (!activeAppointmentId) {
      alert('Error: No active appointment found for this patient. A prescription must be linked to a pending appointment.');
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const medsString = finalMedsList.map(m => `${m.name} ${m.dosage} (${m.frequency}) for ${m.duration}`).join('\n');
      
      let finalNotes = consultationNote;
      if (followUpDate) {
        finalNotes += `\n\n--- FOLLOW-UP ---\nDate: ${followUpDate}`;
      }

      const payload = {
        appointment_id: parseInt(activeAppointmentId),
        diagnosis,
        notes: finalNotes,
        medications: medsString
      };

      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/clinical/prescription`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        alert('Consultation saved successfully!');
        const newHistoryItem = {
          id: response.data.data.prescription_id,
          doctor: 'You',
          date: new Date().toISOString().split('T')[0],
          rating: 5,
          notes: `Diagnosis: ${diagnosis}\nNotes: ${finalNotes}\nMedications: ${payload.medications}`,
          appointment_id: parseInt(activeAppointmentId)
        };
        setConsultationHistory([newHistoryItem, ...consultationHistory]);

        // Clear form
        setConsultationNote('');
        setDiagnosis('');
        setFollowUpDate('');
        setMedicationsList([]);
        setMedication('');
        setDosage('');
        setFrequency('');
        setDuration('');
        // Clear active appt since it's now COMPLETED
        setActiveAppointmentId(null);
      }

    } catch (error) {
      console.error("Save Error Details:", error.response || error);
      const errorMsg = error.response?.data?.message || 'Failed to save data. Please check if a prescription already exists for this appointment.';
      alert(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div>Loading patient details...</div>;
  if (!patientData) return <div>Patient not found.</div>;

  return (
    <div style={styles.container}>
      <DoctorSidebar onLogout={handleLogout} />

      <div className="main-wrapper">
        <DoctorHeader />

        <main className="content-padding">
          <button onClick={handleBack} style={styles.backButton}>
            <FiArrowLeft style={{ marginRight: '8px' }} />
            Back
          </button>

          <div style={styles.header}>
            <h1 style={styles.pageTitle}>Patient Details</h1>
          </div>

          <div style={styles.contentGrid}>
            {/* Left Column - Patient Info */}
            <div style={styles.leftColumn}>
              <section style={styles.card}>
                <div style={styles.profileHeader}>
                  <div style={styles.avatar}>
                    <FiUser size={36} />
                  </div>
                  <div>
                    <h2 style={styles.patientName}>{patientData.name}</h2>
                    <p style={styles.patientId}>Patient ID: {patientData.id}</p>
                    <p style={styles.patientDob}>Date of Birth: {patientData.dob}</p>
                  </div>
                </div>
              </section>

              <section style={styles.card}>
                <h3 style={styles.cardTitle}>
                  <FiPhone style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  Contact Information
                </h3>
                <div style={styles.infoGrid}>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}><FiPhone size={16} /> Phone</span>
                    <span style={styles.infoValue}>{patientData.contact}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}><FiMail size={16} /> Email</span>
                    <span style={styles.infoValue}>{patientData.email}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}><FiMapPin size={16} /> Address</span>
                    <span style={styles.infoValue}>{patientData.address}</span>
                  </div>
                </div>
              </section>

              <section style={styles.card}>
                <h3 style={styles.cardTitle}>
                  <FiFileText style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  Clinical Summary
                </h3>
                <div style={styles.infoGrid}>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Latest Diagnosis</span>
                    <span style={styles.infoValue}>
                      {consultationHistory.length > 0 
                        ? consultationHistory[0].notes.split('\n')[0].replace('Diagnosis: ', '') 
                        : 'No records available'}
                    </span>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column - Consultation & Prescriptions */}
            <div style={styles.rightColumn}>
              <section style={styles.card}>
                <h3 style={styles.cardTitle}>Consultation History</h3>
                <div style={styles.historyScroll}>
                  {consultationHistory.length === 0 ? (
                    <p style={styles.consultNotes}>No previous consultation history found.</p>
                  ) : (
                    consultationHistory.map((consult) => (
                      <div key={consult.id} style={styles.consultationItem}>
                        <div style={styles.consultHeader}>
                          <span style={styles.doctorName}>{consult.doctor}</span>
                          <span style={styles.consultDate}>{consult.date}</span>
                        </div>
                        <p style={{...styles.consultNotes, whiteSpace: 'pre-wrap'}}>{consult.notes}</p>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section style={styles.card}>
                <h3 style={styles.cardTitle}>New Consultation</h3>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="Diagnosis"
                  style={styles.input}
                />
                <textarea
                  value={consultationNote}
                  onChange={(e) => setConsultationNote(e.target.value)}
                  placeholder="Clinical Notes"
                  style={styles.textarea}
                  rows={3}
                />
                <div style={{ marginTop: '16px' }}>
                  <label style={{ ...styles.infoLabel, marginBottom: '8px' }}>Follow-up Date (Optional)</label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    style={{ ...styles.input, marginBottom: 0 }}
                  />
                </div>
              </section>

              <section style={styles.card}>
                <h3 style={styles.cardTitle}>Prescribe Medications</h3>
                
                {/* Medication List Display */}
                {medicationsList.length > 0 && (
                  <div style={styles.addedMedsContainer}>
                    {medicationsList.map(m => (
                      <div key={m.id} style={styles.medTag}>
                        <span>{m.name} - {m.dosage} ({m.frequency}) for {m.duration}</span>
                        <button onClick={() => handleRemoveMedication(m.id)} style={styles.removeMedBtn}>
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div style={styles.medsInputGrid}>
                  <input
                    type="text"
                    value={medication}
                    onChange={(e) => setMedication(e.target.value)}
                    placeholder="Medication Name"
                    style={{...styles.input, marginBottom: 0}}
                  />
                  <input
                    type="text"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="Dosage"
                    style={{...styles.input, marginBottom: 0}}
                  />
                  <input
                    type="text"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    placeholder="Frequency"
                    style={{...styles.input, marginBottom: 0}}
                  />
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="Duration"
                    style={{...styles.input, marginBottom: 0}}
                  />
                  <button onClick={handleAddMedication} style={styles.addMedBtn}>
                    <FiPlus style={{marginRight: '4px'}} /> Add
                  </button>
                </div>

                <button 
                  onClick={handleSaveConsultation} 
                  disabled={isSaving}
                  style={{...styles.saveButton, opacity: isSaving ? 0.7 : 1}}
                >
                  {isSaving ? 'Saving...' : 'Complete Consultation'}
                </button>
              </section>
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
    minHeight: '100vh',
    backgroundColor: '#F3F4F6'
  },
  mainWrapper: {
    // Handled by .main-wrapper
  },
  mainContent: {
    // Handled by .content-padding
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    background: 'none',
    border: 'none',
    color: '#4B5563',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '24px'
  },
  header: {
    marginBottom: '32px'
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#111827'
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: '350px 1fr',
    gap: '32px'
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  avatar: {
    width: '64px',
    height: '64px',
    borderRadius: '16px',
    backgroundColor: '#E6F2FF',
    color: '#0066CC',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  patientName: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#111827',
    margin: 0
  },
  patientId: {
    fontSize: '14px',
    color: '#6B7280',
    margin: '4px 0 0 0'
  },
  patientDob: {
    fontSize: '14px',
    color: '#6B7280',
    margin: '2px 0 0 0'
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center'
  },
  infoGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  infoLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  infoValue: {
    fontSize: '15px',
    color: '#374151',
    fontWeight: '500'
  },
  historyScroll: {
    maxHeight: '400px',
    overflowY: 'auto',
    paddingRight: '8px'
  },
  consultationItem: {
    padding: '16px',
    borderRadius: '12px',
    backgroundColor: '#F9FAFB',
    marginBottom: '16px',
    border: '1px solid #F3F4F6'
  },
  consultHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  doctorName: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#111827'
  },
  consultDate: {
    fontSize: '12px',
    color: '#6B7280'
  },
  consultNotes: {
    fontSize: '14px',
    color: '#4B5563',
    lineHeight: 1.5,
    margin: 0
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid #E5E7EB',
    fontSize: '15px',
    marginBottom: '16px',
    outline: 'none'
  },
  textarea: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid #E5E7EB',
    fontSize: '15px',
    fontFamily: 'inherit',
    outline: 'none',
    resize: 'vertical'
  },
  medsInputGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr 100px',
    gap: '12px',
    marginBottom: '24px'
  },
  addMedBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0066CC',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  addedMedsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '20px'
  },
  medTag: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: '#F0F7FF',
    color: '#0066CC',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600'
  },
  removeMedBtn: {
    background: 'none',
    border: 'none',
    color: '#EF4444',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center'
  },
  saveButton: {
    width: '100%',
    padding: '16px',
    backgroundColor: '#10B981',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s'
  }
};

export default PatientDetailsDoctor;
