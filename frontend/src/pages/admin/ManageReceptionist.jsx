import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit2, FiTrash2, FiUserPlus, FiX } from "react-icons/fi";
import AdminSidebar from "../../components/AdminSidebar";
import AdminHeader from "../../components/AdminHeader";

function ManageReceptionist() {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [receptionists, setReceptionists] = useState([
    {
      id: 1,
      receptionistId: "REP001",
      name: "Sarah Johnson",
      nic: "199812345678",
      phone: "0771234567",
      email: "sarah.johnson@pubudu.lk",
      username: "sarah.johnson"
    },
    {
      id: 2,
      receptionistId: "REP002",
      name: "Nimali Perera",
      nic: "199923456789",
      phone: "0772345678",
      email: "nimali.perera@pubudu.lk",
      username: "nimali.perera"
    },
    {
      id: 3,
      receptionistId: "REP003",
      name: "Kasun Fernando",
      nic: "200034567890",
      phone: "0773456789",
      email: "kasun.fernando@pubudu.lk",
      username: "kasun.fernando"
    }
  ]);

  const [newReceptionist, setNewReceptionist] = useState({
    name: "",
    nic: "",
    phone: "",
    email: "",
    username: "",
    password: ""
  });

  const [errors, setErrors] = useState({});

  const handleLogout = () => {
    console.log("Admin logged out");
    navigate("/");
  };

  const validateReceptionistForm = () => {
    const newErrors = {};

    // Name validation
    if (!newReceptionist.name.trim()) {
      newErrors.name = "Name is required";
    } else if (newReceptionist.name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }

    // NIC validation (Sri Lankan NIC: 9 digits + V/X or 12 digits)
    if (!newReceptionist.nic.trim()) {
      newErrors.nic = "NIC is required";
    } else if (!/^([0-9]{9}[vVxX]|[0-9]{12})$/.test(newReceptionist.nic)) {
      newErrors.nic = "Invalid NIC format (e.g., 199812345678 or 991234567V)";
    }

    // Email validation
    if (!newReceptionist.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newReceptionist.email)) {
      newErrors.email = "Invalid email format";
    }

    // Phone validation
    if (!newReceptionist.phone.trim()) {
      newErrors.phone = "Contact number is required";
    } else if (!/^0\d{9}$/.test(newReceptionist.phone)) {
      newErrors.phone = "Invalid phone format (e.g., 0771234567)";
    }

    // Username validation
    if (!newReceptionist.username.trim()) {
      newErrors.username = "Username is required";
    } else if (newReceptionist.username.trim().length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    // Password validation
    if (!newReceptionist.password) {
      newErrors.password = "Password is required";
    } else if (newReceptionist.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newReceptionist.password)) {
      newErrors.password = "Password must contain uppercase, lowercase, and number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddReceptionist = () => {
    if (!validateReceptionistForm()) {
      return;
    }

    // Auto-generate Receptionist ID
    const nextId = receptionists.length + 1;
    const receptionistId = `REP${String(nextId).padStart(3, '0')}`;

    const receptionistToAdd = {
      id: nextId,
      receptionistId: receptionistId,
      name: newReceptionist.name,
      nic: newReceptionist.nic,
      phone: newReceptionist.phone,
      email: newReceptionist.email,
      username: newReceptionist.username
    };

    setReceptionists([...receptionists, receptionistToAdd]);
    setNewReceptionist({ 
      name: "", 
      nic: "", 
      phone: "", 
      email: "", 
      username: "", 
      password: "" 
    });
    setErrors({});
    setShowAddModal(false);
    alert(`Receptionist added successfully with ID: ${receptionistId}`);
  };

  const handleDeleteReceptionist = (id) => {
    if (window.confirm("Are you sure you want to delete this receptionist?")) {
      setReceptionists(receptionists.filter(receptionist => receptionist.id !== id));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReceptionist({ ...newReceptionist, [name]: value });
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <AdminSidebar onLogout={handleLogout} />

      {/* Main Content */}
      <div style={styles.mainWrapper}>
        {/* Header */}
        <AdminHeader adminName="Admin User" />

        {/* Dashboard Content */}
        <main style={styles.mainContent}>
          {/* Page Header */}
          <div style={styles.pageHeader}>
            <h1 style={styles.pageTitle}>Manage Receptionist</h1>
            <button style={styles.addButton} onClick={() => setShowAddModal(true)}>
              <FiUserPlus style={styles.buttonIcon} />
              Add Receptionist
            </button>
          </div>

          {/* Receptionist Table */}
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Receptionist ID</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>NIC</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Contact Number</th>
                  <th style={styles.th}>Username</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {receptionists.map((receptionist) => (
                  <tr key={receptionist.id} style={styles.tr}>
                    <td style={styles.td}>{receptionist.receptionistId}</td>
                    <td style={styles.td}>{receptionist.name}</td>
                    <td style={styles.td}>{receptionist.nic}</td>
                    <td style={styles.td}>{receptionist.email}</td>
                    <td style={styles.td}>{receptionist.phone}</td>
                    <td style={styles.td}>{receptionist.username}</td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        <button style={styles.editButton} title="Edit">
                          <FiEdit2 />
                        </button>
                        <button 
                          style={styles.deleteButton} 
                          onClick={() => handleDeleteReceptionist(receptionist.id)}
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Add Receptionist Modal */}
      {showAddModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Add New Receptionist</h2>
              <button style={styles.closeButton} onClick={() => setShowAddModal(false)}>
                <FiX />
              </button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={newReceptionist.name}
                  onChange={handleInputChange}
                  style={{...styles.input, ...(errors.name ? styles.inputError : {})}}
                  placeholder="John Doe"
                />
                {errors.name && <span style={styles.errorText}>{errors.name}</span>}
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>NIC</label>
                <input
                  type="text"
                  name="nic"
                  value={newReceptionist.nic}
                  onChange={handleInputChange}
                  style={{...styles.input, ...(errors.nic ? styles.inputError : {})}}
                  placeholder="199812345678 or 991234567V"
                />
                {errors.nic && <span style={styles.errorText}>{errors.nic}</span>}
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={newReceptionist.email}
                  onChange={handleInputChange}
                  style={{...styles.input, ...(errors.email ? styles.inputError : {})}}
                  placeholder="receptionist@pubudu.lk"
                />
                {errors.email && <span style={styles.errorText}>{errors.email}</span>}
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Contact Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={newReceptionist.phone}
                  onChange={handleInputChange}
                  style={{...styles.input, ...(errors.phone ? styles.inputError : {})}}
                  placeholder="0771234567"
                />
                {errors.phone && <span style={styles.errorText}>{errors.phone}</span>}
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Username</label>
                <input
                  type="text"
                  name="username"
                  value={newReceptionist.username}
                  onChange={handleInputChange}
                  style={{...styles.input, ...(errors.username ? styles.inputError : {})}}
                  placeholder="receptionist.username"
                />
                {errors.username && <span style={styles.errorText}>{errors.username}</span>}
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Password</label>
                <input
                  type="password"
                  name="password"
                  value={newReceptionist.password}
                  onChange={handleInputChange}
                  style={{...styles.input, ...(errors.password ? styles.inputError : {})}}
                  placeholder="Enter password"
                />
                {errors.password && <span style={styles.errorText}>{errors.password}</span>}
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.cancelButton} onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button style={styles.submitButton} onClick={handleAddReceptionist}>
                Add Receptionist
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f3f4f6"
  },
  mainWrapper: {
    flex: 1,
    display: "flex",
    flexDirection: "column"
  },
  mainContent: {
    padding: "32px",
    flex: 1
  },
  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px"
  },
  pageTitle: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#1f2937",
    margin: 0,
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  addButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 24px",
    backgroundColor: "#8b9dff",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  buttonIcon: {
    fontSize: "18px"
  },
  tableContainer: {
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
    overflow: "hidden"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse"
  },
  th: {
    backgroundColor: "#f9fafb",
    padding: "16px",
    textAlign: "left",
    fontSize: "14px",
    fontWeight: "700",
    color: "#374151",
    borderBottom: "2px solid #e5e7eb",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  tr: {
    borderBottom: "1px solid #e5e7eb"
  },
  td: {
    padding: "16px",
    fontSize: "14px",
    color: "#4b5563",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  shiftBadgeMorning: {
    padding: "4px 12px",
    backgroundColor: "#dbeafe",
    color: "#1e40af",
    borderRadius: "12px",
    fontSize: "13px",
    fontWeight: "600",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  shiftBadgeEvening: {
    padding: "4px 12px",
    backgroundColor: "#fef3c7",
    color: "#92400e",
    borderRadius: "12px",
    fontSize: "13px",
    fontWeight: "600",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  actionButtons: {
    display: "flex",
    gap: "8px"
  },
  editButton: {
    padding: "8px",
    backgroundColor: "#8b9dff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s"
  },
  deleteButton: {
    padding: "8px",
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s"
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000
  },
  modal: {
    backgroundColor: "white",
    borderRadius: "12px",
    width: "90%",
    maxWidth: "500px",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px",
    borderBottom: "1px solid #e5e7eb"
  },
  modalTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1f2937",
    margin: 0,
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  closeButton: {
    backgroundColor: "transparent",
    border: "none",
    fontSize: "24px",
    color: "#6b7280",
    cursor: "pointer",
    padding: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  modalBody: {
    padding: "24px"
  },
  formGroup: {
    marginBottom: "20px"
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "8px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  input: {
    width: "100%",
    padding: "12px",
    fontSize: "14px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    boxSizing: "border-box"
  },
  inputError: {
    borderColor: "#ef4444"
  },
  errorText: {
    color: "#ef4444",
    fontSize: "12px",
    marginTop: "4px",
    display: "block",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    padding: "24px",
    borderTop: "1px solid #e5e7eb"
  },
  cancelButton: {
    padding: "10px 20px",
    backgroundColor: "white",
    color: "#4b5563",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  submitButton: {
    padding: "10px 20px",
    backgroundColor: "#8b9dff",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  }
};

export default ManageReceptionist;
