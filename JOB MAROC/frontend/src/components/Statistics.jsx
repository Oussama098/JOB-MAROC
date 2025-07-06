import React from 'react'
// import { ResponsiveContainer } from 'recharts';
import StatsOverview from '../components/dashboard/StatsOverview';
import TalentRegistrationChart from '../components/dashboard/TalentRegistrationChart';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import RecentNotifications from '../components/dashboard/RecentNotifications';
import { LineChart, BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import OffersByYearChart from './dashboard/OffersByYears';
import Top5SectorsChart from './dashboard/Top5SectorsChart';
import OffersByModalityChart from './dashboard/OffersByModalityChart';
import OffersByStudyLevelChart from './dashboard/OffersByStudyLevelChart';
import OffersByRegionChart from './dashboard/OffersByRegionChart';

function Statistics() {

  return (
    <div className="space-y-6">
        {/* Stats Overview */}
        <StatsOverview />
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* TalentRegistration Chart */}
          <TalentRegistrationChart/>
          <OffersByYearChart/>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Top5SectorsChart/>
          <OffersByModalityChart/>
        </div>
         <OffersByStudyLevelChart/>
         <OffersByRegionChart/>
        {/* Activity and Notifications */}
        {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ActivityFeed />
          <RecentNotifications />
        </div> */}
      </div>
  )
}

export default Statistics