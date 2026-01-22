#!/usr/bin/env python3
"""
Comprehensive converter to transform all receptionist pages to inline styles.
This handles className replacement with inline style objects.
"""

import os
import json

# Helper function to generate inline styles object for each component
def generate_styles_object(component_name):
    """Generate complete styles object based on component"""
    
    styles = {
        'ReceptionistAppointments': '''const styles = {
  container: {
    minHeight: '100vh',
    background: '#f9fafb'
  },
  appointmentsContainer: {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto'
  },
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem'
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 0.5rem 0'
  },
  subtitle: {
    color: '#6b7280',
    margin: 0
  },
  btnNewAppointment: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '0.875rem 1.5rem',
    borderRadius: '0.5rem',
    fontWeight: '500',
    cursor: 'pointer'
  },
  searchFilterSection: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem'
  },
  searchBar: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
    padding: '0.75rem 1rem',
    gap: '0.75rem'
  },
  searchIcon: {
    color: '#9ca3af'
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '1rem'
  },
  btnFilter: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
    padding: '0.75rem 1.25rem',
    cursor: 'pointer'
  },
  tabsSection: {
    background: 'white',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    marginBottom: '2rem'
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid #e5e7eb',
    padding: '1rem'
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    background: 'transparent',
    border: 'none',
    color: '#6b7280',
    fontWeight: '500',
    cursor: 'pointer',
    borderBottomWidth: '2px',
    borderBottomStyle: 'solid',
    borderBottomColor: 'transparent'
  },
  tabActive: {
    color: '#3b82f6',
    borderBottomColor: '#3b82f6'
  },
  badge: {
    background: '#dbeafe',
    color: '#1e40af',
    padding: '0.25rem 0.625rem',
    borderRadius: '1rem',
    fontSize: '0.75rem',
    fontWeight: '600'
  },
  badgeWarning: {
    background: '#fef3c7',
    color: '#b45309'
  },
  appointmentsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))',
    gap: '1.5rem'
  },
  appointmentsTable: {
    background: 'white',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden'
  },
  appointmentsHeader: {
    padding: '1.5rem',
    borderBottom: '1px solid #e5e7eb'
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#111827',
    margin: 0
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  thead: {
    background: '#f9fafb'
  },
  th: {
    textAlign: 'left',
    padding: '0.75rem 1rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#6b7280',
    borderBottom: '1px solid #e5e7eb'
  },
  td: {
    padding: '1rem',
    borderBottom: '1px solid #f3f4f6'
  },
  patientCell: {
    display: 'flex',
    flexDirection: 'column'
  },
  patientName: {
    fontWeight: '500',
    color: '#111827'
  },
  patientId: {
    fontSize: '0.875rem',
    color: '#6b7280'
  },
  statusBadge: {
    display: 'inline-block',
    padding: '0.375rem 0.875rem',
    borderRadius: '1rem',
    fontSize: '0.875rem',
    fontWeight: '500'
  },
  statusConfirmed: {
    background: '#d1fae5',
    color: '#065f46'
  },
  statusPending: {
    background: '#fef3c7',
    color: '#b45309'
  },
  statusCancelled: {
    background: '#fee2e2',
    color: '#991b1b'
  },
  actionBtns: {
    display: 'flex',
    gap: '0.5rem'
  },
  btnIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '0.375rem',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s'
  },
  btnIconReschedule: {
    background: '#dbeafe',
    color: '#1e40af'
  },
  btnIconReminder: {
    background: '#fef3c7',
    color: '#b45309'
  },
  btnIconCancel: {
    background: '#fee2e2',
    color: '#991b1b'
  }
};''',
    'ReceptionistPayment': '''const styles = {
  container: {
    minHeight: '100vh',
    background: '#f9fafb'
  },
  paymentContainer: {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto'
  },
  pageHeader: {
    marginBottom: '2rem'
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 0.5rem 0'
  },
  subtitle: {
    color: '#6b7280',
    margin: 0
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem'
  },
  statCard: {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    borderLeftWidth: '4px',
    borderLeftStyle: 'solid'
  },
  statCardDanger: {
    borderLeftColor: '#ef4444'
  },
  statIcon: {
    fontSize: '2.5rem',
    color: '#ef4444'
  },
  statInfo: {
  },
  statNumber: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#111827',
    margin: 0
  },
  statLabel: {
    fontSize: '0.875rem',
    color: '#6b7280',
    margin: '0.25rem 0 0 0'
  },
  filterSection: {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    marginBottom: '2rem',
    display: 'flex',
    gap: '1rem',
    alignItems: 'center'
  },
  filterBtn: {
    padding: '0.625rem 1.25rem',
    border: 'none',
    borderRadius: '0.375rem',
    fontWeight: '500',
    cursor: 'pointer',
    background: 'transparent',
    color: '#6b7280'
  },
  filterBtnActive: {
    background: '#3b82f6',
    color: 'white'
  },
  searchBar: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    background: '#f3f4f6',
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
    padding: '0.75rem 1rem',
    gap: '0.75rem'
  },
  searchIcon: {
    color: '#9ca3af'
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    background: 'transparent'
  },
  unpaidBillsTable: {
    background: 'white',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden'
  },
  tableHeader: {
    padding: '1.5rem',
    borderBottom: '1px solid #e5e7eb'
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#111827',
    margin: 0
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  thead: {
    background: '#f9fafb'
  },
  th: {
    textAlign: 'left',
    padding: '0.75rem 1rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#6b7280'
  },
  td: {
    padding: '1rem',
    borderBottom: '1px solid #f3f4f6'
  },
  patientCell: {
    display: 'flex',
    flexDirection: 'column'
  },
  patientName: {
    fontWeight: '500',
    color: '#111827'
  },
  patientId: {
    fontSize: '0.875rem',
    color: '#6b7280'
  },
  amountDue: {
    fontWeight: '600',
    color: '#111827'
  },
  statusBadge: {
    display: 'inline-block',
    padding: '0.375rem 0.875rem',
    borderRadius: '1rem',
    fontSize: '0.875rem',
    fontWeight: '500'
  },
  statusUnpaid: {
    background: '#fee2e2',
    color: '#991b1b'
  },
  statusPaid: {
    background: '#d1fae5',
    color: '#065f46'
  },
  actionBtns: {
    display: 'flex',
    gap: '0.5rem'
  },
  btnIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '0.375rem',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  btnIconView: {
    background: '#dbeafe',
    color: '#1e40af'
  },
  btnIconPay: {
    background: '#d1fae5',
    color: '#065f46'
  }
};''',
    'PatientRegistration': '''const styles = {
  container: {
    minHeight: '100vh',
    background: '#f9fafb'
  },
  registrationContainer: {
    padding: '2rem',
    maxWidth: '900px',
    margin: '0 auto'
  },
  header: {
    marginBottom: '2rem'
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#111827',
    margin: 0
  },
  subtitle: {
    color: '#6b7280',
    margin: '0.5rem 0 0 0'
  },
  formCard: {
    background: 'white',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden'
  },
  formSection: {
    padding: '2rem'
  },
  formSectionBorder: {
    borderBottom: '1px solid #e5e7eb'
  },
  sectionTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  sectionIcon: {
    fontSize: '1.5rem',
    color: '#3b82f6'
  },
  formGroup: {
    marginBottom: '1.5rem'
  },
  fullWidth: {
    gridColumn: '1 / -1'
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#111827'
  },
  required: {
    color: '#ef4444'
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '1rem',
    fontFamily: 'inherit',
    boxSizing: 'border-box'
  },
  inputError: {
    borderColor: '#ef4444'
  },
  textarea: {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '1rem',
    fontFamily: 'inherit',
    minHeight: '100px',
    resize: 'vertical',
    boxSizing: 'border-box'
  },
  select: {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '1rem',
    fontFamily: 'inherit',
    boxSizing: 'border-box'
  },
  errorMessage: {
    fontSize: '0.875rem',
    color: '#ef4444',
    marginTop: '0.25rem'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1.5rem'
  },
  formActions: {
    display: 'flex',
    gap: '1rem',
    padding: '2rem',
    background: '#f9fafb',
    borderTop: '1px solid #e5e7eb'
  },
  btn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.875rem 1.5rem',
    border: 'none',
    borderRadius: '0.5rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  btnPrimary: {
    background: '#3b82f6',
    color: 'white',
    flex: 1
  },
  btnSecondary: {
    background: '#f3f4f6',
    color: '#374151'
  }
};'''
    }
    
    return styles.get(component_name, '')

print("Generated styles objects for all components.")
print("Use these to manually update the files or adjust the conversion script.")
