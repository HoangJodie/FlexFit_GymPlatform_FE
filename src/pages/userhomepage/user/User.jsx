// User.jsx
import React, { useState } from 'react';
import UserSchedule from '../user/UserSchedule';
import Profile from '../user/Profile';
import Membership from './Membership';
import MyClasses from './MyClasses';

const User = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <Profile />;
      case 'myclasses':
        return <MyClasses />;
      case 'viewSchedule':
        return <UserSchedule />;
      case 'membership':
        return <Membership />;
      case 'logout':
        return <p className="text-lg">You have been logged out.</p>;
      default:
        return <p className="text-lg">Welcome to the user dashboard. Here you can manage your profile and settings.</p>;
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full min-h-screen bg-gray-100 p-4">
      <div className="w-full md:w-1/4 lg:w-1/5 p-4 bg-white shadow-lg rounded-lg mb-4 md:mb-0">
        <h2 className="text-xl font-bold mb-4 text-center">User Menu</h2>
        <button
          className={`w-full py-2 mb-2 rounded-lg ${activeTab === 'profile' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} transition-all`}
          onClick={() => handleTabChange('profile')}
        >
          Profile
        </button>
        <button
          className={`w-full py-2 mb-2 rounded-lg ${activeTab === 'myclasses' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} transition-all`}
          onClick={() => handleTabChange('myclasses')}
        >
          My Classes
        </button>
        <button
          className={`w-full py-2 mb-2 rounded-lg ${activeTab === 'viewSchedule' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} transition-all`}
          onClick={() => handleTabChange('viewSchedule')}
        >
          View Schedule
        </button>
        <button
          className={`w-full py-2 mb-2 rounded-lg ${activeTab === 'membership' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} transition-all`}
          onClick={() => handleTabChange('membership')}
        >
          Membership
        </button>
        <button
          className="w-full py-2 mb-2 rounded-lg bg-red-500 text-white transition-all"
          onClick={() => handleTabChange('logout')}
        >
          Logout
        </button>
      </div>

      <div className="w-full md:w-3/4 lg:w-4/5 p-4 bg-white shadow-lg rounded-lg">
        <h1 className="text-3xl font-semibold text-center mb-4">User Dashboard</h1>
        <div className="user-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default User;
