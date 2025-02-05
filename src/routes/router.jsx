import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import Mainlayout from '../layout/Mainlayout';
import AuthLayout from '../layout/AuthLayout';
import Instructor from '../pages/instructor/Instructor';
import InstructorDetail from '../pages/instructor/InstructorDetail';
import Classes from '../pages/classes/Classes';
import ClassDetail from '../pages/classes/ClassDetail';
import Practice from '../pages/practice/Practice';
import Home from '../pages/home/Home';
import Login from '../pages/login/Login';
import Register from '../pages/register/Register';
import UserHomePage from '../pages/userhomepage/UserHomePage';
import ExerciseDetail from '../pages/practice/ExerciseDetail';
import Membership from '../pages/membership/Membership';
import PaymentStatus from '../pages/payment/PaymentStatus';
import PaymentClassResult from '../pages/payment/paymentClassResult';
import MembershipHistoryPage from '../pages/membership/MembershipHistoryPage';
import { QueryClient } from '@tanstack/react-query';
import AiChatPage from '../pages/AiChatPage';
import ResetPassword from '../pages/reset-password/ResetPassword';

const queryClient = new QueryClient();

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Mainlayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: 'instructors', element: <Instructor /> },
      { path: 'classes', element: <Classes /> },
      { path: '/classes/:classId', element: <ClassDetail /> },
      { path: '/instructor', element: <Instructor /> },
      { path: '/instructor/:userId', element: <InstructorDetail /> }, 
      { path: 'practice', element: <Practice /> },
      { path: 'userhomepage', element: <UserHomePage /> },
      { path: '/exercise/:id', element: <ExerciseDetail /> },
      { path: '/membership', element: <Membership /> },
      { path: '/membership/history', element: <MembershipHistoryPage /> },
      { path: '/payment-status', element: <PaymentStatus /> },
      { path: '/paymentClassResult', element: <PaymentClassResult /> },
      { path: '/ai-chat', element: <AiChatPage /> },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
    ],
  },
  { path: '/login', element: <Navigate to="/auth/login" replace /> },
  { path: '/register', element: <Navigate to="/auth/register" replace /> },
  {
    path: '/reset-password',
    element: <ResetPassword />,
  },
]);

export default router;
