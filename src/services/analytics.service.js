import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000'  // Xóa /api vì endpoint mẫu không có
});

const AnalyticsService = {
  getRevenueOverview: async (startDate, endDate) => {
    return api.get('/dashboard/revenue-overview', {
      params: { startDate, endDate }
    });
  },

  getMembershipAnalytics: async (startDate, endDate) => {
    return api.get('/dashboard/membership-analytics', {
      params: { startDate, endDate }
    });
  },

  getClassAnalytics: async (startDate, endDate) => {
    return api.get('/dashboard/class-analytics', {
      params: { startDate, endDate }
    });
  },

  getPaymentAnalytics: async (startDate, endDate) => {
    return api.get('/dashboard/payment-analytics', {
      params: { startDate, endDate }
    });
  },

  getRevenueTimeline: async (startDate, endDate, groupBy) => {
    return api.get('/dashboard/revenue-timeline', {
      params: { startDate, endDate, groupBy }
    });
  }
};

export default AnalyticsService; 