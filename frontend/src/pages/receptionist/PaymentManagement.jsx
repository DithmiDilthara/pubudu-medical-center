import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiCreditCard, FiAlertCircle, FiUser, FiCalendar, FiDollarSign } from "react-icons/fi";
import ReceptionistSidebar from "../../components/ReceptionistSidebar";
import ReceptionistHeader from "../../components/ReceptionistHeader";

function PaymentManagement() {
    const navigate = useNavigate();

    const [pendingPayments, setPendingPayments] = useState([]);
    const [receptionistName, setReceptionistName] = useState("Receptionist");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem("token");
                const headers = { Authorization: `Bearer ${token}` };
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

                // Fetch Profile
                const profileRes = await axios.get(`${apiUrl}/auth/profile`, { headers });
                if (profileRes.data.success) {
                    setReceptionistName(profileRes.data.data.profile.full_name);
                }

                // Fetch Unpaid Appointments
                const paymentsRes = await axios.get(`${apiUrl}/appointments?payment_status=UNPAID`, { headers });
                if (paymentsRes.data.success) {
                    // Map API data to component structure
                    const mapped = paymentsRes.data.data.map(apt => ({
                        id: apt.appointment_id,
                        patientName: apt.patient?.full_name || 'N/A',
                        patientId: `PHE-${apt.patient_id}`,
                        dateOfService: apt.appointment_date,
                        service: apt.doctor?.specialization || 'Consultation',
                        amount: (apt.doctor?.doctor_fee || 0) + (apt.doctor?.center_fee || 0),
                        status: apt.payment_status.toLowerCase()
                    }));
                    setPendingPayments(mapped);
                }
            } catch (error) {
                console.error("Error fetching payment data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
    };

    const handlePay = (payment) => {
        navigate("/receptionist/payment/confirm", {
            state: {
                appointment: {
                    patientName: payment.patientName,
                    patientId: payment.patientId,
                    dateOfService: payment.dateOfService,
                    service: payment.service,
                    amount: payment.amount
                }
            }
        });
    };

    return (
        <div style={styles.container}>
            {/* Sidebar */}
            <ReceptionistSidebar onLogout={handleLogout} />

            {/* Main Content */}
            <div style={styles.mainWrapper}>
                {/* Header */}
                <ReceptionistHeader receptionistName={receptionistName} />

                {/* Page Content */}
                <main style={styles.mainContent}>
                    <div style={styles.contentContainer}>
                        {/* Page Header */}
                        <div style={styles.pageHeader}>
                            <div>
                                <h1 style={styles.pageTitle}>Payment Management</h1>
                                <p style={styles.pageSubtitle}>
                                    Process payments for pending patient appointments.
                                </p>
                            </div>
                        </div>

                        {/* Pending Payments Section */}
                        <div style={styles.tableSection}>
                            <div style={styles.sectionHeader}>
                                <h2 style={styles.sectionTitle}>
                                    <FiCreditCard style={styles.sectionIcon} />
                                    Pending Payments
                                </h2>
                                <span style={styles.badge}>{pendingPayments.length} Items</span>
                            </div>

                            <div style={styles.tableContainer}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr style={styles.tableHeaderRow}>
                                            <th style={styles.tableHeader}>Patient Details</th>
                                            <th style={styles.tableHeader}>Service & Date</th>
                                            <th style={styles.tableHeader}>Amount Due</th>
                                            <th style={styles.tableHeader}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan="4" style={styles.loadingCell}>Loading payments...</td>
                                            </tr>
                                        ) : pendingPayments.length > 0 ? (
                                            pendingPayments.map((payment) => (
                                                <tr key={payment.id} style={styles.tableRow}>
                                                    <td style={styles.tableCell}>
                                                        <div style={styles.patientInfo}>
                                                            <div style={styles.avatar}>
                                                                <FiUser size={18} />
                                                            </div>
                                                            <div>
                                                                <p style={styles.patientName}>{payment.patientName}</p>
                                                                <p style={styles.patientId}>{payment.patientId}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td style={styles.tableCell}>
                                                        <div style={styles.serviceInfo}>
                                                            <p style={styles.serviceText}>{payment.service}</p>
                                                            <p style={styles.dateText}>
                                                                <FiCalendar size={12} style={{ marginRight: '4px' }} />
                                                                {payment.dateOfService}
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td style={styles.tableCell}>
                                                        <div style={styles.priceTag}>
                                                            <span style={styles.currency}>LKR</span>
                                                            <span style={styles.amountText}>{payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                        </div>
                                                    </td>
                                                    <td style={styles.tableCell}>
                                                        <button
                                                            onClick={() => handlePay(payment)}
                                                            style={styles.payButton}
                                                        >
                                                            Process Pay
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" style={styles.noDataCell}>
                                                    <div style={styles.emptyState}>
                                                        <FiAlertCircle size={40} color="#9ca3af" />
                                                        <p>No pending payments found</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div style={styles.footer}>
                            <button
                                onClick={() => navigate("/receptionist/dashboard")}
                                style={styles.backButton}
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: "flex",
        minHeight: "100vh",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        backgroundColor: "#f9fafb"
    },
    mainWrapper: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #f0f8ff 0%, #e6f2ff 100%)"
    },
    mainContent: {
        flex: 1,
        padding: "32px",
        overflow: "auto"
    },
    contentContainer: {
        maxWidth: "1100px",
        margin: "0 auto"
    },
    pageHeader: {
        marginBottom: "32px"
    },
    pageTitle: {
        fontSize: "32px",
        fontWeight: "800",
        color: "#1f2937",
        margin: 0,
        marginBottom: "8px",
        letterSpacing: "-0.5px"
    },
    pageSubtitle: {
        fontSize: "16px",
        color: "#6b7280",
        margin: 0
    },
    tableSection: {
        backgroundColor: "white",
        borderRadius: "16px",
        padding: "32px",
        boxShadow: "0 12px 30px rgba(0, 102, 204, 0.15)",
        border: "2px solid #0066CC",
        marginBottom: "32px"
    },
    sectionHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "24px"
    },
    sectionTitle: {
        fontSize: "20px",
        fontWeight: "700",
        color: "#1f2937",
        margin: 0,
        display: "flex",
        alignItems: "center"
    },
    sectionIcon: {
        marginRight: '12px',
        color: '#0066CC',
        fontSize: '24px'
    },
    badge: {
        background: '#e6f2ff',
        color: '#0066CC',
        padding: '6px 14px',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: '600'
    },
    tableContainer: {
        overflow: "hidden",
        border: "1px solid #e5e7eb",
        borderRadius: "12px"
    },
    table: {
        width: "100%",
        borderCollapse: "collapse"
    },
    tableHeaderRow: {
        backgroundColor: "#f9fafb",
        borderBottom: "1px solid #e5e7eb"
    },
    tableHeader: {
        textAlign: "left",
        padding: "18px 20px",
        fontSize: "13px",
        fontWeight: "700",
        color: "#4b5563",
        textTransform: "uppercase",
        letterSpacing: "1px"
    },
    tableRow: {
        borderBottom: "1px solid #f3f4f6",
        transition: "all 0.2s"
    },
    tableCell: {
        padding: "20px",
        fontSize: "14px"
    },
    patientInfo: {
        display: "flex",
        alignItems: "center",
        gap: "12px"
    },
    avatar: {
        width: "36px",
        height: "36px",
        borderRadius: "10px",
        backgroundColor: "#0066CC",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    patientName: {
        fontSize: "15px",
        fontWeight: "700",
        color: "#111827",
        margin: 0
    },
    patientId: {
        fontSize: "12px",
        fontWeight: "600",
        color: "#0066CC",
        margin: 0,
        marginTop: "2px"
    },
    serviceInfo: {
        display: "flex",
        flexDirection: "column",
        gap: "4px"
    },
    serviceText: {
        margin: 0,
        fontWeight: "600",
        color: "#374151"
    },
    dateText: {
        margin: 0,
        fontSize: "13px",
        color: "#6b7280",
        display: "flex",
        alignItems: "center"
    },
    priceTag: {
        display: "flex",
        alignItems: "baseline",
        gap: "4px"
    },
    currency: {
        fontSize: "12px",
        fontWeight: "700",
        color: "#6b7280"
    },
    amountText: {
        fontSize: "18px",
        fontWeight: "800",
        color: "#111827"
    },
    payButton: {
        padding: "10px 24px",
        fontSize: "14px",
        fontWeight: "700",
        color: "white",
        background: "linear-gradient(135deg, #0066CC 0%, #0052A3 100%)",
        border: "none",
        borderRadius: "10px",
        cursor: "pointer",
        transition: "all 0.2s",
        boxShadow: "0 4px 12px rgba(0, 102, 204, 0.3)"
    },
    loadingCell: {
        padding: "40px",
        textAlign: "center",
        color: "#6b7280",
        fontStyle: "italic"
    },
    noDataCell: {
        padding: "60px 20px",
        textAlign: "center"
    },
    emptyState: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
        color: "#6b7280"
    },
    footer: {
        display: "flex",
        justifyContent: "flex-end"
    },
    backButton: {
        padding: "12px 24px",
        border: "none",
        borderRadius: "10px",
        background: "#0066CC",
        color: "white",
        fontWeight: "700",
        cursor: "pointer",
        transition: "all 0.2s",
        boxShadow: "0 4px 12px rgba(0, 102, 204, 0.2)"
    }
};

export default PaymentManagement;
