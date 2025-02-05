import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PaymentService from '../../services/payment.service';

const PaymentStatus = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState({
        isLoading: true,
        success: false,
        message: ''
    });

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const orderId = searchParams.get('orderId');
                if (!orderId) {
                    setStatus({
                        isLoading: false,
                        success: false,
                        message: 'Không tìm thấy mã đơn hàng'
                    });
                    return;
                }

                const result = await PaymentService.checkPaymentStatus(orderId);
                
                if (result.isSuccess) {
                    setStatus({
                        isLoading: false,
                        success: true,
                        message: 'Thanh toán thành công!'
                    });
                } else {
                    setStatus({
                        isLoading: false,
                        success: false,
                        message: result.message || 'Thanh toán không thành công'
                    });
                }
            } catch (error) {
                console.error('Error checking payment:', error);
                setStatus({
                    isLoading: false,
                    success: false,
                    message: error.message || 'Có lỗi xảy ra khi kiểm tra thanh toán'
                });
            }
        };

        checkStatus();
    }, [searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                {status.isLoading ? (
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div>
                        {status.success ? (
                            <>
                                <div className="text-green-500 mb-4">
                                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">Thanh toán thành công!</h2>
                                <p className="text-gray-600 mb-6">Cảm ơn bạn đã đăng ký membership.</p>
                            </>
                        ) : (
                            <>
                                <div className="text-red-500 mb-4">
                                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">Thanh toán không thành công</h2>
                                <p className="text-gray-600 mb-6">{status.message}</p>
                            </>
                        )}

                        <div className="space-y-4">
                            <button
                                onClick={() => navigate('/membership')}
                                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 w-full"
                            >
                                Quay lại danh sách membership
                            </button>
                            
                            {!status.success && (
                                <button
                                    onClick={() => navigate('/contact')}
                                    className="text-gray-600 hover:text-gray-800 underline text-sm"
                                >
                                    Liên hệ hỗ trợ
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentStatus; 