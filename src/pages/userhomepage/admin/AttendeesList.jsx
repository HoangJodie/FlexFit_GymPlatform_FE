import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';

const AttendeesList = ({ 
  isOpen, 
  onClose, 
  attendees, 
  setAttendees, 
  selectedClassId, 
  selectedClass,
  onRefresh 
}) => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [attenderCount, setAttenderCount] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    // Cập nhật số lượng attendee mỗi khi danh sách attendees thay đổi
    const currentAttenders = attendees.filter(user => 
      selectedClass && user.user_id !== selectedClass.pt_id
    ).length;
    setAttenderCount(currentAttenders);
  }, [attendees, selectedClass]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`http://localhost:3000/user-class/users/${selectedClassId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data && data.users) {
        const teachingPtId = data.pt?.user_id;
        const filteredUsers = data.users.filter(user => user.user_id !== teachingPtId);
        setAttendees(filteredUsers);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, selectedClassId]);

  const handleDeleteAttender = async (userId) => {
    try {
      const response = await fetch(`http://localhost:3000/user-class?userId=${userId}&classId=${selectedClassId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Cập nhật ngay danh sách attendees
        setAttendees(prev => prev.filter(user => user.user_id !== userId));
        // Cập nhật ngay danh sách users
        setUsers(prev => [
          ...prev,
          attendees.find(user => user.user_id === userId)
        ].sort((a, b) => a.user_id - b.user_id));
      }
    } catch (error) {
      console.error('Error deleting attender:', error);
    }
  };

  const handleAddUser = async (userId) => {
    try {
      const addResponse = await fetch('http://localhost:3000/user-class', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          classId: selectedClassId,
          statusId: 2
        }),
      });

      if (addResponse.ok) {
        const userToAdd = users.find(user => user.user_id === userId);
        if (userToAdd) {
          // Cập nhật ngay danh sách attendees
          setAttendees(prev => [...prev, { ...userToAdd, status_id: 2 }]);
          // Cập nhật ngay danh sách users
          setUsers(prev => prev.filter(user => user.user_id !== userId));
        }
      }
      await onRefresh();
    } catch (error) {
      console.error('Error adding user to class:', error);
    }
  };

  const filteredUsers = users
    .filter(user => 
      selectedClass && 
      user.user_id !== selectedClass.pt_id && 
      !attendees.some(attendee => attendee.user_id === user.user_id) &&
      user.role_id !== 1
    )
    .filter(user => 
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(user => selectedRole === 'all' || user.role === selectedRole);

  const isClassFull = selectedClass && attenderCount >= selectedClass.maxAttender;

  return (
    <Modal 
      isOpen={isOpen} 
      onRequestClose={onClose} 
      className="absolute top-[55%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded shadow-lg p-6 w-[80%] z-50"
    >
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">Manage Class Attendees</h2>
          <p className="text-sm text-gray-600 mt-1">
            Attendees: {attenderCount} / {selectedClass?.maxAttender || 0}
          </p>
        </div>
        <button
          className="text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          ×
        </button>
      </div>

      <div className="flex gap-4">
        {/* Left side - Current Attendees */}
        <div className="w-1/2">
          <h3 className="font-semibold mb-2">Current Attendees</h3>
          <div className="border rounded p-4 h-[500px] overflow-y-auto">
            {attendees.length > 0 ? (
              <ul>
                {attendees
                  .filter(user => selectedClass && user.user_id !== selectedClass.pt_id)
                  .map(user => (
                    <li key={user.user_id} className="p-2 border-b flex justify-between items-center">
                      <div>
                        <div>{user.username}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-sm ${
                          user.status_id === 1 ? 'bg-yellow-100 text-yellow-800' :
                          user.status_id === 2 ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {user.status_id === 1 && 'Pending'}
                          {user.status_id === 2 && 'Active'}
                          {user.status_id === 3 && 'Locked'}
                        </span>
                        <button
                          onClick={() => handleDeleteAttender(user.user_id)}
                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center mt-4">No attendees have joined this class.</p>
            )}
          </div>
        </div>

        {/* Right side - Available Users */}
        <div className="w-1/2">
          <h3 className="font-semibold mb-2">Available Users</h3>
          {isClassFull && (
            <div className="mb-2 p-2 bg-yellow-100 text-yellow-800 rounded">
              Class is full! Maximum attendees reached.
            </div>
          )}
          <div className="mb-4 flex gap-4">
            <input
              type="text"
              placeholder="Search users..."
              className="border p-2 rounded flex-grow"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="border p-2 rounded"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="pt">PT</option>
            </select>
          </div>
          <div className="border rounded p-4 h-[440px] overflow-y-auto">
            <ul>
              {filteredUsers.map(user => (
                <li key={user.user_id} className="p-2 border-b flex justify-between items-center">
                  <div>
                    <div>{user.username}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                    <div className="text-xs text-gray-400">{user.role}</div>
                  </div>
                  {isClassFull ? (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded">
                      Full Slot
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAddUser(user.user_id)}
                      className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                    >
                      Add
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <button
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

export default AttendeesList; 