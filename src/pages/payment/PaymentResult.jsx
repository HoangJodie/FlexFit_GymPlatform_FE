import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PaymentService from '../../services/payment.service';

const PaymentResult = () => {
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

                const result = await PaymentService.checkPaymentStatus(orderId);
                
                switch (result.status) {
                    case 'success':
                        setStatus({
                            isLoading: false,
                            type: 'success',
                            message: 'Thanh toán thành công!'
                        });
                        break;
                    case 'pending':
                        setStatus({
                            isLoading: false,
                            type: 'pending',
                            message: 'Đang xử lý thanh toán...'
                        });
                        break;
                    case 'failed':
                        setStatus({
                            isLoading: false,
                            type: 'error',
                            message: 'Thanh toán thất bại'
                        });
                        break;
                    default:
                        setStatus({
                            isLoading: false,
                            type: 'error',
                            message: 'Có lỗi xảy ra'
                        });
                }
            } catch (error) {
                setStatus({
                    isLoading: false,
                    type: 'error',
                    message: error.message
                });
            }
        };

        checkStatus();

        // Auto-refresh cho trạng thái pending
        const intervalId = setInterval(() => {
            if (status.type === 'pending') {
                checkStatus();
            }
        }, 3000);

        return () => clearInterval(intervalId);
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
                        
                        {status.type === 'success' ? (
                            <button 
                                onClick={() => navigate('/userhomepage')}
                                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90"
                            >
                                Về trang chủ
                            </button>
                        ) : (
                            <button 
                                onClick={() => navigate('/membership')}
                                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90"
                            >
                                Thử lại
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentResult; 