import React, { useState, useEffect } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import axios from 'axios';
import { FiMonitor, FiTarget } from 'react-icons/fi';

const RegistrationChannelChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChannelData();
  }, []);

  const fetchChannelData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await axios.get(`${apiUrl}/admin/dashboard-data`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setData(response.data.data.registrationChannel);
      }
    } catch (error) {
      console.error('Error fetching registration channel:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#2563eb', '#10b981'];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const entry = payload[0];
      return (
        <div style={{
          backgroundColor: 'white',
          padding: '12px 16px',
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
          border: '1px solid #f1f5f9'
        }}>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: entry.payload.fill }}>{entry.name}</p>
          <p style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
            {entry.value} Bookings
          </p>
          <p style={{ margin: 0, fontSize: '12px', fontWeight: '500', color: '#64748b' }}>
            {((entry.value / data.reduce((acc, curr) => acc + curr.value, 0)) * 100).toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.titleInfo}>
          <div style={styles.iconBox}>
            <FiMonitor size={20} />
          </div>
          <div>
            <h3 style={styles.title}>Registration Channel</h3>
            <p style={styles.subtitle}>Online Portal vs. Counter Walk-ins</p>
          </div>
        </div>
      </div>

      <div style={styles.chartContainer}>
        {loading ? (
          <div style={styles.loader}>
            <div className="donut-loader" />
          </div>
        ) : data.length === 0 ? (
          <div style={styles.emptyState}>
            <FiTarget size={32} color="#cbd5e1" />
            <p style={{marginTop: '12px', color: '#64748b'}}>No data available yet</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={8}
                dataKey="value"
                animationDuration={1500}
                animationBegin={0}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(255,255,255,0.2)" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                formatter={(value) => <span style={{ color: '#64748b', fontWeight: 600, fontSize: '14px' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      <div style={styles.insightBox}>
        <h4 style={styles.insightTitle}>Digital Growth Tracking</h4>
        <p style={styles.insightText}>
          Monitoring these channels helps track our digital transformation progress and receptionist workload.
        </p>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .donut-loader {
            width: 40px;
            height: 40px;
            border: 4px solid #f1f5f9;
            border-top: 4px solid #2563eb;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
        `}
      </style>
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: 'white',
    borderRadius: '28px',
    padding: '32px',
    border: '1px solid #f1f5f9',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    height: '100%'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  iconBox: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    backgroundColor: '#eff6ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#2563eb'
  },
  title: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
    fontFamily: 'var(--font-accent)'
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: '4px 0 0',
    fontWeight: '500'
  },
  chartContainer: {
    width: '100%',
    height: '320px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  loader: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  insightBox: {
    backgroundColor: '#f8fafc',
    padding: '16px 20px',
    borderRadius: '20px',
    border: '1px solid #f1f5f9'
  },
  insightTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 6px 0'
  },
  insightText: {
    fontSize: '13px',
    color: '#64748b',
    margin: 0,
    lineHeight: '1.5',
    fontWeight: '500'
  }
};

export default RegistrationChannelChart;
