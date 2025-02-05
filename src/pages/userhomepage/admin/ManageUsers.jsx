import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: '', email: '', phoneNum: '', password: '', role_id: '', status_id: '' });
  const [editingUser, setEditingUser] = useState({ username: '', email: '', phoneNum: '', role_id: '', status_id: '' });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:3000/user');
      const data = await response.json();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async () => {
    try {
      const response = await fetch('http://localhost:3000/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });
      if (response.ok) {
        fetchUsers();
        setNewUser({ username: '', email: '', phoneNum: '', password: '', role_id: '', status_id: '' });
        setIsAddModalOpen(false);
      }
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  const handleEditUser = async (user_id) => {
    try {
      console.log("Editing user data:", editingUser); // Log dữ liệu form
      const response = await fetch(`http://localhost:3000/user/${user_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingUser),
      });
      if (response.ok) {
        fetchUsers();
        setEditingUser({ username: '', email: '', phoneNum: '', role_id: '', status_id: '' });
        setIsEditModalOpen(false);
      }
    } catch (error) {
      console.error('Error editing user:', error);
    }
  };


  const handleDeleteUser = async (user_id) => {
    try {
      const response = await fetch(`http://localhost:3000/user/${user_id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const applyFilters = () => {
    const filtered = users.filter(user => {
      const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter ? user.role_id === parseInt(roleFilter) : true;
      const matchesStatus = statusFilter ? user.status_id === parseInt(statusFilter) : true;
      return matchesSearch && matchesRole && matchesStatus;
    });
    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const openAddUserModal = () => {
    setIsAddModalOpen(true);
    setNewUser({ username: '', email: '', phoneNum: '', password: '', role_id: '', status_id: '' });
  };

  const openEditUserModal = (user) => {
    setIsEditModalOpen(true);
    setEditingUser({
      ...user,
      password: '' // Để trống trường password khi mở modal
  });
  };

  const getRoleName = (roleId) => {
    switch (roleId) {
      case 1:
        return 'Admin';
      case 2:
        return 'PT';
      case 3:
        return 'Customer';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold mb-4">Manage Users</h2>
      <p className="text-lg mb-4">Here you can add, edit, or delete users from the system.</p>
      <button onClick={openAddUserModal} className="px-4 py-2 bg-blue-600 text-white rounded mb-6 hover:bg-blue-700">
        Add User
      </button>

      <div className="flex flex-col sm:flex-row gap-2 p-4 pl-0">
        <input
          type="text"
          placeholder="Search by username"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Filter by Role ID</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Filter by Status ID</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
        </select>

        <button
          onClick={applyFilters}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
        >
          Search
        </button>
      </div>


      <h3 className="text-2xl font-semibold mb-3">User List</h3>
      <table className="min-w-full bg-white rounded shadow">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">User ID</th>
            <th className="py-2 px-4 border-b">Username</th>
            <th className="py-2 px-4 border-b">Email</th>
            <th className="py-2 px-4 border-b">Phone Number</th>
            <th className="py-2 px-4 border-b">Role ID</th>
            <th className="py-2 px-4 border-b">Status ID</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.map((user) => (
            <tr key={user.user_id}>
              <td className="py-2 px-4 border-b">{user.user_id}</td>
              <td className="py-2 px-4 border-b">{user.username}</td>
              <td className="py-2 px-4 border-b">{user.email}</td>
              <td className="py-2 px-4 border-b">{user.phoneNum}</td>
              <td className="py-2 px-4 border-b">{getRoleName(user.role_id)}</td>
              <td className="py-2 px-4 border-b">{user.status_id}</td>
              <td className="py-2 px-4 border-b space-x-2">
                <button onClick={() => openEditUserModal(user)} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">
                  Edit
                </button>
                <button onClick={() => handleDeleteUser(user.user_id)} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
  isOpen={isAddModalOpen}
  onRequestClose={() => setIsAddModalOpen(false)}
  contentLabel="Add User"
  className="mt-32 bg-white p-6 max-w-md mx-auto rounded shadow-md"
>
  <h3 className="text-xl font-semibold mb-4">Add User</h3>
  <input
    type="text"
    placeholder="Username"
    value={newUser.username}
    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
    className="block w-full p-2 mb-3 border border-gray-300 rounded"
  />
  <input
    type="email"
    placeholder="Email"
    value={newUser.email}
    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
    className="block w-full p-2 mb-3 border border-gray-300 rounded"
  />
  <input
    type="text"
    placeholder="Phone Number"
    value={newUser.phoneNum}
    onChange={(e) => setNewUser({ ...newUser, phoneNum: e.target.value })}
    className="block w-full p-2 mb-3 border border-gray-300 rounded"
  />
  <input
    type="password"
    placeholder="Password"
    value={newUser.password}
    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
    className="block w-full p-2 mb-3 border border-gray-300 rounded"
  />

  <label htmlFor="role_id" className="block mb-2">Role:</label>
  <select
    id="role_id"
    value={newUser.role_id}
    onChange={(e) => setNewUser({ ...newUser, role_id: parseInt(e.target.value, 10) })}
    className="block w-full p-2 mb-3 border border-gray-300 rounded"
  >
    <option value="">Select Role</option>
    <option value="1">Admin</option>
    <option value="2">PT</option>
    <option value="3">Customer</option>
  </select>

  <label htmlFor="status_id" className="block mb-2">Status:</label>
  <select
    id="status_id"
    value={newUser.status_id}
    onChange={(e) => setNewUser({ ...newUser, status_id: parseInt(e.target.value, 10) })}
    className="block w-full p-2 mb-3 border border-gray-300 rounded"
  >
    <option value="">Select Status</option>
    <option value="1">Active</option>
    <option value="2">Inactive</option>
  </select>

  <div className="flex justify-end space-x-2">
    <button onClick={handleAddUser} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
      Add User
    </button>
    <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500">
      Cancel
    </button>
  </div>
</Modal>

<Modal
  isOpen={isEditModalOpen}
  onRequestClose={() => setIsEditModalOpen(false)}
  contentLabel="Edit User"
  className="mt-32 bg-white p-6 max-w-md mx-auto rounded shadow-md"
>
  <h3 className="text-xl font-semibold mb-4">Edit User</h3>
  <input
    type="text"
    placeholder="Username"
    value={editingUser.username}
    onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
    className="block w-full p-2 mb-3 border border-gray-300 rounded"
  />
  <input
    type="email"
    placeholder="Email"
    value={editingUser.email}
    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
    className="block w-full p-2 mb-3 border border-gray-300 rounded"
  />
  <input
    type="text"
    placeholder="Phone Number"
    value={editingUser.phoneNum}
    onChange={(e) => setEditingUser({ ...editingUser, phoneNum: e.target.value })}
    className="block w-full p-2 mb-3 border border-gray-300 rounded"
  />

  <label htmlFor="role_id" className="block mb-2">Role:</label>
  <select
    id="role_id"
    value={editingUser.role_id}
    onChange={(e) => setEditingUser({ ...editingUser, role_id: parseInt(e.target.value, 10) })}
    className="block w-full p-2 mb-3 border border-gray-300 rounded"
  >
    <option value="">Select Role</option>
    <option value="1">Admin</option>
    <option value="2">PT</option>
    <option value="3">Customer</option>
  </select>

  <label htmlFor="status_id" className="block mb-2">Status:</label>
  <select
    id="status_id"
    value={editingUser.status_id}
    onChange={(e) => setEditingUser({ ...editingUser, status_id: parseInt(e.target.value, 10) })}
    className="block w-full p-2 mb-3 border border-gray-300 rounded"
  >
    <option value="">Select Status</option>
    <option value="1">Active</option>
    <option value="2">Inactive</option>
  </select>

  <div className="flex justify-end space-x-2">
    <button onClick={() => handleEditUser(editingUser.user_id)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
      Save Changes
    </button>
    <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500">
      Cancel
    </button>
  </div>
</Modal>


      {/* Pagination Controls */}
      <div className="flex items-center justify-center space-x-4 py-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
        >
          Previous
        </button>
        <span className="text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''
            }`}
        >
          Next
        </button>
      </div>

    </div>
  );

};

export default ManageUsers;
