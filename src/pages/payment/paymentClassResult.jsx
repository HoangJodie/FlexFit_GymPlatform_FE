import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PaymentClassService from '../../services/paymentClass.service';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = 'http://localhost:3000';

const PaymentClassResult = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState({
        isLoading: true,
        type: null,
        message: ''
    });

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const orderId = searchParams.get('orderId');
                if (!orderId) {
                    setStatus({
                        isLoading: false,
                        type: 'error',
                        message: 'Không tìm thấy mã đơn hàng'
                    });
                    return;
                }

                const result = await PaymentClassService.checkPaymentStatus(orderId);
                console.log('Full payment result:', result);
                console.log('Transaction from result:', result.transaction);

                if (result && typeof result === 'object') {
                    if (result.isSuccess) {
                        try {
                            if (!result.transaction?.user_id || !result.transaction?.class_id) {
                                console.error('Missing transaction data:', result.transaction);
                                throw new Error('Thiếu thông tin giao dịch');
                            }

                            await axios.post(
                                'http://localhost:3000/user-class',
                                {
                                    userId: result.transaction.user_id,
                                    classId: result.transaction.class_id,
                                    statusId: 2
                                },
                                {
                                    headers: {
                                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                                        'Content-Type': 'application/json'
                                    }
                                }
                            );

                            setStatus({
                                isLoading: false,
                                type: 'success',
                                message: 'Thanh toán và đăng ký khóa học thành công!'
                            });
                        } catch (addError) {
                            console.error('Error adding user to class:', addError);
                            console.error('Error details:', {
                                message: addError.message,
                                response: addError.response?.data,
                                status: addError.response?.status
                            });
                            setStatus({
                                isLoading: false,
                                type: 'error',
                                message: 'Thanh toán thành công nhưng không thể đăng ký lớp học. Vui lòng liên hệ hỗ trợ.'
                            });
                        }
                    } else if (result.isPending) {
                        setStatus({
                            isLoading: false,
                            type: 'pending',
                            message: 'Chưa hoàn tất thanh toán'
                        });
                    } else {
                        setStatus({
                            isLoading: false,
                            type: 'error',
                            message: result.message || 'Thanh toán không thành công'
                        });
                    }
                } else {
                    throw new Error('Invalid response format');
                }
            } catch (error) {
                console.error('Error checking payment:', error);
                console.error('Full error details:', {
                    message: error.message,
                    stack: error.stack,
                    response: error.response?.data
                });
                setStatus({
                    isLoading: false,
                    type: 'error',
                    message: error.message || 'Có lỗi xảy ra khi kiểm tra thanh toán'
                });
            }
        };

        checkStatus();
    }, [searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                {status.isLoading ? (
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="text-center">
                        <div className={`mb-4 text-${status.type === 'success' ? 'green' : 'red'}-500`}>
                            {status.type === 'success' ? (
                                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            ) : (
                                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            )}
                        </div>
                        <h2 className="text-2xl font-bold mb-4">{status.message}</h2>
                        
                        <button 
                            onClick={() => navigate('/classes')}
                            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90"
                        >
                            Quay lại danh sách lớp học
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentClassResult;
