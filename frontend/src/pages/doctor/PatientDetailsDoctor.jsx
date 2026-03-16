import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiArrowLeft, FiUser, FiPhone, FiMail, FiMapPin, 
  FiFileText, FiPlus, FiTrash2, FiCalendar, FiActivity,
  FiDroplet, FiAlertCircle, FiChevronRight, FiX
} from 'react-icons/fi';
import { GiPill } from 'react-icons/gi'; // Using GiPill for a better pill icon
import DoctorHeader from '../../components/DoctorHeader';
import DoctorSidebar from '../../components/DoctorSidebar';

function PatientDetailsDoctor() {
  const navigate = useNavigate();
  const location = useLocation();
  const rawId = location.state?.patientId || '1';
  const patientId = rawId.toString().replace('PHE-', '');

  const [activeTab, setActiveTab] = useState('history');
  const [patientData, setPatientData] = useState(null);
  const [history, setHistory] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);
  const [followups, setFollowups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showDiagnosisModal, setShowDiagnosisModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showFollowupModal, setShowFollowupModal] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

        // 1. Fetch Demographics
        const profileRes = await axios.get(`${baseUrl}/doctors/patient/${patientId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (profileRes.data.success) setPatientData(profileRes.data.data);

        // 2. Fetch Clinical History (Visits/Timeline)
        const historyRes = await axios.get(`${baseUrl}/clinical/history/${patientId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (historyRes.data.success) {
          setHistory(historyRes.data.data);
          // Extract prescriptions and diagnoses from history for initial view
          const allPrescriptions = historyRes.data.data.filter(h => h.medications).map(h => ({
            id: h.prescription_id,
            name: h.medications.split('\n')[0],
            dosage: 'Standard', // Placeholder since old format was just a string
            instructions: h.notes,
            date: h.created_at
          }));
          setPrescriptions(allPrescriptions);

          const allDiagnoses = historyRes.data.data.map(h => ({
            id: h.prescription_id,
            condition: h.diagnosis,
            severity: 'Moderate', // Default
            date: h.created_at,
            code: 'ICD-10'
          }));
          setDiagnoses(allDiagnoses);
        }

        // 3. Fetch Follow-ups (Mocked for now as per plan, assuming backend might not have it yet)
        setFollowups([
          { id: 1, date: '2024-03-25', reason: 'Routine Checkup', status: 'Scheduled', notes: 'Check blood pressure levels' }
        ]);

      } catch (error) {
        console.error("Error fetching patient details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (patientId) fetchAllData();
  }, [patientId]);

  const tabs = [
    { id: 'history', label: 'Medical History', icon: <FiActivity /> },
    { id: 'prescriptions', label: 'Prescriptions', icon: <GiPill /> },
    { id: 'diagnosis', label: 'Diagnosis & Notes', icon: <FiFileText /> },
    { id: 'followups', label: 'Follow-ups', icon: <FiCalendar /> }
  ];

  if (isLoading) return <div style={styles.loading}>Loading Patient Data...</div>;
  if (!patientData) return <div style={styles.loading}>Patient not found.</div>;

  return (
    <div style={styles.container}>
      <DoctorSidebar />
      <div className="main-wrapper">
        <DoctorHeader />
        
        {/* Sticky-ish Header */}
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
                    <span style={styles.infoPill}><FiUser /> 45 yrs • Male</span>
                    <span style={styles.infoPill}><FiDroplet color="#EF4444" /> Blood: O+</span>
                    <span style={styles.alertBadge}><FiAlertCircle /> Allergies: Penicillin</span>
                  </div>
                </div>
              </div>
            </div>
            <div style={styles.headerActions}>
              <button onClick={() => setShowPrescriptionModal(true)} style={styles.actionBtnLight}>
                <GiPill /> Prescription
              </button>
              <button onClick={() => setShowNoteModal(true)} style={styles.actionBtnLight}>
                <FiFileText /> Note
              </button>
              <button onClick={() => setShowFollowupModal(true)} style={styles.actionBtnBlue}>
                <FiCalendar /> Follow-up
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
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

        {/* Tab Content Area */}
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
                          key={visit.prescription_id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          style={styles.timelineItem}
                        >
                          <div style={styles.timelineNode} />
                          <div style={styles.timelineCard}>
                            <span style={styles.timelineDate}>
                              {new Date(visit.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                            <h3 style={styles.timelineDiagnosis}>{visit.diagnosis}</h3>
                            <p style={styles.timelineNotes}>{visit.notes}</p>
                          </div>
                        </motion.div>
                      )) : <p style={styles.emptyState}>No past visits recorded.</p>}
                    </div>
                  </div>
                )}

                {activeTab === 'prescriptions' && (
                  <div style={styles.section}>
                    <div style={styles.sectionHeader}>
                      <h2 style={styles.sectionTitle}>Active Prescriptions</h2>
                      <button style={styles.addLink} onClick={() => setShowPrescriptionModal(true)}>+ Add New</button>
                    </div>
                    <div style={styles.cardGrid}>
                      {prescriptions.length > 0 ? prescriptions.map((p, idx) => (
                        <motion.div 
                          key={p.id}
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
                            <p style={styles.prescUsage}>{p.dosage} • Twice Daily</p>
                            <div style={styles.instrBadge}>Take after meals</div>
                          </div>
                          <span style={styles.prescDate}>
                            {new Date(p.date).toLocaleDateString()}
                          </span>
                        </motion.div>
                      )) : <p style={styles.emptyState}>No active prescriptions.</p>}
                    </div>
                  </div>
                )}

                {activeTab === 'diagnosis' && (
                  <div style={styles.twoColumnGrid}>
                    <div style={styles.column}>
                      <div style={styles.sectionHeader}>
                        <h2 style={styles.sectionTitle}>Diagnoses</h2>
                        <button style={styles.addLink} onClick={() => setShowDiagnosisModal(true)}>+ Add</button>
                      </div>
                      {diagnoses.map((d, idx) => (
                        <div key={d.id} style={styles.diagnosisCard}>
                          <div style={styles.diagHeader}>
                            <h3 style={styles.diagTitle}>{d.condition}</h3>
                            <span style={styles.severityTag}>Moderate</span>
                          </div>
                          <p style={styles.diagBody}>Chronic condition monitoring required.</p>
                          <div style={styles.diagFooter}>
                            <span>{d.code}</span>
                            <span>{new Date(d.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={styles.column}>
                      <div style={styles.sectionHeader}>
                        <h2 style={styles.sectionTitle}>Medical Notes</h2>
                        <button style={styles.addLink} onClick={() => setShowNoteModal(true)}>+ Add</button>
                      </div>
                      {history.map((n, idx) => (
                        <div key={n.prescription_id} style={styles.noteCard}>
                          <span style={styles.noteType}>CLINICAL NOTE</span>
                          <span style={styles.noteDate}>{new Date(n.created_at).toLocaleDateString()}</span>
                          <p style={styles.noteText}>{n.notes}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'followups' && (
                  <div style={styles.section}>
                    <div style={styles.sectionHeader}>
                      <h2 style={styles.sectionTitle}>Scheduled Follow-ups</h2>
                      <button style={styles.addLink} onClick={() => setShowFollowupModal(true)}>+ Schedule New</button>
                    </div>
                    <div style={styles.followupList}>
                      {followups.map((f, idx) => (
                        <motion.div 
                          key={f.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          style={styles.followupCard}
                        >
                          <div style={styles.dateBlock}>
                            <span style={styles.month}>MAR</span>
                            <span style={styles.day}>25</span>
                          </div>
                          <div style={styles.followupBody}>
                            <h3 style={styles.followupReason}>{f.reason}</h3>
                            <p style={styles.followupNotes}>{f.notes}</p>
                          </div>
                          <div style={styles.statusBadgeScheduled}>Scheduled</div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* MODALS */}
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
              style={styles.modalContainer}
              onClick={e => e.stopPropagation()}
            >
              <div style={styles.modalHeader}>
                <h3 style={styles.modalTitle}>
                  {showPrescriptionModal && 'Add New Prescription'}
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
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Medication Name</label>
                    <input type="text" placeholder="e.g. Paracetamol" style={styles.formInput} />
                  </div>
                  <div style={styles.formGrid}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Dosage</label>
                      <input type="text" placeholder="500mg" style={styles.formInput} />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Frequency</label>
                      <select style={styles.formInput}>
                        <option>Once daily</option>
                        <option>Twice daily</option>
                        <option>Three times daily</option>
                        <option>As needed</option>
                      </select>
                    </div>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Duration</label>
                    <input type="text" placeholder="7 days" style={styles.formInput} />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Special Instructions</label>
                    <textarea rows={3} placeholder="Take after food..." style={styles.formTextarea} />
                  </div>
                </div>}

                {showNoteModal && <div style={styles.form}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Note Content</label>
                    <textarea rows={5} placeholder="Type your patient notes here..." style={styles.formTextarea} />
                  </div>
                </div>}

                {showDiagnosisModal && <div style={styles.form}>
                   <div style={styles.formGroup}>
                    <label style={styles.label}>Condition</label>
                    <input type="text" placeholder="e.g. Hypertension" style={styles.formInput} />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Notes</label>
                    <textarea rows={4} style={styles.formTextarea} placeholder="Details about this condition..." />
                  </div>
                </div>}

                {showFollowupModal && <div style={styles.form}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Follow-up Date</label>
                    <input type="date" style={styles.formInput} />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Reason</label>
                    <input type="text" placeholder="Check progress" style={styles.formInput} />
                  </div>
                </div>}
              </div>

              <div style={styles.modalFooter}>
                <button onClick={() => {
                   setShowPrescriptionModal(false);
                   setShowDiagnosisModal(false);
                   setShowNoteModal(false);
                   setShowFollowupModal(false);
                }} style={styles.secondaryBtn}>Cancel</button>
                <button style={styles.primaryBtn}>Save Records</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#F8FAFC'
  },
  loading: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    color: '#64748B'
  },
  patientHeader: {
    backgroundColor: 'white',
    borderBottom: '1px solid #E2E8F0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    position: 'sticky',
    top: 0,
    zIndex: 10
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  headerLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  backLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#64748B',
    background: 'none',
    border: 'none',
    fontSize: '0.9rem',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'color 0.2s',
    width: 'fit-content'
  },
  patientIdentity: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px'
  },
  avatarLarge: {
    width: '80px',
    height: '80px',
    borderRadius: '20px',
    background: 'linear-gradient(135deg, #DBEAFE 0%, #EFF6FF 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#2563EB'
  },
  patientName: {
    fontSize: '1.875rem',
    fontWeight: '800',
    color: '#0F172A',
    margin: 0
  },
  infoRow: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px'
  },
  infoPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.875rem',
    color: '#475569',
    backgroundColor: '#F1F5F9',
    padding: '4px 12px',
    borderRadius: '8px'
  },
  alertBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.875rem',
    color: '#92400E',
    backgroundColor: '#FEF3C7',
    padding: '4px 12px',
    borderRadius: '8px'
  },
  headerActions: {
    display: 'flex',
    gap: '12px'
  },
  actionBtnLight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    borderRadius: '12px',
    backgroundColor: '#EFF6FF',
    color: '#2563EB',
    border: 'none',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '0.9rem'
  },
  actionBtnBlue: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    borderRadius: '12px',
    backgroundColor: '#2563EB',
    color: 'white',
    border: 'none',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '0.9rem',
    boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
  },
  tabNav: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 32px',
    display: 'flex',
    gap: '32px'
  },
  tabItem: {
    padding: '16px 0',
    fontSize: '0.9375rem',
    fontWeight: '600',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    position: 'relative',
    transition: 'color 0.2s'
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '2px',
    backgroundColor: '#2563EB'
  },
  tabContent: {
    backgroundColor: '#F8FAFC',
    minHeight: 'calc(100vh - 200px)',
    padding: '40px 0'
  },
  maxContainer: {
    maxWidth: '896px', // max-w-4xl
    margin: '0 auto',
    padding: '0 32px'
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#0F172A',
    margin: 0
  },
  addLink: {
    color: '#2563EB',
    fontWeight: '600',
    fontSize: '0.9rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer'
  },
  timeline: {
    position: 'relative',
    paddingLeft: '32px',
    borderLeft: '2px solid #E2E8F0',
    marginLeft: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px'
  },
  timelineItem: {
    position: 'relative'
  },
  timelineNode: {
    position: 'absolute',
    left: '-41px',
    top: '24px',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    backgroundColor: '#2563EB',
    border: '4px solid white',
    boxShadow: '0 0 0 2px #E0E7FF'
  },
  timelineCard: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '20px',
    border: '1px solid #F1F5F9',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
  },
  timelineDate: {
    fontSize: '0.8rem',
    color: '#2563EB',
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  timelineDiagnosis: {
    fontSize: '1.125rem',
    fontWeight: '700',
    color: '#0F172A',
    margin: '8px 0'
  },
  timelineNotes: {
    fontSize: '0.9375rem',
    color: '#475569',
    lineHeight: 1.6,
    margin: 0
  },
  cardGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  prescriptionCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
  },
  prescIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: '#EFF6FF',
    color: '#2563EB',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  prescDetails: {
    flex: 1
  },
  prescName: {
    fontSize: '1.125rem',
    fontWeight: '700',
    margin: 0,
    color: '#0F172A'
  },
  prescUsage: {
    fontSize: '0.875rem',
    color: '#64748B',
    margin: '4px 0 8px 0'
  },
  instrBadge: {
    display: 'inline-block',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#475569',
    backgroundColor: '#F1F5F9',
    padding: '4px 10px',
    borderRadius: '6px'
  },
  prescDate: {
    fontSize: '0.875rem',
    color: '#94A3B8'
  },
  twoColumnGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '32px'
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  diagnosisCard: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '20px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
  },
  diagHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  diagTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    margin: 0
  },
  severityTag: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#92400E',
    backgroundColor: '#FEF3C7',
    padding: '4px 10px',
    borderRadius: '20px'
  },
  diagBody: {
    fontSize: '0.9rem',
    color: '#64748B',
    lineHeight: 1.5
  },
  diagFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '16px',
    fontSize: '0.8rem',
    color: '#94A3B8',
    fontWeight: '500'
  },
  noteCard: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '20px',
    borderLeft: '4px solid #60A5FA',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
  },
  noteType: {
    fontSize: '0.7rem',
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: '0.1em'
  },
  noteDate: {
    display: 'block',
    fontSize: '0.8rem',
    color: '#94A3B8',
    marginTop: '4px'
  },
  noteText: {
    fontSize: '0.9375rem',
    color: '#334155',
    lineHeight: 1.6,
    marginTop: '12px',
    margin: '12px 0 0 0'
  },
  followupList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  followupCard: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
  },
  dateBlock: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    backgroundColor: '#EFF6FF',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  month: {
    fontSize: '0.65rem',
    fontWeight: '800',
    color: '#2563EB'
  },
  day: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#1E40AF'
  },
  followupBody: {
    flex: 1
  },
  followupReason: {
    fontSize: '1.1rem',
    fontWeight: '700',
    margin: 0
  },
  followupNotes: {
    fontSize: '0.9rem',
    color: '#64748B',
    marginTop: '4px',
    margin: '4px 0 0 0'
  },
  statusBadgeScheduled: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#B45309',
    backgroundColor: '#FFFBEB',
    border: '1px solid #FDE68A',
    padding: '6px 14px',
    borderRadius: '20px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '48px',
    color: '#94A3B8',
    fontSize: '1rem'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '24px'
  },
  modalContainer: {
    backgroundColor: 'white',
    width: '100%',
    maxWidth: '512px',
    borderRadius: '24px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '90vh'
  },
  modalHeader: {
    padding: '24px',
    borderBottom: '1px solid #F1F5F9',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 250, 252, 0.5)'
  },
  modalTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#0F172A',
    margin: 0
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1.25rem',
    color: '#64748B',
    cursor: 'pointer',
    display: 'flex'
  },
  modalBody: {
    padding: '24px',
    overflowY: 'auto'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px'
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#475569'
  },
  formInput: {
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid #E2E8F0',
    backgroundColor: '#F8FAFC',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'all 0.2s',
    '&:focus': {
       backgroundColor: 'white',
       borderColor: '#2563EB',
       boxShadow: '0 0 0 4px rgba(37, 99, 235, 0.1)'
    }
  },
  formTextarea: {
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid #E2E8F0',
    backgroundColor: '#F8FAFC',
    fontSize: '0.95rem',
    outline: 'none',
    resize: 'none',
    fontFamily: 'inherit'
  },
  modalFooter: {
    padding: '24px',
    borderTop: '1px solid #F1F5F9',
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end'
  },
  secondaryBtn: {
    padding: '10px 20px',
    borderRadius: '12px',
    backgroundColor: '#F1F5F9',
    color: '#475569',
    border: 'none',
    fontWeight: '600',
    cursor: 'pointer'
  },
  primaryBtn: {
    padding: '10px 24px',
    borderRadius: '12px',
    backgroundColor: '#2563EB',
    color: 'white',
    border: 'none',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)'
  }
};

export default PatientDetailsDoctor;
