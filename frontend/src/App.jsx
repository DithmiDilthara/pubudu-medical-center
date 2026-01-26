import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import PatientRegistration from './pages/PatientRegistration';
import PatientDashboard from './pages/patient/PatientDashboard';
import FindDoctor from './pages/patient/FindDoctor';
import DoctorDetails from './pages/patient/DoctorDetails';
import ConfirmBooking from './pages/patient/ConfirmBooking';
import OnlinePayment from './pages/patient/OnlinePayment';
import Appointments from './pages/patient/Appointments';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import PatientDetailsDoctor from './pages/patient/PatientDetailsDoctor';
import DoctorPatients from './pages/doctor/DoctorPatients';
import DoctorAvailability from './pages/doctor/DoctorAvailability';
import ReceptionistDashboard from './pages/receptionist/ReceptionistDashboard';
import AddPatient from './pages/receptionist/AddPatient';
import NewBooking from './pages/receptionist/NewBooking';
import AppointmentsManagement from './pages/receptionist/AppointmentsManagement';
import PaymentManagement from './pages/receptionist/PaymentManagement';
import ConfirmPayment from './pages/receptionist/ConfirmPayment';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageDoctors from './pages/admin/ManageDoctors';
import ManageReceptionist from './pages/admin/ManageReceptionist';
import Reports from './pages/admin/Reports';

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" reverseOrder={false} />
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/register" element={<PatientRegistration />} />
          <Route path="/patient/dashboard" element={<PatientDashboard />} />
          <Route path="/patient/find-doctor" element={<FindDoctor />} />
          <Route path="/patient/doctor-details" element={<DoctorDetails />} />
          <Route path="/patient/confirm-booking" element={<ConfirmBooking />} />
          <Route path="/patient/payment" element={<OnlinePayment />} />
          <Route path="/patient/appointments" element={<Appointments />} />
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
          <Route path="/doctor/appointments" element={<DoctorAppointments />} />
          <Route path="/doctor/patient-details" element={<PatientDetailsDoctor />} />
          <Route path="/doctor/patients" element={<DoctorPatients />} />
          <Route path="/doctor/availability" element={<DoctorAvailability />} />
          <Route path="/receptionist/dashboard" element={<ReceptionistDashboard />} />
          <Route path="/receptionist/patients" element={<AddPatient />} />
          <Route path="/receptionist/patients/add" element={<AddPatient />} />
          <Route path="/receptionist/appointments" element={<AppointmentsManagement />} />
          <Route path="/receptionist/appointments/new" element={<NewBooking />} />
          <Route path="/receptionist/payment" element={<PaymentManagement />} />
          <Route path="/receptionist/payment/confirm" element={<ConfirmPayment />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/doctors" element={<ManageDoctors />} />
          <Route path="/admin/receptionist" element={<ManageReceptionist />} />
          <Route path="/admin/reports" element={<Reports />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;