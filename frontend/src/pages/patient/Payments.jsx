import React, { useState, useEffect } from "react";
import { FiCreditCard, FiClock, FiCheckCircle, FiFileText, FiTrendingUp, FiAlertCircle, FiDownload, FiArrowRight, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import PatientSidebar from "../../components/PatientSidebar";
import PatientHeader from "../../components/PatientHeader";
import axios from 'axios';
import toast from 'react-hot-toast';
import CancelAppointmentModal from "../../components/CancelAppointmentModal";

function Payments() {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Cancellation Modal State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [apptToCancel, setApptToCancel] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
// get appointments with payment details
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/appointments`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          setAppointments(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching payment data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAppointments();
  }, [API_URL]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const handleCancelClick = (appointmentId) => {
    setApptToCancel(appointmentId);
    setIsCancelModalOpen(true);
  };

  const confirmCancel = async () => {
    if (!apptToCancel) return;
    setIsCancelling(true);
    const toastId = toast.loading("Cancelling appointment...");
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/appointments/${apptToCancel}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        toast.success("Appointment cancelled successfully!", { id: toastId });
        // Real-time update: marks the appointment as cancelled in local state
        setAppointments(prev => prev.map(a =>
          a.appointment_id === apptToCancel ? { ...a, status: 'CANCELLED' } : a
        ));
      }
    } catch (error) {
      toast.error("Failed to cancel appointment", { id: toastId });
    } finally {
      setIsCancelling(false);
      setIsCancelModalOpen(false);
      setApptToCancel(null);
    }
  };
// Download receipt as PDF
  const handleDownloadReceipt = async (appointmentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/payments/${appointmentId}/receipt`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      // create a link to download the PDF
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Receipt-APT${appointmentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Receipt downloaded successfully");
    } catch (error) {
      console.error("Download Error:", error);
      toast.error("Failed to download receipt");
    }
  };

  // Calculations
  const currentYear = new Date().getFullYear();
  const paidAppointments = appointments.filter(a => a.payment_status === 'PAID');
  const pendingAppointments = appointments.filter(a => (a.payment_status === 'UNPAID' || a.payment_status === 'PARTIAL') && a.status !== 'CANCELLED');

  // Filter transaction list according to user request: "paid and to be paid" only
  const displayAppointments = appointments.filter(a => (a.payment_status === 'PAID' || a.payment_status === 'UNPAID' || a.payment_status === 'PARTIAL') && a.status !== 'CANCELLED');

  // Paginated appointments
  const paginatedAppointments = displayAppointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(displayAppointments.length / itemsPerPage);

  const totalSpentYTD = paidAppointments
    .filter(a => new Date(a.appointment_date).getFullYear() === currentYear)
    .reduce((sum, a) => {
      const paid = (a.payments || []).reduce((pSum, p) => pSum + parseFloat(p.amount), 0);
      return sum + paid;
    }, 0);

  const pendingAmount = pendingAppointments
    .reduce((sum, a) => {
      const total = Number(a.doctor?.doctor_fee || 0) + Number(a.doctor?.center_fee || 600);
      const paid = (a.payments || []).reduce((pSum, p) => pSum + parseFloat(p.amount), 0);
      return sum + (total - paid);
    }, 0);

  const totalPaidAllTime = paidAppointments
    .reduce((sum, a) => {
      const paid = (a.payments || []).reduce((pSum, p) => pSum + parseFloat(p.amount), 0);
      return sum + paid;
    }, 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div style={styles.container}>
      <PatientSidebar onLogout={handleLogout} />

      <div className="main-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <PatientHeader />

        <main style={styles.mainContent}>
          <div style={styles.contentWrapper}>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={styles.headerSection}
            >
              <h1 style={styles.welcomeTitle}>Billing & Invoices</h1>
              <p style={styles.welcomeSubtitle}>View and track your medical payment history.</p>
            </motion.div>

            {/* Summary Cards */}
            <motion.section
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              style={styles.summarySection}
            >
              <motion.div variants={itemVariants} style={styles.summaryCard}>
                <div style={{ ...styles.iconBox, backgroundColor: '#eff6ff', color: '#2563eb' }}>
                  <FiTrendingUp />
                </div>
                <div style={styles.summaryInfo}>
                  <p style={styles.summaryLabel}>Total Spent ({currentYear})</p>
                  <h3 style={styles.summaryValue}>LKR {totalSpentYTD.toLocaleString()}</h3>
                </div>
                <div style={styles.cardDecoration} />
              </motion.div>

              <motion.div variants={itemVariants} style={styles.summaryCard}>
                <div style={{ ...styles.iconBox, backgroundColor: '#fff7ed', color: '#f97316' }}>
                  <FiAlertCircle />
                </div>
                <div style={styles.summaryInfo}>
                  <p style={styles.summaryLabel}>Pending Dues</p>
                  <h3 style={{ ...styles.summaryValue, color: '#f97316' }}>LKR {pendingAmount.toLocaleString()}</h3>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} style={styles.summaryCard}>
                <div style={{ ...styles.iconBox, backgroundColor: '#f0fdf4', color: '#10b981' }}>
                  <FiCheckCircle />
                </div>
                <div style={styles.summaryInfo}>
                  <p style={styles.summaryLabel}>All-time Paid</p>
                  <h3 style={styles.summaryValue}>LKR {totalPaidAllTime.toLocaleString()}</h3>
                </div>
              </motion.div>
            </motion.section>

            {/* History Header */}
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Transaction Records</h2>
              <div style={styles.filterChip}>Recent activity first</div>
            </div>

            {/* Transaction List */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={styles.tableCard}
            >
              <div style={styles.tableWrapper}>
                {appointments.length > 0 ? (
                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.theadRow}>
                        <th style={styles.th}>Transaction Details</th>
                        <th style={styles.th}>Date</th>
                        <th style={styles.th}>Amount</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedAppointments.map((apt) => {
                        const totalFee = Number(apt.doctor?.doctor_fee || 0) + Number(apt.doctor?.center_fee || 600);
                        const paidAmount = (apt.payments || []).reduce((pSum, p) => pSum + parseFloat(p.amount), 0);
                        const isPaid = apt.payment_status === 'PAID';
                        const isPartial = apt.payment_status === 'PARTIAL';
                        const isUnpaid = apt.payment_status === 'UNPAID';
                        const balance = totalFee - paidAmount;

                        let statusLabel = isPaid ? 'PAID' : (isPartial ? 'PARTIAL BALANCE' : 'TO BE PAID');
                        let statusColor = isPaid ? '#10b981' : '#dc2626';
                        let statusBg = isPaid ? '#f0fdf4' : '#fef2f2';

                        const rowStyle = (isUnpaid || isPartial) ? { ...styles.tr, backgroundColor: isPartial ? '#fffbeb' : '#fff5f5', borderLeft: isPartial ? '4px solid #f59e0b' : '4px solid #dc2626' } : styles.tr;

                        return (
                          <motion.tr
                            key={apt.appointment_id}
                            style={rowStyle}
                            whileHover={{
                              backgroundColor: (isUnpaid || isPartial) ? (isPartial ? '#fff8e1' : '#fff1f1') : 'rgba(37, 99, 235, 0.03)',
                              transition: { duration: 0.2 }
                            }}
                          >
                            <td style={styles.td}>
                              <div style={styles.txCell}>
                                <div style={styles.txIcon}><FiFileText /></div>
                                <div>
                                  <p style={styles.txTitle}>Medical Consultation</p>
                                  <p style={styles.txSub}>{apt.doctor?.full_name}</p>
                                </div>
                              </div>
                            </td>
                            <td style={styles.td}>
                              <p style={styles.dateVal}>
                                {new Date(apt.appointment_date).toLocaleDateString('en-US', {
                                  month: 'short', day: 'numeric', year: 'numeric'
                                })}
                              </p>
                            </td>
                            <td style={styles.td}>
                              <p style={styles.amountVal}>
                                {isPaid ? (
                                  <>
                                    LKR {paidAmount.toLocaleString()}
                                    <span style={{ display: 'block', fontSize: '10px', color: '#10b981', fontWeight: '500' }}>(Total Paid)</span>
                                  </>
                                ) : isPartial ? (
                                  <>
                                    LKR {balance.toLocaleString()}
                                    <span style={{ display: 'block', fontSize: '10px', color: '#f59e0b', fontWeight: '500' }}>(Remaining Balance)</span>
                                  </>
                                ) : (
                                  <>
                                    LKR {totalFee.toLocaleString()}
                                    <span style={{ display: 'block', fontSize: '10px', color: '#94a3b8', fontWeight: '500' }}>(To be Paid)</span>
                                  </>
                                )}
                              </p>
                            </td>
                            <td style={styles.td}>
                              <span style={{
                                ...styles.statusChip,
                                color: isPartial ? '#92400e' : statusColor,
                                backgroundColor: isPartial ? '#fef3c7' : statusBg,
                                border: `1px solid ${isPaid ? '#dcfce7' : (isPartial ? '#fde68a' : '#fee2e2')}`
                              }}>
                                {statusLabel}
                              </span>
                            </td>
                            <td style={styles.td}>
                              <div style={styles.actionsCell}>
                                {isPaid ? (
                                  <button
                                    style={styles.downloadBtn}
                                    onClick={() => handleDownloadReceipt(apt.appointment_id)}
                                    title="Download Receipt"
                                  >
                                    <FiDownload />
                                  </button>
                                ) : (isUnpaid || isPartial) ? (
                                  <button
                                    onClick={() => handleCancelClick(apt.appointment_id)}
                                    style={{ ...styles.downloadBtn, backgroundColor: '#fff1f2', color: '#e11d48' }}
                                    title="Cancel Appointment"
                                  >
                                    <FiX />
                                  </button>
                                ) : (
                                  <span style={{ color: '#cbd5e1' }}>N/A</span>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div style={styles.emptyContainer}>
                    {isLoading ? (
                      <div style={styles.fetching}>Verifying financial records...</div>
                    ) : (
                      <>
                        <div style={styles.emptyIcon}><FiCreditCard /></div>
                        <h4 style={styles.emptyHeading}>No payment history</h4>
                        <p style={styles.emptyPara}>All your digital receipts and billing information will be stored here.</p>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Pagination Controls */}
              {!isLoading && displayAppointments.length > 0 && (
                <div style={styles.paginationPanel}>
                  <div style={styles.paginationInfo}>
                    Showing <span style={{ fontWeight: '700' }}>{Math.min(displayAppointments.length, (currentPage - 1) * itemsPerPage + 1)}</span> to <span style={{ fontWeight: '700' }}>{Math.min(displayAppointments.length, currentPage * itemsPerPage)}</span> of <span style={{ fontWeight: '700' }}>{displayAppointments.length}</span> records
                  </div>
                  <div style={styles.paginationControls}>
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      style={{ ...styles.pageBtn, opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                    >
                      Previous
                    </button>

                    <div style={styles.pageNumbers}>
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                          style={{
                            ...styles.pageNumber,
                            backgroundColor: currentPage === i + 1 ? '#2563eb' : 'white',
                            color: currentPage === i + 1 ? 'white' : '#475569',
                            borderColor: currentPage === i + 1 ? '#2563eb' : '#e2e8f0'
                          }}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      style={{ ...styles.pageBtn, opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </motion.section>
          </div>
        </main>
      </div>

      <CancelAppointmentModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={confirmCancel}
        appointmentId={apptToCancel}
        isLoading={isCancelling}
      />
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
  summarySection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '28px',
    marginBottom: '48px',
  },
  summaryCard: {
    backgroundColor: 'white',
    padding: '32px',
    borderRadius: '28px',
    border: '1px solid #f1f5f9',
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)'
  },
  iconBox: {
    width: '64px',
    height: '64px',
    borderRadius: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    zIndex: 2
  },
  summaryInfo: {
    zIndex: 2
  },
  summaryLabel: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    margin: '0 0 6px 0',
  },
  summaryValue: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
    letterSpacing: '-0.5px'
  },
  cardDecoration: {
    position: "absolute",
    right: "-20px",
    top: "-20px",
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(37,99,235,0.05) 0%, transparent 70%)"
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px"
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#0f172a",
    margin: 0
  },
  filterChip: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#2563eb",
    backgroundColor: "#eff6ff",
    padding: "6px 16px",
    borderRadius: "100px"
  },
  tableCard: {
    backgroundColor: 'white',
    borderRadius: '28px',
    border: '1px solid #f1f5f9',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)'
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  theadRow: {
    background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
    borderBottom: 'none'
  },
  th: {
    padding: '20px 32px',
    fontSize: '11px',
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.9)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  tr: {
    borderBottom: '1px solid #f8fafc',
    transition: 'all 0.2s ease',
  },
  td: {
    padding: '24px 32px',
    fontSize: '14px',
    verticalAlign: 'middle',
  },
  txCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  txIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    backgroundColor: "#f8fafc",
    color: "#cbd5e1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px"
  },
  txTitle: {
    fontWeight: '700',
    color: '#1e293b',
    margin: 0
  },
  txSub: {
    fontSize: '13px',
    color: '#2563eb',
    fontWeight: '600',
    margin: 0
  },
  amountVal: {
    fontWeight: '800',
    color: '#0f172a',
    margin: 0
  },
  statusChip: {
    padding: '6px 14px',
    borderRadius: '100px',
    fontSize: '11px',
    fontWeight: '800',
    letterSpacing: '0.5px'
  },
  downloadBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#eff6ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#2563eb',
    cursor: 'pointer',
    fontSize: '18px',
    transition: 'all 0.2s',
  },
  emptyContainer: {
    padding: "80px 40px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  emptyIcon: {
    fontSize: "48px",
    color: "#cbd5e1",
    marginBottom: "20px"
  },
  emptyHeading: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#1e293b",
    margin: "0 0 8px 0"
  },
  emptyPara: {
    fontSize: "14px",
    color: "#94a3b8",
    maxWidth: "300px",
    margin: 0
  },
  fetching: {
    color: "#94a3b8",
    fontSize: "14px",
    fontWeight: "600"
  },
  dateVal: {
    fontWeight: "600",
    color: "#64748b",
    margin: 0
  },
  paginationPanel: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px 32px",
    backgroundColor: "white",
    borderTop: "1px solid #f1f5f9"
  },
  paginationInfo: {
    fontSize: "13px",
    color: "#64748b",
    fontWeight: "500"
  },
  paginationControls: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  pageNumbers: {
    display: "flex",
    gap: "6px"
  },
  pageBtn: {
    padding: "8px 16px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#2563eb",
    backgroundColor: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    transition: "all 0.2s"
  },
  pageNumber: {
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: "600",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    cursor: "pointer",
    transition: "all 0.2s"
  }
};

export default Payments;
