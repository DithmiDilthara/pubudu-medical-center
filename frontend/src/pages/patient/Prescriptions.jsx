import React from "react";
import PatientSidebar from "../../components/PatientSidebar";
import PatientHeader from "../../components/PatientHeader";
import { FiFileText } from "react-icons/fi";

function Prescriptions() {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div style={styles.container}>
      <PatientSidebar onLogout={handleLogout} />

      <div className="main-wrapper">
        <PatientHeader />

        <main className="content-padding">

          <section style={styles.emptyState}>
            <div style={styles.iconCircle}>
              <FiFileText />
            </div>
            <h2 style={styles.emptyTitle}>No prescriptions yet</h2>
            <p style={styles.emptyText}>Your digital prescriptions will appear here once they are issued by your doctor.</p>
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
    marginBottom: '40px',
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
  emptyState: {
    backgroundColor: 'white',
    padding: '80px 40px',
    borderRadius: 'var(--radius-2xl)',
    textAlign: 'center',
    border: '1px solid var(--slate-100)',
    boxShadow: 'var(--shadow-soft)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  iconCircle: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#F3F4F6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    color: '#9CA3AF',
    marginBottom: '24px',
  },
  emptyTitle: {
    fontSize: 'var(--text-lg)',
    fontWeight: '700',
    color: 'var(--slate-900)',
    marginBottom: '12px',
  },
  emptyText: {
    fontSize: 'var(--text-base)',
    color: 'var(--slate-500)',
    maxWidth: '400px',
    lineHeight: '1.6',
  },
};

export default Prescriptions;
