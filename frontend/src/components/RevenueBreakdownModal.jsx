import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiTrendingUp, FiInfo } from 'react-icons/fi';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  Legend
} from 'recharts';
import axios from 'axios';

const RevenueBreakdownModal = ({ isOpen, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'];

  useEffect(() => {
    if (isOpen) {
      fetchRevenueData();
    }
  }, [isOpen]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await axios.get(`${apiUrl}/admin/reports/revenue`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setData(response.data.data);
      } else {
        setError('Failed to fetch revenue data');
      }
    } catch (err) {
      console.error('Error fetching revenue data:', err);
      setError('An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { name, revenue } = payload[0].payload;
      return (
        <div style={{
          backgroundColor: 'white',
          padding: '12px',
          borderRadius: '12px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <p style={{ margin: 0, fontWeight: '700', color: '#1e293b', fontSize: '14px' }}>{name}</p>
          <p style={{ margin: '4px 0 0', color: '#2563eb', fontWeight: '800', fontSize: '16px' }}>
            LKR {parseFloat(revenue).toLocaleString()}
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
            maxWidth: '550px',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                backgroundColor: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb'
              }}>
                <FiTrendingUp size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Revenue Breakdown</h2>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0', fontWeight: '500' }}>Center revenue distribution by doctor</p>
              </div>
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
                color: '#64748b'
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
                <p style={{ color: '#64748b', fontWeight: '600', fontSize: '14px' }}>Calculating revenue...</p>
              </div>
            ) : error ? (
              <div style={{ height: '350px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <div style={{ color: '#ef4444', marginBottom: '16px' }}><FiInfo size={48} /></div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>Failed to load data</h3>
                <p style={{ color: '#64748b', maxWidth: '300px' }}>{error}</p>
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
                        dataKey="revenue"
                      >
                        {data.chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
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
                    <p style={{ margin: 0, fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Revenue</p>
                    <h3 style={{ margin: '4px 0 0', fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>
                      {parseFloat(data.totalRevenue).toLocaleString()}
                    </h3>
                  </div>
                </div>

                {/* Top Contributors List */}
                <div style={{ marginTop: '32px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Top Contributors</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', paddingRight: '8px' }}>
                    {data.chartData.sort((a,b) => b.revenue - a.revenue).map((item, idx) => (
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
                          <span style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>{item.name}</span>
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: '800', color: '#2563eb' }}>
                          LKR {parseFloat(item.revenue).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
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

export default RevenueBreakdownModal;
