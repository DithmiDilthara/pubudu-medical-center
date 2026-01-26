import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReceptionistSidebar from '../../components/ReceptionistSidebar';
import ReceptionistHeader from '../../components/ReceptionistHeader';

function ConfirmPayment() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get appointment data from navigation state or use default
  const appointmentData = location.state?.appointment || {
    patientName: 'Kamal Perera',
    patientId: 'PHE-2037',
    dateOfService: 'July 20, 2024',
    service: 'General Checkup',
    amount: 1500.00
  };

  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [amountPaid, setAmountPaid] = useState(appointmentData.amount || 1500.00);

  const handleConfirmPayment = () => {
    try {
      // Here you would typically make an API call to process the payment
      console.log('Payment confirmed:', {
        patientId: appointmentData.patientId,
        amount: amountPaid,
        method: paymentMethod,
        date: new Date().toISOString()
      });

      // Show success message or navigate back
      alert('Payment confirmed successfully!');
      navigate('/receptionist/appointments');
    } catch (error) {
      console.error('Payment error:', error);
      alert('Failed to process payment. Please try again.');
    }
  };

  return (
    <div style={styles.container}>
      <ReceptionistSidebar />

      <div style={styles.mainContainer}>
        <ReceptionistHeader />

        <div style={styles.content}>
          <div style={styles.paymentCard}>
            <h1 style={styles.pageTitle}>Confirm Payment</h1>

            {/* Patient Details Section */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Patient Details</h2>

              <div style={styles.detailsGrid}>
                <div style={styles.detailItem}>
                  <label style={styles.detailLabel}>Patient Name</label>
                  <div style={styles.detailValue}>{appointmentData.patientName}</div>
                  <div style={styles.detailSubValue}>({appointmentData.patientId})</div>
                </div>

                <div style={styles.detailItem}>
                  <label style={styles.detailLabel}>Date of Service</label>
                  <div style={styles.detailValue}>{appointmentData.dateOfService}</div>
                </div>
              </div>

              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>Service</label>
                <div style={styles.detailValue}>{appointmentData.service}</div>
              </div>
            </div>

            {/* Payment Information Section */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Payment Information</h2>

              <div style={styles.detailsGrid}>
                <div style={styles.detailItem}>
                  <label style={styles.detailLabel}>Amount Paid</label>
                  <div style={styles.amountValue}>LKR {amountPaid.toFixed(2)}</div>
                </div>

                <div style={styles.detailItem}>
                  <label style={styles.detailLabel}>Payment Method</label>
                  <select
                    style={styles.select}
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Confirm Button */}
            <div style={styles.buttonContainer}>
              <button
                style={styles.confirmButton}
                onClick={handleConfirmPayment}
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f8f9fa'
  },

  mainContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },

  content: {
    flex: 1,
    padding: '40px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start'
  },

  paymentCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '40px',
    maxWidth: '800px',
    width: '100%',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },

  pageTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '32px',
    margin: 0
  },

  section: {
    marginTop: '32px',
    paddingTop: '24px',
    borderTop: '1px solid #e5e7eb'
  },

  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '24px',
    margin: 0,
    marginBottom: '24px'
  },

  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    marginBottom: '24px'
  },

  detailItem: {
    display: 'flex',
    flexDirection: 'column'
  },

  detailLabel: {
    fontSize: '13px',
    color: '#6b7280',
    marginBottom: '8px',
    fontWeight: '500'
  },

  detailValue: {
    fontSize: '15px',
    color: '#1a1a1a',
    fontWeight: '600'
  },

  detailSubValue: {
    fontSize: '14px',
    color: '#6b7280',
    marginTop: '2px'
  },

  amountValue: {
    fontSize: '15px',
    color: '#1a1a1a',
    fontWeight: '700'
  },

  select: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    outline: 'none',
    transition: 'all 0.2s ease'
  },

  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '40px',
    paddingTop: '24px',
    borderTop: '1px solid #e5e7eb'
  },

  confirmButton: {
    padding: '12px 32px',
    borderRadius: '8px',
    border: 'none',
    background: '#3b82f6',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
  }
};

export default ConfirmPayment;
