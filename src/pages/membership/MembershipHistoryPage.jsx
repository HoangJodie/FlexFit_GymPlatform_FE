import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PaymentService from '../../services/payment.service';
import axios from 'axios';

const MembershipHistoryPage = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortOrder, setSortOrder] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; // Số item trên mỗi trang
    const navigate = useNavigate();
    const [selectedBill, setSelectedBill] = useState(null);
    const [loadingBill, setLoadingBill] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                navigate('/auth/login');
                return;
            }
        };
        checkAuth();
    }, [navigate]);

    // Thêm interceptor để xử lý refresh token
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                
                if (error.response.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    
                    try {
                        // Gọi API refresh token
                        const response = await axios.post('http://localhost:3000/auth/refresh-token', {}, 
                            { withCredentials: true }
                        );
                        
                        if (response.data.accessToken) {
                            localStorage.setItem('accessToken', response.data.accessToken);
                            axios.defaults.headers.common['Authorization'] = 'Bearer ' + response.data.accessToken;
                            originalRequest.headers['Authorization'] = 'Bearer ' + response.data.accessToken;
                            
                            // Thực hiện lại request ban đầu
                            return axios(originalRequest);
                        }
                    } catch (refreshError) {
                        console.error('Error refreshing token:', refreshError);
                        localStorage.removeItem('accessToken');
                        navigate('/auth/login');
                        return Promise.reject(refreshError);
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, [navigate]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await PaymentService.getMembershipHistory();
                console.log('Raw data from API:', data);
                setHistory(data);
            } catch (error) {
                setError(error.message);
                if (error.response?.status === 401) {
                    navigate('/auth/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [navigate]);

    const handleSort = () => {
        const sortedHistory = [...history].sort((a, b) => {
            const dateA = new Date(a.transaction_date);
            const dateB = new Date(b.transaction_date);
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });
        setHistory(sortedHistory);
        setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    };

    // Tính toán các items cho trang hiện tại
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = history.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(history.length / itemsPerPage);

    // Component phân trang
    const Pagination = () => {
        return (
            <div className="flex justify-center items-center space-x-2 mt-6">
                <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-md ${
                        currentPage === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                    } dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700`}
                >
                    Previous
                </button>

                {[...Array(totalPages)].map((_, index) => (
                    <button
                        key={index + 1}
                        onClick={() => setCurrentPage(index + 1)}
                        className={`px-3 py-1 rounded-md ${
                            currentPage === index + 1
                                ? 'bg-primary text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                    >
                        {index + 1}
                    </button>
                ))}

                <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-md ${
                        currentPage === totalPages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                    } dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700`}
                >
                    Next
                </button>
            </div>
        );
    };

    const BillDetailModal = ({ billDetail, onClose }) => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bill Detail</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Bill Information */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Bill Information</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-500 dark:text-gray-400">Order ID</p>
                                <p className="font-medium text-gray-900 dark:text-white">{billDetail.bill_info.order_id}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 dark:text-gray-400">Transaction Date</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {formatDateTime(billDetail.bill_info.transaction_date)}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500 dark:text-gray-400">Payment Method</p>
                                <p className="font-medium text-gray-900 dark:text-white capitalize">
                                    {billDetail.bill_info.payment_method}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Membership Details */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Membership Details</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                                        {billDetail.membership_info.name}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {billDetail.membership_info.quantity} x {new Intl.NumberFormat('vi-VN', { 
                                            style: 'currency', 
                                            currency: 'VND' 
                                        }).format(billDetail.membership_info.unit_price)}
                                    </p>
                                </div>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                    {new Intl.NumberFormat('vi-VN', { 
                                        style: 'currency', 
                                        currency: 'VND' 
                                    }).format(billDetail.membership_info.total_price)}
                                </p>
                            </div>

                            <div className="border-t pt-4 mt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400">Duration</p>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {billDetail.membership_info.duration.months} months
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400">Valid Period</p>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {formatDateTime(billDetail.membership_info.duration.start_date).split(',')[0]} - {formatDateTime(billDetail.membership_info.duration.end_date).split(',')[0]}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Status */}
                    <div className={`rounded-lg p-4 ${
                        billDetail.payment_status.status_id === 1 
                            ? 'bg-green-50 dark:bg-green-900/20' 
                            : 'bg-yellow-50 dark:bg-yellow-900/20'
                    }`}>
                        <div className="flex justify-between items-center">
                            <p className="text-gray-700 dark:text-gray-300">Payment Status</p>
                            <p className={`font-medium ${
                                billDetail.payment_status.status_id === 1
                                    ? 'text-green-700 dark:text-green-300'
                                    : 'text-yellow-700 dark:text-yellow-300'
                            }`}>
                                {translateStatus(billDetail.payment_status.status_text)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const handleViewBill = async (membershipId) => {
        setLoadingBill(true);
        try {
            const billDetail = await PaymentService.getBillDetail(membershipId);
            setSelectedBill(billDetail);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoadingBill(false);
        }
    };

    // Thêm hàm helper để chuyển đổi status
    const translateStatus = (status) => {
        const statusMap = {
            'Đang hoạt động': 'Active',
            'Đã hết hạn': 'Expired',
            'Chờ kích hoạt': 'Pending Activation',
            'Đã thanh toán': 'Paid',
            'Chờ thanh toán': 'Pending Payment'
        };
        return statusMap[status] || status;
    };

    // Hàm format date
    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        // Giữ nguyên UTC time
        return date.toLocaleString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            timeZone: 'UTC' // Sử dụng UTC thay vì Asia/Ho_Chi_Minh
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-20 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Membership History
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400">
                                View and manage your membership transactions
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg px-4 py-2">
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    Total Entries: {history.length}
                                </span>
                            </div>
                            <button
                                onClick={handleSort}
                                className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary dark:bg-primary/20 rounded-lg hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors"
                            >
                                <span>Sort by Date</span>
                                {sortOrder === 'desc' ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        <p className="mt-4 text-gray-500 dark:text-gray-400">Loading history...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-xl">
                        <div className="flex items-center gap-3">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {error}
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="space-y-6">
                            {currentItems.map((item) => (
                                <div
                                    key={item.membership_id}
                                    onClick={() => handleViewBill(item.membership_id)}
                                    className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ${
                                        item.isActive
                                            ? 'border-l-4 border-green-500'
                                            : item.status_id === 4
                                            ? 'border-l-4 border-yellow-500'
                                            : 'border-l-4 border-gray-200 dark:border-gray-700'
                                    }`}
                                >
                                    <div className="p-6">
                                        {/* Header */}
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                                    {item.membership_name}
                                                    {item.isActive && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                            Active
                                                        </span>
                                                    )}
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    Order ID: {item.order_id}
                                                </p>
                                            </div>
                                            <span
                                                className={`px-4 py-2 rounded-full text-sm font-medium ${
                                                    item.isActive
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                        : item.status_id === 4
                                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                }`}
                                            >
                                                {translateStatus(item.status)}
                                            </span>
                                        </div>

                                        {/* Content Grid */}
                                        <div className="grid md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                            Transaction Date
                                                        </p>
                                                        <p className="text-gray-900 dark:text-white">
                                                            {(() => {
                                                                console.log('Rendering date for item:', item.transaction_date);
                                                                return formatDateTime(item.transaction_date);
                                                            })()}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                            Valid Period
                                                        </p>
                                                        <p className="text-gray-900 dark:text-white">
                                                            {new Date(item.start_date).toLocaleDateString()} - {new Date(item.end_date).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                                    </svg>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                            Payment Details
                                                        </p>
                                                        <p className="text-gray-900 dark:text-white">
                                                            {new Intl.NumberFormat('vi-VN', { 
                                                                style: 'currency', 
                                                                currency: 'VND' 
                                                            }).format(item.price)} via {item.payment_method}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                    </svg>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                            Package Details
                                                        </p>
                                                        <p className="text-gray-900 dark:text-white">
                                                            {item.quantity} {item.quantity > 1 ? 'packages' : 'package'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Active Status Banner */}
                                        {item.isActive && (
                                            <div className="mt-6 bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                                                <div className="flex items-center gap-3">
                                                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <p className="text-green-700 dark:text-green-300 font-medium">
                                                        {item.daysRemaining} days remaining
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* View Details Hint */}
                                        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Click to view detailed bill
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Enhanced Pagination */}
                        {history.length > itemsPerPage && (
                            <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
                                <Pagination />
                            </div>
                        )}
                    </>
                )}

                {/* Bill Detail Modal remains unchanged */}
                {selectedBill && (
                    <BillDetailModal 
                        billDetail={selectedBill} 
                        onClose={() => setSelectedBill(null)}
                    />
                )}
            </div>
        </div>
    );
};

export default MembershipHistoryPage; 