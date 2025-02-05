import { Routes, Route } from 'react-router-dom';
import Instructor from './pages/instructor/Instructor';
import InstructorDetail from './pages/instructor/InstructorDetail';
import PaymentClassResult from './pages/payment/paymentClassResult';
import ResetPassword from './pages/reset-password/ResetPassword';

function App() {
  return (
    <Routes>
      <Route path="/instructor" element={<Instructor />} />
      <Route path="/instructor/:userId" element={<InstructorDetail />} />
      <Route path="/payment/result" element={<PaymentClassResult />} />
      <Route path="/reset-password" element={<ResetPassword />} />
    </Routes>
  );
}

export default App; 