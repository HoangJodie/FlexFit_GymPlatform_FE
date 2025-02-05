import React, { useState, useEffect } from 'react';
import { Transition } from '@headlessui/react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Classes = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [classes, setClasses] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get('page')) || 1
  );
  const [limit, setLimit] = useState(9); // Số lượng item mỗi trang
  const [totalItems, setTotalItems] = useState(0);
  const navigate = useNavigate();
  const [isSearching, setIsSearching] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchResult, setSearchResult] = useState({
    noResults: false,
    isFirstSearch: true
  });
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const page = parseInt(searchParams.get('page')) || 1;
    setCurrentPage(page);
  }, [searchParams]);

  const handleHover = (index) => {
    setHoveredCard(index);
  };

  const handleSelect = (classId) => {
    navigate(`/classes/${classId}`);
  };

  // Thêm hàm kiểm tra lớp đã kết thúc chưa
  const isClassActive = (endDate) => {
    const currentDate = new Date();
    const classEndDate = new Date(endDate);
    return classEndDate >= currentDate;
  };

  // Thêm hàm kiểm tra ngày bắt đầu lớp học
  const isClassStartingSoon = (startDate) => {
    const currentDate = new Date();
    const classStartDate = new Date(startDate);
    const sevenDaysBefore = new Date();
    sevenDaysBefore.setDate(currentDate.getDate() - 7);
    
    return classStartDate >= sevenDaysBefore && classStartDate <= currentDate;
  };

  useEffect(() => {
    const fetchClassesAndPT = async () => {
      try {
        // Fetch trainers
        const responsePT = await fetch('http://localhost:3000/user');
        const PTData = await responsePT.json();
        const trainers = PTData.filter((user) => user.role_id === 3);

        // Fetch tất cả classes để có thể lọc đúng theo điều kiện thời gian
        const responseAllClasses = await fetch('http://localhost:3000/classes');
        const allClassesData = await responseAllClasses.json();
        
        // Lọc các lớp theo điều kiện active, thời gian và status
        const filteredClasses = allClassesData.filter((classItem) => 
          classItem.status_id === 2 && 
          isClassActive(classItem.end_date) &&
          isClassStartingSoon(classItem.start_date)
        );

        // Thực hiện phân trang trên dữ liệu đã lọc
        const startIndex = (currentPage - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedClasses = filteredClasses.slice(startIndex, endIndex);

        // Fetch user count cho mỗi lớp đã phân trang
        const classesWithCountsPromises = paginatedClasses.map(async (classItem) => {
          const responseCount = await fetch(`http://localhost:3000/user-class/count/${classItem.class_id}`);
          const countData = await responseCount.json();
          
          // Thêm thông tin trainer
          const trainer = trainers.find((pt) => pt.user_id === classItem.pt_id);
          
          return {
            ...classItem,
            userCount: countData.userCount,
            trainerName: trainer ? trainer.name : 'Trainer not assigned',
          };
        });

        const classesWithDetails = await Promise.all(classesWithCountsPromises);

        setClasses(classesWithDetails);
        setTotalPages(Math.ceil(filteredClasses.length / limit));
        setTotalItems(filteredClasses.length);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchClassesAndPT();
  }, [currentPage, limit, searchParams]);

  // Thêm debounce function để tránh gọi API quá nhiều lần
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Sửa lại hàm search classes
  const searchClasses = async (searchTerm) => {
    if (!searchTerm.trim()) {
      return [];
    }

    try {
      // Fetch tất cả classes để có thể lọc chính xác
      const response = await fetch('http://localhost:3000/classes');
      const allClasses = await response.json();
      
      // Lọc theo tên và các điều kiện
      const filteredClasses = allClasses.filter((classItem) => 
        classItem.class_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        classItem.status_id === 2 && 
        isClassActive(classItem.end_date) &&
        isClassStartingSoon(classItem.start_date)
      );

      // Áp dụng phân trang cho kết quả tìm kiếm
      const startIndex = (currentPage - 1) * limit;
      const endIndex = startIndex + limit;
      
      return filteredClasses.slice(startIndex, endIndex);
    } catch (error) {
      console.error('Error searching classes:', error);
      return [];
    }
  };

  // Hàm xử lý tìm kiếm
  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const searchResults = await searchClasses(searchInput);
      
      // Fetch user count for search results
      const responsePT = await fetch('http://localhost:3000/user');
      const PTData = await responsePT.json();
      const trainers = PTData.filter((user) => user.role_id === 3);

      const resultsWithCountsPromises = searchResults.map(async (classItem) => {
        const responseCount = await fetch(`http://localhost:3000/user-class/count/${classItem.class_id}`);
        const countData = await responseCount.json();
        const trainer = trainers.find((pt) => pt.user_id === classItem.pt_id);
        
        return {
          ...classItem,
          userCount: countData.userCount,
          trainerName: trainer ? trainer.name : 'Trainer not assigned',
        };
      });

      const resultsWithCounts = await Promise.all(resultsWithCountsPromises);
      setClasses(resultsWithCounts);
      setSearchTerm(searchInput);
      
      // Cập nhật trạng thái tìm kiếm
      setSearchResult({
        noResults: resultsWithCounts.length === 0,
        isFirstSearch: false
      });
    } catch (error) {
      console.error('Error in search:', error);
      setSearchResult({
        noResults: true,
        isFirstSearch: false
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Xử lý khi nhấn Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Xử lý thay đổi input
  const handleInputChange = (e) => {
    setSearchInput(e.target.value);
    if (e.target.value === '') {
      setSearchTerm('');
      fetchClassesAndPT(); // Fetch lại tất cả classes khi input rỗng
    }
  };

  // Thay thế mảng Subjects hiện tại bằng mảng mới
  const Subjects = [
    "All",
    "Yoga",
    "Pilates", 
    "HIIT",
    "Cardio",
    "Strength Training",
    "Boxing",
    "CrossFit",
    "Stretching"
  ];

  // Sửa lại hàm filteredClasses để lọc chính xác theo subject
  const filteredClasses = classes.filter((item) => {
    return (
      (!selectedType || (item.class_type && item.class_type.toString().includes(selectedType))) &&
      (!selectedSubject || (item.class_subject === selectedSubject))
    );
  });

  // Thêm hàm scrollToTop
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Sửa lại hàm handlePageChange
  const handlePageChange = (page) => {
    scrollToTop();
    setCurrentPage(page);
    setSearchParams({ page: page.toString() });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar với thiết kế mới */}
      <div className="w-1/4 p-6 bg-white shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Filters</h2>

        {/* Search box với icon có thể click */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Search by Name</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search classes..."
              value={searchInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {isSearching ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-secondary"></div>
              ) : (
                <svg 
                  className="h-5 w-5 text-gray-400" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" 
                    clipRule="evenodd" 
                  />
                </svg>
              )}
            </div>
          </div>
        </div>

        {/* Class Type */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Class Type</label>
          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent appearance-none"
            >
              <option value="">All Types</option>
              <option value="1">One-on-One</option>
              <option value="2">Many</option>
            </select>
            {/* Đặt icon bên ngoài select */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Subject buttons với thiết kế mới */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Subjects</label>
          <div className="flex flex-col gap-2">
            {Subjects.map((subject) => (
              <button
                key={subject}
                className={`w-full px-4 py-2 rounded-lg transition-all duration-200 ${
                  selectedSubject === subject 
                    ? 'bg-secondary text-white shadow-lg transform scale-105' 
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedSubject(subject === "All" ? '' : subject)}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content với thiết kế mới */}
      <div className="w-3/4 p-6">
        {/* Thêm mt-20 để tránh bị đè bởi header */}
        <div className="mt-20 mb-10">
          <h1 className="text-4xl font-bold text-center text-gray-800">
            Available Classes
          </h1>
          <p className="text-center text-gray-600 mt-2">
            Discover our wide range of fitness classes
          </p>
        </div>

        {/* Thông báo không tìm thấy kết quả */}
        {searchResult.noResults && !searchResult.isFirstSearch && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="bg-gray-100 rounded-full p-4 mb-4">
              <svg 
                className="w-12 h-12 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Classes Found
            </h3>
            <p className="text-gray-500 text-center max-w-md">
              We couldn't find any classes matching "{searchInput}". 
              Try checking for typos or using different keywords.
            </p>
            <button
              onClick={() => {
                setSearchInput('');
                setSearchTerm('');
                setSearchResult({ noResults: false, isFirstSearch: true });
                window.location.reload();
              }}
              className="mt-4 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
            >
              View All Classes
            </button>
          </div>
        )}

        {/* Grid của các class cards */}
        {(!searchResult.noResults || searchResult.isFirstSearch) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map((item, index) => (
              <div
                key={item.class_id}
                className={`relative group bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${
                  item.availableSeats < 1 ? 'bg-red-50' : ''
                }`}
                onMouseEnter={() => handleHover(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Image container */}
                <div className="relative h-48">
                  <img 
                    src={item.image_url} 
                    className="w-full h-full object-cover"
                    alt={item.class_name}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300">
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <button 
                        onClick={() => handleSelect(item.class_id)}
                        className="px-6 py-2 bg-secondary text-white rounded-lg transform hover:scale-105 transition-transform duration-200"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h2 className="text-xl font-bold text-gray-800 mb-2">{item.class_name}</h2>
                  <p className="text-gray-600 text-sm mb-4">{item.class_description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-700">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Trainer: {item.trainerName}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-700">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{item.fee} VND</span>
                    </div>

                    <div className="flex items-center text-gray-700">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>Slots: {item.userCount || 0}/{item.maxAttender || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {(!searchResult.noResults || searchResult.isFirstSearch) && classes.length > 0 && (
          <div className="mt-10 flex justify-center">
            <div className="inline-flex rounded-md shadow-sm">
              {/* Nút Previous */}
              <button
                onClick={() => {
                  if (currentPage !== 1) {
                    handlePageChange(currentPage - 1);
                  }
                }}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border border-gray-300 rounded-l-md
                  ${currentPage === 1 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                Previous
              </button>

              {/* Hiển thị số trang */}
              {[...Array(totalPages)].map((_, index) => {
                // Chỉ hiển thị 5 nút trang gần trang hiện tại
                if (
                  index + 1 === 1 ||
                  index + 1 === totalPages ||
                  (index + 1 >= currentPage - 2 && index + 1 <= currentPage + 2)
                ) {
                  return (
                    <button
                      key={index}
                      onClick={() => handlePageChange(index + 1)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border border-gray-300
                        ${currentPage === index + 1
                          ? 'z-10 bg-secondary text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    >
                      {index + 1}
                    </button>
                  );
                } else if (
                  index + 1 === currentPage - 3 ||
                  index + 1 === currentPage + 3
                ) {
                  return (
                    <span
                      key={index}
                      className="relative inline-flex items-center px-4 py-2 text-sm font-medium border border-gray-300 bg-white text-gray-700"
                    >
                      ...
                    </span>
                  );
                }
                return null;
              })}

              {/* Nút Next */}
              <button
                onClick={() => {
                  if (currentPage !== totalPages) {
                    handlePageChange(currentPage + 1);
                  }
                }}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border border-gray-300 rounded-r-md
                  ${currentPage === totalPages 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                Next
              </button>
            </div>
            
            {/* Hiển thị thông tin tổng số items */}
            <div className="ml-4 text-sm text-gray-500">
              Showing {classes.length} of {totalItems} classes
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
  
export default Classes;