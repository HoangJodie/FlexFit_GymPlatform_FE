import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ClassCard from '../../../userhomepage/personalTrainer/ClassCard';

const ClassRequests = () => {
  const [classes, setClasses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchClassData();
  }, []);

  const fetchClassData = async () => {
    try {
      const response = await axios.get('http://localhost:3000/classes');
      const updatedClasses = response.data.filter(cls => cls.status_id === 1);
      setClasses(updatedClasses);
    } catch (error) {
      console.error('Error fetching class data:', error);
    }
  };

  const updateClassStatus = async (id, statusId) => {
    try {
      await axios.patch(`http://localhost:3000/classes/${id}/status`, { statusId });
      fetchClassData();
    } catch (error) {
      console.error('Error updating class status:', error);
    }
  };

  // Pagination logic
  const indexOfLastEntry = currentPage * itemsPerPage;
  const indexOfFirstEntry = indexOfLastEntry - itemsPerPage;
  const currentEntries = classes.slice(indexOfFirstEntry, indexOfLastEntry);

  const pageNumbers = Array.from({ length: Math.ceil(classes.length / itemsPerPage) }, (_, i) => i + 1);

  const renderActions = (classItem) => (
    <div className="flex gap-2">
      <button 
        onClick={(e) => {
          e.stopPropagation();
          updateClassStatus(classItem.class_id, 2);
        }} 
        className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md transition-colors duration-200"
      >
        Chấp nhận
      </button>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          updateClassStatus(classItem.class_id, 3);
        }} 
        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition-colors duration-200"
      >
        Từ chối
      </button>
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">New class requests</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {currentEntries.map(classItem => (
          <ClassCard
            key={classItem.class_id}
            classItem={classItem}
            onCardClick={() => {}}
            actions={renderActions(classItem)}
            isAdmin={true}
          />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-4">
        <button 
          onClick={() => setCurrentPage(currentPage - 1)} 
          disabled={currentPage === 1} 
          className="px-4 py-2 mr-2 border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Trước
        </button>
        {pageNumbers.map(number => (
          <button
            key={number}
            onClick={() => setCurrentPage(number)}
            className={`px-4 py-2 mx-1 border rounded-md ${
              currentPage === number 
                ? 'bg-blue-500 text-white' 
                : 'hover:bg-gray-100'
            }`}
          >
            {number}
          </button>
        ))}
        <button 
          onClick={() => setCurrentPage(currentPage + 1)} 
          disabled={currentPage === pageNumbers.length} 
          className="px-4 py-2 ml-2 border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Sau
        </button>
      </div>
    </div>
  );
};

export default ClassRequests;
