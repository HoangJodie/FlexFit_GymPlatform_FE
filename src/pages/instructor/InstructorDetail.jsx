import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const classTypeMapping = {
  1: 'One-on-One',
  2: 'Many',
};

const InstructorDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [instructor, setInstructor] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch instructor details
        const instructorResponse = await fetch(`http://localhost:3000/user/${userId}`);
        if (!instructorResponse.ok) {
          throw new Error('Instructor information not found');
        }
        const instructorData = await instructorResponse.json();
        setInstructor(instructorData);

        // Fetch instructor's classes
        const classesResponse = await fetch(`http://localhost:3000/classes/pt/${userId}`);
        if (!classesResponse.ok) {
          throw new Error('Could not fetch classes');
        }
        const classesData = await classesResponse.json();
        setClasses(classesData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleClassClick = (classId) => {
    navigate(`/classes/${classId}`);
  };

  if (loading) {
    return <div className="text-center p-6">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-6">{error}</div>;
  }

  if (!instructor) {
    return <div className="text-center p-6">Instructor not found</div>;
  }

  return (
    <div className="p-6 pt-24 bg-gray-100 min-h-screen">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mt-20">{instructor.username}</h2>
        {instructor.imgUrl ? (
          <img 
            src={instructor.imgUrl} 
            alt={`${instructor.username}'s profile`}
            className="w-40 h-40 rounded-full mx-auto my-4 object-cover"
          />
        ) : (
          <div className="w-40 h-40 rounded-full mx-auto my-4 bg-blue-500 flex items-center justify-center">
            <span className="text-white text-5xl font-bold">
              {instructor.username.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <p className="text-lg text-gray-600 mt-2">Personal Trainer</p>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Instructor Info Card */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h3 className="text-xl font-semibold mb-2">Contact Information</h3>
              <p className="text-gray-600">Email: {instructor.email}</p>
              <p className="text-gray-600">Phone: {instructor.phoneNum}</p>
            </div>

            <div className="border-b pb-4">
              <h3 className="text-xl font-semibold mb-2">Details</h3>
              <p className="text-gray-600">Role: Personal Trainer</p>
              {instructor.PT_introduction && (
                <div className="mt-4">
                  <h4 className="text-lg font-medium mb-2">Introduction</h4>
                  <p className="text-gray-600 leading-relaxed">
                    {instructor.PT_introduction}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Classes List Section */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h3 className="text-xl font-semibold mb-4">Classes</h3>
          {classes.length > 0 ? (
            <div className="grid gap-4">
              {classes.map((classItem) => (
                <div 
                  key={classItem.class_id} 
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleClassClick(classItem.class_id)}
                >
                  <h4 className="font-medium text-lg mb-2">{classItem.class_name}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <p>Class type: {classTypeMapping[classItem.class_type]}</p>
                      <p>Class Subject: {classItem.class_subject}</p>
                    </div>
                    <div>
                      <p>Fee: {classItem.fee} VND</p>
                      <p>Remaining Slots: {classItem.remainingSlots}</p>
                    </div>
                  </div>
                  {classItem.description && (
                    <p className="mt-2 text-gray-600">{classItem.description}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center">No classes available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstructorDetail; 