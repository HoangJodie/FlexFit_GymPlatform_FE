import axios from 'axios';

const API_URL = 'http://localhost:3000';

class PaymentService {
    static async createMembership(membershipData) {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('Please login to continue');
            }

            // Decode token để lấy user_id
            const tokenData = JSON.parse(atob(token.split('.')[1]));
            const userId = tokenData.user_id;

            if (!userId) {
                throw new Error('User information not found');
            }

            // Format data theo cấu trúc mới
            const formattedData = {
                user_id: userId,
                membership_type: membershipData.membership_type,
                price: membershipData.price,
                quantity: membershipData.quantity || 1 // Default là 1 nếu không có quantity
            };

            console.log('Formatted request data:', formattedData);

            const response = await axios.post(
                `${API_URL}/payment/create-membership`,
                formattedData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Server response:', response.data);

            if (!response.data.membership || !response.data.payment || response.data.payment.return_code !== 1) {
                throw new Error(response.data.payment?.return_message || 'Invalid response data');
            }

            return response.data;
        } catch (error) {
            console.error('Payment API Error:', error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Unable to create payment');
            }
            throw new Error('An error occurred while creating payment');
        }
    }

    static async checkPaymentStatus(orderId) {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('Please login to continue');
            }

            const response = await axios.get(
                `${API_URL}/payment/check-status/${orderId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            console.log('Payment status response:', response.data);

            // Parse response theo đúng cấu trúc backend trả về
            const status = response.data;
            return {
                isSuccess: status.code === 1, // Thành công khi code = 1
                isPending: status.isPending,
                isCancelled: status.isCancelled,
                message: status.message,
                membershipStatus: status.statusId
            };
        } catch (error) {
            console.error('Check Status Error:', error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Unable to check payment status');
            }
            throw new Error('Cannot connect to server');
        }
    }

    static async checkExistingMembership(membershipType) {
        try {
            console.log('Calling check membership API with type:', membershipType);
            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('Please login to continue');
            }

            const response = await axios.get(
                `${API_URL}/payment/check-existing-membership`,
                {
                    params: { membership_type: membershipType },
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('Check membership error:', error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Unable to check membership information');
            }
            throw new Error('An error occurred while checking membership');
        }
    }

    static async getMembershipTypes() {
        try {
            const response = await axios.get(`${API_URL}/payment/membership-types`);
            return response.data;
        } catch (error) {
            console.error('Get membership types error:', error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Unable to fetch membership types');
            }
            throw new Error('Cannot connect to server');
        }
    }

    static async getMembershipHistory() {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('Please login to continue');
            }

            const response = await axios.get(
                `${API_URL}/payment/membership-history`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('Get membership history error:', error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Unable to fetch membership history');
            }
            throw new Error('Cannot connect to server');
        }
    }

    static async getBillDetail(membershipId) {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('Please login to continue');
            }

            const response = await axios.get(
                `${API_URL}/payment/bill-detail/${membershipId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('Get bill detail error:', error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Unable to fetch bill detail');
            }
            throw new Error('Cannot connect to server');
        }
    }
}

export default PaymentService; 