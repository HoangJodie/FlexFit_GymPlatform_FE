import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

const MembershipManagement = () => {
  const [memberships, setMemberships] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMembership, setCurrentMembership] = useState({
    membership_type: '',
    name: '',
    description: [''],
    price: '',
    duration: ''
  });

  // Fetch memberships
  const fetchMemberships = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/payment/membership-types`);
      if (response.data) {
        const formattedData = response.data.map(membership => ({
          ...membership,
          description: Array.isArray(membership.description) 
            ? membership.description 
            : membership.description.split(',').map(desc => desc.trim())
        }));
        setMemberships(formattedData);
      }
    } catch (error) {
      toast.error('Unable to load membership list');
      console.error('Error fetching memberships:', error);
    }
  };

  useEffect(() => {
    fetchMemberships();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentMembership(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle description changes
  const handleDescriptionChange = (index, value) => {
    const newDescription = [...currentMembership.description];
    newDescription[index] = value;
    setCurrentMembership(prev => ({
      ...prev,
      description: newDescription
    }));
  };

  // Add new description field
  const addDescription = () => {
    setCurrentMembership(prev => ({
      ...prev,
      description: [...prev.description, '']
    }));
  };

  // Remove description field
  const removeDescription = (index) => {
    const newDescription = currentMembership.description.filter((_, i) => i !== index);
    setCurrentMembership(prev => ({
      ...prev,
      description: newDescription
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...currentMembership,
        price: parseInt(currentMembership.price),
        duration: parseInt(currentMembership.duration)
      };

      if (isEditing) {
        await axios.put(`${BASE_URL}/payment/admin/membership-types/${currentMembership.membership_type}`, data);
        toast.success('Membership updated successfully');
      } else {
        await axios.post(`${BASE_URL}/payment/admin/membership-types`, data);
        toast.success('New membership created successfully');
      }

      setIsModalOpen(false);
      fetchMemberships();
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred');
      console.error('Error submitting form:', error);
    }
  };

  // Handle delete membership
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this membership?')) {
      try {
        await axios.delete(`${BASE_URL}/payment/admin/membership-types/${id}`);
        toast.success('Membership deleted successfully');
        fetchMemberships();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Unable to delete membership');
        console.error('Error deleting membership:', error);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Membership Management</h1>
        <button
          onClick={() => {
            setIsEditing(false);
            setCurrentMembership({
              membership_type: '',
              name: '',
              description: [''],
              price: '',
              duration: ''
            });
            setIsModalOpen(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add New Package
        </button>
      </div>

      {/* Membership List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {memberships.map((membership) => (
          <div key={membership.membership_type} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">{membership.name}</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setCurrentMembership({
                      ...membership,
                      description: Array.isArray(membership.description) 
                        ? membership.description 
                        : membership.description.split(',').map(desc => desc.trim())
                    });
                    setIsModalOpen(true);
                  }}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <i className="fas fa-edit"></i>
                </button>
                <button
                  onClick={() => handleDelete(membership.membership_type)}
                  className="text-red-500 hover:text-red-700"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-2xl font-bold text-blue-600">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'VND'
                }).format(membership.price)}
              </p>
              <p className="text-gray-600">Duration: {membership.duration} month(s)</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Features:</h3>
              <ul className="list-disc list-inside space-y-1">
                {Array.isArray(membership.description) 
                  ? membership.description.map((desc, index) => (
                      <li key={index} className="text-gray-600">{desc}</li>
                    ))
                  : membership.description.split(',').map((desc, index) => (
                      <li key={index} className="text-gray-600">{desc.trim()}</li>
                    ))
                }
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-2xl"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <h2 className="text-2xl font-bold mb-6">
          {isEditing ? 'Edit Membership Package' : 'Add New Membership Package'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Membership Type ID
            </label>
            <input
              type="number"
              name="membership_type"
              value={currentMembership.membership_type}
              onChange={handleInputChange}
              className="w-full border rounded p-2"
              required
              disabled={isEditing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Package Name
            </label>
            <input
              type="text"
              name="name"
              value={currentMembership.name}
              onChange={handleInputChange}
              className="w-full border rounded p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (VND)
            </label>
            <input
              type="number"
              name="price"
              value={currentMembership.price}
              onChange={handleInputChange}
              className="w-full border rounded p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (months)
            </label>
            <input
              type="number"
              name="duration"
              value={currentMembership.duration}
              onChange={handleInputChange}
              className="w-full border rounded p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Features Description
            </label>
            {currentMembership.description.map((desc, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={desc}
                  onChange={(e) => handleDescriptionChange(index, e.target.value)}
                  className="flex-1 border rounded p-2"
                  placeholder={`Feature ${index + 1}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => removeDescription(index)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addDescription}
              className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Add Feature
            </button>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {isEditing ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MembershipManagement; 