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
  FiArrowRight,
  FiRepeat,
  FiDollarSign,
  FiClock,
  FiCheckCircle
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
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { useRef } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import AdminHeader from "../../components/AdminHeader";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import { captureComponentAsBase64, getCircularBase64ImageFromURL } from '../../utils/pdfUtils';
import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import logo from "../../assets/medical center logo.png";

// Initialize pdfMake fonts
pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs;

const Reports = () => {
  const navigate = useNavigate();
  const { api, user } = useAuth();
  const adminName = user?.username || 'Admin';
  
  // State
  const [reportType, setReportType] = useState("revenue");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [errors, setErrors] = useState({ startDate: "", endDate: "" });
  
  // Chart Refs for PDF capture
  const barChartRef = useRef(null);
  const pieChartRef = useRef(null);

  const validateDates = (start, end) => {
    const newErrors = { startDate: "", endDate: "" };
    let isValid = true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    const oneYearFuture = new Date();
    oneYearFuture.setFullYear(today.getFullYear() + 1);

    if (start) {
      const sDate = new Date(start);
      if (sDate > today) {
        newErrors.startDate = "From date cannot be in the future";
        isValid = false;
      } else if (sDate < oneYearAgo) {
        newErrors.startDate = "Cannot go back more than 1 year";
        isValid = false;
      }
    }

    if (end) {
      const eDate = new Date(end);
      if (eDate > oneYearFuture) {
        newErrors.endDate = "Limit: 1 year into the future only";
        isValid = false;
      }
    }

    if (start && end) {
      const sDate = new Date(start);
      const eDate = new Date(end);
      if (sDate > eDate) {
        newErrors.endDate = "To date must be after From date";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      setErrors({
        startDate: !startDate ? "Required" : "",
        endDate: !endDate ? "Required" : ""
      });
      toast.error("Please complete the date selection");
      return;
    }

    if (!validateDates(startDate, endDate)) {
      toast.error("Please fix the date errors");
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
        setReportData(response.data.data);
        toast.success("Report generated successfully!");
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
    
    if (reportType === 'income') {
      await generateIncomePDF();
      return;
    }
    
    if (reportType === 'appointments') {
      await generateAppointmentsPDF();
      return;
    }

    setIsExporting(true);
    try {
      const response = await api.get(`/admin/reports/export/${reportType}`, {
        params: { startDate, endDate },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}_report_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("PDF exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const generateIncomePDF = async () => {
    setIsExporting(true);
    try {
      const logoImg = await getCircularBase64ImageFromURL(logo);
      await new Promise(resolve => setTimeout(resolve, 500));
      const payChartImg = await captureComponentAsBase64(pieChartRef.current);
      const statChartImg = await captureComponentAsBase64(barChartRef.current);

      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      const today = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
      const colors = {
        headerBg: '#60a5fa',
        titleBlue: '#1e40af',
        tableHeader: '#4f46e5',
        borderBlue: '#e0e7ff',
        incomeGreen: '#059669',
        refundRed: '#dc2626',
        centerBlue: '#2563eb',
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
          { text: 'ADVANCED INCOME REPORT', style: 'title' },
          { text: `Period: ${startDate} – ${endDate} | Generated: ${today} at ${timeStr}`, style: 'subtitle' },
          { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 0.5, lineColor: colors.headerBg }], margin: [0, 5, 0, 20] },
          
          {
            table: {
              widths: ['50%', '50%'],
              body: [
                [
                  { stack: [{ text: 'TOTAL NET CASH', style: 'kpiLabel' }, { text: `LKR ${reportData.summary.totalNetCash.toLocaleString()}`, style: 'kpiValue' }], fillColor: colors.incomeGreen, colSpan: 2 },
                  {}
                ],
                [
                  { stack: [{ text: 'GROSS CENTER INCOME', style: 'kpiLabel' }, { text: `LKR ${reportData.summary.grossCenterIncome.toLocaleString()}`, style: 'kpiValue' }], fillColor: colors.centerBlue },
                  { stack: [{ text: 'NET DOCTOR REVENUE', style: 'kpiLabel' }, { text: `LKR ${reportData.summary.netDoctorIncome.toLocaleString()}`, style: 'kpiValue' }], fillColor: '#4338ca' }
                ]
              ]
            },
            margin: [0, 0, 0, 30]
          },

          { text: 'FINANCIAL VISUALIZATION', style: 'sectionTitle' },
          {
            columns: [
              {
                stack: [
                  { text: 'Payment Method Breakdown', style: 'chartTitle' },
                  { image: payChartImg, width: 220 }
                ]
              },
              {
                stack: [
                  { text: 'Transaction Volume Breakdown', style: 'chartTitle' },
                  { image: statChartImg, width: 250 }
                ]
              }
            ]
          },
          
          { text: 'DETAILED CALCULATION TABLES', style: 'sectionTitle', margin: [0, 40, 0, 10], pageBreak: 'before' },

          // --- 1. Center Income Table ---
          { text: '1. Gross Center Income Calculation (Non-Refundable Fees)', style: 'tableSubTitle' },
          {
            table: {
              headerRows: 1,
              widths: ['*', 70, 100],
              body: [
                [{ text: 'DOCTOR NAME', style: 'tableHeader' }, { text: 'PATIENTS', style: 'tableHeader', alignment: 'center' }, { text: 'CLINIC PROFIT', style: 'tableHeader', alignment: 'right' }],
                ...reportData.doctorBreakdown.map((doc, i) => [
                  { text: doc.doctorName, fillColor: i % 2 === 0 ? 'white' : colors.altRow },
                  { text: doc.patientCount.toString(), alignment: 'center', fillColor: i % 2 === 0 ? 'white' : colors.altRow },
                  { text: `LKR ${doc.grossCenter.toLocaleString()}`, alignment: 'right', fillColor: i % 2 === 0 ? 'white' : colors.altRow }
                ]),
                [{ text: 'TOTAL GROSS CENTER INCOME', bold: true, colSpan: 2 }, {}, { text: `LKR ${reportData.summary.grossCenterIncome.toLocaleString()}`, bold: true, alignment: 'right' }]
              ]
            },
            margin: [0, 0, 0, 25]
          },

          // --- 2. Doctor Revenue Table ---
          { text: '2. Gross Doctor Revenue Calculation', style: 'tableSubTitle' },
          {
            table: {
              headerRows: 1,
              widths: ['*', 100],
              body: [
                [{ text: 'DOCTOR NAME', style: 'tableHeader' }, { text: 'INITIAL COLLECTION', style: 'tableHeader', alignment: 'right' }],
                ...reportData.doctorBreakdown.map((doc, i) => [
                  { text: doc.doctorName, fillColor: i % 2 === 0 ? 'white' : colors.altRow },
                  { text: `LKR ${doc.grossDoctor.toLocaleString()}`, alignment: 'right', fillColor: i % 2 === 0 ? 'white' : colors.altRow }
                ]),
                [{ text: 'TOTAL INITIAL DOCTOR COLLECTION', bold: true }, { text: `LKR ${reportData.summary.grossDoctorIncome.toLocaleString()}`, bold: true, alignment: 'right' }]
              ]
            },
            margin: [0, 0, 0, 25]
          },

          // --- 3. Refunds Table ---
          { text: '3. Total Refunds Processed (Amount returned to patients)', style: 'tableSubTitle' },
          {
            table: {
              headerRows: 1,
              widths: ['*', 100],
              body: [
                [{ text: 'REFUND DETAILS (BY PATIENT)', style: 'tableHeader' }, { text: 'REFUNDED AMOUNT', style: 'tableHeader', alignment: 'right' }],
                ...(reportData.individualRefunds && reportData.individualRefunds.length > 0 
                  ? reportData.individualRefunds.map((refund, i) => [
                    { text: `Refund for ${refund.patientName}`, fillColor: i % 2 === 0 ? 'white' : colors.altRow },
                    { text: `LKR ${refund.amount.toLocaleString()}`, color: colors.refundRed, alignment: 'right', fillColor: i % 2 === 0 ? 'white' : colors.altRow }
                  ]) 
                  : [['No refunds processed in this period', { text: 'LKR 0', alignment: 'right' }]]),
                [{ text: 'TOTAL REFUNDS ISSUED', bold: true }, { text: `- LKR ${reportData.summary.totalRefunds.toLocaleString()}`, bold: true, color: colors.refundRed, alignment: 'right' }]
              ]
            },
            margin: [0, 0, 0, 25]
          },

          // --- 4. Net Summary Table ---
          { text: '4. Final Net Settlement (Reconciliation Summary)', style: 'tableSubTitle' },
          {
            table: {
              widths: ['*', 120],
              body: [
                [{ text: 'CALCULATION STEP', style: 'tableHeader' }, { text: 'RESULTING VALUE', style: 'tableHeader', alignment: 'right' }],
                ['Net Doctor Revenue', { text: `LKR ${reportData.summary.netDoctorIncome.toLocaleString()}`, alignment: 'right' }],
                ['Center Retained Income', { text: `LKR ${reportData.summary.grossCenterIncome.toLocaleString()}`, alignment: 'right' }],
                [{ text: 'TOTAL NET CASH HELD', bold: true, fillColor: colors.incomeGreen, color: 'white' }, { text: `LKR ${reportData.summary.totalNetCash.toLocaleString()}`, bold: true, alignment: 'right', fillColor: colors.incomeGreen, color: 'white' }]
              ]
            }
          }
        ],
        footer: (currentPage, pageCount) => {
          return {
            stack: [
              { canvas: [{ type: 'line', x1: 40, y1: 0, x2: 555, y2: 0, lineWidth: 0.5, lineColor: colors.borderBlue }] },
              {
                columns: [
                  { text: `* Clinically Audited Income Statement | Issued: ${today} at ${timeStr}`, style: 'footer' },
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
          kpiValue: { fontSize: 13, color: 'white', bold: true, margin: [10, 0, 10, 10] },
          sectionTitle: { fontSize: 13, bold: true, color: colors.titleBlue, margin: [0, 10, 0, 10] },
          tableSubTitle: { fontSize: 10, bold: true, color: colors.labelGray, margin: [0, 10, 0, 5] },
          tableHeader: { fontSize: 9, bold: true, color: 'white', fillColor: colors.tableHeader, padding: 5 },
          chartTitle: { fontSize: 10, bold: true, alignment: 'center', margin: [0, 0, 0, 10] },
          footer: { fontSize: 8, color: colors.labelGray }
        }
      };

      pdfMake.createPdf(docDefinition).download(`Income_Statement_${startDate}_${endDate}.pdf`);
      toast.success("Advanced Income Report Generated!");
    } catch (error) {
      console.error("Income PDF error:", error);
      toast.error("Failed to generate Income PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const generateAppointmentsPDF = async () => {
    setIsExporting(true);
    try {
      // 1. Prepare Base64 Assets
      const logoImg = await getCircularBase64ImageFromURL(logo);
      
      // Wait a moment for charts to be fully rendered and animations to settle
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const barChartImg = await captureComponentAsBase64(barChartRef.current);
      const pieChartImg = await captureComponentAsBase64(pieChartRef.current);

      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      const today = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
      
      // 2. Define colors from palette
      const colors = {
        headerBg: '#60a5fa',
        titleBlue: '#1e40af',
        bodyText: '#1e293b',
        labelGray: '#64748b',
        tableHeader: '#3b82f6',
        borderBlue: '#bfdbfe',
        altRow: '#f8fafc',
        completed: '#177b49',
        cancelled: '#c4352d',
        noshow: '#e67e1d',
        pending: '#2a7ebc',
        totalStats: '#0e7b90'
      };

      // 3. Construct pdfmake definition
      const docDefinition = {
        pageSize: 'A4',
        pageMargins: [40, 40, 40, 60],
        content: [
          // --- Branded Header ---
          {
            table: {
              widths: ['*'],
              body: [[
                {
                  fillColor: colors.headerBg,
                  columns: [
                    {
                      image: logoImg,
                      width: 45,
                      margin: [10, 10, 0, 10],
                    },
                    {
                      stack: [
                        { text: 'Pubudu Medical Center', style: 'hospitalName', margin: [10, 15, 0, 0] },
                      ],
                      width: '*'
                    },
                    {
                      stack: [
                        { text: 'No 46, Matara Road, Hakmana', style: 'contactInfo' },
                        { text: '071-8050917 / 076-9659767 / 076-6880179', style: 'contactInfo' },
                      ],
                      width: 'auto',
                      margin: [0, 15, 10, 0]
                    }
                  ],
                  border: [false, false, false, false]
                }
              ]]
            },
            layout: 'noBorders',
            margin: [-40, -40, -40, 30]
          },

          // --- Title Section ---
          { text: 'APPOINTMENTS REPORT', style: 'title' },
          { text: `Period: ${startDate} – ${endDate}  |  Generated: ${today} at ${timeStr}`, style: 'subtitle' },
          { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 0.5, lineColor: colors.headerBg }], margin: [0, 5, 0, 20] },

          // --- KPI Cards: Row 1 (4 boxes) ---
          {
            table: {
              widths: ['25%', '25%', '25%', '25%'],
              body: [[
                {
                  stack: [
                    { text: 'TOTAL APPOINTMENTS', style: 'kpiLabel' },
                    { text: reportData.totalAppointments.toString(), style: 'kpiValue' }
                  ],
                  fillColor: colors.totalStats,
                  border: [false, false, true, false],
                  borderColor: ['white', 'white', 'white', 'white']
                },
                {
                  stack: [
                    { text: 'COMPLETED', style: 'kpiLabel' },
                    { text: reportData.totalCompleted.toString(), style: 'kpiValue' }
                  ],
                  fillColor: colors.completed,
                  border: [false, false, true, false],
                  borderColor: ['white', 'white', 'white', 'white']
                },
                {
                  stack: [
                    { text: 'CONFIRMED', style: 'kpiLabel' },
                    { text: reportData.totalConfirmed.toString(), style: 'kpiValue' }
                  ],
                  fillColor: '#0891b2',
                  border: [false, false, true, false],
                  borderColor: ['white', 'white', 'white', 'white']
                },
                {
                  stack: [
                    { text: 'CANCELLED', style: 'kpiLabel' },
                    { text: reportData.totalCancelled.toString(), style: 'kpiValue' }
                  ],
                  fillColor: colors.cancelled,
                  border: [false, false, false, false]
                }
              ]]
            },
            margin: [0, 0, 0, 4]
          },
          // --- KPI Cards: Row 2 (3 boxes) ---
          {
            table: {
              widths: ['33.3%', '33.3%', '33.4%'],
              body: [[
                {
                  stack: [
                    { text: 'NO-SHOW (ABSENT)', style: 'kpiLabel' },
                    { text: reportData.totalNoShow.toString(), style: 'kpiValue' }
                  ],
                  fillColor: colors.noshow,
                  border: [false, false, true, false],
                  borderColor: ['white', 'white', 'white', 'white']
                },
                {
                  stack: [
                    { text: 'PENDING', style: 'kpiLabel' },
                    { text: reportData.totalPending.toString(), style: 'kpiValue' }
                  ],
                  fillColor: colors.pending,
                  border: [false, false, true, false],
                  borderColor: ['white', 'white', 'white', 'white']
                },
                {
                  stack: [
                    { text: 'RESCHEDULE REQUIRED', style: 'kpiLabel' },
                    { text: reportData.totalRescheduleRequired.toString(), style: 'kpiValue' }
                  ],
                  fillColor: '#7c3aed',
                  border: [false, false, false, false]
                }
              ]]
            },
            margin: [0, 0, 0, 25]
          },

          // --- Detailed Table ---
          { text: 'APPOINTMENTS BY DOCTOR BREAKDOWN', style: 'sectionTitle' },
          {
            table: {
              headerRows: 1,
              widths: ['*', '*', 34, 40, 40, 38, 38, 38, 44],
              body: [
                [
                  { text: 'DOCTOR', style: 'tableHeader' },
                  { text: 'SPECIALISATION', style: 'tableHeader' },
                  { text: 'TOTAL', style: 'tableHeader', alignment: 'center' },
                  { text: 'DONE', style: 'tableHeader', alignment: 'center' },
                  { text: 'CONFIRMED', style: 'tableHeader', alignment: 'center' },
                  { text: 'CANCEL', style: 'tableHeader', alignment: 'center' },
                  { text: 'NO-SHOW', style: 'tableHeader', alignment: 'center' },
                  { text: 'PENDING', style: 'tableHeader', alignment: 'center' },
                  { text: 'RESCHEDULE', style: 'tableHeader', alignment: 'center' }
                ],
                ...reportData.doctors.map((doc, i) => [
                  { text: doc.doctor_name, style: 'tableCell', fillColor: i % 2 === 0 ? '#fff' : colors.altRow },
                  { text: doc.specialisation, style: 'tableCell', fillColor: i % 2 === 0 ? '#fff' : colors.altRow },
                  { text: doc.total.toString(), style: 'tableCell', alignment: 'center', fillColor: i % 2 === 0 ? '#fff' : colors.altRow },
                  { text: doc.completed.toString(), style: 'tableCell', alignment: 'center', bold: true, color: colors.completed, fillColor: i % 2 === 0 ? '#fff' : colors.altRow },
                  { text: (doc.confirmed || 0).toString(), style: 'tableCell', alignment: 'center', bold: true, color: '#0891b2', fillColor: i % 2 === 0 ? '#fff' : colors.altRow },
                  { text: doc.cancelled.toString(), style: 'tableCell', alignment: 'center', bold: true, color: colors.cancelled, fillColor: i % 2 === 0 ? '#fff' : colors.altRow },
                  { text: doc.noshow.toString(), style: 'tableCell', alignment: 'center', bold: true, color: colors.noshow, fillColor: i % 2 === 0 ? '#fff' : colors.altRow },
                  { text: (doc.pending || 0).toString(), style: 'tableCell', alignment: 'center', bold: true, color: colors.pending, fillColor: i % 2 === 0 ? '#fff' : colors.altRow },
                  { text: (doc.reschedule_required || 0).toString(), style: 'tableCell', alignment: 'center', bold: true, color: '#7c3aed', fillColor: i % 2 === 0 ? '#fff' : colors.altRow }
                ]),
                // Total Row
                [
                  { text: 'GRAND TOTAL', style: 'tableFooter', colSpan: 2 },
                  {},
                  { text: reportData.totalAppointments.toString(), style: 'tableFooter', alignment: 'center' },
                  { text: reportData.totalCompleted.toString(), style: 'tableFooter', alignment: 'center' },
                  { text: reportData.totalConfirmed.toString(), style: 'tableFooter', alignment: 'center' },
                  { text: reportData.totalCancelled.toString(), style: 'tableFooter', alignment: 'center' },
                  { text: reportData.totalNoShow.toString(), style: 'tableFooter', alignment: 'center' },
                  { text: reportData.totalPending.toString(), style: 'tableFooter', alignment: 'center' },
                  { text: reportData.totalRescheduleRequired.toString(), style: 'tableFooter', alignment: 'center' }
                ]
              ]
            },
            layout: {
              hLineWidth: (i, node) => 0.5,
              vLineWidth: (i, node) => 0.5,
              hLineColor: (i, node) => colors.borderBlue,
              vLineColor: (i, node) => colors.borderBlue,
              paddingLeft: (i) => 4,
              paddingRight: (i) => 4,
              paddingTop: (i) => 5,
              paddingBottom: (i) => 5
            },
            margin: [0, 0, 0, 30]
          },

          // --- Analytics Section (Reordered to Vertical Stack) ---
          { text: 'ANALYTICS VISUALIZATION', style: 'sectionTitle', pageBreak: 'before' },
          {
            stack: [
              { text: 'Appointment Volume by Doctor', style: 'chartTitle', alignment: 'center', margin: [0, 0, 0, 10] },
              { image: barChartImg, width: 480, alignment: 'center', margin: [0, 0, 0, 30] },
              
              { text: 'Appointment Status Breakdown', style: 'chartTitle', alignment: 'center', margin: [0, 0, 0, 10] },
              { image: pieChartImg, width: 280, alignment: 'center' }
            ],
            margin: [0, 10, 0, 0]
          }
        ],
        footer: (currentPage, pageCount) => {
          return {
            stack: [
              { canvas: [{ type: 'line', x1: 40, y1: 0, x2: 555, y2: 0, lineWidth: 0.5, lineColor: colors.borderBlue }] },
              {
                columns: [
                  { text: `* Audited Appointment Summary | Issued: ${today} at ${timeStr}`, style: 'footer' },
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
          title: { fontSize: 18, bold: true, color: colors.titleBlue, alignment: 'center', margin: [0, 0, 0, 5] },
          subtitle: { fontSize: 10, color: colors.labelGray, alignment: 'center' },
          kpiLabel: { fontSize: 7, color: 'white', bold: true, margin: [8, 8, 8, 2] },
          kpiValue: { fontSize: 16, color: 'white', bold: true, margin: [8, 0, 8, 8] },
          sectionTitle: { fontSize: 12, bold: true, color: colors.titleBlue, margin: [0, 0, 0, 10] },
          tableHeader: { fontSize: 9, bold: true, color: 'white', fillColor: colors.tableHeader, margin: [2, 4, 2, 4] },
          tableCell: { fontSize: 9, color: colors.bodyText },
          tableFooter: { fontSize: 10, bold: true, color: 'white', fillColor: colors.titleBlue, margin: [2, 6, 2, 6] },
          chartTitle: { fontSize: 10, bold: true, color: colors.bodyText, margin: [0, 0, 0, 10] },
          footer: { fontSize: 8, color: colors.labelGray }
        }
      };

      // 4. Generate and Download
      pdfMake.createPdf(docDefinition).download(`appointments_report_${startDate}_${endDate}.pdf`);
      toast.success("Branded PDF Generated Successfully!");
    } catch (error) {
      console.error("PDF Generation Error:", error);
      toast.error("Critical error in PDF generation. Check console.");
    } finally {
      setIsExporting(false);
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
        <AdminHeader adminName={adminName} />

        <motion.main 
          className="content-padding"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header Title - Personalized Welcome */}
          <div style={styles.headerTitleSection}>
            <h1 style={styles.pageTitle}>Generate Reports</h1>
            <p style={styles.pageSubtitle}>Analyze healthcare performance and financial trends with data-driven insights</p>
          </div>
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
                  <option value="revenue">Revenue Stats (Summary)</option>
                  <option value="income">Advanced Income Report</option>
                  <option value="appointments">Appointment Reports</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>From Date</label>
                <div style={styles.dateInputWrapper}>
                  <FiCalendar style={styles.dateIcon} />
                  <input 
                    type="date" 
                    style={{
                      ...styles.dateInput,
                      ...(errors.startDate ? styles.inputError : {})
                    }}
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      validateDates(e.target.value, endDate);
                    }}
                  />
                </div>
                {errors.startDate && <span style={styles.errorText}>{errors.startDate}</span>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>To Date</label>
                <div style={styles.dateInputWrapper}>
                  <FiCalendar style={styles.dateIcon} />
                  <input 
                    type="date" 
                    style={{
                      ...styles.dateInput,
                      ...(errors.endDate ? styles.inputError : {})
                    }}
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      validateDates(startDate, e.target.value);
                    }}
                  />
                </div>
                {errors.endDate && <span style={styles.errorText}>{errors.endDate}</span>}
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
                       reportType === 'income' ? 'Financial Income Statement' : 'Appointment Trends'}
                    </h3>
                    <p style={styles.resultsPeriod}>Period: {startDate} to {endDate}</p>
                  </div>
                  <button 
                    style={styles.exportBtn} 
                    onClick={handleExportPDF}
                    disabled={isExporting}
                  >
                    {isExporting ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      >
                        <FiActivity size={16} />
                      </motion.div>
                    ) : (
                      <FiDownload size={16} />
                    )}
                    <span>{isExporting ? 'Exporting...' : 'Export PDF'}</span>
                  </button>
                </div>

                {/* Summary Cards */}
                <div style={styles.summaryGrid}>
                  {reportType === 'income' ? (
                    <>
                      <motion.div variants={itemVariants} style={{...styles.summaryCard, borderLeft: '5px solid #059669'}}>
                        <p style={styles.summaryLabel}>Total net cash</p>
                        <h4 style={{...styles.summaryValue, color: '#059669'}}>LKR {reportData.summary.totalNetCash?.toLocaleString()}</h4>
                        <div style={styles.summaryIconBox}><FiDollarSign color="#059669" /></div>
                      </motion.div>
                      <motion.div variants={itemVariants} style={{...styles.summaryCard, borderLeft: '5px solid #2563eb'}}>
                        <p style={styles.summaryLabel}>Center Revenue (Retained)</p>
                        <h4 style={{...styles.summaryValue, color: '#2563eb'}}>LKR {reportData.summary.grossCenterIncome?.toLocaleString()}</h4>
                        <div style={styles.summaryIconBox}><FiGrid color="#2563eb" /></div>
                      </motion.div>
                      <motion.div variants={itemVariants} style={{...styles.summaryCard, borderLeft: '5px solid #dc2626'}}>
                        <p style={styles.summaryLabel}>Total Refunds Given</p>
                        <h4 style={{...styles.summaryValue, color: '#dc2626'}}>LKR {reportData.summary.totalRefunds?.toLocaleString()}</h4>
                        <div style={styles.summaryIconBox}><FiRepeat color="#dc2626" /></div>
                      </motion.div>
                      <motion.div variants={itemVariants} style={styles.summaryCard}>
                        <p style={styles.summaryLabel}>Net Doctor Income</p>
                        <h4 style={styles.summaryValue}>LKR {reportData.summary.netDoctorIncome?.toLocaleString()}</h4>
                        <div style={styles.summaryIconBox}><FiUsers color="#2563eb" /></div>
                      </motion.div>
                      <motion.div variants={itemVariants} style={styles.summaryCard}>
                        <p style={styles.summaryLabel}>Total Bookings</p>
                        <h4 style={styles.summaryValue}>{reportData.summary.totalBookings}</h4>
                        <div style={styles.summaryIconBox}><FiCheckCircle color="#2563eb" /></div>
                      </motion.div>
                      <motion.div variants={itemVariants} style={styles.summaryCard}>
                        <p style={styles.summaryLabel}>No-Show Collections</p>
                        <h4 style={styles.summaryValue}>{reportData.summary.noShowCount}</h4>
                        <div style={styles.summaryIconBox}><FiClock color="#2563eb" /></div>
                      </motion.div>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>

                {/* Chart Section */}
                <div style={styles.chartCard}>
                  <h4 style={styles.chartTitle}>
                    {reportType === 'revenue' ? 'Revenue & Patient Volume per Doctor' : 
                     reportType === 'patients' ? 'Patient Registrations by Source' : 'Appointment Volume per Doctor'}
                  </h4>
                  <div style={{ width: '100%', height: 400 }}>
                    {reportType === 'income' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', alignItems: 'center' }}>
                        <div style={{ width: '100%', height: 400 }}>
                          <h5 style={{ textAlign: 'center', color: '#1e293b', fontSize: '15px', fontWeight: '700', marginBottom: '20px' }}>Appointment Status Distribution</h5>
                          <div ref={barChartRef} style={{ width: '100%', height: '360px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={reportData.charts.appointmentStatus} margin={{ top: 10, right: 30, left: 40, bottom: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#64748b', fontSize: 11 }}
                                    label={{ value: 'Status Type', position: 'insideBottom', offset: -25, fill: '#64748b', fontSize: 11, fontWeight: '600' }}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#3b82f6', fontSize: 12 }} 
                                    allowDecimals={false}
                                    label={{ value: 'Number of Patients', angle: -90, position: 'insideLeft', offset: -25, fill: '#3b82f6', fontSize: 11, fontWeight: '600' }}
                                />
                                <Tooltip cursor={{ fill: '#f8fafc' }} />
                                <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '20px' }} />
                                <Bar dataKey="value" name="Volume" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={50} isAnimationActive={false} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                        
                        <div style={{ width: '100%', maxWidth: '600px', minHeight: '450px', padding: '20px', borderTop: '1px solid #f1f5f9' }}>
                          <h5 style={{ textAlign: 'center', color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Payment Method Reconciliation</h5>
                          <div ref={pieChartRef} style={{ width: '100%', height: '350px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={reportData.charts.paymentMethods}
                                  innerRadius={70}
                                  outerRadius={110}
                                  paddingAngle={5}
                                  dataKey="value"
                                  labelLine={false}
                                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                  isAnimationActive={false}
                                >
                                  <Cell fill="#10b981" />
                                  <Cell fill="#3b82f6" />
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={50} iconType="rect" iconSize={14} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    )}

                    {reportType === 'revenue' && (
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
                    )}


                    {reportType === 'appointments' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', alignItems: 'center' }}>
                        <div style={{ width: '100%', height: 400 }}>
                          <h5 style={{ textAlign: 'center', color: '#64748b', fontSize: '14px', marginBottom: '15px' }}>Appointment Volume per Doctor</h5>
                          <div ref={barChartRef} style={{ width: '100%', height: '360px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={reportData.chartData} margin={{ top: 10, right: 30, left: 20, bottom: 60 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                  dataKey="name" 
                                  axisLine={false} 
                                  tickLine={false} 
                                  tick={{ fill: '#64748b', fontSize: 11 }} 
                                  angle={-45}
                                  textAnchor="end"
                                  interval={0}
                                  label={{ value: 'Doctor Name', position: 'insideBottomRight', offset: -10, fill: '#64748b', fontSize: 11, fontWeight: '600' }}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#3b82f6', fontSize: 12 }} 
                                    allowDecimals={false}
                                    label={{ value: 'Appt. Count', angle: -90, position: 'insideLeft', offset: -10, fill: '#3b82f6', fontSize: 11, fontWeight: '600' }}
                                />
                                <Tooltip cursor={{ fill: '#f8fafc' }} />
                                <Legend verticalAlign="top" align="right" />
                                <Bar 
                                  dataKey="appointments" 
                                  name="Appointment Count" 
                                  fill="#3b82f6" 
                                  radius={[6, 6, 0, 0]} 
                                  barSize={60}
                                  isAnimationActive={false}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                        
                        <div style={{ width: '100%', maxWidth: '600px', minHeight: '450px', padding: '20px', borderTop: '1px solid #f1f5f9' }}>
                          <h5 style={{ textAlign: 'center', color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Appointment Status Breakdown</h5>
                          <div ref={pieChartRef} style={{ width: '100%', height: '350px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={[
                                    { name: 'Completed', value: Number(reportData.totalCompleted) || 0 },
                                    { name: 'Cancelled', value: Number(reportData.totalCancelled) || 0 },
                                    { name: 'No-Show', value: Number(reportData.totalNoShow) || 0 },
                                    { name: 'Pending', value: Number(reportData.totalPending) || 0 }
                                  ]}
                                  innerRadius={70}
                                  outerRadius={110}
                                  paddingAngle={5}
                                  dataKey="value"
                                  labelLine={false}
                                  label={({ percent }) => percent >= 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                                  isAnimationActive={false}
                                >
                                  <Cell fill="#177b49" />
                                  <Cell fill="#c4352d" />
                                  <Cell fill="#e67e1d" />
                                  <Cell fill="#2a7ebc" />
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={50} iconType="rect" iconSize={14} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={styles.resultsFooter}>
                  <button style={styles.cancelBtn} onClick={() => setReportData(null)}>
                    <FiX />
                    <span>Clear Report</span>
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
  errorText: {
    color: '#ef4444',
    fontSize: '11px',
    fontWeight: '700',
    marginTop: '4px',
    marginLeft: '4px',
    display: 'flex',
    alignItems: 'center'
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fff1f2'
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
  headerTitleSection: {
    marginBottom: "32px",
  },
  pageTitle: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#0f172a",
    margin: "0 0 4px 0",
    letterSpacing: "-0.5px",
    fontFamily: "var(--font-accent)",
  },
  pageSubtitle: {
    fontSize: "16px",
    color: "#64748b",
    margin: 0,
    fontWeight: "500",
    fontFamily: "var(--font-main)",
  },
};

export default Reports;
