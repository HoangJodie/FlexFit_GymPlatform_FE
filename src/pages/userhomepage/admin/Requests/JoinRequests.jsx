import React, { useEffect, useState } from 'react';
import axios from 'axios';

const classTypeMapping = {
  1: 'One-on-One',
  2: 'Many',
};

const JoinClassRequests = () => {
  const [userClassList, setUserClassList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const userClassResponse = await axios.get(`http://localhost:3000/user-class/users`);
      const allUsers = userClassResponse.data;
      const joinRequests = allUsers.filter(user => user.status_id === 1);
      
      const requestsWithDetails = await Promise.all(
        joinRequests.map(async (request) => {
          try {
            const classResponse = await axios.get(`http://localhost:3000/classes/info/${request.class_id}`);
            const classData = classResponse.data;
            const ptResponse = await axios.get(`http://localhost:3000/user/${classData.pt_id}`);
            const userCountResponse = await axios.get(`http://localhost:3000/user-class/count/${request.class_id}`);
            const userResponse = await axios.get(`http://localhost:3000/user/${request.user_id}`);
            const userData = userResponse.data;
            
            return {
              ...request,
              name: userData.name,
              classDetails: {
                ...classData,
                ptName: ptResponse.data.name,
                currentMembers: userCountResponse.data.userCount
              }
            };
          } catch (error) {
            console.error(`Error fetching details for class ${request.class_id}:`, error);
            return request;
          }
        })
      );

      const groupedRequests = requestsWithDetails.reduce((acc, request) => {
        if (!request.classDetails) return acc;
        
        const classId = request.class_id;
        if (!acc[classId]) {
          acc[classId] = {
            classDetails: request.classDetails,
            requests: []
          };
        }
        acc[classId].requests.push(request);
        return acc;
      }, {});

      setUserClassList(Object.values(groupedRequests));
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.');
    }
  };

  const updateUserClassStatus = async (userId, classId, statusId) => {
    try {
      const parsedUserId = +parseInt(userId, 10);
      const parsedClassId = +parseInt(classId, 10);

      const response = await axios.patch(
        `http://localhost:3000/user-class/${parsedUserId}/${parsedClassId}`, 
        { 
          statusId: statusId,
          userId: parsedUserId,
          classId: parsedClassId
        }
      );

      if (response.data) {
        fetchData();
      }
    } catch (error) {
      if (error.response?.status === 404) {
        alert('Không tìm thấy thông tin yêu cầu tham gia lớp');
      } else {
        console.error('Lỗi khi cập nhật trạng thái:', error);
        alert('Không thể cập nhật trạng thái. Vui lòng thử lại sau.');
      }
    }
  };

  const indexOfLastEntry = currentPage * itemsPerPage;
  const indexOfFirstEntry = indexOfLastEntry - itemsPerPage;
  const currentEntries = userClassList.slice(indexOfFirstEntry, indexOfLastEntry);
  const pageNumbers = Array.from({ length: Math.ceil(userClassList.length / itemsPerPage) }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <h2 className="text-2xl font-bold mb-6">Yêu Cầu Tham Gia Lớp Học</h2>

      {userClassList.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          Không có yêu cầu tham gia nào
        </div>
      )}

      {currentEntries.map((classGroup) => {
        const { classDetails, requests } = classGroup;
        const formattedFee = classDetails?.fee ? `${parseFloat(classDetails.fee).toLocaleString('vi-VN')}đ` : 'Chưa có phí';
        
        return (
          <div key={classDetails.class_id} className="bg-white rounded-xl shadow-md mb-6 overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center">
                <div className="w-20 h-20 rounded-lg overflow-hidden mr-4">
                  <img 
                    src={classDetails.image_url || '/default-class-image.jpg'}
                    alt={classDetails.class_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-1">{classDetails.class_name}</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <p>Huấn luyện viên: {classDetails.ptName}</p>
                    <p>Loại lớp: {classTypeMapping[classDetails.class_type]}</p>
                    <p>Học phí: {formattedFee}</p>
                    <p>Học viên: {classDetails.currentMembers}/{classDetails.maxAttender}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4">
              <h4 className="text-lg font-semibold mb-3">Danh sách yêu cầu ({requests.length})</h4>
              <div className="space-y-3">
                {requests.map(request => (
                  <div 
                    key={request.user_id}
                    className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div>            
                      <p className="font-medium">{request.name}</p>
                      <p className="text-sm text-gray-600">Username: {request.username}</p>
                      <p className="text-sm text-gray-600">ID: {request.user_id}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateUserClassStatus(request.user_id, request.class_id, 2)}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                      >
                        Chấp nhận
                      </button>
                      <button
                        onClick={() => updateUserClassStatus(request.user_id, request.class_id, 3)}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      >
                        Từ chối
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}

      {userClassList.length > 0 && (
        <div className="flex justify-center mt-6">
          <button 
            onClick={() => setCurrentPage(currentPage - 1)} 
            disabled={currentPage === 1} 
            className="px-4 py-2 mr-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            Trang trước
          </button>
          {pageNumbers.map(number => (
            <button
              key={number}
              onClick={() => setCurrentPage(number)}
              className={`px-4 py-2 mx-1 border rounded-lg ${
                currentPage === number ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
              }`}
            >
              {number}
            </button>
          ))}
          <button 
            onClick={() => setCurrentPage(currentPage + 1)} 
            disabled={currentPage === pageNumbers.length} 
            className="px-4 py-2 ml-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            Trang sau
          </button>
        </div>
      )}
    </div>
  );
};

export default JoinClassRequests;