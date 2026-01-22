import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminLogin from './pages/admin/AdminLogin';
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
import PaymentReceipt from './pages/PaymentReceipt';
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
        <Route path="/admin/login" element={<AdminLogin />} />
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
        <Route path="/payments/:id/receipt" element={<PaymentReceipt />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/reports/:id" element={<ReportDetail />} />
        <Route path="/reports/:id/smart" element={<SmartReport />} />
        <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
        <Route path="/admin/tests" element={<AdminLayout><ManageTests /></AdminLayout>} />
        <Route path="/admin/categories" element={<AdminLayout><ManageCategories /></AdminLayout>} />
        <Route path="/admin/lab-partners" element={<AdminLayout><ManageLabPartners /></AdminLayout>} />
        <Route path="/admin/bookings" element={<AdminLayout><ManageBookings /></AdminLayout>} />
        <Route path="/admin/users" element={<AdminLayout><ManageUsers /></AdminLayout>} />
        <Route path="/admin/phlebotomists" element={<AdminLayout><ManagePhlebotomists /></AdminLayout>} />
        <Route path="/admin/content" element={<AdminLayout><ManageContent /></AdminLayout>} />
        <Route path="/admin/pricing" element={<AdminLayout><ManageTestPricing /></AdminLayout>} />
      </Routes>
    </Layout>
  );
}

export default App;
