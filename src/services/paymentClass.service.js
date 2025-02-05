import axios from 'axios';

const API_URL = 'http://localhost:3000';

class PaymentClassService {
    static async createClassPayment(classData) {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('Vui lòng đăng nhập để tiếp tục');
            }

            const tokenData = JSON.parse(atob(token.split('.')[1]));
            const userId = tokenData.user_id;

            if (!userId) {
                throw new Error('Không tìm thấy thông tin người dùng');
            }

            const formattedData = {
                user_id: userId,
                class_id: classData.class_id,
                amount_paid: classData.amount_paid
            };

            console.log('Dữ liệu yêu cầu đã format:', formattedData);

            const response = await axios.post(
                `${API_URL}/payment-class/create-class-payment`,
                formattedData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Phản hồi từ server:', response.data);

            if (!response.data || !response.data.payment) {
                throw new Error('Dữ liệu phản hồi không hợp lệ');
            }

            return response.data;

        } catch (error) {
            console.error('Lỗi API Thanh toán:', error);
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw error;
        }
    }

    static async checkPaymentStatus(orderId) {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('Vui lòng đăng nhập để tiếp tục');
            }

            console.log('Checking payment status for order:', orderId);

            const response = await axios.get(
                `${API_URL}/payment-class/check-status/${orderId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            console.log('Raw payment response:', response.data);
            
            if (!response.data) {
                throw new Error('Không nhận được dữ liệu trạng thái thanh toán');
            }

            const status = response.data;
            console.log('Full status from backend:', status);

            // Đảm bảo cấu trúc dữ liệu khớp với backend
            return {
                isSuccess: status.code === 1,
                isPending: status.isPending,
                isCancelled: status.isCancelled,
                message: status.message,
                transaction: status.transaction ? {
                    user_id: status.transaction.user_id,
                    class_id: status.transaction.class_id,
                    status_id: status.transaction.status_id,
                    amount: status.transaction.amount,
                    order_id: status.transaction.order_id,
                    payment_method: status.transaction.payment_method,
                    created_at: status.transaction.created_at,
                    updated_at: status.transaction.updated_at,
                    class_transaction_id: status.transaction.class_transaction_id
                } : null,
                code: status.code
            };

        } catch (error) {
            console.error('Lỗi kiểm tra trạng thái:', error);
            console.error('Chi tiết lỗi:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
                config: error.config
            });

            // Xử lý các loại lỗi cụ thể
            if (error.response) {
                // Server trả về response với status code nằm ngoài range 2xx
                if (error.response.status === 500) {
                    throw new Error('Lỗi server: Không thể xử lý yêu cầu');
                }
                if (error.response.status === 404) {
                    throw new Error('Không tìm thấy thông tin giao dịch');
                }
                if (error.response.status === 401) {
                    throw new Error('Phiên đăng nhập hết hạn');
                }
                throw new Error(error.response.data.message || 'Lỗi không xác định từ server');
            } else if (error.request) {
                // Request được gửi nhưng không nhận được response
                throw new Error('Không thể kết nối đến server');
            } else {
                // Có lỗi khi setup request
                throw new Error('Lỗi khi gửi yêu cầu');
            }
        }
    }

    static async checkJoinStatus(userId, classId) {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('Vui lòng đăng nhập để tiếp tục');
            }

            const response = await axios.get(`${API_URL}/user-class/status`, {
                params: {
                    userId: userId,
                    classId: classId
                },
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            return response.data;
        } catch (error) {
            console.error('Lỗi khi kiểm tra trạng thái tham gia:', error);
            throw error;
        }
    }
}

export default PaymentClassService;