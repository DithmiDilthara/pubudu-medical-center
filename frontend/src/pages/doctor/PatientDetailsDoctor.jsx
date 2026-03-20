import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiArrowLeft, FiUser, FiPhone, FiMail, FiMapPin, 
  FiFileText, FiPlus, FiTrash2, FiCalendar, FiActivity,
  FiDroplet, FiAlertCircle, FiChevronRight, FiX
} from 'react-icons/fi';
import { GiPill } from 'react-icons/gi';
import DoctorHeader from '../../components/DoctorHeader';
import DoctorSidebar from '../../components/DoctorSidebar';

function PatientDetailsDoctor() {
  const navigate = useNavigate();
  const location = useLocation();
  const rawId = location.state?.patientId || location.state?.patient?.patient_id || '';
  const patientId = rawId.toString().replace('PHE-', '');
  const appointment_id = location.state?.appointment_id || null;

  const [activeTab, setActiveTab] = useState('history');
  const [patientData, setPatientData] = useState(null);
  const [history, setHistory] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);
  const [followups, setFollowups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorStatus, setErrorStatus] = useState(null);

  // Form states for Consultation
  const [consultationData, setConsultationData] = useState({
    diagnosis: '',
    prescription: [{ name: '', dosage: '', frequency: 'Once daily', duration: '', instructions: '' }],
    notes: '',
    follow_up_date: ''
  });

  // Modal states
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showDiagnosisModal, setShowDiagnosisModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showFollowupModal, setShowFollowupModal] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      if (!patientId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setErrorStatus(null);
      try {
        const token = localStorage.getItem('token');
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

        // 1. Fetch Demographics
        try {
          const profileRes = await axios.get(`${baseUrl}/doctors/patient/${patientId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (profileRes.data.success) setPatientData(profileRes.data.data);
        } catch (err) {
          if (err.response?.status === 404) {
            setErrorStatus(404);
            setIsLoading(false);
            return;
          }
          throw err;
        }

        // 2. Fetch Clinical History
        const historyRes = await axios.get(`${baseUrl}/clinical/history/${patientId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (historyRes.data.success) {
          setHistory(historyRes.data.data);
          
          const allPrescriptions = historyRes.data.data.flatMap(h => {
             if (!h.prescription) return [];
             const lines = h.prescription.split('\n').filter(l => l.trim());
             return lines.map(line => ({
                id: h.record_id,
                name: line.split('(')[0].trim(),
                dosage: line.match(/\(([^)]+)\)/)?.[1] || 'Standard',
                instructions: h.notes,
                date: h.record_date
             }));
          });
          setPrescriptions(allPrescriptions);

          const allDiagnoses = historyRes.data.data.map(h => ({
            id: h.record_id,
            condition: h.diagnosis,
            severity: 'Diagnostic Record', 
            date: h.record_date,
            code: 'ICD-10'
          }));
          setDiagnoses(allDiagnoses);

          const allFollowups = historyRes.data.data.filter(h => h.follow_up_date).map(h => ({
            id: h.record_id,
            date: h.follow_up_date,
            reason: 'Follow-up Consultation',
            status: 'Recorded',
            notes: h.notes
          }));
          setFollowups(allFollowups);
        }

      } catch (error) {
        console.error("Error fetching patient details:", error);
        setErrorStatus(error.response?.status || 500);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [patientId]);

  const handleSaveConsultation = async () => {
    if (!consultationData.diagnosis && consultationData.prescription.every(p => !p.name)) {
      alert("Please add at least a diagnosis or a prescription.");
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

      const prescriptionString = consultationData.prescription
        .filter(p => p.name.trim())
        .map(p => `${p.name} (${p.dosage}) - ${p.frequency} for ${p.duration}. ${p.instructions}`.trim())
        .join('\n');

      const payload = {
        appointment_id,
        patient_id: patientId,
        diagnosis: consultationData.diagnosis,
        notes: consultationData.notes,
        prescription: prescriptionString,
        follow_up_date: consultationData.follow_up_date || null
      };

      const response = await axios.post(`${baseUrl}/clinical/record`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        alert("Consultation records saved successfully!");
        setConsultationData({
          diagnosis: '',
          prescription: [{ name: '', dosage: '', frequency: 'Once daily', duration: '', instructions: '' }],
          notes: '',
          follow_up_date: ''
        });
        window.location.reload();
      }
    } catch (error) {
      console.error("Error saving consultation:", error);
      alert("Failed to save consultation records.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddMedicine = () => {
    setConsultationData(prev => ({
      ...prev,
      prescription: [...prev.prescription, { name: '', dosage: '', frequency: 'Once daily', duration: '', instructions: '' }]
    }));
  };

  const handleRemoveMedicine = (index) => {
    const newPresc = [...consultationData.prescription];
    newPresc.splice(index, 1);
    setConsultationData(prev => ({ ...prev, prescription: newPresc }));
  };

  const tabs = [
    { id: 'history', label: 'Medical History', icon: <FiActivity /> },
    { id: 'prescriptions', label: 'Prescriptions', icon: <GiPill /> },
    { id: 'diagnosis', label: 'Diagnosis & Notes', icon: <FiFileText /> },
    { id: 'followups', label: 'Follow-ups', icon: <FiCalendar /> }
  ];

  const getQuickActionStyle = (isActive) => ({
    ...styles.actionBtnQuick,
    backgroundColor: isActive ? '#2563EB' : '#EFF6FF',
    color: isActive ? 'white' : '#2563EB',
    borderColor: isActive ? '#1D4ED8' : 'transparent'
  });

  if (isLoading) return <div style={styles.loading}>Loading Patient Data...</div>;

  if (errorStatus === 404 || !patientId) {
    return (
      <div style={styles.container}>
        <DoctorSidebar />
        <div className="main-wrapper">
          <DoctorHeader />
          <div style={styles.errorContainer}>
            <FiAlertCircle size={48} color="#EF4444" />
            <h2 style={styles.errorTitle}>Patient Not Found</h2>
            <p style={styles.errorText}>The patient record you are looking for does not exist or has been removed.</p>
            <button onClick={() => navigate('/doctor/patients')} style={styles.actionBtnBlue}>
              <FiArrowLeft /> Back to Patient Directory
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (errorStatus) {
    return (
      <div style={styles.container}>
        <DoctorSidebar />
        <div className="main-wrapper">
          <DoctorHeader />
          <div style={styles.errorContainer}>
            <FiAlertCircle size={48} color="#EF4444" />
            <h2 style={styles.errorTitle}>Error Loading Data</h2>
            <p style={styles.errorText}>An error occurred while fetching patient details. Please try again later.</p>
            <button onClick={() => window.location.reload()} style={styles.secondaryBtn}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!patientData) return <div style={styles.loading}>Patient data unavailable.</div>;

  return (
    <div style={styles.container}>
      <DoctorSidebar />
      <div className="main-wrapper">
        <DoctorHeader />
        
        <header style={styles.patientHeader}>
          <div style={styles.headerContent}>
            <div style={styles.headerLeft}>
              <button onClick={() => navigate('/doctor/patients')} style={styles.backLink}>
                <FiArrowLeft /> Back to Patients
              </button>
              <div style={styles.patientIdentity}>
                <div style={styles.avatarLarge}>
                  {patientData.name.charAt(0)}
                </div>
                <div style={styles.patientMeta}>
                  <h1 style={styles.patientName}>{patientData.name}</h1>
                  <div style={styles.infoRow}>
                    <span style={styles.infoPill}>
                      <FiUser style={{ color: '#2563EB' }} /> 
                      {patientData.dob ? `${new Date().getFullYear() - new Date(patientData.dob).getFullYear()} yrs • ${patientData.gender}` : 'N/A'}
                    </span>
                    <span style={styles.bloodPill}>
                      <FiDroplet style={{ color: '#EF4444' }} /> 
                      Blood: {patientData.blood_group || 'N/A'}
                    </span>
                    <span style={styles.allergiesPill}>
                      <FiAlertCircle style={{ color: '#B45309' }} /> 
                      Allergies: {patientData.allergies || 'None recorded'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div style={styles.headerRight}>
              <div style={styles.headerActions}>
                <button 
                  onClick={() => setShowDiagnosisModal(true)} 
                  style={getQuickActionStyle(consultationData.diagnosis)}
                  className="quick-action-btn"
                >
                  <FiActivity /> Diagnosis
                </button>
                <button 
                  onClick={() => setShowPrescriptionModal(true)} 
                  style={getQuickActionStyle(consultationData.prescription.some(p => p.name))}
                  className="quick-action-btn"
                >
                  <GiPill /> Prescription
                </button>
                <button 
                  onClick={() => setShowNoteModal(true)} 
                  style={getQuickActionStyle(consultationData.notes)}
                  className="quick-action-btn"
                >
                  <FiFileText /> Notes
                </button>
                <button 
                  onClick={() => setShowFollowupModal(true)} 
                  style={getQuickActionStyle(consultationData.follow_up_date)}
                  className="quick-action-btn"
                >
                  <FiCalendar /> Follow Up
                </button>
              </div>
              <button 
                onClick={handleSaveConsultation} 
                style={styles.actionBtnBlue}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Consultation'}
              </button>
            </div>
          </div>

          <nav style={styles.tabNav}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  ...styles.tabItem,
                  color: activeTab === tab.id ? '#2563EB' : '#64748B'
                }}
              >
                {tab.icon} {tab.label}
                {activeTab === tab.id && (
                  <motion.div layoutId="patient-tab" style={styles.tabUnderline} />
                )}
              </button>
            ))}
          </nav>
        </header>

        <main style={styles.tabContent}>
          <div style={styles.maxContainer}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'history' && (
                  <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>Visit Timeline</h2>
                    <div style={styles.timeline}>
                      {history.length > 0 ? history.map((visit, index) => (
                        <motion.div 
                          key={visit.record_id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          style={styles.timelineItem}
                        >
                          <div style={styles.timelineNode} />
                          <div style={styles.timelineCard}>
                            <span style={styles.timelineDate}>
                              {new Date(visit.record_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                            <h3 style={styles.timelineDiagnosis}>{visit.diagnosis}</h3>
                            <p style={styles.timelineNotes}>{visit.notes}</p>
                            {visit.prescription && (
                              <div style={styles.timelinePresc}>
                                <GiPill /> {visit.prescription.split('\n').map((l, i) => <div key={i}>{l}</div>)}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )) : <p style={styles.emptyState}>No past visits recorded.</p>}
                    </div>
                  </div>
                )}

                {activeTab === 'prescriptions' && (
                  <div style={styles.section}>
                    <div style={styles.sectionHeader}>
                      <h2 style={styles.sectionTitle}>Prescription History</h2>
                    </div>
                    <div style={styles.cardGrid}>
                      {prescriptions.length > 0 ? prescriptions.map((p, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          style={styles.prescriptionCard}
                        >
                          <div style={styles.prescIcon}>
                            <GiPill size={20} />
                          </div>
                          <div style={styles.prescDetails}>
                            <h3 style={styles.prescName}>{p.name}</h3>
                            <p style={styles.prescUsage}>{p.dosage}</p>
                            <div style={styles.instrBadge}>{p.instructions}</div>
                          </div>
                          <span style={styles.prescDate}>
                            {new Date(p.date).toLocaleDateString()}
                          </span>
                        </motion.div>
                      )) : <p style={styles.emptyState}>No prescriptions found.</p>}
                    </div>
                  </div>
                )}

                {activeTab === 'diagnosis' && (
                  <div style={styles.twoColumnGrid}>
                    <div style={styles.column}>
                      <div style={styles.sectionHeader}>
                        <h2 style={styles.sectionTitle}>Diagnoses</h2>
                      </div>
                      {diagnoses.length > 0 ? diagnoses.map((d, idx) => (
                        <div key={idx} style={styles.diagnosisCard}>
                          <div style={styles.diagHeader}>
                            <h3 style={styles.diagTitle}>{d.condition}</h3>
                            <span style={styles.severityTag}>Recorded</span>
                          </div>
                          <div style={styles.diagFooter}>
                            <span>{d.code}</span>
                            <span>{new Date(d.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      )) : <p style={styles.emptyState}>No diagnoses recorded.</p>}
                    </div>
                    <div style={styles.column}>
                      <div style={styles.sectionHeader}>
                        <h2 style={styles.sectionTitle}>Medical Notes</h2>
                      </div>
                      {history.length > 0 ? history.map((n, idx) => (
                        <div key={idx} style={styles.noteCard}>
                          <span style={styles.noteType}>CLINICAL NOTE</span>
                          <span style={styles.noteDate}>{new Date(n.record_date).toLocaleDateString()}</span>
                          <p style={styles.noteText}>{n.notes}</p>
                        </div>
                      )) : <p style={styles.emptyState}>No clinical notes.</p>}
                    </div>
                  </div>
                )}

                {activeTab === 'followups' && (
                  <div style={styles.section}>
                    <div style={styles.sectionHeader}>
                      <h2 style={styles.sectionTitle}>Follow-up Records</h2>
                    </div>
                    <div style={styles.followupList}>
                      {followups.length > 0 ? followups.map((f, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          style={styles.followupCard}
                        >
                          <div style={styles.dateBlock}>
                            <span style={styles.month}>{new Date(f.date).toLocaleString('default', { month: 'short' }).toUpperCase()}</span>
                            <span style={styles.day}>{new Date(f.date).getDate()}</span>
                          </div>
                          <div style={styles.followupBody}>
                            <h3 style={styles.followupReason}>{f.reason}</h3>
                            <p style={styles.followupNotes}>{f.notes}</p>
                          </div>
                          <div style={styles.statusBadgeScheduled}>{f.status}</div>
                        </motion.div>
                      )) : <p style={styles.emptyState}>No follow-ups recorded.</p>}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      <AnimatePresence>
        {(showPrescriptionModal || showDiagnosisModal || showNoteModal || showFollowupModal) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.modalOverlay}
            onClick={() => {
              setShowPrescriptionModal(false);
              setShowDiagnosisModal(false);
              setShowNoteModal(false);
              setShowFollowupModal(false);
            }}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{
                ...styles.modalContainer,
                maxWidth: showPrescriptionModal ? '800px' : '500px'
              }}
              onClick={e => e.stopPropagation()}
            >
              <div style={styles.modalHeader}>
                <h3 style={styles.modalTitle}>
                  {showPrescriptionModal && 'Build Prescription'}
                  {showDiagnosisModal && 'Add Diagnosis'}
                  {showNoteModal && 'Add Medical Note'}
                  {showFollowupModal && 'Schedule Follow-up'}
                </h3>
                <button onClick={() => {
                   setShowPrescriptionModal(false);
                   setShowDiagnosisModal(false);
                   setShowNoteModal(false);
                   setShowFollowupModal(false);
                }} style={styles.closeBtn}><FiX /></button>
              </div>
              
              <div style={styles.modalBody}>
                {showPrescriptionModal && <div style={styles.form}>
                  {consultationData.prescription.map((med, idx) => (
                    <div key={idx} style={styles.medicineEntry}>
                       <div style={styles.medicineHeader}>
                         <h4 style={styles.medTitle}>Medicine #{idx + 1}</h4>
                         {consultationData.prescription.length > 1 && (
                            <button onClick={() => handleRemoveMedicine(idx)} style={styles.removeMedBtn}>
                              <FiTrash2 /> Remove
                            </button>
                         )}
                       </div>
                       <div style={styles.formGrid}>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Medication Name</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Paracetamol" 
                            style={styles.formInput} 
                            value={med.name}
                            onChange={(e) => {
                              const newP = [...consultationData.prescription];
                              newP[idx].name = e.target.value;
                              setConsultationData(prev => ({ ...prev, prescription: newP }));
                            }}
                          />
                        </div>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Dosage</label>
                          <input 
                            type="text" 
                            placeholder="500mg" 
                            style={styles.formInput} 
                            value={med.dosage}
                            onChange={(e) => {
                              const newP = [...consultationData.prescription];
                              newP[idx].dosage = e.target.value;
                              setConsultationData(prev => ({ ...prev, prescription: newP }));
                            }}
                          />
                        </div>
                      </div>
                      <div style={styles.formGrid}>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Frequency</label>
                          <select 
                            style={styles.formInput}
                            value={med.frequency}
                            onChange={(e) => {
                              const newP = [...consultationData.prescription];
                              newP[idx].frequency = e.target.value;
                              setConsultationData(prev => ({ ...prev, prescription: newP }));
                            }}
                          >
                            <option>Once daily</option>
                            <option>Twice daily</option>
                            <option>Three times daily</option>
                            <option>Four times daily</option>
                            <option>As needed</option>
                          </select>
                        </div>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Duration</label>
                          <input 
                            type="text" 
                            placeholder="7 days" 
                            style={styles.formInput} 
                            value={med.duration}
                            onChange={(e) => {
                              const newP = [...consultationData.prescription];
                              newP[idx].duration = e.target.value;
                              setConsultationData(prev => ({ ...prev, prescription: newP }));
                            }}
                          />
                        </div>
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Special Instructions</label>
                        <input 
                          type="text" 
                          placeholder="Take after food..." 
                          style={styles.formInput}
                          value={med.instructions}
                          onChange={(e) => {
                            const newP = [...consultationData.prescription];
                            newP[idx].instructions = e.target.value;
                            setConsultationData(prev => ({ ...prev, prescription: newP }));
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  <button onClick={handleAddMedicine} style={styles.addMedBtn}>
                    <FiPlus /> Add Another Medicine
                  </button>
                </div>}

                {showNoteModal && <div style={styles.form}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Note Content</label>
                    <textarea 
                      rows={8} 
                      placeholder="Type your patient notes here..." 
                      style={styles.formTextarea} 
                      value={consultationData.notes}
                      onChange={(e) => setConsultationData(prev => ({ ...prev, notes: e.target.value }))}
                    />
                  </div>
                </div>}

                {showDiagnosisModal && <div style={styles.form}>
                   <div style={styles.formGroup}>
                    <label style={styles.label}>Condition / Diagnosis</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Hypertension" 
                      style={styles.formInput} 
                      value={consultationData.diagnosis}
                      onChange={(e) => setConsultationData(prev => ({ ...prev, diagnosis: e.target.value }))}
                    />
                  </div>
                </div>}

                {showFollowupModal && <div style={styles.form}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Follow-up Date</label>
                    <input 
                      type="date" 
                      style={styles.formInput} 
                      value={consultationData.follow_up_date}
                      onChange={(e) => setConsultationData(prev => ({ ...prev, follow_up_date: e.target.value }))}
                    />
                  </div>
                </div>}
              </div>

              <div style={styles.modalFooter}>
                <button onClick={() => {
                   setShowPrescriptionModal(false);
                   setShowDiagnosisModal(false);
                   setShowNoteModal(false);
                   setShowFollowupModal(false);
                }} style={styles.secondaryBtn}>Close</button>
                <button 
                  onClick={() => {
                    setShowPrescriptionModal(false);
                    setShowDiagnosisModal(false);
                    setShowNoteModal(false);
                    setShowFollowupModal(false);
                  }} 
                  style={styles.primaryBtn}
                > Done </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .quick-action-btn { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
        .quick-action-btn:hover {
          background-color: #2563EB !important;
          color: white !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: { display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC' },
  loading: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#64748B' },
  errorContainer: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 40px', textAlign: 'center', gap: '20px' },
  errorTitle: { fontSize: '2rem', fontWeight: '800', color: '#0F172A', margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" },
  errorText: { fontSize: '1.1rem', color: '#64748B', maxWidth: '500px', lineHeight: 1.6, margin: 0 },
  patientHeader: { backgroundColor: 'white', borderBottom: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 10 },
  headerContent: { maxWidth: '1400px', margin: '0 auto', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { display: 'flex', flexDirection: 'column', gap: '12px' },
  headerRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '16px' },
  backLink: { display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', background: 'none', border: 'none', fontSize: '0.9rem', cursor: 'pointer', fontWeight: '500', transition: 'color 0.2s', width: 'fit-content' },
  patientIdentity: { display: 'flex', alignItems: 'center', gap: '20px' },
  avatarLarge: { width: '72px', height: '72px', borderRadius: '18px', background: 'linear-gradient(135deg, #DBEAFE 0%, #EFF6FF 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: '800', color: '#2563EB', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.1)', fontFamily: "'Plus Jakarta Sans', sans-serif" },
  patientName: { fontSize: '1.75rem', fontWeight: '800', color: '#0F172A', margin: 0, letterSpacing: '-0.02em', fontFamily: "'Plus Jakarta Sans', sans-serif" },
  infoRow: { display: 'flex', gap: '12px', marginTop: '8px', fontFamily: "'Inter', sans-serif" },
  infoPill: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#1E293B', backgroundColor: '#F1F5F9', padding: '6px 14px', borderRadius: '100px', fontWeight: '700' },
  bloodPill: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#1E293B', backgroundColor: '#FEF2F2', padding: '6px 14px', borderRadius: '100px', fontWeight: '700' },
  allergiesPill: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#92400E', backgroundColor: '#FEF3C7', padding: '6px 14px', borderRadius: '100px', fontWeight: '700' },
  headerActions: { display: 'flex', gap: '10px' },
  actionBtnQuick: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '12px', border: '2px solid transparent', fontWeight: '700', cursor: 'pointer', fontSize: '0.875rem', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', fontFamily: "'Inter', sans-serif" },
  actionBtnBlue: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '14px', backgroundColor: '#2563EB', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '0.95rem', boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.39)', transition: 'all 0.2s', fontFamily: "'Inter', sans-serif" },
  tabNav: { maxWidth: '1400px', margin: '0 auto', padding: '0 32px', display: 'flex', gap: '40px' },
  tabItem: { 
    padding: '16px 0', 
    fontSize: '0.9rem', 
    fontWeight: '700', 
    border: 'none', 
    background: 'none', 
    cursor: 'pointer', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    position: 'relative', 
    transition: 'color 0.2s', 
    textTransform: 'uppercase', 
    letterSpacing: '0.5px',
    outline: 'none', // Remove ugly outline
    fontFamily: "'Inter', sans-serif"
  },
  tabUnderline: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', backgroundColor: '#2563EB', borderRadius: '3px 3px 0 0' },
  tabContent: { backgroundColor: '#F8FAFC', minHeight: 'calc(100vh - 200px)', padding: '40px 0' },
  maxContainer: { maxWidth: '1024px', margin: '0 auto', padding: '0 32px' },
  section: { display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: "'Inter', sans-serif" },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  sectionTitle: { fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" },
  timeline: { position: 'relative', paddingLeft: '32px', borderLeft: '2px solid #E2E8F0', marginLeft: '8px', display: 'flex', flexDirection: 'column', gap: '32px' },
  timelineItem: { position: 'relative' },
  timelineNode: { position: 'absolute', left: '-41px', top: '24px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#2563EB', border: '4px solid white', boxShadow: '0 0 0 2px #E0E7FF' },
  timelineCard: { backgroundColor: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #F1F5F9', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' },
  timelineDate: { fontSize: '0.9rem', color: '#2563EB', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.02em', display: 'block', marginBottom: '8px' },
  timelineDiagnosis: { fontSize: '1.2rem', fontWeight: '800', color: '#0F172A', margin: '0 0 12px 0' },
  timelineNotes: { fontSize: '0.95rem', color: '#475569', lineHeight: 1.6, margin: 0 },
  timelinePresc: { marginTop: '16px', padding: '12px 20px', backgroundColor: '#F8FAFC', borderRadius: '14px', fontSize: '0.9rem', color: '#2563EB', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '600' },
  cardGrid: { display: 'flex', flexDirection: 'column', gap: '16px' },
  prescriptionCard: { backgroundColor: 'white', padding: '24px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '24px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #F1F5F9' },
  prescIcon: { width: '56px', height: '56px', borderRadius: '16px', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  prescDetails: { flex: 1 },
  prescName: { fontSize: '1.1rem', fontWeight: '800', margin: 0, color: '#0F172A' },
  prescUsage: { fontSize: '0.9rem', color: '#64748B', margin: '4px 0 8px 0', fontWeight: '600' },
  instrBadge: { display: 'inline-block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', backgroundColor: '#F1F5F9', padding: '6px 12px', borderRadius: '8px' },
  prescDate: { fontSize: '0.85rem', color: '#94A3B8', fontWeight: '600' },
  twoColumnGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px' },
  column: { display: 'flex', flexDirection: 'column', gap: '20px' },
  diagnosisCard: { backgroundColor: 'white', padding: '24px', borderRadius: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #F1F5F9' },
  diagHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  diagTitle: { fontSize: '1.1rem', fontWeight: '800', margin: 0 },
  severityTag: { fontSize: '0.75rem', fontWeight: '800', color: '#1E40AF', backgroundColor: '#DBEAFE', padding: '4px 12px', borderRadius: '100px', textTransform: 'uppercase' },
  diagFooter: { display: 'flex', justifyContent: 'space-between', marginTop: '16px', fontSize: '0.8rem', color: '#94A3B8', fontWeight: '700' },
  noteCard: { backgroundColor: 'white', padding: '24px', borderRadius: '24px', borderLeft: '5px solid #3B82F6', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' },
  noteType: { fontSize: '0.75rem', fontWeight: '800', color: '#2563EB', letterSpacing: '0.1em' },
  noteDate: { display: 'block', fontSize: '0.85rem', color: '#94A3B8', marginTop: '6px', fontWeight: '600' },
  noteText: { fontSize: '0.95rem', color: '#334155', lineHeight: 1.7, marginTop: '14px', margin: '14px 0 0 0' },
  followupList: { display: 'flex', flexDirection: 'column', gap: '16px' },
  followupCard: { backgroundColor: 'white', padding: '24px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '24px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #F1F5F9' },
  dateBlock: { width: '64px', height: '64px', borderRadius: '16px', backgroundColor: '#EFF6FF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#2563EB' },
  month: { fontSize: '0.75rem', fontWeight: '900' },
  day: { fontSize: '1.5rem', fontWeight: '900' },
  followupBody: { flex: 1 },
  followupReason: { fontSize: '1.1rem', fontWeight: '800', margin: 0, color: '#0F172A' },
  followupNotes: { fontSize: '0.9rem', color: '#64748B', marginTop: '4px', fontWeight: '500' },
  statusBadgeScheduled: { fontSize: '0.8rem', fontWeight: '800', padding: '6px 14px', borderRadius: '100px', backgroundColor: '#ECFDF5', color: '#059669', textTransform: 'uppercase' },
  emptyState: { 
    textAlign: 'center', 
    padding: '60px 40px', 
    color: '#64748B', 
    fontWeight: '500', 
    fontSize: '1rem',
    backgroundColor: 'white',
    borderRadius: '24px',
    border: '1px solid #E2E8F0',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    margin: '20px 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '160px'
  },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px', fontFamily: "'Inter', sans-serif" },
  modalContainer: { backgroundColor: 'white', borderRadius: '28px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255,255,255,0.1)' },
  modalHeader: { padding: '24px 32px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: '1.5rem', fontWeight: '800', color: '#0F172A', margin: 0, letterSpacing: '-0.02em', fontFamily: "'Plus Jakarta Sans', sans-serif" },
  closeBtn: { backgroundColor: '#F1F5F9', border: 'none', borderRadius: '12px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', cursor: 'pointer', color: '#64748B', transition: 'all 0.2s' },
  modalBody: { padding: '32px', overflowY: 'auto', flex: 1 },
  form: { display: 'flex', flexDirection: 'column', gap: '24px' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '10px' },
  label: { fontSize: '0.9rem', fontWeight: '700', color: '#475569', marginLeft: '4px' },
  formInput: { padding: '14px 18px', borderRadius: '14px', border: '1px solid #E2E8F0', fontSize: '1rem', outline: 'none', transition: 'all 0.2s', backgroundColor: '#F8FAFC', ':focus': { borderColor: '#2563EB', backgroundColor: 'white', boxShadow: '0 0 0 4px rgba(37, 99, 235, 0.1)' } },
  formTextarea: { padding: '18px', borderRadius: '16px', border: '1px solid #E2E8F0', fontSize: '1rem', outline: 'none', resize: 'none', transition: 'all 0.2s', backgroundColor: '#F8FAFC', lineHeight: 1.6 },
  modalFooter: { padding: '24px 32px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'flex-end', gap: '12px' },
  primaryBtn: { padding: '12px 28px', borderRadius: '12px', backgroundColor: '#2563EB', color: 'white', border: 'none', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 10px rgba(37, 99, 235, 0.2)' },
  secondaryBtn: { padding: '12px 28px', borderRadius: '12px', backgroundColor: '#F1F5F9', color: '#475569', border: 'none', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s' },
  medicineEntry: { padding: '24px', backgroundColor: '#F8FAFC', borderRadius: '20px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '16px' },
  medicineHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  medTitle: { margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#0F172A' },
  removeMedBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '10px', backgroundColor: '#FEF2F2', color: '#EF4444', border: 'none', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' },
  addMedBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '16px', borderRadius: '16px', border: '2px dashed #CBD5E1', backgroundColor: 'transparent', color: '#64748B', fontSize: '1rem', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', ':hover': { borderColor: '#2563EB', color: '#2563EB', backgroundColor: '#EFF6FF' } }
};

export default PatientDetailsDoctor;
