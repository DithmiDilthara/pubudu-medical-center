import React, { useState, useEffect } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip 
} from 'recharts';


const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'];

function RevenueDonutChart() {
  const [activeTab, setActiveTab] = useState('Weekly');
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const tabs = ['Daily', 'Weekly', 'Monthly'];

  useEffect(() => {
    const fetchRevenue = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const response = await fetch(`${apiUrl}/admin/dashboard-data?period=${activeTab}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await response.json();
        if (result.success && result.data.revenueByDoctor) {
          setData(result.data.revenueByDoctor);
        }
      } catch (error) {
        console.error("Error fetching revenue data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRevenue();
  }, [activeTab]);

  const totalRevenue = data.reduce((acc, curr) => acc + curr.value, 0);

  const formatCurrency = (value) => {
    return `LKR ${value.toLocaleString()}`;
  };

  return (
    <div style={styles.chartCard}>
      <h3 style={styles.cardTitle}>Revenue by Doctor</h3>
      
      <div style={styles.tabsContainer}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              ...styles.tab,
              ...(activeTab === tab ? styles.activeTab : {})
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={styles.chartWrapper}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '220px', width: '100%', color: '#64748b', fontSize: '13px' }}>
            Updating...
          </div>
        ) : data.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '220px', width: '100%', color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '0 20px' }}>
            No revenue in this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
                animationDuration={1500}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={4} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => formatCurrency(value)}
                contentStyle={styles.tooltip}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
        
        {!isLoading && data.length > 0 && (
          <div style={styles.centerLabel}>
            <p style={styles.centerLabelText}>Total</p>
            <p style={styles.centerLabelValue}>{formatCurrency(totalRevenue)}</p>
          </div>
        )}
      </div>

      <div style={styles.legendContainer}>
        {data.map((entry, index) => (
          <div key={entry.name} style={styles.legendItem}>
            <div style={styles.legendLeft}>
              <div style={{ ...styles.legendDot, backgroundColor: COLORS[index % COLORS.length] }} />
              <span style={styles.legendName}>{entry.name}</span>
            </div>
            <span style={styles.legendValue}>{formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  chartCard: {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "24px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#0f172a",
    margin: 0,
    fontFamily: "var(--font-accent)",
  },
  tabsContainer: {
    display: "flex",
    backgroundColor: "#f1f5f9",
    padding: "4px",
    borderRadius: "12px",
    gap: "4px",
  },
  tab: {
    flex: 1,
    padding: "8px 0",
    fontSize: "13px",
    fontWeight: "600",
    color: "#64748b",
    border: "none",
    backgroundColor: "transparent",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  activeTab: {
    backgroundColor: "white",
    color: "#2563eb",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
  },
  chartWrapper: {
    position: "relative",
    width: "100%",
    height: "220px",
  },
  centerLabel: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    textAlign: "center",
    pointerEvents: "none",
  },
  centerLabelText: {
    fontSize: "12px",
    color: "#64748b",
    margin: 0,
    fontWeight: "600",
  },
  centerLabelValue: {
    fontSize: "15px", // Slightly smaller to fit formatted text nicely
    fontWeight: "800",
    color: "#0f172a",
    margin: 0,
    fontFamily: "var(--font-accent)",
  },
  legendContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "10px",
  },
  legendItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  legendLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  legendDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
  },
  legendName: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#64748b",
  },
  legendValue: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#0f172a",
  },
  tooltip: {
    borderRadius: '12px',
    border: 'none',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    padding: '12px',
    backgroundColor: 'white',
  }
};

export default RevenueDonutChart;
