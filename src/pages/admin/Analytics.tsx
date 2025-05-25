import React, { useState } from 'react';
import { BarChart3, PieChart, TrendingUp, Calendar, ArrowDownRight, ArrowUpRight, Clock } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { useIncidents } from '../../contexts/IncidentContext';
import { Incident } from '../../types/incident.types';
import { subDays, format, isWithinInterval, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

const Analytics: React.FC = () => {
  const { incidents } = useIncidents();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  
  // Get date range based on selected time range
  const getDateRange = () => {
    const today = new Date();
    
    switch (timeRange) {
      case 'week':
        return {
          start: startOfWeek(today),
          end: endOfWeek(today)
        };
      case 'month':
        return {
          start: startOfMonth(today),
          end: endOfMonth(today)
        };
      case 'year':
        return {
          start: new Date(today.getFullYear(), 0, 1),
          end: new Date(today.getFullYear(), 11, 31)
        };
    }
  };
  
  // Filter incidents by date range
  const filterIncidentsByDateRange = (incidents: Incident[], range: { start: Date; end: Date }) => {
    return incidents.filter(incident => {
      const reportDate = new Date(incident.reportTime);
      return isWithinInterval(reportDate, range);
    });
  };
  
  const dateRange = getDateRange();
  const filteredIncidents = filterIncidentsByDateRange(incidents, dateRange);
  
  // Incident type distribution for pie chart
  const getIncidentTypeData = () => {
    const typeCounts = filteredIncidents.reduce((acc, incident) => {
      acc[incident.type] = (acc[incident.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      labels: Object.keys(typeCounts).map(type => type.charAt(0).toUpperCase() + type.slice(1)),
      datasets: [
        {
          data: Object.values(typeCounts),
          backgroundColor: [
            '#ef4444', // fire (red)
            '#3b82f6', // flood (blue)
            '#f59e0b', // earthquake (amber)
            '#6366f1', // storm (indigo)
            '#ec4899', // medical (pink)
            '#f97316', // infrastructure (orange)
            '#6b7280', // other (gray)
          ],
          borderWidth: 0,
        },
      ],
    };
  };
  
  // Daily incidents for bar chart
  const getDailyIncidentsData = () => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return {
        date,
        label: format(date, 'EEE'),
        count: 0
      };
    });
    
    // Count incidents per day
    incidents.forEach(incident => {
      const reportDate = new Date(incident.reportTime);
      
      days.forEach(day => {
        if (
          reportDate.getDate() === day.date.getDate() &&
          reportDate.getMonth() === day.date.getMonth() &&
          reportDate.getFullYear() === day.date.getFullYear()
        ) {
          day.count++;
        }
      });
    });
    
    return {
      labels: days.map(day => day.label),
      datasets: [
        {
          label: 'Incidents',
          data: days.map(day => day.count),
          backgroundColor: '#ff5722',
        },
      ],
    };
  };
  
  // Severity distribution for line chart
  const getSeverityTrendData = () => {
    // Get last 12 days
    const days = Array.from({ length: 12 }, (_, i) => {
      const date = subDays(new Date(), 11 - i);
      return {
        date,
        label: format(date, 'd MMM'),
        low: 0,
        medium: 0,
        high: 0,
        critical: 0
      };
    });
    
    // Count incidents per day by severity
    incidents.forEach(incident => {
      const reportDate = new Date(incident.reportTime);
      
      days.forEach(day => {
        if (
          reportDate.getDate() === day.date.getDate() &&
          reportDate.getMonth() === day.date.getMonth() &&
          reportDate.getFullYear() === day.date.getFullYear()
        ) {
          day[incident.severity as keyof typeof day]++;
        }
      });
    });
    
    return {
      labels: days.map(day => day.label),
      datasets: [
        {
          label: 'Low',
          data: days.map(day => day.low),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.3,
        },
        {
          label: 'Medium',
          data: days.map(day => day.medium),
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          tension: 0.3,
        },
        {
          label: 'High',
          data: days.map(day => day.high),
          borderColor: '#f97316',
          backgroundColor: 'rgba(249, 115, 22, 0.1)',
          tension: 0.3,
        },
        {
          label: 'Critical',
          data: days.map(day => day.critical),
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.3,
        },
      ],
    };
  };
  
  // Chart options
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: '#e0e2e7',
          font: {
            size: 12,
          },
        },
      },
    },
  };
  
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#9ba2b3',
        },
        grid: {
          color: '#353845',
        },
      },
      x: {
        ticks: {
          color: '#9ba2b3',
        },
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };
  
  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#9ba2b3',
        },
        grid: {
          color: '#353845',
        },
      },
      x: {
        ticks: {
          color: '#9ba2b3',
        },
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: '#e0e2e7',
        },
      },
    },
  };
  
  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <BarChart3 size={24} className="text-primary-500 mr-2" />
          <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
        </div>
        <p className="text-dark-300">
          Comprehensive analytics and insights on incident reporting and response
        </p>
      </div>
      
      {/* Time Range Filter */}
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">System Overview</h2>
        <div className="flex bg-dark-800 rounded-md p-1">
          <Button
            variant={timeRange === 'week' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setTimeRange('week')}
          >
            Week
          </Button>
          <Button
            variant={timeRange === 'month' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setTimeRange('month')}
          >
            Month
          </Button>
          <Button
            variant={timeRange === 'year' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setTimeRange('year')}
          >
            Year
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-dark-300 text-sm mb-1">Total Incidents</p>
              <h3 className="text-2xl font-bold text-white">{filteredIncidents.length}</h3>
              <div className="flex items-center mt-1 text-xs">
                <ArrowUpRight size={14} className="text-success-500 mr-1" />
                <span className="text-success-500">12% increase</span>
                <span className="text-dark-400 ml-1">vs. previous {timeRange}</span>
              </div>
            </div>
            <div className="p-3 rounded-full bg-primary-500/20 text-primary-500">
              <BarChart3 size={22} />
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-dark-300 text-sm mb-1">Response Rate</p>
              <h3 className="text-2xl font-bold text-white">94%</h3>
              <div className="flex items-center mt-1 text-xs">
                <ArrowUpRight size={14} className="text-success-500 mr-1" />
                <span className="text-success-500">3% increase</span>
                <span className="text-dark-400 ml-1">vs. previous {timeRange}</span>
              </div>
            </div>
            <div className="p-3 rounded-full bg-success-500/20 text-success-500">
              <TrendingUp size={22} />
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-dark-300 text-sm mb-1">Avg. Response Time</p>
              <h3 className="text-2xl font-bold text-white">18 min</h3>
              <div className="flex items-center mt-1 text-xs">
                <ArrowDownRight size={14} className="text-success-500 mr-1" />
                <span className="text-success-500">5 min faster</span>
                <span className="text-dark-400 ml-1">vs. previous {timeRange}</span>
              </div>
            </div>
            <div className="p-3 rounded-full bg-info-500/20 text-info-500">
              <Clock size={22} />
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-dark-300 text-sm mb-1">Critical Incidents</p>
              <h3 className="text-2xl font-bold text-white">
                {filteredIncidents.filter(i => i.severity === 'critical').length}
              </h3>
              <div className="flex items-center mt-1 text-xs">
                <ArrowDownRight size={14} className="text-danger-500 mr-1" />
                <span className="text-danger-500">2 more</span>
                <span className="text-dark-400 ml-1">vs. previous {timeRange}</span>
              </div>
            </div>
            <div className="p-3 rounded-full bg-danger-500/20 text-danger-500">
              <Calendar size={22} />
            </div>
          </div>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card title="Daily Incidents (Last 7 Days)">
          <div className="h-64">
            <Bar data={getDailyIncidentsData()} options={barOptions} />
          </div>
        </Card>
        
        <Card title="Incident Types">
          <div className="h-64">
            <Pie data={getIncidentTypeData()} options={pieOptions} />
          </div>
        </Card>
      </div>
      
      <Card title="Incident Severity Trends (Last 12 Days)">
        <div className="h-80">
          <Line data={getSeverityTrendData()} options={lineOptions} />
        </div>
      </Card>
    </div>
  );
};

export default Analytics;