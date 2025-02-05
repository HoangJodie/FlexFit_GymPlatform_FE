import axios from 'axios';

// Tạo một instance mới của axios với cấu hình riêng
const axiosInstance = axios.create({
    baseURL: 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    }
});

// Thêm interceptor để xử lý token và timestamp
axiosInstance.interceptors.request.use(
    (config) => {
        // Thêm token vào header
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Thêm timestamp vào URL để tránh cache
        const timestamp = new Date().getTime();
        config.url = `${config.url}${config.url.includes('?') ? '&' : '?'}_t=${timestamp}`;
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Kiểm tra xung đột lịch học
 * @param {Object} scheduleData
 * @param {number} scheduleData.user_id - ID của user
 * @param {number} scheduleData.class_id - ID của lớp học
 * @returns {Promise<{hasConflict: boolean, conflicts: Array}>}
 */
const checkScheduleConflict = async (scheduleData) => {
    try {
        console.log('Kiểm tra xung đột lịch học với dữ liệu:', scheduleData);
        
        const response = await axiosInstance.post(
            '/schedule/check-schedule-conflict', 
            scheduleData
        );

        console.log('Kết quả kiểm tra lịch học:', response.data);
        return response.data;
    } catch (error) {
        console.error('Lỗi kiểm tra lịch học:', error);
        throw new Error(
            error.response?.data?.message || 
            'Có lỗi xảy ra khi kiểm tra xung đột lịch học'
        );
    }
};

/**
 * Kiểm tra xung đột lịch học cho lớp
 * @param {Object} scheduleData
 * @param {number} scheduleData.class_id - ID của lớp học
 * @param {Date} scheduleData.days - Ngày học
 * @param {Date} scheduleData.start_hour - Giờ bắt đầu
 * @param {Date} scheduleData.end_hour - Giờ kết thúc
 * @returns {Promise<{hasConflicts: boolean, conflictingUsers: Array}>}
 */
const checkClassScheduleConflict = async (scheduleData) => {
    try {
        console.log('Kiểm tra xung đột lịch học lớp với dữ liệu:', scheduleData);
        
        const response = await axiosInstance.post(
            '/schedule/check-class-schedule-conflict', 
            scheduleData
        );
        
        console.log('Kết quả kiểm tra lịch học lớp:', response.data);
        return response.data;
    } catch (error) {
        console.error('Lỗi kiểm tra lịch học lớp:', error);
        throw new Error(
            error.response?.data?.message || 
            'Có lỗi xảy ra khi kiểm tra xung đột lịch học lớp'
        );
    }
};

// Không cần hàm clearCache nữa vì không sử dụng cache
export {
    checkScheduleConflict,
    checkClassScheduleConflict
};
