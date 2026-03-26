import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import axios from 'axios';
import { FiTrendingUp, FiCalendar } from 'react-icons/fi';

const RevenueTrendChart = () => {
  const [period, setPeriod] = useState('Weekly');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendData();
  }, [period]);

  const fetchTrendData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await axios.get(`${apiUrl}/admin/dashboard-data?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setData(response.data.data.revenueTrend);
      }
    } catch (error) {
      console.error('Error fetching revenue trend:', error);
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'white',
          padding: '12px 16px',
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
          border: '1px solid #f1f5f9'
        }}>
          <p style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>{label}</p>
          <p style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#2563eb' }}>
            LKR {parseFloat(payload[0].value).toLocaleString()}
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
            <FiTrendingUp size={20} />
          </div>
          <div>
            <h3 style={styles.title}>Revenue by Doctor</h3>
            <p style={styles.subtitle}>Comparative performance analysis for the selected period</p>
          </div>
        </div>
        <div style={styles.tabs}>
          {['Daily', 'Weekly', 'Monthly'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                ...styles.tab,
                backgroundColor: period === p ? '#2563eb' : 'transparent',
                color: period === p ? 'white' : '#64748b',
                boxShadow: period === p ? '0 4px 12px rgba(37, 99, 235, 0.2)' : 'none'
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.chartContainer}>
        {loading ? (
          <div style={styles.loader}>
            <div className="bar-loader">
              <div style={styles.loaderBar} />
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                dy={10}
                interval={period === 'Monthly' ? 4 : 0}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}
              />
              <Tooltip cursor={{ fill: '#f1f5f9', radius: 8 }} content={<CustomTooltip />} />
              <Bar 
                dataKey="revenue" 
                radius={[8, 8, 0, 0]} 
                animationDuration={1500}
                barSize={period === 'Daily' ? 35 : period === 'Weekly' ? 50 : 60}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="url(#barGradient)" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <style>
        {`
          .bar-loader {
            width: 100%;
            height: 4px;
            background-color: #f1f5f9;
            border-radius: 4px;
            overflow: hidden;
            position: relative;
          }
          @keyframes slide {
            0% { left: -100%; }
            100% { left: 100%; }
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
    gap: '32px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px'
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
  tabs: {
    backgroundColor: '#f8fafc',
    padding: '4px',
    borderRadius: '14px',
    display: 'flex',
    gap: '4px',
    border: '1px solid #f1f5f9'
  },
  tab: {
    padding: '8px 16px',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '700',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  chartContainer: {
    width: '100%',
    height: '320px',
    position: 'relative'
  },
  loader: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 40px'
  },
  loaderBar: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    backgroundColor: '#2563eb',
    animation: 'slide 1.5s infinite linear'
  }
};

export default RevenueTrendChart;
