import React, { useState } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  Sector
} from 'recharts';
import { motion } from 'framer-motion';

const RevenueChart = ({ revenueData = { daily: 0, weekly: 0, monthly: 0, total: 0 } }) => {
  const [period, setPeriod] = useState('Weekly');
  const [activeIndex, setActiveIndex] = useState(null);

  const getSegments = () => {
    const appts = revenueData.appointments || [];
    const paidAppts = appts.filter(a => a.payment_status === 'PAID');
    const todayStr = new Date().toISOString().split('T')[0];

    if (period === 'Daily') {
      const todayPaid = paidAppts.filter(a => a.appointment_date === todayStr);
      if (todayPaid.length === 0) return [{ name: 'No Revenue', value: 1, color: '#f1f5f9', isPlaceholder: true }];
      
      return todayPaid.map((a, i) => ({
        name: a.patient_name || `Appt #${i+1}`,
        value: Number(a.doctor?.doctor_fee || 0),
        color: ['#3b82f6', '#2563eb', '#1d4ed8', '#1e40af'][i % 4]
      }));
    }

    if (period === 'Weekly') {
      const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
      }).reverse();

      return last7Days.map((date, i) => {
        const dayTotal = paidAppts
          .filter(a => a.appointment_date === date)
          .reduce((sum, a) => sum + Number(a.doctor?.doctor_fee || 0), 0);
        
        return {
          name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
          value: dayTotal,
          color: ['#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95', '#3b82f6', '#2563eb'][i % 7]
        };
      }).filter(s => s.value > 0);
    }

    if (period === 'Monthly') {
      // Group by weeks
      const categories = [
        { name: 'Week 1', start: 0, end: 7 },
        { name: 'Week 2', start: 8, end: 14 },
        { name: 'Week 3', start: 15, end: 21 },
        { name: 'Week 4', start: 22, end: 31 },
      ];

      return categories.map((cat, i) => {
        const dStart = new Date(); dStart.setDate(dStart.getDate() - cat.end);
        const dEnd = new Date(); dEnd.setDate(dEnd.getDate() - cat.start);
        
        const weekTotal = paidAppts
          .filter(a => {
            const ad = new Date(a.appointment_date);
            return ad >= dStart && ad <= dEnd;
          })
          .reduce((sum, a) => sum + Number(a.doctor?.doctor_fee || 0), 0);
        
        return {
          name: cat.name,
          value: weekTotal,
          color: ['#10b981', '#059669', '#047857', '#065f46'][i]
        };
      }).filter(s => s.value > 0);
    }

    // Default: Total breakdown
    return [
      { name: 'Today', value: revenueData.daily, color: '#0f172a' },
      { name: 'This Week', value: Math.max(0, revenueData.weekly - revenueData.daily), color: '#3b82f6' },
      { name: 'This Month', value: Math.max(0, revenueData.monthly - revenueData.weekly), color: '#8b5cf6' },
      { name: 'Previous', value: Math.max(0, revenueData.total - revenueData.monthly), color: '#10b981' },
    ].filter(s => s.value > 0);
  };

  const segments = getSegments();

  const chartData = segments.length > 0 ? segments : [{ name: 'No Revenue', value: 1, color: '#f1f5f9', isPlaceholder: true }];
  
  // If no revenue at all, show a placeholder segment to keep the circle
  if (chartData.length === 0) {
    chartData.push({ name: 'No Revenue', value: 1, color: '#f1f5f9', isPlaceholder: true });
  }

  const getDisplayTotal = () => {
    switch(period) {
      case 'Daily': return revenueData.daily;
      case 'Weekly': return revenueData.weekly;
      case 'Monthly': return revenueData.monthly;
      default: return revenueData.total;
    }
  };

  const onPieEnter = (_, index) => {
    if (chartData[index]?.isPlaceholder) return;
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 4}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}
        />
      </g>
    );
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>Consultation Revenue</h3>
          <p style={styles.amount}>LKR {getDisplayTotal().toLocaleString()}</p>
        </div>
        <div style={styles.tabs}>
          {['Daily', 'Weekly', 'Monthly'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                ...styles.tab,
                ...(period === p ? styles.activeTab : {})
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={chartData.length > 1 ? 4 : 0}
              dataKey="value"
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
              stroke="none"
              animationDuration={800}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            {!chartData[0]?.isPlaceholder && (
              <Tooltip 
                formatter={(value, name, props) => {
                    const segment = segments.find(s => s.name === name);
                    return [`LKR ${value.toLocaleString()}`, 'Source'];
                }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
            )}
          </PieChart>
        </ResponsiveContainer>
        
        <div style={styles.centerLabel}>
          {activeIndex !== null && !chartData[activeIndex]?.isPlaceholder ? (
            <>
              <span style={styles.centerPercent}>
                {Math.round((chartData[activeIndex].value / revenueData.total) * 100)}%
              </span>
              <span style={styles.centerText}>{chartData[activeIndex].name}</span>
            </>
          ) : (
            <>
                <span style={{...styles.centerPercent, fontSize: '18px'}}>Total</span>
                <span style={styles.centerText}>Revenue</span>
            </>
          )}
        </div>
      </div>

      <div style={styles.legendGrid}>
        {segments.filter(s => !s.isPlaceholder).map((item, index) => (
          <div 
            key={item.name} 
            style={styles.legendItem}
            onMouseEnter={() => {
                const chartIdx = chartData.findIndex(s => s.name === item.name);
                if (chartIdx !== -1) setActiveIndex(chartIdx);
            }}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <div style={{ ...styles.dot, backgroundColor: item.color }} />
            <div style={styles.legendInfo}>
              <p style={styles.legendName}>{item.name}</p>
              <p style={styles.legendValue}>LKR {item.value.toLocaleString()}</p>
            </div>
          </div>
        ))}
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
    alignItems: 'flex-start',
    marginBottom: '8px'
  },
  title: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0
  },
  amount: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#1e293b',
    margin: '4px 0 0 0'
  },
  tabs: {
    display: 'flex',
    backgroundColor: '#f1f5f9',
    padding: '4px',
    borderRadius: '10px',
    gap: '2px'
  },
  tab: {
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#64748b',
    border: 'none',
    backgroundColor: 'transparent',
    borderRadius: '7px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  activeTab: {
    backgroundColor: 'white',
    color: '#0f172a',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  chartWrapper: {
    position: 'relative',
    height: '220px'
  },
  centerLabel: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    pointerEvents: 'none'
  },
  centerPercent: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: 1
  },
  centerText: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    marginTop: '2px'
  },
  idleText: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#94a3b8'
  },
  legendGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    marginTop: '16px',
    paddingTop: '20px',
    borderTop: '1px solid #f8fafc'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer'
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0
  },
  legendInfo: {
    display: 'flex',
    flexDirection: 'column'
  },
  legendName: {
    fontSize: '12px',
    color: '#64748b',
    margin: 0,
    fontWeight: '600'
  },
  legendValue: {
    fontSize: '13px',
    color: '#0f172a',
    fontWeight: '800',
    margin: 0
  }
};

export default RevenueChart;
