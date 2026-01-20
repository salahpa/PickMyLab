import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Tests from './pages/Tests';
import TestDetail from './pages/TestDetail';
import BookTest from './pages/BookTest';
import Bookings from './pages/Bookings';
import BookingDetail from './pages/BookingDetail';
import Payment from './pages/Payment';
import PaymentHistory from './pages/PaymentHistory';
import PaymentSuccess from './pages/PaymentSuccess';
import Reports from './pages/Reports';
import ReportDetail from './pages/ReportDetail';
import SmartReport from './pages/SmartReport';
import NotificationPreferences from './pages/NotificationPreferences';
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/notifications/preferences" element={<NotificationPreferences />} />
        <Route path="/tests" element={<Tests />} />
        <Route path="/tests/:id" element={<TestDetail />} />
        <Route path="/book-test/:id" element={<BookTest />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/bookings/:id" element={<BookingDetail />} />
        <Route path="/bookings/:id/confirm" element={<BookingDetail />} />
        <Route path="/bookings/:id/success" element={<PaymentSuccess />} />
        <Route path="/payment/:id" element={<Payment />} />
        <Route path="/payments" element={<PaymentHistory />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/reports/:id" element={<ReportDetail />} />
        <Route path="/reports/:id/smart" element={<SmartReport />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Layout>
  );
}

export default App;
