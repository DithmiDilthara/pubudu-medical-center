import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit2, FiTrash2, FiUserPlus, FiX } from "react-icons/fi";
import AdminSidebar from "../../components/AdminSidebar";
import AdminHeader from "../../components/AdminHeader";

function ManageDoctors() {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [doctors, setDoctors] = useState([
    {
      id: 1,
      doctorId: "DOC001",
      name: "Dr. Kavindi Fernando",
      specialization: "Cardiologist",
      phone: "0771234567",
      email: "kavindi.fernando@pubudu.lk",
      licenseNo: "SLMC12345",
      username: "kavindi.fernando"
    },
    {
      id: 2,
      doctorId: "DOC002",
      name: "Dr. Asanka Wijesinghe",
      specialization: "Pediatrician",
      phone: "0772345678",
      email: "asanka.wijesinghe@pubudu.lk",
      licenseNo: "SLMC23456",
      username: "asanka.wijesinghe"
    },
    {
      id: 3,
      doctorId: "DOC003",
      name: "Dr. Nimal De Silva",
      specialization: "General Physician",
      phone: "0773456789",
      email: "nimal.desilva@pubudu.lk",
      licenseNo: "SLMC34567",
      username: "nimal.desilva"
    }
  ]);

  const [newDoctor, setNewDoctor] = useState({
    name: "",
    specialization: "",
    phone: "",
    email: "",
    licenseNo: "",
    username: "",
    password: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState({});

  const handleLogout = () => {
    console.log("Admin logged out");
    navigate("/");
  };

  const validateDoctorForm = () => {
    const newErrors = {};

    // Name validation
    if (!newDoctor.name.trim()) {
      newErrors.name = "Name is required";
    } else if (newDoctor.name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }

    // Specialization validation
    if (!newDoctor.specialization.trim()) {
      newErrors.specialization = "Specialization is required";
    }

    // Email validation
    if (!newDoctor.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newDoctor.email)) {
      newErrors.email = "Invalid email format";
    }

    // License Number validation
    if (!newDoctor.licenseNo.trim()) {
      newErrors.licenseNo = "License number is required";
    }

    // Phone validation
    if (!newDoctor.phone.trim()) {
      newErrors.phone = "Contact number is required";
    } else if (!/^0\d{9}$/.test(newDoctor.phone)) {
      newErrors.phone = "Invalid phone format (e.g., 0771234567)";
    }

    // Username validation
    if (!newDoctor.username.trim()) {
      newErrors.username = "Username is required";
    } else if (newDoctor.username.trim().length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    // Password validation
    if (!newDoctor.password) {
      newErrors.password = "Password is required";
    } else if (newDoctor.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newDoctor.password)) {
      newErrors.password = "Password must contain uppercase, lowercase, and number";
    }

    // Confirm Password validation
    if (!newDoctor.confirmPassword) {
      newErrors.confirmPassword = "Please confirm password";
    } else if (newDoctor.password !== newDoctor.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddDoctor = () => {
    if (!validateDoctorForm()) {
      return;
    }

    // Auto-generate Doctor ID
    const nextId = doctors.length + 1;
    const doctorId = `DOC${String(nextId).padStart(3, '0')}`;

    const doctorToAdd = {
      id: nextId,
      doctorId: doctorId,
      name: newDoctor.name,
      specialization: newDoctor.specialization,
      phone: newDoctor.phone,
      email: newDoctor.email,
      licenseNo: newDoctor.licenseNo,
      username: newDoctor.username
    };

    setDoctors([...doctors, doctorToAdd]);
    setNewDoctor({ 
      name: "", 
      specialization: "", 
      phone: "", 
      email: "", 
      licenseNo: "", 
      username: "", 
      password: "", 
      confirmPassword: "" 
    });
    setErrors({});
    setShowAddModal(false);
    alert(`Doctor added successfully with ID: ${doctorId}`);
  };

  const handleDeleteDoctor = (id) => {
    if (window.confirm("Are you sure you want to delete this doctor?")) {
      setDoctors(doctors.filter(doctor => doctor.id !== id));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDoctor({ ...newDoctor, [name]: value });
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
            <h1 style={styles.pageTitle}>Manage Doctors</h1>
            <button style={styles.addButton} onClick={() => setShowAddModal(true)}>
              <FiUserPlus style={styles.buttonIcon} />
              Add Doctor
            </button>
          </div>

          {/* Doctors Table */}
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Doctor ID</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Specialization</th>
                  <th style={styles.th}>Phone</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>License No</th>
                  <th style={styles.th}>Username</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doctor) => (
                  <tr key={doctor.id} style={styles.tr}>
                    <td style={styles.td}>{doctor.doctorId}</td>
                    <td style={styles.td}>{doctor.name}</td>
                    <td style={styles.td}>{doctor.specialization}</td>
                    <td style={styles.td}>{doctor.phone}</td>
                    <td style={styles.td}>{doctor.email}</td>
                    <td style={styles.td}>{doctor.licenseNo}</td>
                    <td style={styles.td}>{doctor.username}</td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        <button style={styles.editButton} title="Edit">
                          <FiEdit2 />
                        </button>
                        <button 
                          style={styles.deleteButton} 
                          onClick={() => handleDeleteDoctor(doctor.id)}
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

      {/* Add Doctor Modal */}
      {showAddModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Add New Doctor</h2>
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
                  value={newDoctor.name}
                  onChange={handleInputChange}
                  style={{...styles.input, ...(errors.name ? styles.inputError : {})}}
                  placeholder="Dr. John Doe"
                />
                {errors.name && <span style={styles.errorText}>{errors.name}</span>}
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Specialization</label>
                <input
                  type="text"
                  name="specialization"
                  value={newDoctor.specialization}
                  onChange={handleInputChange}
                  style={{...styles.input, ...(errors.specialization ? styles.inputError : {})}}
                  placeholder="Cardiologist"
                />
                {errors.specialization && <span style={styles.errorText}>{errors.specialization}</span>}
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={newDoctor.email}
                  onChange={handleInputChange}
                  style={{...styles.input, ...(errors.email ? styles.inputError : {})}}
                  placeholder="doctor@pubudu.lk"
                />
                {errors.email && <span style={styles.errorText}>{errors.email}</span>}
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>License Number</label>
                <input
                  type="text"
                  name="licenseNo"
                  value={newDoctor.licenseNo}
                  onChange={handleInputChange}
                  style={{...styles.input, ...(errors.licenseNo ? styles.inputError : {})}}
                  placeholder="SLMC12345"
                />
                {errors.licenseNo && <span style={styles.errorText}>{errors.licenseNo}</span>}
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Contact Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={newDoctor.phone}
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
                  value={newDoctor.username}
                  onChange={handleInputChange}
                  style={{...styles.input, ...(errors.username ? styles.inputError : {})}}
                  placeholder="doctor.username"
                />
                {errors.username && <span style={styles.errorText}>{errors.username}</span>}
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Password</label>
                <input
                  type="password"
                  name="password"
                  value={newDoctor.password}
                  onChange={handleInputChange}
                  style={{...styles.input, ...(errors.password ? styles.inputError : {})}}
                  placeholder="Enter password"
                />
                {errors.password && <span style={styles.errorText}>{errors.password}</span>}
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={newDoctor.confirmPassword}
                  onChange={handleInputChange}
                  style={{...styles.input, ...(errors.confirmPassword ? styles.inputError : {})}}
                  placeholder="Confirm password"
                />
                {errors.confirmPassword && <span style={styles.errorText}>{errors.confirmPassword}</span>}
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.cancelButton} onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button style={styles.submitButton} onClick={handleAddDoctor}>
                Add Doctor
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

export default ManageDoctors;
