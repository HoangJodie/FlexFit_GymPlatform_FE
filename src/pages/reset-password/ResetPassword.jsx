import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './ResetPassword.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setStatus({
        type: 'error',
        message: 'Passwords do not match'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post('http://localhost:3000/auth/reset-password', {
        token,
        newPassword: formData.newPassword
      });

      setStatus({
        type: 'success',
        message: 'Password has been updated successfully'
      });

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'An error occurred. Please try again'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-box">
        <h2>Reset Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              required
              minLength="6"
              placeholder="Enter new password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength="6"
              placeholder="Confirm new password"
            />
          </div>

          {status.message && (
            <div className={`status-message ${status.type}`}>
              {status.message}
            </div>
          )}

          <button 
            type="submit" 
            className="reset-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export { ResetPassword as default }; 