import React from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle, 
  Clock, 
  Flame, 
  Droplet, 
  Activity
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useIncidents } from '../../contexts/IncidentContext';
import IncidentCard from '../../components/incidents/IncidentCard';
import { getIncidentStats, getIncidentTypeDistribution, getRecentIncidents } from '../../data/mockData';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { incidents } = useIncidents();
  const stats = getIncidentStats();
  const recentIncidents = getRecentIncidents(3);
  const typeDistribution = getIncidentTypeDistribution();

  // Format data for doughnut chart
  const doughnutData = {
    labels: Object.keys(typeDistribution).map(type => 
      type.charAt(0).toUpperCase() + type.slice(1)
    ),
    datasets: [
      {
        data: Object.values(typeDistribution),
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

  // Format data for bar chart (last 7 days incidents)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date;
  }).reverse();
  
  const barData = {
    labels: last7Days.map(date => date.toLocaleDateString('en-US', { weekday: 'short' })),
    datasets: [
      {
        label: 'Incidents',
        data: last7Days.map(date => {
          const dayStart = new Date(date);
          dayStart.setHours(0, 0, 0, 0);
          
          const dayEnd = new Date(date);
          dayEnd.setHours(23, 59, 59, 999);
          
          return incidents.filter(incident => {
            const reportDate = new Date(incident.reportTime);
            return reportDate >= dayStart && reportDate <= dayEnd;
          }).length;
        }),
        backgroundColor: '#ff5722',
      },
    ],
  };

  // Chart options
  const doughnutOptions = {
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

  return (
    <div className="animate-fadeIn">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">
          Welcome, {user?.name}
        </h1>
        <p className="text-dark-300">Dashboard overview and recent incidents</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <Card className="transform transition-all hover:scale-105">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary-500/20 text-primary-500 mr-4">
              <AlertTriangle size={22} />
            </div>
            <div>
              <p className="text-dark-300 text-sm">Total Incidents</p>
              <h3 className="text-2xl font-bold text-white">{stats.total}</h3>
            </div>
          </div>
        </Card>

        <Card className="transform transition-all hover:scale-105">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-warning-500/20 text-warning-500 mr-4">
              <ShieldAlert size={22} />
            </div>
            <div>
              <p className="text-dark-300 text-sm">Active Incidents</p>
              <h3 className="text-2xl font-bold text-white">{stats.active}</h3>
            </div>
          </div>
        </Card>

        <Card className="transform transition-all hover:scale-105">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-success-500/20 text-success-500 mr-4">
              <CheckCircle size={22} />
            </div>
            <div>
              <p className="text-dark-300 text-sm">Resolved Incidents</p>
              <h3 className="text-2xl font-bold text-white">{stats.resolved}</h3>
            </div>
          </div>
        </Card>

        <Card className="transform transition-all hover:scale-105">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-danger-500/20 text-danger-500 mr-4">
              <Activity size={22} />
            </div>
            <div>
              <p className="text-dark-300 text-sm">Critical Incidents</p>
              <h3 className="text-2xl font-bold text-white">{stats.critical}</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Action Button */}
      <div className="mb-8">
        <Link to="/incidents/report">
          <Button size="lg" leftIcon={<AlertTriangle size={18} />}>
            Report New Incident
          </Button>
        </Link>
      </div>

      {/* Charts and Recent Incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2" title="Weekly Incident Report">
          <div className="h-64">
            <Bar data={barData} options={barOptions} />
          </div>
        </Card>

        <Card title="Incident Types">
          <div className="h-64">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </Card>
      </div>

      {/* Recent Incidents */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Recent Incidents</h2>
          <Link to="/incidents">
            <Button variant="ghost" size="sm" rightIcon={<Clock size={16} />}>
              View All
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentIncidents.map((incident) => (
            <IncidentCard key={incident.id} incident={incident} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;