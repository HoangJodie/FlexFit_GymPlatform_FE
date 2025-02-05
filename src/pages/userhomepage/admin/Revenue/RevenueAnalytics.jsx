import React, { useState, useEffect } from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import AnalyticsService from '../../../../services/analytics.service';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const RevenueAnalytics = () => {
  const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  const [endDate, setEndDate] = useState(new Date());
  const [groupBy, setGroupBy] = useState('month');

  // Thêm state cho dữ liệu timeline
  const [timelineData, setTimelineData] = useState({
    labels: [],
    datasets: []
  });

  // Thêm các state mới để lưu dữ liệu từ API
  const [overviewData, setOverviewData] = useState({
    membershipRevenue: 0,
    classRevenue: 0,
    totalRevenue: 0
  });

  const [membershipAnalytics, setMembershipAnalytics] = useState({
    newMembers: 0,
    activeMembers: 0,
    membershipStats: []
  });

  const [classAnalytics, setClassAnalytics] = useState({
    totalActiveClasses: 0,
    popularClasses: []
  });

  const [paymentAnalytics, setPaymentAnalytics] = useState({
    membershipPayments: [],
    classPayments: []
  });

  // Thêm loading state
  const [isLoading, setIsLoading] = useState(true);

  // Thêm error state
  const [error, setError] = useState(null);

  // Thêm state mới để lưu dữ liệu timeline thô
  const [rawTimelineData, setRawTimelineData] = useState([]);

  // Cập nhật useEffect với loading và error
  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Get date parameters
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];

        // Fetch revenue overview
        const overviewResponse = await AnalyticsService.getRevenueOverview(
          startDateStr,
          endDateStr
        );
        setOverviewData(overviewResponse.data);

        // Fetch membership analytics
        const membershipResponse = await AnalyticsService.getMembershipAnalytics(
          startDateStr,
          endDateStr
        );
        setMembershipAnalytics(membershipResponse.data);

        // Fetch class analytics
        const classResponse = await AnalyticsService.getClassAnalytics(
          startDateStr,
          endDateStr
        );
        setClassAnalytics(classResponse.data);

        // Fetch payment analytics
        const paymentResponse = await AnalyticsService.getPaymentAnalytics(
          startDateStr,
          endDateStr
        );
        setPaymentAnalytics(paymentResponse.data);

        // Fetch timeline data
        const timelineResponse = await AnalyticsService.getRevenueTimeline(
          startDateStr,
          endDateStr,
          groupBy
        );

        // Process timeline data
        const timelineDataArray = Array.isArray(timelineResponse.data) 
          ? timelineResponse.data 
          : timelineResponse.data.data || [];
        
        setRawTimelineData(timelineDataArray);

        // Process timeline chart data
        const timelineChartData = {
          labels: timelineDataArray.map(item => formatDate(item.date)),
          datasets: [
            
            {
              label: 'Membership Revenue',
              data: timelineDataArray.map(item => item.membershipRevenue || 0),
              borderColor: 'rgb(255, 99, 132)',
              tension: 0.1,
              fill: false
            },
            {
              label: 'Class Revenue',
              data: timelineDataArray.map(item => item.classRevenue || 0),
              borderColor: 'rgb(54, 162, 235)',
              tension: 0.1,
              fill: false
            }
          ]
        };
        setTimelineData(timelineChartData);

      } catch (error) {
        console.error('Raw error data:', error.response?.data);
        setError('Unable to load data. Please try again later.');
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [startDate, endDate, groupBy]);

  // Thêm console.log để debug
  useEffect(() => {
    console.log('Raw timeline data:', rawTimelineData);
    console.log('Processed timeline data:', timelineData);
  }, [rawTimelineData, timelineData]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Add this mapping function
  const getMembershipTypeName = (type) => {
    const membershipTypes = {
      '1': 'Basic Plan',
      '2': 'Premium Plan',
      '3': 'VIP Plan'
    };
    return membershipTypes[type] || type;
  };

  // Cập nhật dữ liệu cho biểu đồ membership
  const membershipPieData = {
    labels: membershipAnalytics.membershipStats.map(stat => {
      const type = getMembershipTypeName(stat.membership_type);
      const count = stat._count.user_id;
      return `${type} (${count} members)`;
    }),
    datasets: [{
      data: membershipAnalytics.membershipStats.map(stat => stat._sum.price),
      backgroundColor: [
        'rgb(255, 99, 132)',   // Basic Plan - Pink
        'rgb(54, 162, 235)',   // Premium Plan - Blue
        'rgb(75, 192, 192)'    // VIP Plan - Teal
      ]
    }]
  };

  // Add new stats for the membership overview
  const membershipOverviewData = {
    totalRevenue: membershipAnalytics.totalRevenue || 0,
    newMembers: membershipAnalytics.newMembers || 0,
    activeMembers: membershipAnalytics.activeMembers || 0
  };

  // Add options for better Pie chart display
  const membershipPieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw;
            const label = context.label.split(' (')[0]; // Get only the plan name
            return `${label}: ${formatCurrency(value)}`;
          }
        }
      }
    }
  };

  // Cập nhật dữ liệu cho biểu đồ class
  const classBarData = {
    labels: classAnalytics.popularClasses.map(cls => cls.class_name),
    datasets: [{
      label: 'Top Revenue Generating Classes',
      data: classAnalytics.popularClasses.map(cls => cls.fee),
      backgroundColor: 'rgb(75, 192, 192)'
    }]
  };

  // Cập nhật bảng phương thức thanh toán
  const paymentMethodsData = [
    ...paymentAnalytics.membershipPayments.map(method => ({
      method: method.payment_method,
      count: method._count.membership_id,
      revenue: method._sum.price
    })),
    ...paymentAnalytics.classPayments.map(method => ({
      method: method.payment_method,
      count: method._count.class_transaction_id,
      revenue: method._sum.amount_paid
    }))
  ];

  // Add this function near the top of your component
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Add options configuration
  const timelineOptions = {
    responsive: true,
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date'
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Revenue'
        },
        ticks: {
          callback: function(value) {
            return formatCurrency(value);
          }
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
          }
        }
      }
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Revenue Analytics</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="flex gap-4 mb-6 bg-white p-4 rounded-lg shadow">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <DatePicker
                selected={startDate}
                onChange={setStartDate}
                className="border rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <DatePicker
                selected={endDate}
                onChange={setEndDate}
                className="border rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Group By</label>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                className="border rounded p-2"
              >
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
                <option value="year">Year</option>
              </select>
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(overviewData.totalRevenue)}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Membership Revenue</h3>
              <p className="text-3xl font-bold text-blue-600">
                {formatCurrency(membershipOverviewData.totalRevenue)}
              </p>
              <div className="mt-2 text-sm text-gray-600">
                <p>New Members: {membershipOverviewData.newMembers}</p>
                <p>Active Members: {membershipOverviewData.activeMembers}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Class Revenue</h3>
              <p className="text-3xl font-bold text-purple-600">
                {formatCurrency(overviewData.classRevenue)}
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Revenue Timeline Chart</h3>
              <Line data={timelineData} options={timelineOptions} />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Revenue Distribution by Membership Type</h3>
              <Pie data={membershipPieData} options={membershipPieOptions} />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Top Revenue Generating Classes</h3>
              <Bar data={classBarData} />
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Payment Methods Statistics</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 border-b">Method</th>
                      <th className="px-6 py-3 border-b">Count</th>
                      <th className="px-6 py-3 border-b">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentMethodsData.map((method, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 border-b">{method.method}</td>
                        <td className="px-6 py-4 border-b text-center">{method.count}</td>
                        <td className="px-6 py-4 border-b text-right">
                          {formatCurrency(method.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RevenueAnalytics; 