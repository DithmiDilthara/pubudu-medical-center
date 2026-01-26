import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCreditCard, FiAlertCircle } from "react-icons/fi";
import ReceptionistSidebar from "../../components/ReceptionistSidebar";
import ReceptionistHeader from "../../components/ReceptionistHeader";

function PaymentManagement() {
    const navigate = useNavigate();

    // Sample pending appointments data
    const [pendingPayments, setPendingPayments] = useState([
        {
            id: 1,
            patientName: "Kamal Perera",
            patientId: "PHE-2037",
            dateOfService: "2024-07-20",
            service: "General Checkup",
            amount: 1500.00,
            status: "pending"
        },
        {
            id: 2,
            patientName: "Wanisha Ekanayake",
            patientId: "PHE-9148",
            dateOfService: "2024-07-15",
            service: "Specialist Consultation",
            amount: 2390.00,
            status: "pending"
        },
        {
            id: 3,
            patientName: "Jude Bevan",
            patientId: "PHE-6720",
            dateOfService: "2024-07-10",
            service: "Laboratory Test",
            amount: 1200.00,
            status: "pending"
        }
    ]);

    const handleLogout = () => {
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
                <ReceptionistHeader receptionistName="Sarah Johnson" />

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
                            <h2 style={styles.sectionTitle}>
                                <FiCreditCard style={{ marginRight: '10px', verticalAlign: 'middle' }} />
                                Pending Payments
                            </h2>

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
                                        {pendingPayments.length > 0 ? (
                                            pendingPayments.map((payment) => (
                                                <tr key={payment.id} style={styles.tableRow}>
                                                    <td style={styles.tableCell}>
                                                        <div>
                                                            <p style={styles.patientName}>{payment.patientName}</p>
                                                            <p style={styles.patientId}>({payment.patientId})</p>
                                                        </div>
                                                    </td>
                                                    <td style={styles.tableCell}>
                                                        <div>
                                                            <p style={styles.serviceText}>{payment.service}</p>
                                                            <p style={styles.dateText}>{payment.dateOfService}</p>
                                                        </div>
                                                    </td>
                                                    <td style={styles.tableCell}>
                                                        <span style={styles.amountText}>LKR {payment.amount.toFixed(2)}</span>
                                                    </td>
                                                    <td style={styles.tableCell}>
                                                        <button
                                                            onClick={() => handlePay(payment)}
                                                            style={styles.payButton}
                                                        >
                                                            Pay
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" style={styles.noDataCell}>
                                                    No pending payments found
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
        flexDirection: "column"
    },
    mainContent: {
        flex: 1,
        padding: "32px",
        overflow: "auto"
    },
    contentContainer: {
        maxWidth: "1200px",
        margin: "0 auto"
    },
    pageHeader: {
        marginBottom: "32px"
    },
    pageTitle: {
        fontSize: "32px",
        fontWeight: "700",
        color: "#1f2937",
        margin: 0,
        marginBottom: "8px"
    },
    pageSubtitle: {
        fontSize: "15px",
        color: "#6b7280",
        margin: 0
    },
    tableSection: {
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "24px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        marginBottom: "24px"
    },
    sectionTitle: {
        fontSize: "18px",
        fontWeight: "600",
        color: "#1f2937",
        margin: 0,
        marginBottom: "24px",
        display: "flex",
        alignItems: "center"
    },
    tableContainer: {
        overflowX: "auto",
        border: "1px solid #e5e7eb",
        borderRadius: "8px"
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
        padding: "16px",
        fontSize: "13px",
        fontWeight: "600",
        color: "#6b7280",
        textTransform: "uppercase",
        letterSpacing: "0.5px"
    },
    tableRow: {
        borderBottom: "1px solid #f3f4f6",
        transition: "background-color 0.2s"
    },
    tableCell: {
        padding: "16px",
        fontSize: "14px",
        color: "#374151"
    },
    patientName: {
        fontSize: "15px",
        fontWeight: "600",
        color: "#1f2937",
        margin: 0
    },
    patientId: {
        fontSize: "13px",
        color: "#6b7280",
        margin: 0,
        marginTop: "2px"
    },
    serviceText: {
        margin: 0,
        fontWeight: "500"
    },
    dateText: {
        margin: 0,
        fontSize: "13px",
        color: "#6b7280",
        marginTop: "2px"
    },
    amountText: {
        fontWeight: "700",
        color: "#059669"
    },
    payButton: {
        padding: "8px 20px",
        fontSize: "13px",
        fontWeight: "600",
        color: "white",
        background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        transition: "all 0.2s",
        boxShadow: "0 4px 10px rgba(16, 185, 129, 0.3)"
    },
    noDataCell: {
        padding: "32px",
        textAlign: "center",
        fontSize: "14px",
        color: "#9ca3af"
    },
    footer: {
        display: "flex",
        justifyContent: "flex-end"
    },
    backButton: {
        padding: "10px 24px",
        border: "none",
        borderRadius: "6px",
        background: "#0066CC",
        color: "white",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.2s",
        boxShadow: "0 2px 4px rgba(0, 102, 204, 0.2)"
    }
};

export default PaymentManagement;
