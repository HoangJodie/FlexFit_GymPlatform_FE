import React, { useState } from 'react';
import axios from 'axios';

const AddClass = ({ onClassAdded, onCancel }) => {
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    className: '',
    classDescription: '',
    classType: '',
    fee: '',
    startDate: '',
    endDate: '',
    file: null,
    maxAttender: '',
    classSubject: '',
  });
  const [dateError, setDateError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'endDate') {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(value);
      
      if (formData.startDate && endDate < startDate) {
        setDateError('End date cannot be earlier than start date');
      } else {
        setDateError('');
      }
    }

    if (name === 'startDate') {
      if (formData.endDate) {
        const startDate = new Date(value);
        const endDate = new Date(formData.endDate);
        
        if (endDate < startDate) {
          setDateError('End date cannot be earlier than start date');
        } else {
          setDateError('');
        }
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      file: e.target.files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    
    if (endDate < startDate) {
      setDateError('End date cannot be earlier than start date');
      return;
    }

    const accessToken = localStorage.getItem('accessToken');
    const data = new FormData();
    data.append('className', formData.className);
    data.append('classDescription', formData.classDescription);
    data.append('classType', formData.classType);
    data.append('fee', formData.fee);
    data.append('startDate', formData.startDate);
    data.append('endDate', formData.endDate);
    if (formData.file) data.append('file', formData.file);
    data.append('maxAttender', formData.maxAttender);
    data.append('classSubject', formData.classSubject);
  
    try {
      const response = await axios.post('http://localhost:3000/classes/create', data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      onClassAdded(response.data);
    } catch (err) {
      console.error('Error creating class:', err);
      setError('Error creating class');
    }
  };

  return (
    <div className="max-w-[800px] mx-auto my-8 p-8 bg-white rounded-2xl shadow-lg">
      <button
        onClick={onCancel}
        className="absolute left-5 top-5 px-4 py-2 text-base bg-gray-50 border border-gray-200 
        rounded-lg flex items-center gap-2 text-gray-600 hover:bg-gray-100 transition-all"
      >
        ← Back
      </button>

      <h2 className="text-center text-3xl font-semibold text-gray-800 mb-8">
        Add New Class
      </h2>

      {error && (
        <div className="bg-red-500 text-white p-3 rounded-lg mb-4 text-center">
          {error}
        </div>
      )}
      
      <form 
        onSubmit={handleSubmit} 
        className="grid grid-cols-2 gap-5 p-8 bg-white rounded-xl border border-gray-200"
      >
        <div className="col-span-2">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Class Name
          </label>
          <input
            type="text"
            name="className"
            value={formData.className}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2.5 text-base border border-gray-300 rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="col-span-2">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Class Subject
          </label>
          <select
            name="classSubject"
            value={formData.classSubject}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2.5 text-base border border-gray-300 rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="">Select Class Subject</option>
            <option value="Yoga">Yoga</option>
            <option value="Pilates">Pilates</option>
            <option value="HIIT">HIIT</option>
            <option value="Cardio">Cardio</option>
            <option value="Strength Training">Strength Training</option>
            <option value="Boxing">Boxing</option>
            <option value="CrossFit">CrossFit</option>
            <option value="Stretching">Stretching</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Class Description
          </label>
          <textarea
            name="classDescription"
            value={formData.classDescription}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2.5 text-base border border-gray-300 rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
            min-h-[100px] resize-y"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Class Type
          </label>
          <select
            name="classType"
            value={formData.classType}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2.5 text-base border border-gray-300 rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="">Select Class Type</option>
            <option value="1">One-on-One</option>
            <option value="2">Group Class</option>
          </select>
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Fee
          </label>
          <input
            type="number"
            name="fee"
            value={formData.fee}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2.5 text-base border border-gray-300 rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Start Date
          </label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2.5 text-base border border-gray-300 rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            End Date
          </label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleInputChange}
            required
            className={`w-full px-3 py-2.5 text-base rounded-lg focus:outline-none focus:ring-2 
            focus:ring-blue-500 focus:border-transparent ${
              dateError ? 'border-2 border-red-500' : 'border border-gray-300'
            }`}
          />
          {dateError && (
            <p className="mt-1 text-sm text-red-500">
              {dateError}
            </p>
          )}
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Maximum Attenders
          </label>
          <input
            type="number"
            name="maxAttender"
            value={formData.maxAttender}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2.5 text-base border border-gray-300 rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Class Image
          </label>
          <input 
            type="file" 
            name="file" 
            onChange={handleFileChange} 
            required 
            className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="col-span-2 flex justify-end gap-4 mt-4">
          <button 
            type="button" 
            onClick={onCancel}
            className="px-6 py-3 bg-white text-red-500 border border-red-500 rounded-lg 
            hover:bg-red-500 hover:text-white transition-all duration-200"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-6 py-3 bg-green-500 text-white rounded-lg font-medium 
            hover:bg-green-600 transition-all duration-200"
          >
            Create Class
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddClass; 