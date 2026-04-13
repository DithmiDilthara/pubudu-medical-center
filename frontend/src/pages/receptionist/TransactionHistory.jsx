import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  FiSearch, 
  FiCalendar, 
  FiFilter, 
  FiDownload, 
  FiPrinter, 
  FiUser, 
  FiActivity,
  FiTrendingUp,
  FiRepeat,
  FiDollarSign,
  FiCheckCircle,
  FiFileText,
  FiArrowRight
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import ReceptionistSidebar from "../../components/ReceptionistSidebar";
import ReceptionistHeader from "../../components/ReceptionistHeader";
import { toast } from "react-hot-toast";

const TransactionHistory = () => {
  const navigate = useNavigate();
  const [receptionistName, setReceptionistName] = useState("Receptionist");
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  
  // Filter States
  const [patientName, setPatientName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [type, setType] = useState("ALL");
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  useEffect(() => {
    // Set default dates to current month on load
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Format dates to YYYY-MM-DD
    const formatDate = (d) => {
        const offset = d.getTimezoneOffset() * 60000;
        return (new Date(d.getTime() - offset)).toISOString().split('T')[0];
    };
    
    setStartDate(formatDate(firstDay));
    setEndDate(formatDate(today));
    
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const profileRes = await axios.get(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (profileRes.data.success) {
        setReceptionistName(profileRes.data.data.profile.full_name);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/payments/history`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { patientName, startDate, endDate, type }
      });

      if (response.data.success) {
        setTransactions(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
      toast.error("Failed to load transaction history");
    } finally {
      setIsLoading(false);
    }
  };

  // Immediate fetch on filter change (debounced for name)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchHistory();
    }, 500);
    return () => clearTimeout(timer);
  }, [patientName, startDate, endDate, type]);

  const handleDownloadReceipt = async (appointmentId) => {
    if (!appointmentId) return;
    const toastId = toast.loading("Downloading receipt...");
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/payments/${appointmentId}/receipt`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Receipt-APT${appointmentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Receipt downloaded!", { id: toastId });
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download receipt", { id: toastId });
    }
  };

  const summaryStats = useMemo(() => {
    const payments = transactions.filter(t => t.transaction_type === 'PAYMENT');
    const refunds = transactions.filter(t => t.transaction_type === 'REFUND');
    
    const totalCollected = payments.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    const totalRefunded = refunds.reduce((sum, t) => sum + Math.abs(parseFloat(t.amount || 0)), 0);
    
    return {
      totalCollected,
      totalRefunded,
      netCash: totalCollected - totalRefunded,
      transactionCount: transactions.length
    };
  }, [transactions]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: { opacity: 1, scale: 1 }
  };

  return (
    <div style={styles.container}>
      <ReceptionistSidebar onLogout={() => { localStorage.clear(); navigate("/"); }} />
      <div className="main-wrapper">
        <ReceptionistHeader receptionistName={receptionistName} />

        <motion.main 
          className="content-padding"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header Title */}
          <div style={styles.headerTitleSection}>
            <h1 style={styles.pageTitle}>Transaction History</h1>
            <p style={styles.pageSubtitle}>View and audit clinic-wide payments and refunds with full transparency.</p>
          </div>

          {/* Stats Section */}
          <div style={styles.statsGrid}>
            <motion.div variants={itemVariants} style={{...styles.statsCard, borderLeft: '5px solid #2563eb'}}>
              <p style={styles.statsLabel}>Total Collections</p>
              <h4 style={{...styles.statsValue, color: '#2563eb'}}>LKR {summaryStats.totalCollected.toLocaleString()}</h4>
              <div style={styles.statsIconBox}><FiTrendingUp color="#2563eb" /></div>
            </motion.div>
            
            <motion.div variants={itemVariants} style={{...styles.statsCard, borderLeft: '5px solid #dc2626'}}>
              <p style={styles.statsLabel}>Total Refunds</p>
              <h4 style={{...styles.statsValue, color: '#dc2626'}}>LKR {summaryStats.totalRefunded.toLocaleString()}</h4>
              <div style={styles.statsIconBox}><FiRepeat color="#dc2626" /></div>
            </motion.div>

            <motion.div variants={itemVariants} style={{...styles.statsCard, borderLeft: '5px solid #059669'}}>
              <p style={styles.statsLabel}>Net Revenue</p>
              <h4 style={{...styles.statsValue, color: '#059669'}}>LKR {summaryStats.netCash.toLocaleString()}</h4>
              <div style={styles.statsIconBox}><FiDollarSign color="#059669" /></div>
            </motion.div>

            <motion.div variants={itemVariants} style={styles.statsCard}>
              <p style={styles.statsLabel}>History Volume</p>
              <h4 style={styles.statsValue}>{summaryStats.transactionCount} Recs</h4>
              <div style={styles.statsIconBox}><FiActivity color="#64748b" /></div>
            </motion.div>
          </div>

          {/* Filters Card */}
          <div style={styles.filterCard}>
            <div style={styles.cardHeader}>
              <FiFilter size={18} color="#2563eb" />
              <h2 style={styles.cardTitle}>Filter Ledger</h2>
            </div>

            <div style={styles.filterGrid}>
              <div style={styles.filterGroup}>
                <label style={styles.label}>Patient Search</label>
                <div style={styles.inputWrapper}>
                  <FiSearch style={styles.inputIcon} />
                  <input 
                    type="text" 
                    placeholder="Search name..."
                    style={styles.input}
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                  />
                </div>
              </div>

              <div style={styles.filterGroup}>
                <label style={styles.label}>From Date</label>
                <div style={styles.inputWrapper}>
                  <FiCalendar style={styles.inputIcon} />
                  <input 
                    type="date" 
                    style={styles.input}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
              </div>

              <div style={styles.filterGroup}>
                <label style={styles.label}>To Date</label>
                <div style={styles.inputWrapper}>
                  <FiCalendar style={styles.inputIcon} />
                  <input 
                    type="date" 
                    style={styles.input}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div style={styles.filterGroup}>
                <label style={styles.label}>Trans. Type</label>
                <select 
                  style={styles.select}
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="ALL">All Transactions</option>
                  <option value="PAYMENT">Payments Only</option>
                  <option value="REFUND">Refunds Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Ledger Table */}
          <div style={styles.tableCard}>
            <div style={styles.cardHeaderWithAction}>
              <div style={styles.cardHeader}>
                <FiFileText size={18} color="#2563eb" />
                <h2 style={styles.cardTitle}>Transaction Records</h2>
              </div>
              <button 
                style={styles.refreshBtn}
                onClick={fetchHistory}
                disabled={isLoading}
              >
                <FiActivity className={isLoading ? "animate-spin" : ""} />
                <span>{isLoading ? "Refreshing..." : "Sync Records"}</span>
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Timestamp</th>
                    <th style={styles.th}>Patient</th>
                    <th style={styles.th}>Consultation with</th>
                    <th style={{...styles.th, textAlign: 'right'}}>Amount</th>
                    <th style={{...styles.th, textAlign: 'center'}}>Type</th>
                    <th style={{...styles.th, textAlign: 'center'}}>Method</th>
                    <th style={{...styles.th, textAlign: 'center'}}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {transactions.length > 0 ? (
                      transactions.map((t, idx) => (
                        <motion.tr 
                          key={t.payment_id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            backgroundColor: idx % 2 === 0 ? 'white' : '#f8fafc'
                          }}
                        >
                          <td style={styles.td}>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                              {new Date(t.created_at).toLocaleDateString()}
                            </div>
                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                              {new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>
                          <td style={styles.td}>
                            <div style={styles.flexCenter}>
                              <div style={styles.avatarMini}>{t.patient?.full_name?.charAt(0)}</div>
                              <span style={{ fontWeight: '600' }}>{t.patient?.full_name || 'Guest'}</span>
                            </div>
                          </td>
                          <td style={styles.td}>
                            {t.appointment?.doctor?.full_name || 'N/A'}
                          </td>
                          <td style={{...styles.td, textAlign: 'right', fontWeight: '800', color: t.transaction_type === 'REFUND' ? '#dc2626' : '#0f172a'}}>
                            {t.transaction_type === 'REFUND' ? '-' : ''}LKR {Math.abs(parseFloat(t.amount)).toLocaleString()}
                          </td>
                          <td style={{...styles.td, textAlign: 'center'}}>
                            <span style={{
                              ...styles.badge,
                              backgroundColor: t.transaction_type === 'REFUND' ? '#fef2f2' : '#ecfdf5',
                              color: t.transaction_type === 'REFUND' ? '#dc2626' : '#059669',
                              border: t.transaction_type === 'REFUND' ? '1px solid #fee2e2' : '1px solid #d1fae5'
                            }}>
                              {t.transaction_type}
                            </span>
                          </td>
                          <td style={{...styles.td, textAlign: 'center'}}>
                            <span style={styles.methodBadge}>{t.payment_method}</span>
                          </td>
                          <td style={{...styles.td, textAlign: 'center'}}>
                            {t.transaction_type === 'PAYMENT' && t.appointment_id ? (
                                <button 
                                    style={styles.printBtn}
                                    onClick={() => handleDownloadReceipt(t.appointment_id)}
                                >
                                    <FiPrinter size={14} />
                                    <span>Receipt</span>
                                </button>
                            ) : (
                                <span style={{ color: '#cbd5e1', fontSize: '12px' }}>N/A</span>
                            )}
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                            <FiActivity size={48} opacity={0.2} />
                            <p>No transaction records found matching your filters.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        </motion.main>
      </div>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-spin {
            animation: spin 1s linear infinite;
          }
        `}
      </style>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f4f7fe",
    fontFamily: "'Inter', sans-serif"
  },
  headerTitleSection: {
    marginBottom: "32px"
  },
  pageTitle: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#0f172a",
    margin: "0 0 8px 0",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    letterSpacing: "-0.5px"
  },
  pageSubtitle: {
    fontSize: "15px",
    color: "#64748b",
    margin: 0
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "20px",
    marginBottom: "32px"
  },
  statsCard: {
    backgroundColor: "white",
    borderRadius: "20px",
    padding: "24px",
    position: "relative",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
    border: "1px solid #f1f5f9"
  },
  statsLabel: {
    fontSize: "12px",
    color: "#64748b",
    fontWeight: "600",
    margin: "0 0 4px 0",
    textTransform: "uppercase",
    letterSpacing: "0.05em"
  },
  statsValue: {
    fontSize: "24px",
    fontWeight: "800",
    margin: 0
  },
  statsIconBox: {
    position: "absolute",
    right: "20px",
    top: "24px",
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    backgroundColor: "#f8fafc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  filterCard: {
    backgroundColor: "white",
    borderRadius: "24px",
    padding: "24px",
    border: "1px solid #eff6ff",
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.03)",
    marginBottom: "24px"
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px"
  },
  cardHeaderWithAction: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px 24px 16px 24px"
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1e293b",
    margin: 0
  },
  filterGrid: {
    display: "grid",
    gridTemplateColumns: "1.5fr 1fr 1fr 1.2fr",
    gap: "20px"
  },
  filterGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },
  label: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    paddingLeft: "4px"
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center"
  },
  inputIcon: {
    position: "absolute",
    left: "14px",
    color: "#cbd5e1"
  },
  input: {
    width: "100%",
    padding: "10px 14px 10px 40px",
    fontSize: "14px",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    outline: "none",
    transition: "all 0.2s"
  },
  select: {
    width: "100%",
    padding: "10px 12px",
    fontSize: "14px",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    outline: "none",
    cursor: "pointer"
  },
  tableCard: {
    backgroundColor: "white",
    borderRadius: "24px",
    border: "1px solid #eff6ff",
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.03)",
    overflow: "hidden",
    minHeight: "400px"
  },
  refreshBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    border: "none",
    padding: "8px 16px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse"
  },
  th: {
    padding: "16px 24px",
    backgroundColor: "#f8fafc",
    color: "#64748b",
    fontSize: "12px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderBottom: "1px solid #f1f5f9"
  },
  td: {
    padding: "18px 24px",
    fontSize: "14px",
    color: "#475569"
  },
  flexCenter: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },
  avatarMini: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    backgroundColor: "#2563eb",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "12px"
  },
  badge: {
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.02em"
  },
  methodBadge: {
    padding: "4px 10px",
    backgroundColor: "#f1f5f9",
    color: "#475569",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "600",
    border: "1px solid #e2e8f0"
  },
  printBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    backgroundColor: "white",
    color: "#0f172a",
    border: "1px solid #e2e8f0",
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s"
  }
};

export default TransactionHistory;
