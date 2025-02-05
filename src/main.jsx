import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { RouterProvider } from 'react-router-dom';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import 'react-toastify/dist/ReactToastify.css';
import Aos from 'aos';
import { router } from './routes/router';
import { UserProvider } from './context/UserContext'; // Import UserProvider

const queryClient = new QueryClient();

Aos.init();

ReactDOM.createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <UserProvider> {/* Bọc RouterProvider bằng UserProvider */}
      <RouterProvider router={router} />
    </UserProvider>
  </QueryClientProvider>
);
