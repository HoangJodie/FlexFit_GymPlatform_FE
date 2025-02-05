import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import PaymentClassService from '../../services/paymentClass.service';
import { checkScheduleConflict } from '../../services/scheduleService';


const classTypeMapping = {
  1: 'One-on-One',
  2: 'Many',
};

const statusMapping = {
  1: 'Pending',
  2: 'Active',
  3: 'Locked',
};

const ClassDetail = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isMax, setIsMax] = useState(false);
  const [ptName, setPtName] = useState(''); // State for PT name
  const [userCount, setUserCount] = useState(0); // State for user count
  const [userId, setUserId] = useState(null);
  const [joinStatus, setJoinStatus] = useState({
    isJoined: false,
    isLoading: true,
    error: null
  });
  const [hasMembership, setHasMembership] = useState(false);
  const [checkingMembership, setCheckingMembership] = useState(true);
  const [notification, setNotification] = useState({
    show: false,
    type: '', // 'membership', 'schedule', 'membership-expired'
    message: '',
    details: null
  });

  // Hàm reset state
  const resetStates = () => {
    setClassData(null);
    setLoading(true);
    setError(null);
    setIsJoined(false);
    setIsMax(false);
    setPtName('');
    setUserCount(0);
    setUserId(null);
    setJoinStatus({
      isJoined: false,
      isLoading: true,
      error: null
    });
    setHasMembership(false);
    setCheckingMembership(true);
    setNotification({
      show: false,
      type: '',
      message: '',
      details: null
    });
  };

  useEffect(() => {
    console.log('Current classId:', classId);
    if (!classId) {
      console.error('No classId provided');
      return;
    }

    // Reset states và clear cache khi classId thay đổi
    resetStates();

    const fetchClassData = async () => {
      console.log('Starting fetchClassData...');
      try {
        setLoading(true);
        // Fetch class data
        console.log('Fetching class data for ID:', classId);
        const response = await fetch(`http://localhost:3000/classes/info/${classId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch class data. Status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Class data received:', data);

        // Fetch schedule data - Sửa endpoint cho đúng
        try {
          const scheduleResponse = await axios.get(`http://localhost:3000/schedule/class/${classId}`);
        const scheduleData = scheduleResponse.data;
        console.log('Schedule data received:', scheduleData);

        // Combine class data with schedule data
        const combinedData = {
          ...data,
          schedule: {
            days: scheduleData.days,
            start_hour: scheduleData.start_hour,
            end_hour: scheduleData.end_hour
          }
        };

        // Kiểm tra dữ liệu lịch học
        if (!scheduleData.start_hour || !scheduleData.end_hour) {
            console.log('Class has no schedule:', combinedData);
            // Vẫn set class data nhưng không có lịch
            setClassData({
              ...data,
              schedule: null
            });
          } else {
            setClassData(combinedData);
          }
        } catch (scheduleError) {
          console.log('No schedule found for class:', scheduleError);
          // Vẫn set class data khi không có lịch
          setClassData({
            ...data,
            schedule: null
          });
        }

        // Fetch PT name
        console.log('Fetching PT data for ID:', data.pt_id);
        const ptResponse = await axios.get(`http://localhost:3000/user/${data.pt_id}`);
        console.log('PT data received:', ptResponse.data);
        setPtName(ptResponse.data.name);

        // Fetch user count
        console.log('Fetching user count for class:', classId);
        const userCountResponse = await axios.get(`http://localhost:3000/user-class/count/${classId}`);
        console.log('User count data:', userCountResponse.data);
        const currentCount = userCountResponse.data.userCount;
        setUserCount(currentCount);

        setIsMax(currentCount >= data.maxAttender);
        console.log('Is class full:', currentCount >= data.maxAttender);
      } catch (error) {
        console.error('Error in fetchClassData:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    const checkJoinStatus = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          setJoinStatus(prev => ({ ...prev, isLoading: false }));
          return;
        }

        const decodedToken = jwtDecode(accessToken);
        setUserId(decodedToken.user_id);

        // Sử dụng endpoint mới để kiểm tra trạng thái tham gia
        const response = await axios.get(`http://localhost:3000/user-class/status`, {
          params: {
            userId: decodedToken.user_id,
            classId: classId
          }
        });
        
        setJoinStatus({
          isJoined: response.data.isJoined,
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Error checking join status:', error);
        setJoinStatus({
          isJoined: false,
          isLoading: false,
          error: "Failed to check join status"
        });
      }
    };

    const checkMembershipStatus = async () => {
        try {
           // Lấy accessToken từ localStorage để kiểm tra xem người dùng đã đăng nhập hay chưa
            const accessToken = localStorage.getItem('accessToken');
           // Nếu không có accessToken, người dùng không có trạng thái thành viên, kết thúc kiểm tra
            if (!accessToken) {
                setHasMembership(false);
                setCheckingMembership(false);
                return;
            }
            // Gửi yêu cầu kiểm tra trạng thái thành viên tới API
            const response = await axios.get('http://localhost:3000/payment/membership-status', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            // Xử lý dữ liệu trả về từ API
            const membershipData = response.data;
            setHasMembership(membershipData.isActive);
            setCheckingMembership(false);

        } catch (error) {
          // Xử lý lỗi nếu xảy ra khi kiểm tra trạng thái thành viên
            console.error('Error checking membership:', error);
          // Đặt trạng thái thành viên là không hoạt động và kết thúc kiểm tra
            setHasMembership(false);
            setCheckingMembership(false);
        }
    };

    if (classId) {
      fetchClassData();
      checkJoinStatus();
      checkMembershipStatus();
    }

    // Cleanup function
    return () => {
      resetStates();
    };
  }, [classId]); // Dependency array chỉ có classId

  const handleJoinClass = async () => {
    console.log('Starting handleJoinClass...');
    const accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) {
      navigate('/login');
      return;
    }

    try {
      setJoinStatus(prev => ({ ...prev, isLoading: true }));

      // Add to queue and wait for result - Using NestJS backend port
      const queueResponse = await axios.post(
        `http://localhost:3000/classes/${classId}/queue-registration`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      // Check queue result
      if (!queueResponse.data.success) {
        setNotification({
          show: true,
          type: 'error',
          message: queueResponse.data.message || 'Class is full',
          details: null
        });
        return;
      }

      // Continue with condition checks
      const canJoin = await checkClassConditions();
      if (!canJoin) {
        // Cancel queue request
        try {
          await axios.delete(
            `http://localhost:3000/classes/${classId}/queue-registration`,
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`
              }
            }
          );
        } catch (cancelError) {
          console.error('Error canceling registration:', cancelError);
        }
        return;
      }

      // Handle payment
      if (fee > 0) {
        const paymentResult = await handlePayment();
        if (!paymentResult.success) {
          // Cancel queue request if payment fails
          try {
            await axios.delete(
              `http://localhost:3000/classes/${classId}/queue-registration`,
              {
                headers: {
                  'Authorization': `Bearer ${accessToken}`
                }
              }
            );
          } catch (cancelError) {
            console.error('Error canceling registration after payment failure:', cancelError);
          }
          return;
        }
      } else {
        const paymentData = {
          class_id: parseInt(classId),
          amount_paid: 0
        };
        await PaymentClassService.createClassPayment(paymentData);
      }

      // Complete registration from queue
      const registrationResponse = await axios.post(
        `http://localhost:3000/classes/${classId}/complete-registration`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (registrationResponse.data.success) {
        setJoinStatus({
          isJoined: true,
          isLoading: false,
          error: null
        });
        // Show success notification
        setNotification({
          show: true,
          type: 'success',
          message: registrationResponse.data.message || 'Registration successful',
          details: null
        });
      } else {
        throw new Error(registrationResponse.data.message || 'Could not complete registration');
      }

    } catch (error) {
      console.error('Error during registration process:', error);
      
      // Cancel queue request if error occurs
      try {
        await axios.delete(
          `http://localhost:3000/classes/${classId}/queue-registration`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );
      } catch (cancelError) {
        console.error('Error canceling registration:', cancelError);
      }

      setJoinStatus(prev => ({
        ...prev,
        isLoading: false,
        error: error.response?.data?.message || error.message || "Failed to join class"
      }));

      // Show error notification
      setNotification({
        show: true,
        type: 'error',
        message: error.response?.data?.message || error.message || "Failed to join class",
        details: null
      });

      if (error.response?.status === 401) {
        localStorage.removeItem('accessToken');
        navigate('/login');
      }
    }
  };

  const handlePayment = async () => {
    try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            navigate('/login');
            return;
        }

        setJoinStatus(prev => ({ ...prev, isLoading: true }));

        const paymentData = {
            class_id: parseInt(classId),
            amount_paid: parseFloat(fee || 0)
        };

        console.log('Sending payment data:', paymentData);

        const response = await PaymentClassService.createClassPayment(paymentData);
        console.log('Payment response:', response);

        // Kiểm tra response
        if (response?.payment?.order_url) {
            console.log('Redirecting to payment URL:', response.payment.order_url);
            window.location.href = response.payment.order_url;
        } else {
            throw new Error('Payment URL not received');
        }

    } catch (error) {
        console.error('Lỗi thanh toán:', error);
        setJoinStatus(prev => ({
            ...prev,
            isLoading: false,
            error: error.message || 'Payment processing failed'
        }));
    } finally {
        setJoinStatus(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Thêm hàm xử lý riêng cho việc chuyển hướng
  const handleMembershipRedirect = (e) => {
    e.preventDefault(); // Ngăn s kiện click của button
    navigate('/membership');
  };

  // Thêm component MembershipWarning
  const NotificationMessage = () => {
    if (!notification.show) return null;

    let content;
    switch (notification.type) {
      case 'membership':
        content = (
          <>
            <p className="text-yellow-700">{notification.message}</p>
            <button
              onClick={() => navigate('/membership')}
              className="mt-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200"
            >
              Register Membership
              <svg className="ml-2 -mr-0.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        );
        break;

      case 'membership-expired':
        content = (
          <>
            <p className="text-yellow-700">
              Your membership will expire on {new Date(notification.details.membershipEnd).toLocaleDateString('en-US')},
              while the class ends on {new Date(notification.details.classEnd).toLocaleDateString('en-US')}
            </p>
            <p className="mt-1 text-yellow-700">
              You need {notification.details.monthsNeeded} more months of membership to complete this class
            </p>
            <button
              onClick={() => navigate('/membership')}
              className="mt-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200"
            >
              Extend Membership
              <svg className="ml-2 -mr-0.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        );
        break;

      case 'schedule':
        content = (
          <>
            <p className="text-yellow-700">Schedule conflicts with the following classes:</p>
            <ul className="list-disc list-inside mt-1">
              {[...new Set(notification.details.map(cls => cls.class_name))].map((className, index) => (
                <li key={index} className="text-yellow-700">
                  {className}
                </li>
              ))}
            </ul>
          </>
        );
        break;

      default:
        content = <p className="text-yellow-700">{notification.message}</p>;
    }

    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        {content}
      </div>
    );
  };

  // Hàm kiểm tra tất cả điều kiện
  const checkClassConditions = async () => {
    try {
      // Kiểm tra trạng thái tham gia trước
      const response = await axios.get(`http://localhost:3000/user-class/status`, {
        params: {
          userId: userId,
          classId: classId
        }
      });
      
      // Nếu đã tham gia rồi thì không cần kiểm tra các điều kiện khác
      if (response.data.isJoined) {
        return false;
      }

      // 1. Kiểm tra membership
      const membershipResponse = await axios.get('http://localhost:3000/payment/membership-status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      const membershipData = membershipResponse.data;

      // Nếu không có membership
      if (!membershipData.isActive) {
        setNotification({
          show: true,
          type: 'membership',
          message: 'You need to register for Membership to join this class',
          details: null
        });
        setHasMembership(false);
        return false;
      }

      setHasMembership(true);

      // 2. Kiểm tra end_date của membership
      if (membershipData.membershipDetails) {
        const membershipEnd = new Date(membershipData.membershipDetails.end_date);
        const classEnd = new Date(classData.end_date);

        if (membershipEnd < classEnd) {
          const monthsNeeded = calculateMonthsDifference(membershipEnd, classEnd);
          setNotification({
            show: true,
            type: 'membership-expired',
            message: 'Your membership will expire before the class ends',
            details: {
              membershipEnd,
              classEnd,
              monthsNeeded
            }
          });
          return false;
        }
      }

      // 3. Kiểm tra xung đột lịch học
      const scheduleData = {
        user_id: userId,
        class_id: parseInt(classId)
      };

      console.log('Checking schedule conflict with data:', scheduleData);

      const scheduleResult = await checkScheduleConflict(scheduleData);
      console.log('Schedule check result:', scheduleResult);

      if (scheduleResult.hasConflict) {
        setNotification({
          show: true,
          type: 'schedule',
          message: 'This class schedule conflicts with your existing classes',
          details: scheduleResult.conflicts.map(conflict => ({
            class_name: conflict.existing_class.class_name,
            schedule: {
              days: new Date(conflict.existing_class.schedule.days).toLocaleDateString(),
              time: `${new Date(conflict.existing_class.schedule.start_hour).toLocaleTimeString()} - 
                     ${new Date(conflict.existing_class.schedule.end_hour).toLocaleTimeString()}`
            }
          }))
        });
        return false;
      }

      // Nếu không có lớp trùng
      setNotification({
        show: false,
        type: '',
        message: '',
        details: null
      });
      return true;

    } catch (error) {
      console.error('Error checking conditions:', error);
      setNotification({
        show: true,
        type: 'error',
        message: 'An error occurred while checking conditions',
        details: null
      });
      return false;
    }
  };

  // Thêm useEffect để kiểm tra điều kiện khi component mount
  useEffect(() => {
    if (classData && userId) {
      checkClassConditions();
    }
  }, [classData, userId]);

  if (loading) return <p className="text-center">Loading class details...</p>;
  if (error) return <p className="text-red-500 text-center font-semibold">{error}</p>;
  if (!classData) return <p className="text-center">No class found.</p>;

  const { class_name, image_url, class_description, status_id, class_type, start_date, end_date, fee } = classData;
  const classTypeString = classTypeMapping[class_type] || 'Unknown';
  const formattedFee = fee ? `${parseFloat(fee).toFixed(2)} VND` : 'No fee specified';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
        </div>
      ) : error ? (
        <div className="text-center">
          <div className="bg-red-50 p-4 rounded-lg inline-block">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        </div>
      ) : classData ? (
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/classes')}
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
            Back to Classes
          </button>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Hero Section with Image */}
            <div className="relative h-96">
              <img 
                src={image_url} 
                alt={class_name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent">
                <div className="absolute bottom-0 left-0 p-8">
                  <h1 className="text-4xl font-bold text-white mb-2">{class_name}</h1>
                  <div className="flex items-center space-x-4">
                    <span className={`px-4 py-1 rounded-full text-sm font-medium 
                      ${status_id === 1 ? 'bg-yellow-100 text-yellow-800' :
                        status_id === 2 ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'}`}
                    >
                      {statusMapping[status_id]}
                    </span>
                    <span className="text-white">{classTypeString}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Description */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">About this Class</h2>
                    <p className="text-gray-600 leading-relaxed">{class_description}</p>
                  </div>

                  {/* Class Details */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Trainer</h3>
                        <div className="flex items-center">
                          <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <p className="text-gray-800 font-medium">{ptName}</p>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Schedule</h3>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <div>
                              <p className="text-gray-800">Start: {new Date(start_date).toLocaleDateString()}</p>
                              <p className="text-gray-800">End: {new Date(end_date).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Fee</h3>
                        <div className="flex items-center">
                          <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-gray-800 font-medium">{formattedFee}</p>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Availability</h3>
                        <div className="flex items-center">
                          <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <p className="text-gray-800 font-medium">
                            {userCount || 0}/{classData.maxAttender || 0} slots
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
                  <div className="bg-gray-50 rounded-xl p-6 sticky top-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6">Join This Class</h2>
                    <div className="space-y-4">
                      <NotificationMessage />
                      {joinStatus.isLoading ? (
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-secondary"></div>
                        </div>
                      ) : joinStatus.isJoined ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <p className="text-green-700 font-medium">You have registered for this class!</p>
                          </div>
                        </div>
                      ) : isMax ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <p className="text-red-700 font-medium">
                              Class is full ({userCount}/{classData.maxAttender} slots)
                            </p>
                          </div>
                        </div>
                      ) : (
                        <>
                          {fee > 0 ? (
                            <button
                              onClick={!hasMembership ? handleMembershipRedirect : handlePayment}
                              disabled={notification.show}
                              className={`w-full px-6 py-3 ${
                                notification.show 
                                  ? 'bg-gray-400 cursor-not-allowed' 
                                  : 'bg-secondary hover:bg-secondary/90'
                              } text-white font-medium rounded-lg transition-colors flex items-center justify-center`}
                            >
                              {checkingMembership ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Checking membership...
                                </div>
                              ) : !hasMembership ? (
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                                    </svg>
                                    Register Membership First
                                </div>
                              ) : (
                                <>
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                                    </svg>
                                    Pay and Join ({formattedFee})
                                </>
                              )}
                            </button>
                          ) : (
                            <button
                              onClick={!hasMembership ? handleMembershipRedirect : handleJoinClass}
                              disabled={notification.show}
                              className={`w-full px-6 py-3 ${
                                notification.show 
                                  ? 'bg-gray-400 cursor-not-allowed' 
                                  : 'bg-secondary hover:bg-secondary/90'
                              } text-white font-medium rounded-lg transition-colors flex items-center justify-center`}
                            >
                              {checkingMembership ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Checking membership...
                                </div>
                              ) : !hasMembership ? (
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                                    </svg>
                                    Register Membership First
                                </div>
                              ) : (
                                <>
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                                    </svg>
                                    Join Free
                                </>
                              )}
                            </button>
                          )}
                          {joinStatus.error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-2">
                              <p className="text-red-700 text-sm">{joinStatus.error}</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500">No class found.</div>
      )}
    </div>
  );
};

export default ClassDetail;