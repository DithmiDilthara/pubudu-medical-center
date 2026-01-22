import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import PatientRegistration from './pages/PatientRegistration';
import PatientDashboard from './pages/PatientDashboard';
import FindDoctor from './pages/FindDoctor';
import DoctorDetails from './pages/DoctorDetails';
import ConfirmBooking from './pages/ConfirmBooking';
import Appointments from './pages/Appointments';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorAppointments from './pages/DoctorAppointments';
import PatientDetailsDoctor from './pages/PatientDetailsDoctor';
import DoctorPatients from './pages/DoctorPatients';
import DoctorAvailability from './pages/DoctorAvailability';
import ReceptionistDashboard from './pages/receptionist/ReceptionistDashboard';
import AddPatient from './pages/receptionist/AddPatient';
import NewBooking from './pages/receptionist/NewBooking';
import AppointmentsManagement from './pages/receptionist/AppointmentsManagement';
import ConfirmPayment from './pages/receptionist/ConfirmPayment';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<PatientRegistration />} />
        <Route path="/patient/dashboard" element={<PatientDashboard />} />
        <Route path="/patient/find-doctor" element={<FindDoctor />} />
        <Route path="/patient/doctor-details" element={<DoctorDetails />} />
        <Route path="/patient/confirm-booking" element={<ConfirmBooking />} />
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
        <Route path="/receptionist/payment" element={<ConfirmPayment />} />
      </Routes>
    </Router>
  );
}

export default App;