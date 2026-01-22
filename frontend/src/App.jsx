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
import ManageTests from './pages/admin/ManageTests';
import ManageCategories from './pages/admin/ManageCategories';
import ManageLabPartners from './pages/admin/ManageLabPartners';
import ManageBookings from './pages/admin/ManageBookings';
import ManageUsers from './pages/admin/ManageUsers';
import ManagePhlebotomists from './pages/admin/ManagePhlebotomists';
import ManageContent from './pages/admin/ManageContent';
import ManageTestPricing from './pages/admin/ManageTestPricing';

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
        <Route path="/admin/tests" element={<ManageTests />} />
        <Route path="/admin/categories" element={<ManageCategories />} />
        <Route path="/admin/lab-partners" element={<ManageLabPartners />} />
        <Route path="/admin/bookings" element={<ManageBookings />} />
        <Route path="/admin/users" element={<ManageUsers />} />
        <Route path="/admin/phlebotomists" element={<ManagePhlebotomists />} />
        <Route path="/admin/content" element={<ManageContent />} />
        <Route path="/admin/pricing" element={<ManageTestPricing />} />
      </Routes>
    </Layout>
  );
}

export default App;
