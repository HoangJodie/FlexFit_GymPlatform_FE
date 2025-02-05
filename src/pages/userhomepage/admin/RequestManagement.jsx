import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ClassRequests from '../admin/Requests/ClassRequests';
import JoinRequests from '../admin/Requests/JoinRequests';

const RequestManagement = () => {
  const [activeTab, setActiveTab] = useState('classes');

  return (
    <div className="p-4">
      {/* Tab Navigation */}
      <div className="mb-4">
        <button onClick={() => setActiveTab('classes')} className={`px-4 py-2 rounded ${activeTab === 'classes' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Class Requests</button>
      </div>

      {/* Conditional Rendering based on Active Tab */}
      {activeTab === 'classes' && <ClassRequests />}
    </div>
  );
};

export default RequestManagement;