import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { jwtDecode } from 'jwt-decode'; 
import User from './user/User';
import PersonalTrainer from './personalTrainer/PersonalTrainer';
import Admin from './admin/Admin';
import axios from 'axios';


const UserHomePage = () => {
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkToken = async () => {
      // Lấy access token từ localStorage
      let accessToken = localStorage.getItem('accessToken');

      if (!accessToken) {
        navigate('/'); // Chuyển hướng về trang đăng nhập nếu không có token
        return;
      }

      try {
        // Giải mã access token để lấy thông tin role
        const decodedToken = jwtDecode(accessToken);
        setRole(decodedToken.role); // Cập nhật role từ token

        // Kiểm tra thời gian hết hạn của token (exp là thời gian hết hạn tính theo giây)
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp < currentTime) {
          console.log('Access token has expired, refreshing token...');
          const refreshResponse = await axios.post(
            'http://localhost:3000/auth/refresh',
            {},
            { withCredentials: true }
          );
          accessToken = refreshResponse.data.accessToken;
          console.log('New access token received:', accessToken);
          localStorage.setItem('accessToken', accessToken);
          setRole(jwtDecode(accessToken).role);
        } else {
          console.log('Access token is still valid');
        }
        
      } catch (error) {
        console.error('Invalid token', error);
        localStorage.removeItem('accessToken'); // Xóa token nếu không hợp lệ
        navigate('/'); // Chuyển hướng về trang đăng nhập
      }
    };

    checkToken();
  }, [navigate]); // Thêm navigate vào dependency array

  return (
    <div className='mt-[100px]'>
      {role === 1 && <Admin />} 
      {role === 2 && <User />} 
      {role === 3 && <PersonalTrainer />} 

    
      {role === null && <p>Loading...</p>}
      {/* <Admin /> */}
    </div>
  );
};

export default UserHomePage;
