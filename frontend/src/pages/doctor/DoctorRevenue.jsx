import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiFileText, 
  FiCalendar, 
  FiDownload, 
  FiBarChart2, 
  FiActivity, 
  FiDollarSign,
  FiRepeat,
  FiUsers,
  FiGrid
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import DoctorSidebar from "../../components/DoctorSidebar";
import DoctorHeader from "../../components/DoctorHeader";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import { getCircularBase64ImageFromURL } from '../../utils/pdfUtils';
import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import logo from "../../assets/medical center logo.png";

// Initialize pdfMake fonts
pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs;

const DoctorRevenue = () => {
  const navigate = useNavigate();
  const { api, user } = useAuth();
  const doctorName = user?.username || 'Doctor';
  
  // State
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [reportData, setReportData] = useState(null);

  // Set default dates to current month on load
  useEffect(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Format dates to YYYY-MM-DD
    const formatDate = (d) => {
        const offset = d.getTimezoneOffset() * 60000;
        return (new Date(d.getTime() - offset)).toISOString().split('T')[0];
    };
    
    setStartDate(formatDate(firstDay));
    setEndDate(formatDate(today));
  }, []);

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select a date range");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.get(`/doctors/me/revenue`, {
        params: { startDate, endDate }
      });

      if (response.data.success) {
        setReportData(response.data.data);
        toast.success("Revenue report generated successfully!");
      }
    } catch (error) {
      console.error("Report error:", error);
      toast.error("Failed to generate report");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!reportData) return;
    setIsExporting(true);
    
    try {
      const logoImg = await getCircularBase64ImageFromURL(logo);

      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      const today = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
      const colors = {
        headerBg: '#60a5fa',
        titleBlue: '#1e40af',
        tableHeader: '#4338ca',
        borderBlue: '#e0e7ff',
        incomeBlue: '#2563eb',
        refundRed: '#dc2626',
        netGreen: '#059669',
        labelGray: '#64748b',
        altRow: '#f8fafc'
      };

      const docDefinition = {
        pageSize: 'A4',
        pageMargins: [40, 40, 40, 60],
        content: [
          {
            table: {
               widths: ['*'],
              body: [[
                {
                  fillColor: colors.headerBg,
                  columns: [
                    { image: logoImg, width: 45, margin: [10, 10, 0, 10] },
                    { text: 'Pubudu Medical Center', style: 'hospitalName', margin: [10, 15, 0, 0], width: '*' },
                    {
                      stack: [
                        { text: 'No 46, Matara Road, Hakmana', style: 'contactInfo' },
                        { text: '071-8050917 / 076-9659767 / 076-6880179', style: 'contactInfo' },
                      ],
                      width: 'auto', margin: [0, 15, 10, 0]
                    }
                  ],
                  border: [false, false, false, false]
                }
              ]]
            },
            layout: 'noBorders', margin: [-40, -40, -40, 30]
          },
          { text: 'MY REVENUE STATEMENT', style: 'title' },
          { text: `Doctor: ${doctorName} | Period: ${startDate} – ${endDate} | Issued: ${today} at ${timeStr}`, style: 'subtitle' },
          { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 0.5, lineColor: colors.headerBg }], margin: [0, 5, 0, 20] },
          
          {
            table: {
              widths: ['33%', '33%', '34%'],
              body: [
                [
                  { stack: [{ text: 'GROSS EARNINGS', style: 'kpiLabel' }, { text: `LKR ${(reportData.totalGross || 0).toLocaleString()}`, style: 'kpiValue' }], fillColor: colors.incomeBlue },
                  { stack: [{ text: 'REFUND DEDUCTIONS', style: 'kpiLabel' }, { text: `- LKR ${(reportData.totalRefunds || 0).toLocaleString()}`, style: 'kpiValue' }], fillColor: colors.refundRed },
                  { stack: [{ text: 'NET PAYOUT', style: 'kpiLabel' }, { text: `LKR ${(reportData.totalNet || 0).toLocaleString()}`, style: 'kpiValue' }], fillColor: colors.netGreen }
                ]
              ]
            },
            margin: [0, 0, 0, 30]
          },

          { text: 'SESSION-BY-SESSION BREAKDOWN', style: 'sectionTitle', margin: [0, 10, 0, 10] },
          
          {
            table: {
              headerRows: 1,
              widths: [80, 80, 50, 70, 60, 80],
              body: [
                [
                  { text: 'DATE', style: 'tableHeader' }, 
                  { text: 'TIME SLOT', style: 'tableHeader' }, 
                  { text: 'COMPLETED PATIENTS', style: 'tableHeader', alignment: 'center' }, 
                  { text: 'GROSS FEE', style: 'tableHeader', alignment: 'right' },
                  { text: 'REFUNDED COUNT', style: 'tableHeader', alignment: 'center' },
                  { text: 'NET PAYOUT', style: 'tableHeader', alignment: 'right' }
                ],
                ...reportData.breakdown.map((session, i) => [
                  { text: session.date, fillColor: i % 2 === 0 ? 'white' : colors.altRow, fontSize: 9 },
                  { text: session.time_slot, fillColor: i % 2 === 0 ? 'white' : colors.altRow, fontSize: 9 },
                  { text: (session.completed_patients || 0).toString(), alignment: 'center', fillColor: i % 2 === 0 ? 'white' : colors.altRow, fontSize: 9 },
                  { text: `LKR ${(session.gross_fee || 0).toLocaleString()}`, alignment: 'right', fillColor: i % 2 === 0 ? 'white' : colors.altRow, fontSize: 9 },
                  { text: (session.refunded_patients || 0).toString(), alignment: 'center', fillColor: i % 2 === 0 ? 'white' : colors.altRow, fontSize: 9, color: session.refunded_patients > 0 ? colors.refundRed : 'black' },
                  { text: `LKR ${(session.net_payout || 0).toLocaleString()}`, alignment: 'right', fillColor: i % 2 === 0 ? 'white' : colors.altRow, fontSize: 9, bold: true }
                ]),
                // Final Total Row
                [
                   { text: 'TOTALS', bold: true, colSpan: 2 },
                   {},
                   { text: reportData.breakdown.reduce((sum, s) => sum + s.completed_patients, 0).toString(), bold: true, alignment: 'center' },
                   { text: `LKR ${(reportData.totalGross || 0).toLocaleString()}`, bold: true, alignment: 'right' },
                   { text: reportData.breakdown.reduce((sum, s) => sum + s.refunded_patients, 0).toString(), bold: true, alignment: 'center', color: colors.refundRed },
                   { text: `LKR ${(reportData.totalNet || 0).toLocaleString()}`, bold: true, alignment: 'right', color: colors.netGreen }
                ]
              ]
            },
            margin: [0, 0, 0, 25]
          }
        ],
        footer: (currentPage, pageCount) => {
          return {
            stack: [
              { canvas: [{ type: 'line', x1: 40, y1: 0, x2: 555, y2: 0, lineWidth: 0.5, lineColor: colors.borderBlue }] },
              {
                columns: [
                  { text: `* Note: No-Show patients are excluded. | Issued: ${today} at ${timeStr}`, style: 'footer' },
                  { text: `Page ${currentPage} of ${pageCount}`, style: 'footer', alignment: 'right' }
                ],
                margin: [40, 10, 40, 0]
              }
            ]
          };
        },
        styles: {
          hospitalName: { fontSize: 18, bold: true, color: 'white' },
          contactInfo: { fontSize: 9, color: 'white', alignment: 'right' },
          title: { fontSize: 18, bold: true, color: colors.titleBlue, alignment: 'center' },
          subtitle: { fontSize: 10, color: '#64748b', alignment: 'center', margin: [0, 5, 0, 0] },
          kpiLabel: { fontSize: 8, color: 'white', bold: true, margin: [10, 10, 10, 2] },
          kpiValue: { fontSize: 14, color: 'white', bold: true, margin: [10, 0, 10, 10] },
          sectionTitle: { fontSize: 13, bold: true, color: colors.titleBlue, margin: [0, 10, 0, 10] },
          tableHeader: { fontSize: 8, bold: true, color: 'white', fillColor: colors.tableHeader, padding: 5 },
          footer: { fontSize: 8, color: colors.labelGray }
        }
      };

      pdfMake.createPdf(docDefinition).download(`My_Revenue_${startDate}_${endDate}.pdf`);
      toast.success("Revenue PDF Exported!");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 }
  };

  return (
    <div style={styles.container}>
      <DoctorSidebar />
      <div className="main-wrapper">
        <DoctorHeader doctorName={doctorName} />

        <motion.main 
          className="content-padding"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div style={styles.headerTitleSection}>
            <h1 style={styles.pageTitle}>My Revenue Report</h1>
            <p style={styles.pageSubtitle}>Track your earnings, monitor completed sessions, and view secure financial reports.</p>
          </div>

          <div style={styles.generatorCard}>
            <div style={styles.cardHeader}>
              <div style={styles.iconWrapper}>
                <FiFileText size={20} color="#2563eb" />
              </div>
              <h2 style={styles.cardTitle}>Configure Reporting Period</h2>
            </div>

            <div style={styles.formGrid}>
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
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                      <FiActivity />
                    </motion.div>
                  ) : (
                    <FiBarChart2 />
                  )}
                  <span>{isLoading ? 'Processing...' : 'Pull Report'}</span>
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
                <div style={styles.resultsHeader}>
                  <div>
                    <h3 style={styles.resultsTitle}>Detailed Financial Statement</h3>
                    <p style={styles.resultsPeriod}>Period: {startDate} to {endDate}</p>
                  </div>
                  <button 
                    style={styles.exportBtn} 
                    onClick={handleExportPDF}
                    disabled={isExporting}
                  >
                    {isExporting ? <FiActivity size={16} /> : <FiDownload size={16} />}
                    <span>{isExporting ? 'Exporting...' : 'Export PDF'}</span>
                  </button>
                </div>

                <div style={styles.summaryGrid}>
                  <motion.div variants={itemVariants} style={{...styles.summaryCard, borderLeft: '5px solid #2563eb'}}>
                    <p style={styles.summaryLabel}>Gross Earnings (Completed)</p>
                    <h4 style={{...styles.summaryValue, color: '#2563eb'}}>LKR {reportData.totalGross?.toLocaleString()}</h4>
                    <div style={styles.summaryIconBox}><FiDollarSign color="#2563eb" /></div>
                  </motion.div>
                  
                  <motion.div variants={itemVariants} style={{...styles.summaryCard, borderLeft: '5px solid #dc2626'}}>
                    <p style={styles.summaryLabel}>Total Refund Deductions</p>
                    <h4 style={{...styles.summaryValue, color: '#dc2626'}}>- LKR {reportData.totalRefunds?.toLocaleString()}</h4>
                    <div style={styles.summaryIconBox}><FiRepeat color="#dc2626" /></div>
                  </motion.div>

                  <motion.div variants={itemVariants} style={{...styles.summaryCard, borderLeft: '5px solid #059669', transform: 'scale(1.02)'}}>
                    <p style={styles.summaryLabel}>Actual Net Payout</p>
                    <h4 style={{...styles.summaryValue, color: '#059669'}}>LKR {reportData.totalNet?.toLocaleString()}</h4>
                    <div style={styles.summaryIconBox}><FiGrid color="#059669" /></div>
                  </motion.div>
                </div>

                <div style={styles.chartCard}>
                  <h4 style={styles.chartTitle}>Session Breakdown</h4>
                  <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>No-show patients are deliberately excluded from all calculations.</p>
                  
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Date</th>
                          <th style={styles.th}>Time Slot</th>
                          <th style={{...styles.th, textAlign: 'center'}}>Completed Patients</th>
                          <th style={{...styles.th, textAlign: 'right'}}>Gross Fee</th>
                          <th style={{...styles.th, textAlign: 'center'}}>Refunds</th>
                          <th style={{...styles.th, textAlign: 'right'}}>Net Payout</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.breakdown.length > 0 ? (
                            reportData.breakdown.map((session, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: idx % 2 === 0 ? 'white' : '#f8fafc' }}>
                                <td style={styles.td}>{session.date}</td>
                                <td style={styles.td}>{session.time_slot}</td>
                                <td style={{...styles.td, textAlign: 'center'}}>{session.completed_patients || 0}</td>
                                <td style={{...styles.td, textAlign: 'right'}}>LKR {(session.gross_fee || 0).toLocaleString()}</td>
                                <td style={{...styles.td, textAlign: 'center', color: session.refunded_patients > 0 ? '#dc2626' : '#64748b'}}>
                                {session.refunded_patients || 0}
                                </td>
                                <td style={{...styles.td, textAlign: 'right', fontWeight: 'bold', color: '#0f172a'}}>LKR {(session.net_payout || 0).toLocaleString()}</td>
                            </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                                    No financial data available for this date range.
                                </td>
                            </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
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
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    fontFamily: "'Inter', sans-serif"
  },
  headerTitleSection: {
    marginBottom: "32px"
  },
  pageTitle: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#0f172a",
    margin: "0 0 8px 0",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    letterSpacing: "-0.5px"
  },
  pageSubtitle: {
    fontSize: "15px",
    color: "#64748b",
    margin: 0
  },
  generatorCard: {
    backgroundColor: "white",
    borderRadius: "20px",
    padding: "32px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
    border: "1px solid #f1f5f9",
    marginBottom: "32px"
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "24px"
  },
  iconWrapper: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    backgroundColor: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1e293b",
    margin: 0
  },
  formGrid: {
    display: "flex",
    gap: "24px",
    alignItems: "flex-end",
    flexWrap: "wrap"
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    flex: "1",
    minWidth: "200px"
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.05em"
  },
  dateInputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center"
  },
  dateIcon: {
    position: "absolute",
    left: "14px",
    color: "#94a3b8",
    fontSize: "18px"
  },
  dateInput: {
    width: "100%",
    padding: "12px 14px 12px 40px",
    fontSize: "15px",
    color: "#1e293b",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    outline: "none",
    transition: "all 0.2s"
  },
  generateBtn: {
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    padding: "14px 24px",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    transition: "all 0.2s",
    boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.2)"
  },
  reportResults: {
    display: "flex",
    flexDirection: "column",
    gap: "24px"
  },
  resultsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 8px"
  },
  resultsTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#0f172a",
    margin: "0 0 6px 0"
  },
  resultsPeriod: {
    fontSize: "14px",
    color: "#64748b",
    margin: 0
  },
  exportBtn: {
    backgroundColor: "white",
    color: "#0f172a",
    border: "1px solid #e2e8f0",
    padding: "10px 20px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "24px"
  },
  summaryCard: {
    backgroundColor: "white",
    borderRadius: "20px",
    padding: "24px",
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
    border: "1px solid #f1f5f9"
  },
  summaryLabel: {
    fontSize: "13px",
    color: "#64748b",
    fontWeight: "600",
    margin: "0 0 8px 0",
    textTransform: "uppercase",
    letterSpacing: "0.05em"
  },
  summaryValue: {
    fontSize: "32px",
    fontWeight: "800",
    margin: 0,
    fontFamily: "'Plus Jakarta Sans', sans-serif"
  },
  summaryIconBox: {
    position: "absolute",
    right: "24px",
    bottom: "24px",
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    backgroundColor: "#f8fafc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    opacity: 0.8
  },
  chartCard: {
    backgroundColor: "white",
    borderRadius: "20px",
    padding: "32px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
    border: "1px solid #f1f5f9"
  },
  chartTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1e293b",
    margin: "0 0 4px 0"
  },
  th: {
    padding: '16px',
    backgroundColor: '#f8fafc',
    color: '#64748b',
    fontWeight: '700',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '2px solid #e2e8f0'
  },
  td: {
    padding: '16px',
    fontSize: '14px',
    color: '#334155'
  }
};

export default DoctorRevenue;
