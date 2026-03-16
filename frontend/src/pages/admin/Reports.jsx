import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiFileText, 
  FiCalendar, 
  FiDownload, 
  FiBarChart2, 
  FiActivity, 
  FiTrendingUp, 
  FiUsers, 
  FiGrid,
  FiX,
  FiArrowRight
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import AdminSidebar from "../../components/AdminSidebar";
import AdminHeader from "../../components/AdminHeader";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";

const Reports = () => {
  const navigate = useNavigate();
  const { api } = useAuth();
  
  // State
  const [reportType, setReportType] = useState("revenue");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  // Mock Data Generation for Chart
  const mockChartData = [
    { name: 'Pediatrics', revenue: 45000, patients: 12 },
    { name: 'Cardiology', revenue: 52000, patients: 8 },
    { name: 'Neurology', revenue: 38000, patients: 5 },
    { name: 'Dermatology', revenue: 25000, patients: 15 },
    { name: 'General', revenue: 18000, patients: 22 },
  ];

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select a date range");
      return;
    }

    setIsLoading(true);
    // Simulated delay as requested
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const response = await api.get(`/admin/reports/${reportType}`, {
        params: { startDate, endDate }
      });

      if (response.data.success) {
        setReportData({
          ...response.data.data,
          chartData: mockChartData // Injecting mock chart data for visualization
        });
        toast.success("Report generated successfully!");
      }
    } catch (error) {
      console.error("Report error:", error);
      toast.error("Failed to generate report");
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 }
  };

  return (
    <div style={styles.container}>
      <AdminSidebar />
      <div className="main-wrapper">
        <AdminHeader title="Business Intelligence" />

        <motion.main 
          className="content-padding"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Report Generator Form */}
          <div style={styles.generatorCard}>
            <div style={styles.cardHeader}>
              <div style={styles.iconWrapper}>
                <FiFileText size={20} color="#2563eb" />
              </div>
              <h2 style={styles.cardTitle}>Generate Report</h2>
            </div>

            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Report Type</label>
                <select 
                  style={styles.select}
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <option value="revenue">Revenue Report</option>
                  <option value="patients">Patient Registration Report</option>
                  <option value="appointments">Appointment Reports</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>From Date</label>
                <div style={styles.dateInputWrapper}>
                  <FiCalendar style={styles.dateIcon} />
                  <input 
                    type="date" 
                    style={styles.dateInput}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>To Date</label>
                <div style={styles.dateInputWrapper}>
                  <FiCalendar style={styles.dateIcon} />
                  <input 
                    type="date" 
                    style={styles.dateInput}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>&nbsp;</label>
                <button 
                  style={styles.generateBtn}
                  onClick={handleGenerateReport}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    >
                      <FiActivity />
                    </motion.div>
                  ) : (
                    <FiBarChart2 />
                  )}
                  <span>{isLoading ? 'Processing...' : 'Generate Report'}</span>
                </button>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {reportData && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                style={styles.reportResults}
              >
                {/* Report Results Header */}
                <div style={styles.resultsHeader}>
                  <div>
                    <h3 style={styles.resultsTitle}>
                      {reportType === 'revenue' ? 'Revenue Analytics' : 
                       reportType === 'patients' ? 'Patient Demographics' : 'Appointment Trends'}
                    </h3>
                    <p style={styles.resultsPeriod}>Period: {startDate} to {endDate}</p>
                  </div>
                  <button style={styles.exportBtn}>
                    <FiDownload size={16} />
                    <span>Export PDF</span>
                  </button>
                </div>

                {/* Summary Cards */}
                <div style={styles.summaryGrid}>
                  <motion.div variants={itemVariants} style={styles.summaryCard}>
                    <p style={styles.summaryLabel}>Total Revenue</p>
                    <h4 style={styles.summaryValue}>LKR {reportData.totalRevenue?.toLocaleString() || '178,000'}</h4>
                    <div style={styles.trendUp}>
                      <FiTrendingUp size={12} />
                      <span>+12.5% vs Prev</span>
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} style={styles.summaryCard}>
                    <p style={styles.summaryLabel}>Total Patients</p>
                    <h4 style={styles.summaryValue}>{reportData.appointmentCount || '73'}</h4>
                    <div style={styles.summaryIconBox}><FiUsers color="#2563eb" /></div>
                  </motion.div>

                  <motion.div variants={itemVariants} style={styles.summaryCard}>
                    <p style={styles.summaryLabel}>Top Department</p>
                    <h4 style={{...styles.summaryValue, color: '#059669'}}>Pediatrics</h4>
                    <div style={styles.summaryIconBox}><FiGrid color="#059669" /></div>
                  </motion.div>
                </div>

                {/* Chart Section */}
                <div style={styles.chartCard}>
                  <h4 style={styles.chartTitle}>Departmental Revenue vs Patient Volume</h4>
                  <div style={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer>
                      <BarChart data={reportData.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#64748b', fontSize: 12 }} 
                        />
                        <YAxis 
                          yAxisId="left" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#2563eb', fontSize: 12 }}
                          label={{ value: 'Revenue (LKR)', angle: -90, position: 'insideLeft', offset: 10, fill: '#2563eb', fontSize: 11 }}
                        />
                        <YAxis 
                          yAxisId="right" 
                          orientation="right" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#60a5fa', fontSize: 12 }}
                          label={{ value: 'Patient Count', angle: 90, position: 'insideRight', offset: 10, fill: '#60a5fa', fontSize: 11 }}
                        />
                        <Tooltip 
                          cursor={{ fill: '#f8fafc' }}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar 
                          yAxisId="left" 
                          dataKey="revenue" 
                          name="Revenue (LKR)" 
                          fill="#2563eb" 
                          radius={[6, 6, 0, 0]} 
                          barSize={40} 
                        />
                        <Bar 
                          yAxisId="right" 
                          dataKey="patients" 
                          name="Patient Volume" 
                          fill="#93c5fd" 
                          radius={[6, 6, 0, 0]} 
                          barSize={40} 
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={styles.resultsFooter}>
                  <button style={styles.cancelBtn} onClick={() => setReportData(null)}>
                    <FiX />
                    <span>Clear Report</span>
                  </button>
                  <button style={styles.scheduleBtn}>
                    <span>Schedule Follow-up</span>
                    <FiArrowRight />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.main>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f8fafc'
  },
  generatorCard: {
    backgroundColor: 'white',
    borderRadius: '24px',
    padding: '32px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    marginBottom: '32px',
    border: '1px solid #f1f5f9'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '28px'
  },
  iconWrapper: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    backgroundColor: '#eff6ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: '-0.5px',
    margin: 0
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
    alignItems: 'flex-end'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  select: {
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    backgroundColor: 'white',
    fontSize: '14px',
    color: '#0f172a',
    outline: 'none',
    cursor: 'pointer'
  },
  dateInputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  dateIcon: {
    position: 'absolute',
    left: '14px',
    color: '#94a3b8'
  },
  dateInput: {
    width: '100%',
    padding: '12px 14px 12px 42px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    color: '#0f172a',
    outline: 'none'
  },
  generateBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '12px 24px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.2)'
  },
  reportResults: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px'
  },
  resultsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  resultsTitle: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 4px 0'
  },
  resultsPeriod: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0
  },
  exportBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px'
  },
  summaryCard: {
    backgroundColor: '#f8fafc',
    borderRadius: '20px',
    padding: '24px',
    border: '1px solid #f1f5f9',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  summaryLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#64748b',
    margin: 0
  },
  summaryValue: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#2563eb',
    margin: 0
  },
  trendUp: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: '#059669',
    fontSize: '12px',
    fontWeight: '700'
  },
  summaryIconBox: {
    position: 'absolute',
    top: '24px',
    right: '24px',
    width: '32px',
    height: '32px',
    borderRadius: '10px',
    backgroundColor: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
  },
  chartCard: {
    backgroundColor: 'white',
    borderRadius: '24px',
    padding: '32px',
    border: '1px solid #f1f5f9',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  chartTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '32px'
  },
  resultsFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '16px'
  },
  cancelBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: 'transparent',
    color: '#64748b',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  scheduleBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 32px',
    backgroundColor: '#0f172a',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.2)'
  }
};

export default Reports;
