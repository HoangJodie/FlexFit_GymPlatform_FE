import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    password: '',
    confirmPassword: '',
    email: '',
    phoneNumber: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Password and Confirm Password do not match");
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:3000/user', {
        username: formData.username,
        name: formData.name,
        password: formData.password,
        email: formData.email,
        phoneNum: formData.phoneNumber
      });
      setSuccess('Registration successful! Redirecting to login...');
      setError('');
  
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      if (error.response && error.response.data) {
        setError(error.response.data.message || 'Registration failed. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
      setSuccess('');
    }
  };

  return (
    <div className="register-container">
      <div className="register-image">
        <div className="image-text">
          <h2>Join FlexFit</h2>
          <p>Start your fitness journey today. Transform your life with our expert guidance.</p>
        </div>
      </div>
      <div className="register-form-container">
        <div className="register-form-box">
          <div className="brand-logo">
            <h2 
              className="cursor-pointer"
              onClick={() => navigate('/')}
            >
              FlexFit
            </h2>
          </div>
          <div className="register-header">
            <h1>Create your account</h1>
            <p>Please fill in the information below</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group half-width">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  name="username"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group half-width">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group half-width">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group half-width">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                  id="phoneNumber"
                  type="text"
                  name="phoneNumber"
                  placeholder="Enter your phone number"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group half-width">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group half-width">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <button type="submit" className="register-button">
              Create Account
            </button>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
          </form>
          
          <div className="login-section">
            <p className="login-text">Already have an account?</p>
            <Link to="/login" className="login-link">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;