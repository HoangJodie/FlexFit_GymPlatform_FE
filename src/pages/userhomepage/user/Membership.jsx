import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Membership = () => {
    const [membershipData, setMembershipData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMembershipStatus = async () => {
            try {
                const accessToken = localStorage.getItem('accessToken');
                
                if (!accessToken) {
                    setError('You are not logged in');
                    setTimeout(() => {
                        navigate('/login');
                    }, 2000);
                    return;
                }

                const response = await axios.get('http://localhost:3000/payment/membership-status', {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                setMembershipData(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching membership:', err);
                if (err.response?.status === 401) {
                    setError('Session expired. Please login again');
                    setTimeout(() => {
                        localStorage.removeItem('accessToken');
                        navigate('/login');
                    }, 2000);
                } else {
                    setError('Unable to load membership information. Please try again later');
                }
                setLoading(false);
            }
        };

        fetchMembershipStatus();
    }, [navigate]);

    if (loading) return <div className="text-center">Loading...</div>;
    if (error) return <div className="text-center text-red-500">{error}</div>;
    if (!membershipData) return <div className="text-center">No membership data available</div>;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US');
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6 text-center">Membership Information</h2>
            
            <div className="space-y-4">
                <div className="flex justify-between p-4 bg-gray-50 rounded">
                    <span className="font-semibold">Membership Status:</span>
                    <span className={`${membershipData.isActive ? 'text-green-500' : 'text-red-500'}`}>
                        {membershipData.isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>

                {membershipData.hasMembership && membershipData.membershipDetails && (
                    <>
                        <div className="flex justify-between p-4 bg-gray-50 rounded">
                            <span className="font-semibold">Membership Type:</span>
                            <span>Package {membershipData.membershipDetails.membership_type}</span>
                        </div>

                        <div className="flex justify-between p-4 bg-gray-50 rounded">
                            <span className="font-semibold">Start Date:</span>
                            <span>{formatDate(membershipData.membershipDetails.start_date)}</span>
                        </div>

                        <div className="flex justify-between p-4 bg-gray-50 rounded">
                            <span className="font-semibold">End Date:</span>
                            <span>{formatDate(membershipData.membershipDetails.end_date)}</span>
                        </div>

                        <div className="flex justify-between p-4 bg-gray-50 rounded">
                            <span className="font-semibold">Days Remaining:</span>
                            <span className="text-blue-500 font-bold">{membershipData.daysRemaining} days</span>
                        </div>

                        <div className="flex justify-between p-4 bg-gray-50 rounded">
                            <span className="font-semibold">Price:</span>
                            <span>{formatPrice(membershipData.membershipDetails.price)}</span>
                        </div>

                        <div className="flex justify-between p-4 bg-gray-50 rounded">
                            <span className="font-semibold">Payment Method:</span>
                            <span className="capitalize">{membershipData.membershipDetails.payment_method}</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Membership; 