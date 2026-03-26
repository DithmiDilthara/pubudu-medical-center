import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiInfo } from 'react-icons/fi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import axios from 'axios';

const PatientRegistrationModal = ({ isOpen, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchStats();
    }
  }, [isOpen]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await axios.get(`${apiUrl}/admin/patient-registration-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        const stats = response.data.data;
        const chartData = [
          { name: 'Online Registration', value: stats.online, color: '#2563eb' },
          { name: 'Receptionist Registration', value: stats.receptionist, color: '#93c5fd' }
        ];
        setData({ ...stats, chartData });
      } else {
        setError('Failed to fetch data');
      }
    } catch (err) {
      console.error('Error fetching patient stats:', err);
      setError('An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { name, value, color } = payload[0].payload;
      const total = data.total || 1;
      const percentage = ((value / total) * 100).toFixed(1);
      return (
        <div style={{
          backgroundColor: 'white',
          padding: '12px',
          borderRadius: '12px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <p style={{ margin: 0, fontWeight: '700', color: '#1e293b', fontSize: '14px' }}>{name}</p>
          <p style={{ margin: '4px 0 0', color: color, fontWeight: '800', fontSize: '18px' }}>
            {value} <span style={{ fontSize: '12px', fontWeight: '500', color: '#64748b' }}>({percentage}%)</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <AnimatePresence>
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: 'white',
            borderRadius: '32px',
            width: '100%',
            maxWidht: '500px',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            position: 'relative'
          }}
        >
          {/* Header */}
          <div style={{
            padding: '24px 32px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(to right, #ffffff, #f8fafc)'
          }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Patient Registration Source</h2>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0', fontWeight: '500' }}>Overall breakdown of patient sign-ups</p>
            </div>
            <button 
              onClick={onClose}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b',
                transition: 'all 0.2s ease'
              }}
            >
              <FiX size={20} />
            </button>
          </div>

          <div style={{ padding: '32px' }}>
            {loading ? (
              <div style={{ height: '350px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                <div className="spinner" style={{
                  width: '40px',
                  height: '40px',
                  border: '4px solid #f1f5f9',
                  borderTop: '4px solid #2563eb',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                <p style={{ color: '#64748b', fontWeight: '600', fontSize: '14px' }}>Loading statistics...</p>
              </div>
            ) : error ? (
              <div style={{ height: '350px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <div style={{ color: '#ef4444', marginBottom: '16px' }}><FiInfo size={48} /></div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>Oops! Something went wrong</h3>
                <p style={{ color: '#64748b', maxWidth: '300px' }}>{error}</p>
                <button 
                  onClick={fetchStats}
                  style={{
                    marginTop: '20px',
                    padding: '10px 24px',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div>
                <div style={{ height: '280px', position: 'relative' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {data.chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Total in Center */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    pointerEvents: 'none'
                  }}>
                    <p style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Total</p>
                    <h3 style={{ margin: 0, fontSize: '32px', fontWeight: '900', color: '#0f172a' }}>{data.total}</h3>
                  </div>
                </div>

                {/* Legend */}
                <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {data.chartData.map((item, idx) => {
                    const percentage = ((item.value / data.total) * 100).toFixed(1);
                    return (
                      <div key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '16px',
                        border: '1px solid #f1f5f9'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: item.color }} />
                          <span style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>{item.name}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>{item.value}</span>
                          <span style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', marginLeft: '6px' }}>({percentage}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <style>
          {`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    </AnimatePresence>
  );
};

export default PatientRegistrationModal;
