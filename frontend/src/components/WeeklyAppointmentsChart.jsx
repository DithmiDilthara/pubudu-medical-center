import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { FiChevronDown } from 'react-icons/fi';

function WeeklyAppointmentsChart() {
  const [data, setData] = React.useState([
    { name: 'Mon', value: 0 },
    { name: 'Tue', value: 0 },
    { name: 'Wed', value: 0 },
    { name: 'Thu', value: 0 },
    { name: 'Fri', value: 0 },
    { name: 'Sat', value: 0 },
    { name: 'Sun', value: 0 },
  ]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchTrend = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const response = await fetch(`${apiUrl}/admin/dashboard-data`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await response.json();
        if (result.success && result.data.weeklyTrend) {
          setData(result.data.weeklyTrend);
        }
      } catch (error) {
        console.error("Error fetching weekly trend:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrend();
  }, []);

  return (
    <div style={styles.chartCard}>
      <div style={styles.cardHeader}>
        <div>
          <h3 style={styles.cardTitle}>Weekly Appointments</h3>
          <p style={styles.cardSubtitle}>Last 7 Days Trend</p>
        </div>
      </div>
      
      <div style={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={300}>
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#64748b' }}>
              Loading chart data...
            </div>
          ) : (
            <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
              />
              <Tooltip 
                contentStyle={styles.tooltip}
                itemStyle={{ color: '#2563eb', fontWeight: 700 }}
                cursor={{ stroke: '#2563eb', strokeWidth: 1 }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#2563eb" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorValue)" 
                animationDuration={1500}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
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
    gap: "24px",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#0f172a",
    margin: "0 0 4px 0",
    fontFamily: "var(--font-accent)",
  },
  cardSubtitle: {
    fontSize: "14px",
    color: "#64748b",
    margin: 0,
    fontWeight: "500",
    fontFamily: "var(--font-main)",
  },
  dropdown: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 14px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    color: "#64748b",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    backgroundColor: "#f8fafc",
  },
  chartWrapper: {
    width: "100%",
    marginTop: "10px",
  },
  tooltip: {
    borderRadius: '12px',
    border: 'none',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    padding: '12px',
    backgroundColor: 'white',
  }
};

export default WeeklyAppointmentsChart;
