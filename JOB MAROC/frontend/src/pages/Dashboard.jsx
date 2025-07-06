import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import StatsOverview from '../components/dashboard/StatsOverview';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import RecentNotifications from '../components/dashboard/RecentNotifications';
import { LineChart, BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Statistics from '../components/Statistics';
import { Outlet } from 'react-router-dom';

const Dashboard = () => {
  // Sample data for charts
  // const salesData = [
  //   { name: 'Jan', value: 4000 },
  //   { name: 'Feb', value: 3000 },
  //   { name: 'Mar', value: 5000 },
  //   { name: 'Apr', value: 2780 },
  //   { name: 'May', value: 1890 },
  //   { name: 'Jun', value: 2390 },
  //   { name: 'Jul', value: 3490 },
  // ];

  // const trafficData = [
  //   { name: 'Mon', desktop: 4000, mobile: 2400, tablet: 1800 },
  //   { name: 'Tue', desktop: 3000, mobile: 1398, tablet: 2210 },
  //   { name: 'Wed', desktop: 2000, mobile: 3800, tablet: 2290 },
  //   { name: 'Thu', desktop: 2780, mobile: 3908, tablet: 2000 },
  //   { name: 'Fri', desktop: 1890, mobile: 4800, tablet: 2181 },
  //   { name: 'Sat', desktop: 2390, mobile: 3800, tablet: 2500 },
  //   { name: 'Sun', desktop: 3490, mobile: 4300, tablet: 2100 },
  // ];

  return (
    <Statistics/>
  );
};

export default Dashboard;