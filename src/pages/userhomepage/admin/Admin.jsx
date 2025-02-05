import React, { useState } from 'react';
import ManageUsers from '../admin/ManageUsers';
import ManageClasses from '../admin/ManageClasses';
import RequestManagement from './RequestManagement.jsx';
import RevenueAnalytics from './Revenue/RevenueAnalytics';
import ExerciseManagement from './ExerciseManagement/ExerciseManagement';
import MembershipManagement from './MembershipManagement/MembershipManagement';
import './Admin.css'; // Import file CSS

const Admin = () => {
  const [activeTab, setActiveTab] = useState('manageUsers');

  const renderContent = () => {
    switch (activeTab) {
      case 'manageUsers':
        return <ManageUsers />;
      case 'manageClasses':
        return <ManageClasses />;
      case 'requestManagement':
        return <RequestManagement />;
      case 'revenue':
        return <RevenueAnalytics />;
      case 'exercises':
        return <ExerciseManagement />;
      case 'memberships':
        return <MembershipManagement />;
      default:
        return <p className="text-gray-600 mb-5">Welcome to the admin dashboard. Here you can manage users, view reports, and more.</p>;
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-52 bg-gray-800 text-white p-5 shadow-md h-full">
        <h2 className="text-xl mb-4">Menu</h2>

        <button
          className={`bg-[#9b2b2b] text-white border-none p-2 rounded mb-2 w-full transition-colors duration-300 
          ${activeTab === 'manageUsers' ? 'bg-[#0056b4]' : 'hover:bg-[#0056b3]'}`}
          onClick={() => setActiveTab('manageUsers')}
        >
          Manage Users
        </button>

        <button
          className={`bg-[#9b2b2b] text-white border-none p-2 rounded mb-2 w-full transition-colors duration-300 
          ${activeTab === 'manageClasses' ? 'bg-[#0056b4]' : 'hover:bg-[#0056b3]'}`}
          onClick={() => setActiveTab('manageClasses')}
        >
          Manage Classes
        </button>

        <button
          className={`bg-[#9b2b2b] text-white border-none p-2 rounded mb-2 w-full transition-colors duration-300 
          ${activeTab === 'requestManagement' ? 'bg-[#0056b4]' : 'hover:bg-[#0056b3]'}`}
          onClick={() => setActiveTab('requestManagement')}
        >
          Request Management
        </button>

        <button
          className={`bg-[#9b2b2b] text-white border-none p-2 rounded mb-2 w-full transition-colors duration-300 
          ${activeTab === 'revenue' ? 'bg-[#0056b4]' : 'hover:bg-[#0056b3]'}`}
          onClick={() => setActiveTab('revenue')}
        >
          Revenue Analytics
        </button>

        <button
          className={`bg-[#9b2b2b] text-white border-none p-2 rounded mb-2 w-full transition-colors duration-300 
          ${activeTab === 'exercises' ? 'bg-[#0056b4]' : 'hover:bg-[#0056b3]'}`}
          onClick={() => setActiveTab('exercises')}
        >
          Manage Exercises
        </button>

        <button
          className={`bg-[#9b2b2b] text-white border-none p-2 rounded mb-2 w-full transition-colors duration-300 
          ${activeTab === 'memberships' ? 'bg-[#0056b4]' : 'hover:bg-[#0056b3]'}`}
          onClick={() => setActiveTab('memberships')}
        >
          Manage Memberships
        </button>
      </div>

      <div className="flex-1 p-5 bg-gray-100 overflow-y-auto">
        <h1 className="text-2xl text-gray-800 mb-2">Admin Dashboard</h1>
        {renderContent()}
      </div>
    </div>
  );
};

export default Admin;