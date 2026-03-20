import React from 'react';
import { FiTrendingUp, FiTrendingDown, FiActivity } from 'react-icons/fi';

const RevenueSummary = () => {
  // Mock data for the summary
  const summary = [
    { 
      label: 'Today', 
      amount: 'LKR 12,450', 
      trend: '+12%', 
      isUp: true,
      color: '#2563eb',
      bg: '#eff6ff'
    },
    { 
      label: 'Weekly', 
      amount: 'LKR 90,000', 
      trend: '+8%', 
      isUp: true,
      color: '#7c3aed',
      bg: '#f5f3ff'
    },
    { 
      label: 'Monthly', 
      amount: 'LKR 340,200', 
      trend: '-2%', 
      isUp: false,
      color: '#059669',
      bg: '#ecfdf5'
    }
  ];

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.title}>Revenue Summary</h3>
        <div style={styles.iconBox}>
          <FiActivity />
        </div>
      </div>

      <div style={styles.list}>
        {summary.map((item) => (
          <div key={item.label} style={styles.item}>
            <div style={styles.itemLeft}>
              <p style={styles.label}>{item.label}</p>
              <h4 style={styles.amount}>{item.amount}</h4>
            </div>
            <div style={{
              ...styles.trendBadge,
              backgroundColor: item.bg,
              color: item.color
            }}>
              {item.isUp ? <FiTrendingUp style={styles.trendIcon} /> : <FiTrendingDown style={styles.trendIcon} />}
              <span>{item.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.footer}>
        <p style={styles.footerText}>Updated: Just now</p>
        <button style={styles.detailsBtn}>Full Report</button>
      </div>
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: 'white',
    borderRadius: '24px',
    padding: '24px',
    border: '1px solid #f1f5f9',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  title: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0
  },
  iconBox: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: '#fffbeb',
    color: '#d97706',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px'
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '16px',
    borderBottom: '1px solid #f8fafc'
  },
  itemLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#94a3b8',
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: '0.025em'
  },
  amount: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#1e293b',
    margin: 0
  },
  trendBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 10px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '700'
  },
  trendIcon: {
    fontSize: '14px'
  },
  footer: {
    marginTop: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  footerText: {
    fontSize: '12px',
    color: '#cbd5e1',
    margin: 0
  },
  detailsBtn: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#2563eb',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    ':hover': {
      textDecoration: 'underline'
    }
  }
};

export default RevenueSummary;
