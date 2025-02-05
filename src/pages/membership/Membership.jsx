import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import PaymentService from '../../services/payment.service';

const Membership = () => {
    const navigate = useNavigate();
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const [paymentData, setPaymentData] = useState(null);
    const [showQRCode, setShowQRCode] = useState(false);
    const [paymentError, setPaymentError] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [membershipStatus, setMembershipStatus] = useState(null);
    const [showUpgradeConfirm, setShowUpgradeConfirm] = useState(false);
    const [pendingPlanId, setPendingPlanId] = useState(null);
    const [membershipTypes, setMembershipTypes] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [showQuantityModal, setShowQuantityModal] = useState(false);

    // Thêm ErrorModal component
    const ErrorModal = ({ error, onClose }) => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
                <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Notice</h3>
                    <p className="text-gray-600">{error}</p>
                </div>
                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );

    const handlePlanClick = async (planId) => {
        // Kiểm tra đăng nhập trước khi xử lý
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            navigate('/login', { 
                state: { from: '/membership' },
                replace: true 
            });
            return;
        }

        setLoading(true);
        setPaymentError(null);
        setSelectedPlan(planId);
        
        try {
            const status = await PaymentService.checkExistingMembership(planId);
            console.log('Membership status:', status);
            
            // Kiểm tra nếu không được phép mua
            if (!status.canPurchase) {
                if (status.pendingPaymentMembership) {
                    setPaymentError(
                        <div className="space-y-4">
                            <p>{status.message}</p>
                            <div className="flex justify-end">
                                <button
                                    onClick={() => window.location.href = `/payment-status?orderId=${status.pendingPaymentMembership.order_id}`}
                                    className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
                                >
                                    Continue Previous Payment
                                </button>
                            </div>
                        </div>
                    );
                } else {
                    setPaymentError(status.message);
                }
                setLoading(false);
                return;
            }

            // Nếu có membership đang active
            if (status.hasActiveMembership) {
                setPendingPlanId(planId);
                setMembershipStatus(status);
                setShowUpgradeConfirm(true);
                setLoading(false);
                return;
            }

            // Nếu chưa có membership, hiển thị modal chọn số lượng
            setShowQuantityModal(true);

        } catch (error) {
            console.error('Error:', error);
            setPaymentError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const proceedWithPayment = async (planId) => {
        console.log('proceedWithPayment called with planId:', planId);
        setLoading(true);
        try {
            const selectedPlan = membershipTypes.find(p => p.membership_type === planId);
            if (!selectedPlan) {
                throw new Error('Membership plan not found');
            }

            const membershipData = {
                membership_type: planId,
                price: parseInt(selectedPlan.price),
                quantity: quantity
            };

            console.log('Sending membership data:', membershipData);
            const response = await PaymentService.createMembership(membershipData);
            console.log('Payment response:', response);
            
            if (response?.payment?.order_url) {
                window.location.href = response.payment.order_url;
            } else {
                throw new Error('Invalid payment information received');
            }

        } catch (error) {
            console.error('Payment error:', error);
            setPaymentError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Cập nhật QR Code Modal
    const QRCodeModal = () => {
        const selectedPlanDetails = membershipTypes.find(p => p.membership_type === selectedPlan);
        
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg max-w-md w-full">
                    <h3 className="text-xl font-bold mb-4 text-center">Scan QR Code to Pay</h3>
                    {paymentError && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                            {paymentError}
                        </div>
                    )}
                    {paymentData && selectedPlanDetails && (
                        <div className="text-center">
                            <div className="mb-4">
                                <p className="font-semibold text-gray-700">Order Details:</p>
                                <p className="text-sm text-gray-600">Plan: {selectedPlanDetails.name}</p>
                                <p className="text-sm text-gray-600">
                                    Price: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
                                        .format(selectedPlanDetails.price)}
                                </p>
                            </div>
                            
                            <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${paymentData.payment.qr_code}`}
                                alt="QR Code"
                                className="mx-auto mb-4"
                            />
                            
                            <div className="space-y-4">
                                <p className="text-sm text-gray-600">
                                    Or open ZaloPay app to pay:
                                </p>
                                <a
                                    href={paymentData.payment.order_url}
                                    className="bg-blue-500 text-white px-4 py-2 rounded-lg block hover:bg-blue-600 transition-colors"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Open ZaloPay
                                </a>
                                
                                {isProcessing && (
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                                        <p className="text-sm text-gray-600">Processing payment...</p>
                                    </div>
                                )}
                                
                                <button
                                    onClick={() => {
                                        setShowQRCode(false);
                                        setPaymentError(null);
                                        setPaymentStatus(null);
                                    }}
                                    className="text-gray-600 hover:text-gray-800 underline text-sm"
                                >
                                    Cancel Payment
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Thêm Modal xác nhận nâng cấp
    const UpgradeConfirmModal = () => {
        const selectedPlanDetails = membershipTypes.find(p => p.membership_type === pendingPlanId);
        
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg max-w-md w-full">
                    <h3 className="text-xl font-bold mb-4 text-center">Confirm Membership Purchase</h3>
                    <div className="mb-6 text-gray-600">
                        {membershipStatus?.hasActiveMembership && (
                            <div className="bg-blue-50 p-4 rounded-lg mb-4">
                                <p className="font-medium text-blue-800 mb-2">Current Membership:</p>
                                <p>Plan: {membershipTypes.find(p => p.membership_type === membershipStatus?.activeMembership?.membership_type)?.name}</p>
                                <p>Valid until: {new Date(membershipStatus?.activeMembership?.end_date).toLocaleDateString()}</p>
                                <p>Days remaining: {membershipStatus?.activeMembership?.daysRemaining} days</p>
                            </div>
                        )}

                        <div className="bg-green-50 p-4 rounded-lg">
                            <p className="font-medium text-green-800 mb-2">New Membership:</p>
                            <p>Plan: {selectedPlanDetails?.name}</p>
                            <div className="flex items-center gap-4 my-2">
                                <label className="font-medium">Quantity:</label>
                                <select 
                                    value={quantity}
                                    onChange={(e) => setQuantity(Number(e.target.value))}
                                    className="border rounded px-2 py-1"
                                >
                                    {[1, 2, 3, 4].map(num => (
                                        <option key={num} value={num}>
                                            {num} {num === 1 ? 'package' : 'packages'} 
                                            ({num * selectedPlanDetails?.duration} months)
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <p>Total Duration: {quantity * selectedPlanDetails?.duration} months</p>
                            <p>Price: {new Intl.NumberFormat('vi-VN', { 
                                style: 'currency', 
                                currency: 'VND' 
                            }).format(parseInt(selectedPlanDetails?.price) * quantity)}</p>
                        </div>

                        <div className="mt-4 text-sm text-gray-600">
                            <p className="font-medium">{membershipStatus?.message}</p>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4">
                        <button
                            onClick={() => {
                                setShowUpgradeConfirm(false);
                                setPendingPlanId(null);
                                setQuantity(1);
                            }}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                setShowUpgradeConfirm(false);
                                proceedWithPayment(pendingPlanId);
                            }}
                            className="px-4 py-2 bg-secondary text-white rounded hover:bg-secondary/90"
                        >
                            Confirm Purchase
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Thêm useEffect để fetch membership types khi component mount
    useEffect(() => {
        const fetchMembershipTypes = async () => {
            try {
                const types = await PaymentService.getMembershipTypes();
                setMembershipTypes(types);
            } catch (error) {
                setPaymentError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMembershipTypes();
    }, []);

    // Thêm modal mới để chọn số lượng gói
    const QuantitySelectionModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full">
                <h3 className="text-xl font-bold mb-4 text-center text-gray-900 dark:text-white">
                    Select Package Quantity
                </h3>
                
                <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <p className="font-medium text-gray-900 dark:text-white mb-2">
                            {membershipTypes.find(p => p.membership_type === selectedPlan)?.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Base price: {new Intl.NumberFormat('vi-VN', { 
                                style: 'currency', 
                                currency: 'VND' 
                            }).format(membershipTypes.find(p => p.membership_type === selectedPlan)?.price)}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Number of Packages
                        </label>
                        <select 
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            {[1, 2, 3, 4].map(num => (
                                <option key={num} value={num}>
                                    {num} {num === 1 ? 'package' : 'packages'} 
                                    ({num * membershipTypes.find(p => p.membership_type === selectedPlan)?.duration} months)
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                            <p className="text-gray-700 dark:text-gray-300">Total Duration:</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                                {quantity * membershipTypes.find(p => p.membership_type === selectedPlan)?.duration} months
                            </p>
                        </div>
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-green-200 dark:border-green-700">
                            <p className="text-gray-700 dark:text-gray-300">Total Price:</p>
                            <p className="font-bold text-lg text-primary">
                                {new Intl.NumberFormat('vi-VN', { 
                                    style: 'currency', 
                                    currency: 'VND' 
                                }).format(quantity * membershipTypes.find(p => p.membership_type === selectedPlan)?.price)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                    <button
                        onClick={() => {
                            setShowQuantityModal(false);
                            setQuantity(1);
                        }}
                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            setShowQuantityModal(false);
                            proceedWithPayment(selectedPlan);
                        }}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-20 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 relative inline-block">
                        Choose Your Plan
                        <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary"></div>
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Unlock your fitness potential with our flexible membership options. 
                        Choose the plan that best fits your goals.
                    </p>
                </div>

                {/* Features Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                        <div className="bg-primary/10 p-3 rounded-lg">
                            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">Instant Access</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Start training immediately after purchase</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                        <div className="bg-primary/10 p-3 rounded-lg">
                            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">Flexible Duration</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Choose your preferred membership length</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                        <div className="bg-primary/10 p-3 rounded-lg">
                            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">Secure Payment</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Safe and easy payment process</p>
                        </div>
                    </div>
                </div>

                {/* Plans Section */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        <p className="mt-4 text-gray-500 dark:text-gray-400">Loading membership plans...</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-3 gap-8">
                        {membershipTypes.map((plan) => (
                            <motion.div
                                key={plan.membership_type}
                                whileHover={{ scale: 1.02 }}
                                className={`relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg ${
                                    plan.membership_type === 2 ? 'ring-2 ring-secondary' : ''
                                }`}
                            >
                                {plan.membership_type === 2 && (
                                    <div className="absolute top-5 right-5">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary text-white">
                                            Popular Choice
                                        </span>
                                    </div>
                                )}

                                <div className={`${
                                    plan.membership_type === 1 ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                                    plan.membership_type === 2 ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
                                    'bg-gradient-to-br from-yellow-500 to-yellow-600'
                                } p-8 text-white`}>
                                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                    <div className="flex items-baseline mb-2">
                                        <span className="text-4xl font-extrabold">
                                            {new Intl.NumberFormat('vi-VN', { 
                                                style: 'currency', 
                                                currency: 'VND' 
                                            }).format(parseInt(plan.price))}
                                        </span>
                                        <span className="ml-2 text-white/80">/{plan.duration} month{plan.duration > 1 ? 's' : ''}</span>
                                    </div>
                                </div>

                                <div className="p-8">
                                    <ul className="mb-8 space-y-4">
                                        {plan.description.map((feature, index) => (
                                            <li key={index} className="flex items-start text-gray-600 dark:text-gray-300">
                                                <svg className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                                </svg>
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <button
                                        onClick={() => handlePlanClick(plan.membership_type)}
                                        disabled={loading}
                                        className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300
                                            ${plan.membership_type === 2 
                                                ? 'bg-secondary hover:bg-secondary/90' 
                                                : 'bg-primary hover:bg-primary/90'
                                            }
                                            ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg transform hover:-translate-y-0.5'}
                                        `}
                                    >
                                        {loading ? (
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                <span className="ml-2">Processing...</span>
                                            </div>
                                        ) : (
                                            'Get Started'
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Modals */}
                {showQuantityModal && <QuantitySelectionModal />}
                {showUpgradeConfirm && <UpgradeConfirmModal />}
                {showQRCode && <QRCodeModal />}
                {paymentError && (
                    <ErrorModal 
                        error={paymentError}
                        onClose={() => setPaymentError(null)}
                    />
                )}
            </div>
        </div>
    );
};

export default Membership; 