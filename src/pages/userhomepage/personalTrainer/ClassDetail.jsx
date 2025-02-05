import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ClassDetail = ({ classItem, onBack }) => {
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [error, setError] = useState(null);
  const [scheduleData, setScheduleData] = useState({
    dayOfWeek: '',
    startHour: '',
    endHour: '',
  });
  const [classDetail, setClassDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState({
    class_name: '',
    class_description: '',
    class_type: '',
    fee: '',
    max_attender: '',
    start_date: '',
    end_date: '',
    class_subject: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [attendees, setAttendees] = useState([]);

  const daysOfWeek = [
    { value: 0, label: 'Monday' },
    { value: 1, label: 'Tuesday' },
    { value: 2, label: 'Wednesday' },
    { value: 3, label: 'Thursday' },
    { value: 4, label: 'Friday' },
    { value: 5, label: 'Saturday' },
    { value: 6, label: 'Sunday' },
  ];

  const MIN_HOUR = "05:00";
  const MAX_HOUR = "21:00";

  const CLASS_SUBJECTS = [
    'Yoga',
    'Pilates',
    'HIIT',
    'Cardio',
    'Strength Training',
    'Boxing',
    'CrossFit',
    'Stretching'
  ];

  useEffect(() => {
    const fetchClassDetail = async () => {
      try {
        setLoading(true);
        const accessToken = localStorage.getItem('accessToken');
        const response = await axios.get(
          `http://localhost:3000/classes/${classItem.class_id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setClassDetail(response.data);
      } catch (err) {
        console.error('Error fetching class detail:', err);
        setError('Failed to load class details');
      } finally {
        setLoading(false);
      }
    };

    fetchClassDetail();
  }, [classItem.class_id]);

  useEffect(() => {
    if (classDetail) {
      setEditData({
        class_name: classDetail.class_name,
        class_description: classDetail.class_description,
        class_type: classDetail.class_type,
        fee: classDetail.fee,
        max_attender: classDetail.maxAttender,
        start_date: new Date(classDetail.start_date).toISOString().split('T')[0],
        end_date: new Date(classDetail.end_date).toISOString().split('T')[0],
        class_subject: classDetail.class_subject
      });
    }
  }, [classDetail]);

  const handleScheduleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'startHour' || name === 'endHour') {
      if (value < MIN_HOUR || value > MAX_HOUR) {
        setError('Operating hours must be between 5:00 AM and 9:00 PM');
        return;
      }
    }
    
    setScheduleData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user makes changes
    setError(null);
    
    // Validate time when both times are set
    if (name === 'startHour' || name === 'endHour') {
      const updatedData = { ...scheduleData, [name]: value };
      if (updatedData.startHour && updatedData.endHour) {
        const startTime = new Date(`2024-01-01T${updatedData.startHour}`);
        const endTime = new Date(`2024-01-01T${updatedData.endHour}`);
        
        if (startTime >= endTime) {
          setError('Start time must be earlier than end time');
        }
      }
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    
    // Kiểm tra thời gian
    const startTime = new Date(`2024-01-01T${scheduleData.startHour}`);
    const endTime = new Date(`2024-01-01T${scheduleData.endHour}`);
    
    if (startTime >= endTime) {
      setError('Start time must be earlier than end time');
      return;
    }

    const accessToken = localStorage.getItem('accessToken');
    const baseDate = "2024-03-25";
    const startHourFormatted = new Date(`${baseDate}T${scheduleData.startHour}:00.000Z`).toISOString();
    const endHourFormatted = new Date(`${baseDate}T${scheduleData.endHour}:00.000Z`).toISOString();

    const scheduleDataToSubmit = {
      dayOfWeek: parseInt(scheduleData.dayOfWeek),
      startHour: startHourFormatted,
      endHour: endHourFormatted,
    };

    try {
      await axios.post(
        `http://localhost:3000/schedule/class/${classItem.class_id}/batch`,
        scheduleDataToSubmit,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setShowScheduleForm(false);
      setScheduleData({ dayOfWeek: '', startHour: '', endHour: '' });
      setError(null);
      alert('Schedule created successfully!');
    } catch (err) {
      console.error('Error adding schedule:', err);
      // Xử lý thông báo lỗi từ server
      if (err.response?.status === 409) {
        // Chuyển đổi thông báo lỗi sang tiếng Anh
        const vietnameseMessage = err.response.data.message;
        const date = vietnameseMessage.match(/\d{1,2}\/\d{1,2}\/\d{4}/)?.[0];
        if (date) {
          setError(`Schedule conflict detected on ${date}`);
        } else {
          setError('Schedule conflict detected');
        }
      } else {
        setError(err.response?.data?.message || 'Error adding schedule. Please try again.');
      }
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const formattedData = {
        className: editData.class_name,
        classDescription: editData.class_description,
        statusId: classDetail.status_id.toString(),
        fee: editData.fee.toString(),
        classType: editData.class_type.toString(),
        startDate: new Date(editData.start_date).toISOString(),
        endDate: new Date(editData.end_date).toISOString(),
        pt_id: classDetail.pt_id.toString(),
        maxAttender: editData.max_attender.toString(),
        class_subject: editData.class_subject
      };

      await axios.patch(
        `http://localhost:3000/classes/${classDetail.class_id}`,
        formattedData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Refresh class detail data
      const response = await axios.get(
        `http://localhost:3000/classes/${classDetail.class_id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setClassDetail(response.data);
      setIsEditing(false);
      alert('Class updated successfully!');
    } catch (err) {
      console.error('Error updating class:', err);
      setError(err.response?.data?.message || 'Error updating class. Please try again.');
    }
  };

  const fetchAttendees = async (classId) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await axios.get(
        `http://localhost:3000/user-class/users/${classId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      
      if (response.data) {
        // Lấy user_id của PT dạy lớp này từ response.data.pt
        const teachingPtId = response.data.pt?.user_id;
        
        // Lọc bỏ PT dạy lớp này khỏi danh sách users
        const filteredUsers = response.data.users.filter(user => user.user_id !== teachingPtId);
        
        console.log('Filtered attendees data:', filteredUsers);
        setAttendees(filteredUsers);
      }
    } catch (error) {
      console.error('Error fetching attendees:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (classDetail?.class_id) {
        await fetchAttendees(classDetail.class_id);
      }
    };
    fetchData();
  }, [classDetail]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
        </div>
      ) : classDetail ? (
        <>
          {/* Back Button */}
          <button
            onClick={onBack}
            className="group mb-8 flex items-center text-gray-600 hover:text-secondary transition-colors"
          >
            <svg 
              className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Class List
          </button>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-secondary to-secondary/80 px-8 py-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{classDetail.class_name}</h1>
                  <span className={`inline-flex items-center px-4 py-1 rounded-full text-sm font-medium ${
                    classDetail.status_id === 1 ? 'bg-yellow-100 text-yellow-800' :
                    classDetail.status_id === 2 ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    <span className="w-2 h-2 mr-2 rounded-full ${
                      classDetail.status_id === 1 ? 'bg-yellow-400' :
                      classDetail.status_id === 2 ? 'bg-green-400' :
                      'bg-red-400'
                    }"></span>
                    {classDetail.status_id === 1 ? 'Pending' : 
                     classDetail.status_id === 2 ? 'Active' : 'Locked'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-8">
              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Basic Info */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Description Section */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Description</h2>
                    {isEditing ? (
                      <textarea
                        name="class_description"
                        value={editData.class_description}
                        onChange={handleEditChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                        rows="4"
                      />
                    ) : (
                      <p className="text-gray-600 leading-relaxed">{classDetail.class_description}</p>
                    )}
                  </div>

                  {/* Class Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Class Information */}
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Class Name</h3>
                        {isEditing ? (
                          <input
                            type="text"
                            name="class_name"
                            value={editData.class_name}
                            onChange={handleEditChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary focus:border-transparent"
                          />
                        ) : (
                          <p className="text-gray-800 font-medium">{classDetail.class_name}</p>
                        )}
                      </div>

                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Class Type</h3>
                        {isEditing ? (
                          <select
                            name="class_type"
                            value={editData.class_type}
                            onChange={handleEditChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary focus:border-transparent"
                          >
                            <option value="1">One-on-One</option>
                            <option value="2">Many</option>
                          </select>
                        ) : (
                          <p className="text-gray-800 font-medium">
                            {classDetail.class_type === 1 ? 'One-on-One' : 'Many'}
                          </p>
                        )}
                      </div>

                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Fee</h3>
                        {isEditing ? (
                          <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-500">VND</span>
                            <input
                              type="number"
                              name="fee"
                              value={editData.fee}
                              onChange={handleEditChange}
                              className="w-full pl-8 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary focus:border-transparent"
                            />
                          </div>
                        ) : (
                          <p className="text-gray-800 font-medium">{classDetail.fee} VND</p>
                        )}
                      </div>

                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Class Subject</h3>
                        {isEditing ? (
                          <select
                            name="class_subject"
                            value={editData.class_subject || ''}
                            onChange={handleEditChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary focus:border-transparent"
                          >
                            <option value="">Select a subject</option>
                            {CLASS_SUBJECTS.map((subject) => (
                              <option key={subject} value={subject}>
                                {subject}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <p className="text-gray-800 font-medium">
                            {classDetail.class_subject || 'Not specified'}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Attendance Information */}
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Start Date</h3>
                        {isEditing ? (
                          <input
                            type="date"
                            name="start_date"
                            value={editData.start_date}
                            onChange={handleEditChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary focus:border-transparent"
                          />
                        ) : (
                          <p className="text-gray-800 font-medium">
                            {new Date(classDetail.start_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">End Date</h3>
                        {isEditing ? (
                          <input
                            type="date"
                            name="end_date"
                            value={editData.end_date}
                            onChange={handleEditChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary focus:border-transparent"
                          />
                        ) : (
                          <p className="text-gray-800 font-medium">
                            {new Date(classDetail.end_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Maximum Attendees</h3>
                        {isEditing ? (
                          <input
                            type="number"
                            name="max_attender"
                            value={editData.max_attender}
                            onChange={handleEditChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary focus:border-transparent"
                          />
                        ) : (
                          <p className="text-gray-800 font-medium">{classDetail.maxAttender}</p>
                        )}
                      </div>

                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Current Attendees</h3>
                        <p className="text-gray-800 font-medium">{classDetail.currentAttender}</p>
                      </div>

                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Remaining Slots</h3>
                        <p className="text-gray-800 font-medium">{classDetail.remainingSlots}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Schedule & Actions */}
                <div className="space-y-6">
                  {/* Schedule Form */}
                  {showScheduleForm && (
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Weekly Schedule</h3>
                      <form onSubmit={handleScheduleSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Day of Week
                          </label>
                          <select
                            name="dayOfWeek"
                            value={scheduleData.dayOfWeek}
                            onChange={handleScheduleChange}
                            required
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                          >
                            <option value="">Select day</option>
                            {daysOfWeek.map(day => (
                              <option key={day.value} value={day.value}>
                                {day.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Time
                          </label>
                          <input
                            type="time"
                            name="startHour"
                            value={scheduleData.startHour}
                            onChange={handleScheduleChange}
                            required
                            min={MIN_HOUR}
                            max={MAX_HOUR}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Time
                          </label>
                          <input
                            type="time"
                            name="endHour"
                            value={scheduleData.endHour}
                            onChange={handleScheduleChange}
                            required
                            min={MIN_HOUR}
                            max={MAX_HOUR}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                          />
                        </div>

                        {error && (
                          <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
                            <div className="flex">
                              <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setShowScheduleForm(false);
                              setError(null);
                            }}
                            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
                            disabled={!!error}
                          >
                            Add Schedule
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleEditSubmit}
                          className="w-full px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
                        >
                          Save Changes
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="w-full px-4 py-2 bg-white text-secondary border-2 border-secondary rounded-lg hover:bg-secondary hover:text-white transition-colors"
                        >
                          Edit Class
                        </button>
                        <button
                          onClick={() => setShowScheduleForm(true)}
                          className="w-full px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
                        >
                          Add Schedule
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Attendees List Section */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mt-8">
            <div className="bg-gradient-to-r from-secondary to-secondary/80 px-8 py-4">
              <h2 className="text-xl font-bold text-white">Class Attendees ({attendees.length})</h2>
            </div>
            
            <div className="p-6">
              {attendees && attendees.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phone Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {attendees.map((attendee) => (
                        <tr key={attendee.user_id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-gray-900">
                                {attendee.name || 'N/A'}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{attendee.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{attendee.phoneNum}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${attendee.role_id === 2 ? 'bg-blue-100 text-blue-800' : 
                                attendee.role_id === 3 ? 'bg-purple-100 text-purple-800' : 
                                'bg-gray-100 text-gray-800'}`}>
                              {attendee.role_id === 2 ? 'Member' : 
                               attendee.role_id === 3 ? 'Personal Trainer' : 
                               'Unknown Role'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${attendee.status_id === 1 ? 'bg-yellow-100 text-yellow-800' : 
                                attendee.status_id === 2 ? 'bg-green-100 text-green-800' : 
                                'bg-red-100 text-red-800'}`}>
                              {attendee.status_id === 1 ? 'Pending' : 
                               attendee.status_id === 2 ? 'Active' : 
                               'Inactive'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No attendees found for this class
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center text-red-600">Failed to load class details</div>
      )}
    </div>
  );
};

export default ClassDetail; 