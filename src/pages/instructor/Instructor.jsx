import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InstructorDetail from './InstructorDetail';

const Instructor = () => {
  const navigate = useNavigate();
  const [filteredPT, setFilteredPT] = useState([]);
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:3000/user');
        const data = await response.json();
        filterPT(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  // Function to filter personal trainers
  const filterPT = (allUsers) => {
    const filtered = allUsers.filter(user => user.role_id === 3); // Filtering for PT role_id = 3
    setFilteredPT(filtered);
  };

  const handleInstructorClick = (userId) => {
    navigate(`/instructor/${userId}`);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Centered Heading and Paragraph */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mt-20">Our Personal Trainers</h2>
        <p className="text-lg mt-2">Explore our personal trainers below.</p>
      </div>

      {filteredPT.length > 0 ? (
        <div className="grid mb-28 md:grid-cols-2 lg:grid-cols-3 w-[90%] gap-4 mx-auto">
          {filteredPT.map((user) => (
            <div 
              key={user.user_id} 
              className="flex dark:text-white hover:-translate-y-2 duration-200 cursor-pointer flex-col shadow-md py-8 px-10 md:px-8 rounded-md"
              onClick={() => handleInstructorClick(user.user_id)}
            >
              <div className="flex-col flex gap-6 md:gap-8">
                <div className='flex flex-col text-center'>
                  <p className="font-medium text-lg dark:text-white text-gray-800">{user.username}</p>
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={`${user.username}'s profile`}
                      className="w-32 h-32 rounded-full mx-auto my-4 object-cover"
                    />
                  ) : user.imgUrl ? (
                    <img 
                      src={user.imgUrl} 
                      alt={`${user.username}'s profile`}
                      className="w-32 h-32 rounded-full mx-auto my-4 object-cover"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full mx-auto my-4 bg-blue-500 flex items-center justify-center">
                      <span className="text-white text-4xl font-bold">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <p className='text-gray-500 mb-4'>Personal Trainer</p>
                  <div className="text-left">
                    <p className='text-gray-500 mb-3'>Email: {user.email}</p>
                    <p className='text-gray-500 mb-3'>Phone: {user.phoneNum}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className='text-center text-gray-500'>No trainers available.</p>
      )}
    </div>
  );
};

export default Instructor;