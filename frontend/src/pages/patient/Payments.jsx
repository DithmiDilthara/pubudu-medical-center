import React, { useState, useEffect } from "react";
import { FiCreditCard, FiClock, FiCheckCircle, FiFileText, FiTrendingUp, FiAlertCircle, FiDownload } from "react-icons/fi";
import PatientSidebar from "../../components/PatientSidebar";
import PatientHeader from "../../components/PatientHeader";
import axios from 'axios';
import toast from 'react-hot-toast';

function Payments() {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/appointments`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          setAppointments(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching payment data:", error);
        toast.error("Failed to load payment history");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  // Calculations
  const currentYear = new Date().getFullYear();
  const paidAppointments = appointments.filter(a => a.payment_status === 'PAID');
  const pendingAppointments = appointments.filter(a => a.payment_status === 'UNPAID' && a.status !== 'CANCELLED');

  const totalSpentYTD = paidAppointments
    .filter(a => new Date(a.appointment_date).getFullYear() === currentYear)
    .reduce((sum, a) => sum + (Number(a.doctor?.doctor_fee || 0) + Number(a.doctor?.center_fee || 0)), 0);

  const pendingAmount = pendingAppointments
    .reduce((sum, a) => sum + (Number(a.doctor?.doctor_fee || 0) + Number(a.doctor?.center_fee || 0)), 0);

  const totalPaidAllTime = paidAppointments
    .reduce((sum, a) => sum + (Number(a.doctor?.doctor_fee || 0) + Number(a.doctor?.center_fee || 0)), 0);

  return (
    <div style={styles.container}>
      <PatientSidebar onLogout={handleLogout} />

      <div className="main-wrapper">
        <PatientHeader />

        <main className="content-padding">

          {/* Summary Cards */}
          <section style={styles.summarySection}>
            <div style={styles.summaryCard}>
              <div style={{ ...styles.iconCircle, backgroundColor: '#E6F2FF' }}>
                <FiTrendingUp style={{ color: '#0066CC' }} />
              </div>
              <div>
                <p style={styles.summaryLabel}>Total Spent ({currentYear})</p>
                <h3 style={styles.summaryValue}>LKR {totalSpentYTD.toLocaleString()}</h3>
              </div>
            </div>

            <div style={styles.summaryCard}>
              <div style={{ ...styles.iconCircle, backgroundColor: '#FFF7ED' }}>
                <FiAlertCircle style={{ color: '#F97316' }} />
              </div>
              <div>
                <p style={styles.summaryLabel}>Pending Payments</p>
                <h3 style={styles.summaryValue}>LKR {pendingAmount.toLocaleString()}</h3>
              </div>
            </div>

            <div style={styles.summaryCard}>
              <div style={{ ...styles.iconCircle, backgroundColor: '#F0FDF4' }}>
                <FiCheckCircle style={{ color: '#16A34A' }} />
              </div>
              <div>
                <p style={styles.summaryLabel}>Total Paid All Time</p>
                <h3 style={styles.summaryValue}>LKR {totalPaidAllTime.toLocaleString()}</h3>
              </div>
            </div>
          </section>

          {/* Transaction History */}
          <section style={styles.tableSection}>
            <div style={styles.tableHeader}>
              <h2 style={styles.tableTitle}>Transaction History</h2>
            </div>

            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeadRow}>
                    <th style={styles.th}>Transaction</th>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Amount</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.length > 0 ? (
                    appointments.map((apt) => {
                      const total = Number(apt.doctor?.doctor_fee || 0) + Number(apt.doctor?.center_fee || 0);
                      const isPaid = apt.payment_status === 'PAID';
                      const isRefunded = apt.status === 'CANCELLED' && isPaid;

                      let statusLabel = isPaid ? 'Paid' : 'Pending';
                      let statusColor = isPaid ? '#10B981' : '#F59E0B';
                      let statusBg = isPaid ? '#D1FAE5' : '#FEF3C7';

                      if (isRefunded) {
                        statusLabel = 'Refunded';
                        statusColor = '#6B7280';
                        statusBg = '#F3F4F6';
                      }

                      return (
                        <tr key={apt.appointment_id} style={styles.tr}>
                          <td style={styles.td}>
                            <div style={styles.transactionInfo}>
                              <span style={styles.txDesc}>Consultation - {apt.doctor?.full_name}</span>
                              <span style={styles.txId}>ID: #{String(apt.appointment_id).slice(-8).toUpperCase()}</span>
                            </div>
                          </td>
                          <td style={styles.td}>
                            {new Date(apt.appointment_date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                          </td>
                          <td style={styles.td}>
                            <span style={styles.amount}>LKR {total.toLocaleString()}</span>
                          </td>
                          <td style={styles.td}>
                            <span style={{ 
                                ...styles.badge, 
                                color: statusColor, 
                                backgroundColor: statusBg 
                            }}>
                              {statusLabel}
                            </span>
                          </td>
                          <td style={styles.td}>
                            {isPaid && !isRefunded && (
                              <button 
                                onClick={() => toast.success("Downloading receipt...")}
                                style={styles.receiptBtn}
                              >
                                <FiDownload />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" style={styles.emptyTd}>
                        {isLoading ? 'Loading transactions...' : 'No transactions found'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
  pageHeader: {
    marginBottom: '32px',
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#111827',
    margin: '0 0 8px 0',
  },
  pageSubtitle: {
    fontSize: '15px',
    color: '#6B7280',
    margin: 0,
  },
  summarySection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
    marginBottom: '40px',
  },
  summaryCard: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: 'var(--radius-2xl)',
    boxShadow: 'var(--shadow-soft)',
    border: '1px solid var(--slate-100)',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  iconCircle: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
  },
  summaryLabel: {
    fontSize: 'var(--text-sm)',
    fontWeight: '600',
    color: 'var(--slate-500)',
    margin: '0 0 4px 0',
  },
  summaryValue: {
    fontSize: 'var(--text-xl)',
    fontWeight: '800',
    color: 'var(--slate-900)',
    margin: 0,
  },
  tableSection: {
    backgroundColor: 'white',
    borderRadius: 'var(--radius-2xl)',
    border: '1px solid var(--slate-100)',
    boxShadow: 'var(--shadow-soft)',
    overflow: 'hidden',
  },
  tableHeader: {
    padding: '24px 32px',
    borderBottom: '1px solid #F3F4F6',
  },
  tableTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#111827',
    margin: 0,
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  tableHeadRow: {
    backgroundColor: '#F9FAFB',
  },
  th: {
    padding: '16px 32px',
    fontSize: '13px',
    fontWeight: '700',
    color: '#4B5563',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tr: {
    borderBottom: '1px solid #F3F4F6',
    transition: 'background-color 0.2s ease',
    ':hover': {
      backgroundColor: '#F9FAFB',
    },
  },
  td: {
    padding: '20px 32px',
    fontSize: 'var(--text-sm)',
    color: 'var(--slate-600)',
    verticalAlign: 'middle',
  },
  transactionInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  txDesc: {
    fontWeight: '600',
    color: '#111827',
  },
  txId: {
    fontSize: '12px',
    color: '#9CA3AF',
  },
  amount: {
    fontWeight: '700',
    color: '#111827',
  },
  badge: {
    padding: '6px 12px',
    borderRadius: '100px',
    fontSize: '12px',
    fontWeight: '700',
  },
  receiptBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    border: '1px solid #E5E7EB',
    backgroundColor: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#3B82F6',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: '#E6F2FF',
      borderColor: '#3B82F6',
    },
  },
  emptyTd: {
    padding: '48px',
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: '15px',
  },
};

export default Payments;
