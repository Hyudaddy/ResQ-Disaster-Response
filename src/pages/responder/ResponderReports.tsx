import React from 'react';
import { FileText, Download, Filter, Calendar, AlertTriangle } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useIncidents } from '../../contexts/IncidentContext';
import { Incident } from '../../types/incident.types';
import toast from 'react-hot-toast';

const ResponderReports: React.FC = () => {
  const { incidents } = useIncidents();
  
  // Resolved incidents for reports
  const resolvedIncidents = incidents.filter(
    i => ['resolved', 'closed'].includes(i.status)
  ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  
  // Generate a weekly report
  const generateWeeklyReport = () => {
    toast.success('Weekly report generated');
  };
  
  // Generate incident response report
  const generateIncidentReport = (incidentId: string) => {
    toast.success(`Report generated for incident #${incidentId}`);
  };
  
  // Calculate response times
  const calculateResponseTimes = (incidents: Incident[]) => {
    // In a real app, this would calculate based on actual response timestamps
    // For demo purposes, we'll return fixed values
    return {
      average: "18 minutes",
      fastest: "3 minutes",
      slowest: "45 minutes"
    };
  };
  
  const responseTimes = calculateResponseTimes(incidents);
  
  // Calculate incident distribution by type
  const getIncidentTypeDistribution = () => {
    return incidents.reduce((acc, incident) => {
      acc[incident.type] = (acc[incident.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };
  
  const typeDistribution = getIncidentTypeDistribution();

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <FileText size={24} className="text-primary-500 mr-2" />
          <h1 className="text-2xl font-bold text-white">Reports</h1>
        </div>
        <p className="text-dark-300">
          Generate and view reports for incident response activities
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Response Time Card */}
        <Card title="Response Times">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-dark-300">Average Response</span>
              <span className="text-white font-semibold">{responseTimes.average}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-dark-300">Fastest Response</span>
              <span className="text-success-500 font-semibold">{responseTimes.fastest}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-dark-300">Slowest Response</span>
              <span className="text-danger-500 font-semibold">{responseTimes.slowest}</span>
            </div>
          </div>
        </Card>
        
        {/* Incident Types Card */}
        <Card title="Incident Distribution">
          <div className="space-y-3">
            {Object.entries(typeDistribution).map(([type, count]) => (
              <div key={type} className="flex justify-between items-center">
                <span className="text-dark-300 capitalize">{type}</span>
                <span className="text-white font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </Card>
        
        {/* Generate Report Card */}
        <Card title="Generate Reports">
          <div className="space-y-4">
            <Button
              variant="primary"
              fullWidth
              leftIcon={<Calendar size={16} />}
              onClick={generateWeeklyReport}
            >
              Weekly Summary
            </Button>
            <Button
              variant="secondary"
              fullWidth
              leftIcon={<AlertTriangle size={16} />}
              onClick={() => toast('Custom report functionality would be implemented here', { icon: '📊' })}
            >
              Custom Report
            </Button>
          </div>
        </Card>
      </div>
      
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Recent Incident Reports</h2>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<Filter size={16} />}
        >
          Filter
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-dark-800 text-left">
              <th className="px-4 py-3 text-dark-300 font-medium text-sm">ID</th>
              <th className="px-4 py-3 text-dark-300 font-medium text-sm">Title</th>
              <th className="px-4 py-3 text-dark-300 font-medium text-sm">Type</th>
              <th className="px-4 py-3 text-dark-300 font-medium text-sm">Status</th>
              <th className="px-4 py-3 text-dark-300 font-medium text-sm">Resolved Date</th>
              <th className="px-4 py-3 text-dark-300 font-medium text-sm">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-800">
            {resolvedIncidents.slice(0, 10).map((incident) => (
              <tr key={incident.id} className="bg-dark-900 hover:bg-dark-800 transition">
                <td className="px-4 py-3 text-white">#{incident.id}</td>
                <td className="px-4 py-3 text-white">{incident.title}</td>
                <td className="px-4 py-3">
                  <span className="capitalize text-dark-200">{incident.type}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    incident.status === 'resolved' 
                      ? 'bg-success-500/20 text-success-500' 
                      : 'bg-dark-700 text-dark-300'
                  }`}>
                    {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3 text-dark-300">
                  {incident.resolvedTime 
                    ? new Date(incident.resolvedTime).toLocaleDateString() 
                    : '-'}
                </td>
                <td className="px-4 py-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary-500"
                    leftIcon={<Download size={14} />}
                    onClick={() => generateIncidentReport(incident.id)}
                  >
                    Report
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResponderReports;