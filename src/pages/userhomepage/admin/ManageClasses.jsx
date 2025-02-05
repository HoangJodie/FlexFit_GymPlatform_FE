import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { format } from 'date-fns';
import Select from 'react-select';
import ClassCard from '../personalTrainer/ClassCard';
import AttendeesList from './AttendeesList';

Modal.setAppElement('#root');

const classSubjects = [
  "Yoga",
  "Pilates",
  "HIIT",
  "Cardio",
  "Strength Training", 
  "Boxing",
  "CrossFit",
  "Stretching"
];

const ManageClasses = () => {
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [pt, setPT] = useState([]);
  const [newClass, setNewClass] = useState({
    className: '',
    classDescription: '',
    classType: '',
    fee: '',
    startDate: '',
    endDate: '',
    image: null,
    pt_id: '',
    maxAttender: '',
  });
  const [filters, setFilters] = useState({
    status_id: '',
    class_type: '',
    start_date: '',
    end_date: '',
    searchTerm: '',
    pt_id: '',
    class_subject: ''
  });
  const [editingClass, setEditingClass] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
  const [attendees, setAttendees] = useState([]);
  const [isAttendeesModalOpen, setIsAttendeesModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const [selectedClass, setSelectedClass] = useState(null);
  const [activeTab, setActiveTab] = useState('active'); // 'active' hoặc 'ended'
  const [endedFilters, setEndedFilters] = useState({
    searchTerm: '',
    class_type: '',
    pt_id: '',
    class_subject: '',
    start_date: '',
    end_date: ''
  });

  const fetchClasses = async () => {
    try {
      const response = await fetch('http://localhost:3000/classes');
      const data = await response.json();
      
      // Fetch thông tin chi tiết cho mỗi lớp học
      const classesWithDetails = await Promise.all(
        data.map(async (cls) => {
          // Fetch thông tin PT
          let ptName = 'Not assigned';
          if (cls.pt_id) {
            try {
              const ptResponse = await fetch(`http://localhost:3000/user/${cls.pt_id}`);
              const ptData = await ptResponse.json();
              ptName = ptData.name;
            } catch (error) {
              console.error('Error fetching PT info:', error);
            }
          }

          // Fetch thông tin chi tiết của lớp học
          try {
            const classInfoResponse = await fetch(`http://localhost:3000/classes/info/${cls.class_id}`);
            if (!classInfoResponse.ok) {
              throw new Error('Failed to fetch class info');
            }
            const classInfo = await classInfoResponse.json();
            
            // Log để debug
            console.log('Raw class data:', cls);
            console.log('Class info from API:', classInfo);

            // Đảm bảo ưu tiên sử dụng class_subject từ classInfo nếu có
            const class_subject = classInfo.class_subject || cls.class_subject || 'Not specified';
            
            return {
              ...cls,
              ...classInfo,
              pt_name: ptName,
              max_attender: classInfo.max_attender,
              start_date: format(new Date(cls.start_date), 'yyyy-MM-dd'),
              end_date: format(new Date(cls.end_date), 'yyyy-MM-dd'),
              class_subject: class_subject // Sử dụng giá trị đã xử lý
            };
          } catch (error) {
            console.error(`Error fetching info for class ${cls.class_id}:`, error);
            // Vẫn giữ class_subject từ dữ liệu gốc nếu có
            return {
              ...cls,
              pt_name: ptName,
              max_attender: 'N/A',
              start_date: format(new Date(cls.start_date), 'yyyy-MM-dd'),
              end_date: format(new Date(cls.end_date), 'yyyy-MM-dd'),
              class_subject: cls.class_subject || 'Not specified'
            };
          }
        })
      );

      console.log('Final classes data:', classesWithDetails);
      setClasses(classesWithDetails);
      setFilteredClasses(classesWithDetails);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  //fetch pt for pt list
  const fetchPts = async () => {
    try {
      const response = await fetch('http://localhost:3000/user');
      const data = await response.json();
  
      // Filter users with role_id = 3
      const filteredData = data.filter(user => user.role_id === 3);
  
      setPT(filteredData);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Handle search PT
  const ptOptions = pt.map(pt => ({
    value: pt.user_id,
    label: `${pt.name} (ID: ${pt.user_id})`
  }));

  useEffect(() => {
    fetchClasses();
    fetchPts();
  }, []);

  // Fetch attendees for a specific class
  const fetchAttendees = async (classId) => {
    try {
      const response = await fetch(`http://localhost:3000/user-class/users/${classId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      // Lọc bỏ PT dạy lớp này khỏi danh sách users
      if (data && data.users) {
        const teachingPtId = data.pt?.user_id;
        const filteredUsers = data.users.filter(user => user.user_id !== teachingPtId);
        setAttendees(filteredUsers);
      }
      setSelectedClassId(classId);
      setIsAttendeesModalOpen(true);
    } catch (error) {
      console.error('Error fetching attendees:', error);
    }
  };

  // Open attendees modal with specific class attendees
  const handleOpenAttendeesModal = async (classId) => {
    try {
      const response = await fetch(`http://localhost:3000/user-class/users/${classId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Lọc bỏ PT dạy lớp này khỏi danh sách users
      if (data && data.users) {
        const teachingPtId = data.pt?.user_id;
        const filteredUsers = data.users.filter(user => user.user_id !== teachingPtId);
        setAttendees(filteredUsers);
      }
      setSelectedClassId(classId);
      const classInfo = classes.find(cls => cls.class_id === classId);
      setSelectedClass(classInfo);
      setIsAttendeesModalOpen(true);
    } catch (error) {
      console.error('Error fetching attendees:', error);
    }
  };

  // Close attendees modal
  const closeAttendeesModal = () => {
    setAttendees([]);
    setIsAttendeesModalOpen(false);
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentClasses = filteredClasses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredClasses.length / itemsPerPage);

  const handleAddClass = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    const { className, classDescription, classType, fee, startDate, endDate, image, pt_id, maxAttender, class_subject } = newClass;

    if (!image) {
      alert('Vui lòng chọn hình ảnh cho lớp học');
      return;
    }

    if (!pt_id) {
      alert('Vui lòng chọn PT cho lớp học');
      return;
    }

    // Kiểm tra và set maxAttender dựa trên classType
    let finalMaxAttender = maxAttender;
    if (classType === '1') {
      finalMaxAttender = '1';
    }

    try {
      // Log để kiểm tra dữ liệu trước khi gửi
      console.log('Sending data:', {
        className,
        classDescription,
        classType,
        fee,
        startDate,
        endDate,
        pt_id, // Lúc này pt_id đã là string
        maxAttender: finalMaxAttender,
        class_subject
      });

      formData.append('className', className);
      formData.append('classDescription', classDescription);
      formData.append('classType', classType);
      formData.append('fee', fee);
      formData.append('startDate', startDate);
      formData.append('endDate', endDate);
      formData.append('file', image);
      formData.append('pt_id', pt_id); // Gửi trực tiếp vì đã là string
      formData.append('maxAttender', finalMaxAttender);
      formData.append('classSubject', class_subject || '');

      // Log formData để kiểm tra
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      const response = await fetch('http://localhost:3000/classes', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add class');
      }

      const result = await response.json();
      console.log('Add class result:', result);

      await fetchClasses();
      setNewClass({
        className: '',
        classDescription: '',
        classType: '',
        fee: '',
        startDate: '',
        endDate: '',
        image: null,
        pt_id: '', // Reset về string rỗng
        maxAttender: '',
        class_subject: ''
      });
      setIsAddClassModalOpen(false);

    } catch (error) {
      console.error('Error adding class:', error);
      alert(error.message || 'Failed to add class. Please try again.');
    }
  };

  const handleEditClass = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    
    // Kiểm tra và xử lý các giá trị trước khi thêm vào formData
    formData.append('className', editingClass.className || '');
    formData.append('classDescription', editingClass.classDescription || '');
    formData.append('statusId', editingClass.statusId ? editingClass.statusId.toString() : '');
    formData.append('classType', editingClass.classType ? editingClass.classType.toString() : '');
    formData.append('fee', editingClass.fee ? editingClass.fee.toString() : '');
    formData.append('startDate', editingClass.startDate || '');
    formData.append('endDate', editingClass.endDate || '');
    formData.append('oldImageId', editingClass.oldImageId || '');
    formData.append('pt_id', editingClass.pt_id ? editingClass.pt_id.toString() : '');
    formData.append('maxAttender', editingClass.maxAttender ? editingClass.maxAttender.toString() : '');
    formData.append('class_subject', editingClass.class_subject || '');

    // Debug log
    console.log('Editing class data:', editingClass);

    // Thêm file nếu có
    if (editingClass.image) {
      formData.append('file', editingClass.image);
    }

    try {
      // Debug log
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      const response = await fetch(`http://localhost:3000/classes/${editingClass.classId}`, {
        method: 'PATCH',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update class');
      }

      // Refresh danh sách lớp học sau khi cập nhật thành công
      await fetchClasses();
      setIsModalOpen(false);
      setEditingClass(null);
    } catch (error) {
      console.error('Error updating class:', error);
      alert(error.message);
    }
  };

  // Cập nhật hàm openEditModal để set đầy đủ các trường
  const openEditModal = (cls) => {
    console.log('Opening edit modal with class data:', cls); // Debug log
    
    // Đảm bảo max_attender là string và có giá trị
    const maxAttender = cls.max_attender ? cls.max_attender.toString() : 
                       cls.maxAttender ? cls.maxAttender.toString() : '';
    
    // Đảm bảo pt_id là string và có giá trị
    const ptId = cls.pt_id ? cls.pt_id.toString() : '';
    
    setEditingClass({
      ...cls,
      className: cls.class_name || '',
      classDescription: cls.class_description || '',
      statusId: cls.status_id ? cls.status_id.toString() : '',
      classType: cls.class_type ? cls.class_type.toString() : '',
      fee: cls.fee ? cls.fee.toString() : '',
      startDate: cls.start_date || '',
      endDate: cls.end_date || '',
      oldImageId: cls.image_id || '',
      classId: cls.class_id ? cls.class_id.toString() : '',
      pt_id: ptId,
      maxAttender: maxAttender, // Sử dụng giá trị đã xử lý
      class_subject: cls.class_subject || '',
      image: null
    });

    // Debug log để kiểm tra giá trị
    console.log('Max Attender value:', maxAttender);
    console.log('Class data being set:', cls);
    
    setIsModalOpen(true);
  };

  const closeEditModal = () => {
    setIsModalOpen(false);
    setEditingClass(null);
  };

  const openAddClassModal = () => {
    setIsAddClassModalOpen(true);
  };

  const closeAddClassModal = () => {
    setIsAddClassModalOpen(false);
  };

  const handleDeleteClass = async (classId) => {
    try {
      const response = await fetch(`http://localhost:3000/classes/${classId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchClasses();
      } else {
        const errorData = await response.json();
        console.error('Error deleting class:', errorData);
      }
    } catch (error) {
      console.error('Error deleting class:', error);
    }
  };

  // Search and Filter Class
  const handleSearchAndFilter = () => {
    console.log('Filtering classes:', classes); // Debug log
    const filtered = classes.filter((cls) => {
      const currentDate = new Date();
      const isActive = new Date(cls.end_date) >= currentDate;
      
      // Chỉ lọc các lớp đang hoạt động khi ở tab Active
      if (activeTab === 'active' && !isActive) {
        return false;
      }

      const matchesStatus =
        filters.status_id === '' || cls.status_id === parseInt(filters.status_id);
      
      const matchesClassType =
        filters.class_type === '' || cls.class_type === parseInt(filters.class_type);
      
      const matchesStartDate =
        filters.start_date === '' || new Date(cls.start_date) >= new Date(filters.start_date);
      
      const matchesEndDate =
        filters.end_date === '' || new Date(cls.end_date) <= new Date(filters.end_date);
      
      const matchesSearchTerm =
        filters.searchTerm === '' || 
        cls.class_name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        cls.class_subject?.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      const matchesPT =
        filters.pt_id === '' || cls.pt_id === parseInt(filters.pt_id);
      
      const matchesSubject =
        filters.class_subject === '' || 
        cls.class_subject === filters.class_subject;

      return (
        matchesStatus && 
        matchesClassType && 
        matchesStartDate && 
        matchesEndDate && 
        matchesSearchTerm && 
        matchesPT && 
        matchesSubject
      );
    });

    console.log('Filtered classes:', filtered); // Debug log
    setFilteredClasses(filtered);
    setCurrentPage(1);
  };

  // Thêm hàm xử lý khi click vào card
  const handleCardClick = async (classItem) => {
    setEditingClass({
      ...classItem,
      className: classItem.class_name,
      classDescription: classItem.class_description,
      statusId: classItem.status_id,
      classType: classItem.class_type.toString(),
      fee: classItem.fee.toString(),
      startDate: classItem.start_date,
      endDate: classItem.end_date,
      oldImageId: classItem.image_id,
      classId: classItem.class_id.toString(),
      pt_id: classItem.pt_id,
      maxAttender: classItem.max_attender,
      class_subject: classItem.class_subject || '',
    });
    setIsModalOpen(true);
  };

  // Thêm xử lý cho việc thay đổi class type trong form thêm mới
  const handleClassTypeChange = (e) => {
    const type = e.target.value;
    setNewClass(prev => ({
      ...prev,
      classType: type,
      maxAttender: type === '1' ? '1' : prev.maxAttender // Tự động set maxAttender = 1 cho lớp One-on-One
    }));
  };

  // Sửa lại hàm handlePTSelection để chuyển user_id thành string ngay khi chọn
  const handlePTSelection = (selectedOption) => {
    console.log('Selected PT:', selectedOption);
    // Chuyển đổi value thành string ngay khi được chọn
    const ptId = selectedOption ? selectedOption.value.toString() : '';
    console.log('PT ID being set:', ptId);
    setNewClass(prev => ({
      ...prev,
      pt_id: ptId // Lưu dưới dạng string
    }));
  };

  // Thêm hàm để lọc classes theo trạng thái
  const filterClassesByStatus = (classes) => {
    const currentDate = new Date();
    return {
      active: classes.filter(cls => new Date(cls.end_date) >= currentDate),
      ended: classes.filter(cls => new Date(cls.end_date) < currentDate)
    };
  };

  // Thêm hàm xử lý filter cho ended classes
  const handleEndedSearchAndFilter = () => {
    setFilteredClasses(
      classes.filter((cls) => {
        const isEnded = new Date(cls.end_date) < new Date();
        if (!isEnded) return false;

        const matchesClassType =
          endedFilters.class_type === '' || cls.class_type === parseInt(endedFilters.class_type);
        
        const matchesStartDate =
          endedFilters.start_date === '' || new Date(cls.start_date) >= new Date(endedFilters.start_date);
        
        const matchesEndDate =
          endedFilters.end_date === '' || new Date(cls.end_date) <= new Date(endedFilters.end_date);
        
        const matchesSearchTerm =
          endedFilters.searchTerm === '' || 
          cls.class_name.toLowerCase().includes(endedFilters.searchTerm.toLowerCase()) ||
          cls.class_subject?.toLowerCase().includes(endedFilters.searchTerm.toLowerCase());
        
        const matchesPT =
          endedFilters.pt_id === '' || cls.pt_id === parseInt(endedFilters.pt_id);
        
        const matchesSubject =
          endedFilters.class_subject === '' || 
          cls.class_subject === endedFilters.class_subject;

        return (
          matchesClassType && 
          matchesStartDate && 
          matchesEndDate && 
          matchesSearchTerm && 
          matchesPT && 
          matchesSubject
        );
      })
    );
    setCurrentPage(1);
  };

  // Thêm useEffect để cập nhật filteredClasses khi chuyển tab
  useEffect(() => {
    const currentDate = new Date();
    const filtered = classes.filter(cls => {
      const isEnded = new Date(cls.end_date) < currentDate;
      return activeTab === 'ended' ? isEnded : !isEnded;
    });
    setFilteredClasses(filtered);
  }, [activeTab, classes]);

  const renderClasses = () => {
    console.log('Current classes:', currentClasses); // Debug log
    return currentClasses.map((classItem) => (
      <ClassCard
        key={classItem.class_id}
        classItem={classItem}
        onCardClick={handleCardClick}
        actions={
          <div className="flex space-x-2 mt-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenAttendeesModal(classItem.class_id);
              }}
              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
            >
              Attendees
            </button>
          </div>
        }
        isAdmin={true}
        isEnded={activeTab === 'ended'}
      />
    ));
  };

  // Thêm hàm để cập nhật attendees
  const updateAttendees = (newAttendees) => {
    setAttendees(newAttendees);
  };

  // Thêm useEffect để log giá trị của editingClass khi nó thay đổi
  useEffect(() => {
    if (editingClass) {
      console.log('Current editingClass:', editingClass);
      console.log('PT ID:', editingClass.pt_id);
      console.log('Max Attender:', editingClass.maxAttender);
    }
  }, [editingClass]);

  return (
    <div className="h-full p-6 bg-gray-50">
      <h2 className="text-2xl font-bold mb-4">Manage Classes</h2>
      <p className="text-gray-600 mb-6">Here you can add, edit, or delete classes from the system.</p>
      
      {/* Tab Navigation */}
      <div className="flex mb-6 border-b">
        <button
          className={`py-2 px-4 mr-2 ${
            activeTab === 'active'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('active')}
        >
          Active Classes
        </button>
        <button
          className={`py-2 px-4 ${
            activeTab === 'ended'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('ended')}
        >
          Ended Classes
        </button>
      </div>

      {/* Search Filters for Active Classes */}
      {activeTab === 'active' && (
        <div className="p-4 bg-white rounded shadow-md">
          <h3 className="text-lg font-semibold mb-4">Search and Filter Classes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Term */}
            <input
              type="text"
              placeholder="Search by class name or subject"
              value={filters.searchTerm}
              onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
              className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Status Filter */}
            <select
              value={filters.status_id}
              onChange={(e) => setFilters({ ...filters, status_id: e.target.value })}
              className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Status</option>
              <option value="1">Pending</option>
              <option value="2">Active</option>
              <option value="3">Locked</option>
            </select>

            {/* Class Type Filter */}
            <select
              value={filters.class_type}
              onChange={(e) => setFilters({ ...filters, class_type: e.target.value })}
              className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Class Type</option>
              <option value="1">One-on-One</option>
              <option value="2">Many</option>
            </select>

            {/* PT Filter */}
            <Select
              options={ptOptions}
              value={ptOptions.find(option => option.value === filters.pt_id)}
              onChange={(selectedOption) => 
                setFilters({ ...filters, pt_id: selectedOption ? selectedOption.value : '' })
              }
              placeholder="Select PT"
              isClearable
              className="w-full"
            />

            {/* Subject Filter - Thay đổi từ input thành select */}
            <select
              value={filters.class_subject}
              onChange={(e) => setFilters({ ...filters, class_subject: e.target.value })}
              className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Subject</option>
              {classSubjects.map((subject, index) => (
                <option key={index} value={subject}>
                  {subject}
                </option>
              ))}
            </select>

            {/* Date Filters */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="date"
                placeholder="Start Date"
                value={filters.start_date}
                onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                placeholder="End Date"
                value={filters.end_date}
                onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearchAndFilter}
              className="md:col-span-2 bg-blue-500 text-white rounded p-2 hover:bg-blue-600 transition duration-200"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Search Filters for Ended Classes */}
      {activeTab === 'ended' && (
        <div className="p-4 bg-white rounded shadow-md">
          <h3 className="text-lg font-semibold mb-4">Search and Filter Ended Classes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Term */}
            <input
              type="text"
              placeholder="Search by class name or subject"
              value={endedFilters.searchTerm}
              onChange={(e) => setEndedFilters({ ...endedFilters, searchTerm: e.target.value })}
              className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Class Type Filter */}
            <select
              value={endedFilters.class_type}
              onChange={(e) => setEndedFilters({ ...endedFilters, class_type: e.target.value })}
              className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Class Type</option>
              <option value="1">One-on-One</option>
              <option value="2">Many</option>
            </select>

            {/* PT Filter */}
            <Select
              options={ptOptions}
              value={ptOptions.find(option => option.value === endedFilters.pt_id)}
              onChange={(selectedOption) => 
                setEndedFilters({ ...endedFilters, pt_id: selectedOption ? selectedOption.value : '' })
              }
              placeholder="Select PT"
              isClearable
              className="w-full"
            />

            {/* Subject Filter */}
            <select
              value={endedFilters.class_subject}
              onChange={(e) => setEndedFilters({ ...endedFilters, class_subject: e.target.value })}
              className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Subject</option>
              {classSubjects.map((subject, index) => (
                <option key={index} value={subject}>
                  {subject}
                </option>
              ))}
            </select>

            {/* Date Filters */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="date"
                placeholder="Start Date"
                value={endedFilters.start_date}
                onChange={(e) => setEndedFilters({ ...endedFilters, start_date: e.target.value })}
                className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                placeholder="End Date"
                value={endedFilters.end_date}
                onChange={(e) => setEndedFilters({ ...endedFilters, end_date: e.target.value })}
                className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Search Button */}
            <button
              onClick={handleEndedSearchAndFilter}
              className="md:col-span-2 bg-blue-500 text-white rounded p-2 hover:bg-blue-600 transition duration-200"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Add Class Modal */}
      <Modal
        isOpen={isAddClassModalOpen}
        onRequestClose={closeAddClassModal}
        className="mt-20 bg-white rounded shadow-lg p-6 w-[90%] max-w-6xl mx-auto"
      >
        <h2 className="text-2xl font-semibold mb-6">Add New Class</h2>
        <form onSubmit={handleAddClass} className="space-y-6">
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class Name
              </label>
              <input
                className="border border-gray-300 p-2 rounded w-full"
                type="text"
                placeholder="Enter class name"
                value={newClass.className}
                onChange={(e) => setNewClass({ ...newClass, className: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class Type
              </label>
              <select
                className="border border-gray-300 p-2 rounded w-full"
                value={newClass.classType}
                onChange={handleClassTypeChange}
                required
              >
                <option value="">Select Type</option>
                <option value="1">One-on-One</option>
                <option value="2">Many</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class Subject
              </label>
              <select
                className="border border-gray-300 p-2 rounded w-full"
                value={newClass.class_subject}
                onChange={(e) => setNewClass({ ...newClass, class_subject: e.target.value })}
                required
              >
                <option value="">Select Subject</option>
                {classSubjects.map((subject, index) => (
                  <option key={index} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fee (VND)
              </label>
              <input
                className="border border-gray-300 p-2 rounded w-full"
                type="number"
                placeholder="Enter fee"
                value={newClass.fee}
                onChange={(e) => setNewClass({ ...newClass, fee: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                className="border border-gray-300 p-2 rounded w-full"
                type="date"
                value={newClass.startDate}
                onChange={(e) => setNewClass({ ...newClass, startDate: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                className="border border-gray-300 p-2 rounded w-full"
                type="date"
                value={newClass.endDate}
                onChange={(e) => setNewClass({ ...newClass, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Personal Trainer
              </label>
              <Select
                options={ptOptions}
                value={ptOptions.find(option => option.value.toString() === newClass.pt_id)}
                onChange={handlePTSelection}
                placeholder="Select PT"
                className="w-full"
                isSearchable
                isClearable
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Attendees
              </label>
              <input
                className="border border-gray-300 p-2 rounded w-full"
                type="number"
                placeholder="Enter max attendees"
                value={newClass.maxAttender}
                onChange={(e) => setNewClass({ ...newClass, maxAttender: e.target.value })}
                required
                min="1"
                disabled={newClass.classType === '1'}
              />
            </div>
          </div>

          {/* Row 4 - Description and Image */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class Description
              </label>
              <textarea
                className="border border-gray-300 p-2 rounded w-full"
                placeholder="Enter class description"
                value={newClass.classDescription}
                onChange={(e) => setNewClass({ ...newClass, classDescription: e.target.value })}
                required
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class Image
              </label>
              <input
                className="border border-gray-300 p-2 rounded w-full"
                type="file"
                accept="image/*"
                onChange={(e) => setNewClass({ ...newClass, image: e.target.files[0] })}
                required
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="submit"
              className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
            >
              Add Class
            </button>
            <button
              type="button"
              className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
              onClick={closeAddClassModal}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Class Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onRequestClose={closeEditModal} 
        className="mt-20 bg-white rounded shadow-lg p-6 w-[90%] max-w-6xl mx-auto"
      >
        <h2 className="text-2xl font-semibold mb-6">Edit Class</h2>
        <form onSubmit={handleEditClass} className="space-y-6">
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class Name
              </label>
              <input
                className="border border-gray-300 p-2 rounded w-full"
                type="text"
                placeholder="Enter class name"
                value={editingClass?.className || ''}
                onChange={(e) => setEditingClass({ ...editingClass, className: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                className="border border-gray-300 p-2 rounded w-full"
                value={editingClass?.statusId || ''}
                onChange={(e) => setEditingClass({ ...editingClass, statusId: e.target.value })}
                required
              >
                <option value="1">Pending</option>
                <option value="2">Active</option>
                <option value="3">Locked</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class Type
              </label>
              <select
                className="border border-gray-300 p-2 rounded w-full"
                value={editingClass?.classType || ''}
                onChange={(e) => setEditingClass({ ...editingClass, classType: e.target.value })}
                required
              >
                <option value="1">One-on-One</option>
                <option value="2">Many</option>
              </select>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fee (VND)
              </label>
              <input
                className="border border-gray-300 p-2 rounded w-full"
                type="number"
                placeholder="Enter fee"
                value={editingClass?.fee || ''}
                onChange={(e) => setEditingClass({ ...editingClass, fee: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                className="border border-gray-300 p-2 rounded w-full"
                type="date"
                value={editingClass?.startDate || ''}
                onChange={(e) => setEditingClass({ ...editingClass, startDate: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                className="border border-gray-300 p-2 rounded w-full"
                type="date"
                value={editingClass?.endDate || ''}
                onChange={(e) => setEditingClass({ ...editingClass, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Personal Trainer
              </label>
              <Select
                options={ptOptions}
                value={ptOptions.find(option => option.value === parseInt(editingClass?.pt_id))}
                onChange={(selectedOption) => 
                  setEditingClass({ 
                    ...editingClass, 
                    pt_id: selectedOption ? selectedOption.value.toString() : '' 
                  })
                }
                placeholder="Select PT"
                className="w-full"
                isSearchable
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Attendees
              </label>
              <input
                className="border border-gray-300 p-2 rounded w-full"
                type="number"
                placeholder="Enter max attendees"
                value={editingClass?.maxAttender || ''}
                onChange={(e) => setEditingClass({ 
                  ...editingClass, 
                  maxAttender: e.target.value 
                })}
                required
                min="1"
                disabled={editingClass?.classType === '1'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class Subject
              </label>
              <select
                className="border border-gray-300 p-2 rounded w-full"
                value={editingClass?.class_subject || ''}
                onChange={(e) => setEditingClass({ ...editingClass, class_subject: e.target.value })}
                required
              >
                <option value="">Select Subject</option>
                {classSubjects.map((subject, index) => (
                  <option key={index} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 4 - Description and Image */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class Description
              </label>
              <textarea
                className="border border-gray-300 p-2 rounded w-full"
                placeholder="Enter class description"
                value={editingClass?.classDescription || ''}
                onChange={(e) => setEditingClass({ ...editingClass, classDescription: e.target.value })}
                required
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class Image
              </label>
              <input
                className="border border-gray-300 p-2 rounded w-full"
                type="file"
                accept="image/*"
                onChange={(e) => setEditingClass({ ...editingClass, image: e.target.files[0] })}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-2 mt-6">
            <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
              Update Class
            </button>
            <button
              type="button"
              className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
              onClick={closeEditModal}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Attendees Modal */}
      <AttendeesList 
        isOpen={isAttendeesModalOpen}
        onClose={closeAttendeesModal}
        attendees={attendees}
        setAttendees={updateAttendees}
        selectedClassId={selectedClassId}
        selectedClass={selectedClass}
        onRefresh={() => fetchAttendees(selectedClassId)}
      />

      {/* Classes List */}
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {activeTab === 'active' ? 'Active Classes' : 'Ended Classes'}
          </h2>
          {activeTab === 'active' && (
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              onClick={openAddClassModal}
            >
              Add New Class
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderClasses()}
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center mt-8">
          {Array.from({ length: Math.ceil(filteredClasses.length / itemsPerPage) }, (_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              className={`mx-1 px-4 py-2 border rounded-lg 
                ${currentPage === index + 1 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
                transition duration-300 ease-in-out`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageClasses;
