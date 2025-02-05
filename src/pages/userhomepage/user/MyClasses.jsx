import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserClassCard from './UserClassCard';

const API_URL = 'http://localhost:3000';

const MyClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setError('Please login to view your classes.');
          setLoading(false);
          return;
        }

        const userClassesResponse = await fetch(`${API_URL}/user-class/UserOwned`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!userClassesResponse.ok) {
          if (userClassesResponse.status === 401) {
            throw new Error('Unauthorized');
          }
          throw new Error('Unable to fetch class list');
        }

        const userData = await userClassesResponse.json();
        console.log('API Response:', userData);

        if (!userData.classIds || userData.classIds.length === 0) {
          setClasses([]);
          setLoading(false);
          return;
        }

        const classPromises = userData.classIds.map(async (classId) => {
          try {
            const classResponse = await fetch(`${API_URL}/classes/info/${classId}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (!classResponse.ok) {
              throw new Error(`HTTP error! status: ${classResponse.status}`);
            }
            
            const classData = await classResponse.json();
            return classData;
          } catch (err) {
            console.error(`Error fetching class info ${classId}:`, err);
            return null;
          }
        });

        const classesData = (await Promise.all(classPromises)).filter(c => c !== null);
        console.log('Processed Classes:', classesData);
        setClasses(classesData);
        setLoading(false);
      } catch (err) {
        console.error('Error loading classes:', err);
        if (err.message === 'Unauthorized') {
          handleUnauthorized();
        } else {
          setError(err.message || 'Unable to load classes');
        }
        setLoading(false);
      }
    };

    fetchClasses();
  }, [navigate]);

  const handleUnauthorized = () => {
    localStorage.removeItem('accessToken');
    setError('Your session has expired. Please login again.');
    navigate('/login', { replace: true });
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );
  
  if (error) return (
    <div className="text-red-500 text-center p-4 bg-red-50 rounded-lg">
      <p>{error}</p>
      {error.includes('login') ? (
        <button 
          onClick={handleUnauthorized}
          className="mt-2 text-sm text-blue-500 hover:text-blue-700"
        >
          Login Again
        </button>
      ) : (
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 text-sm text-blue-500 hover:text-blue-700"
        >
          Try Again
        </button>
      )}
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">My Classes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((classItem) => (
          <UserClassCard
            key={classItem.class_id}
            classItem={classItem}
            isEnded={new Date(classItem.end_date) < new Date()}
          />
        ))}
      </div>
      {classes.length === 0 && (
        <div className="text-center text-gray-500 p-8 bg-gray-50 rounded-lg">
          <p className="text-lg">You haven't joined any classes yet.</p>
          <p className="text-sm mt-2">Join classes to start your journey!</p>
        </div>
      )}
    </div>
  );
};

export default MyClasses; 