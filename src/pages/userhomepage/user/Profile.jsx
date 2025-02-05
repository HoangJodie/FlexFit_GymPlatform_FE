import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; 
import './User.css'

const Profile = () => {
    const [userData, setUserData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
      name: '',
      username: '',
      email: '',
      phoneNum: '',
    });
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);

    // Fetch user data when the component mounts
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const accessToken = localStorage.getItem('accessToken');
                const response = await axios.get('http://localhost:3000/user/profile', {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    },
                    withCredentials: true
                });
                
                console.log('User data received:', response.data);
                setUserData(response.data);
                setFormData({
                    name: response.data.name,
                    username: response.data.username,
                    email: response.data.email,
                    phoneNum: response.data.phoneNum || '',
                });
                if (response.data.imgurl) {
                    setAvatarPreview(response.data.imgurl);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                if (error.response?.status === 401) {
                    localStorage.removeItem('accessToken');
                    // Có thể thêm redirect về trang login nếu cần
                }
            }
        };

        fetchUserData();
    }, []);

    // Function to map role_id to role name
    const getRoleName = (role_id) => {
        switch (role_id) {
        case 1:
            return 'Admin';
        case 2:
            return 'User';
        case 3:
            return 'PT';
        }
    };

    // Handle input change for editing
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
        ...formData,
        [name]: value
        });
    };

    // Toggle edit mode
    const handleEdit = () => {
        setIsEditing(!isEditing);
    };

    // Submit the updated profile data
    const handleSave = async () => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            const formDataToSend = new FormData();
            
            formDataToSend.append('name', formData.name);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('phoneNum', formData.phoneNum);

            if (avatar) {
                formDataToSend.append('image', avatar);
            }

            const response = await axios.patch(
                'http://localhost:3000/user/profile',
                formDataToSend, 
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    },
                    withCredentials: true
                }
            );

            console.log('Response:', response.data);

            if (response.data) {
                setUserData(response.data);
                setIsEditing(false);
                
                if (avatarPreview) {
                    URL.revokeObjectURL(avatarPreview);
                    setAvatarPreview(null);
                }
                setAvatar(null);

                alert('Cập nhật thông tin thành công!');
            }
        } catch (error) {
            console.error('Error updating user data:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
                alert(`Lỗi: ${error.response.data.message || 'Không thể cập nhật thông tin'}`);
            } else {
                alert('Có lỗi xảy ra khi cập nhật thông tin');
            }
        }
    };

    // Thêm hàm để hủy chỉnh sửa
    const handleCancel = () => {
        setFormData({
            name: userData.name,
            username: userData.username,
            email: userData.email,
            phoneNum: userData.phoneNum || '',
        });
        setIsEditing(false);
    };

    // Thêm hàm để lấy chữ cái đầu của username
    const getInitials = (name) => {
        return name ? name.charAt(0).toUpperCase() : '?';
    };

    // Thêm sau các hàm xử lý hiện có
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
            // Tạo preview URL cho avatar
            const previewUrl = URL.createObjectURL(file);
            setAvatarPreview(previewUrl);
        }
    };

    if (!userData) {
        return <div className="profile-container">Loading...</div>;
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                <div className="profile-avatar">
                    {isEditing ? (
                        <div className="avatar-upload">
                            <img 
                                src={avatarPreview || (userData.imgurl || null)} 
                                alt="Avatar Preview"
                                className="avatar-preview"
                            />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="avatar-input"
                                id="avatar-input"
                            />
                            <label htmlFor="avatar-input" className="avatar-label">
                                Chọn ảnh
                            </label>
                        </div>
                    ) : (
                        userData.imgurl ? (
                            <img 
                                src={userData.imgurl} 
                                alt="User Avatar" 
                                className="user-avatar"
                            />
                        ) : (
                            getInitials(userData.username)
                        )
                    )}
                </div>
                <h1>Thông tin cá nhân</h1>
            </div>

            <div className="profile-info">
                <label>Họ và tên:</label>
                {isEditing ? (
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="profile-input"
                    />
                ) : (
                    <p className="profile-data">{userData.name}</p>
                )}
            </div>

            <div className="profile-info">
                <label>Tên đăng nhập:</label>
                {isEditing ? (
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="profile-input"
                    />
                ) : (
                    <p className="profile-data">{userData.username}</p>
                )}
            </div>

            <div className="profile-info">
                <label>Email:</label>
                {isEditing ? (
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="profile-input"
                    />
                ) : (
                    <p className="profile-data">{userData.email}</p>
                )}
            </div>

            <div className="profile-info">
                <label>Số điện thoại:</label>
                {isEditing ? (
                    <input
                        type="text"
                        name="phoneNum"
                        value={formData.phoneNum}
                        onChange={handleInputChange}
                        className="profile-input"
                    />
                ) : (
                    <p className="profile-data">{userData.phoneNum || 'Chưa cung cấp'}</p>
                )}
            </div>

            <div className="profile-info">
                <label>Vai trò:</label>
                <p className="profile-data">{getRoleName(userData.role_id)}</p>
            </div>

            <div className="button-container">
                {isEditing ? (
                    <>
                        <button className="edit-button" onClick={handleSave}>
                            Lưu thay đổi
                        </button>
                        <button className="cancel-button" onClick={handleCancel}>
                            Hủy
                        </button>
                    </>
                ) : (
                    <button className="edit-button" onClick={handleEdit}>
                        Chỉnh sửa
                    </button>
                )}
            </div>
        </div>
    );
};

export default Profile;