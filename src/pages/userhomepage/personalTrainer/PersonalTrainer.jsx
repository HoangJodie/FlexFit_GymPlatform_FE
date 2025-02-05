// PersonalTrainer.jsx
import React, { useState } from 'react';
import PersonalTrainerSchedule from './PersonalTrainerSchedule';
import Profile from '../user/Profile';
import ClassManagement from './ClassManagement';

const PersonalTrainer = () => {
   // State to track the active tab
   const [activeTab, setActiveTab] = useState('manageClients');
   const [clients, setClients] = useState([]);

   // Function to render content based on the active tab
   const renderContent = () => {
      switch (activeTab) {
         case 'profile':
            return <Profile />;
         case 'workoutPlans':
            return <PersonalTrainerSchedule />;
         case 'classManagement':
            return <ClassManagement />;
         case 'statistics':
            return (
               <div>
                  <h2 className="text-2xl font-semibold mb-4">Statistics</h2>
                  <p className="mb-2">View overall performance and progress statistics.</p>
                  <ul className="list-disc list-inside">
                     <li>Client performance reports</li>
                     <li>Workout completion rates</li>
                     <li>Class attendance records</li>
                  </ul>
               </div>
            );
         default:
            return <p>Welcome to your trainer dashboard. Here you can manage your clients, workout plans, and more.</p>;
      }
   };

   return (
      <div className="flex flex-col md:flex-row h-full min-h-screen bg-gray-100 p-4">
         <div className="w-full md:w-1/4 lg:w-1/5 p-4 bg-white shadow-lg rounded-lg mb-4 md:mb-0">
            <h2 className="text-xl font-bold mb-4 text-center">Trainer Menu</h2>
            <button
               className={`w-full py-2 mb-2 rounded-lg ${activeTab === 'profile' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} transition-all`}
               onClick={() => setActiveTab('profile')}
            >
               Profile
            </button>
            <button
               className={`w-full py-2 mb-2 rounded-lg ${activeTab === 'workoutPlans' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} transition-all`}
               onClick={() => setActiveTab('workoutPlans')}
            >
               Workout Plans
            </button>
            <button
               className={`w-full py-2 mb-2 rounded-lg ${activeTab === 'classManagement' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} transition-all`}
               onClick={() => setActiveTab('classManagement')}
            >
               Class Management
            </button>
            <button
               className={`w-full py-2 mb-2 rounded-lg ${activeTab === 'statistics' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} transition-all`}
               onClick={() => setActiveTab('statistics')}
            >
               Statistics
            </button>
         </div>

         <div className="w-full md:w-3/4 lg:w-4/5 p-4 bg-white shadow-lg rounded-lg">
            <h1 className="text-3xl font-semibold text-center mb-4">Personal Trainer Dashboard</h1>
            <div className="pt-content">
               {renderContent()}
            </div>
         </div>
      </div>
   );
};

export default PersonalTrainer;
