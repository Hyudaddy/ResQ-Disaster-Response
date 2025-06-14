import React from 'react';
import { FileText, Download, Filter, Calendar, AlertTriangle } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useIncidents } from '../../contexts/IncidentContext';
import { useAuth } from '../../contexts/AuthContext';
import { Incident } from '../../types/incident.types';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Extend jsPDF type to include lastAutoTable
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}

const ResponderReports: React.FC = () => {
  const { incidents } = useIncidents();
  const { user } = useAuth();
  
  // Resolved incidents for reports
  const resolvedIncidents = incidents.filter(
    i => ['resolved', 'closed'].includes(i.status)
  ).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  
  // Generate a weekly report
  const generateWeeklyReport = () => {
    if (user?.role !== 'admin') {
      toast.error('Only administrators can generate reports');
      return;
    }
    toast.success('Weekly report generated');
  };
  
  // Generate incident response report
  const generateIncidentReport = (incidentId: string) => {
    if (user?.role !== 'admin') {
      toast.error('Only administrators can generate reports');
      return;
    }

    const incident = incidents.find(i => i.id === incidentId);
    if (!incident) {
      toast.error('Incident not found');
      return;
    }

    // Create new PDF document with A4 size
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Set margins and page dimensions
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    
    // Add header
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('ResQ', pageWidth / 2, 25, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Disaster and Incident Response System', pageWidth / 2, 35, { align: 'center' });
    
    // Add a line separator
    doc.setDrawColor(0, 0, 0);
    doc.line(margin, 40, pageWidth - margin, 40);
    
    // Reset text color to black for content
    doc.setTextColor(0, 0, 0);
    
    // Add incident details
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Incident Response Report', margin, 50);
    
    // Add incident ID and date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Report ID: #${incident.id}`, margin, 57);
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, 63);
    
    // Add incident details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Incident Details', margin, 72);
    
    // Create table with incident information
    autoTable(doc, {
      startY: 75,
      head: [['Field', 'Value']],
      body: [
        ['Title', incident.title],
        ['Type', incident.type?.name || 'Unknown'],
        ['Status', incident.status.charAt(0).toUpperCase() + incident.status.slice(1)],
        ['Severity', incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)],
        ['Reported By', incident.reporter?.full_name || 'Unknown'],
        ['Reported Date', new Date(incident.created_at).toLocaleString()],
        ['Resolved Date', incident.resolved_at ? new Date(incident.resolved_at).toLocaleString() : 'N/A'],
        ['Location', `${incident.location?.municipality || ''}, ${incident.location?.barangay || ''}${incident.location?.purok ? `, ${incident.location.purok}` : ''}`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      styles: { 
        fontSize: 9,
        cellPadding: 3,
        overflow: 'linebreak',
        cellWidth: 'wrap'
      },
      margin: { left: margin, right: margin },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 'auto' }
      }
    });

    // Add description section
    if (incident.description) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Description', margin, doc.lastAutoTable.finalY + 8);
      
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 12,
        body: [[incident.description]],
        theme: 'grid',
        styles: { 
          fontSize: 9,
          cellPadding: 3,
          overflow: 'linebreak',
          cellWidth: 'wrap'
        },
        margin: { left: margin, right: margin },
      });
    }

    // Add responders section if available
    if (incident.responders && incident.responders.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Responders', margin, doc.lastAutoTable.finalY + 8);
      
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 12,
        head: [['Name', 'Role', 'Status', 'Assigned At']],
        body: incident.responders.map(r => [
          r.responder.full_name,
          r.responder.role,
          r.status.charAt(0).toUpperCase() + r.status.slice(1),
          new Date(r.assigned_at).toLocaleString()
        ]),
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        styles: { 
          fontSize: 9,
          cellPadding: 3,
          overflow: 'linebreak',
          cellWidth: 'wrap'
        },
        margin: { left: margin, right: margin },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 30 },
          2: { cellWidth: 30 },
          3: { cellWidth: 'auto' }
        }
      });
    }

    // Add resources section if available
    if (incident.resources && incident.resources.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Resources Deployed', margin, doc.lastAutoTable.finalY + 8);
      
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 12,
        head: [['Name', 'Type', 'Status', 'Assigned At']],
        body: incident.resources.map(r => [
          r.resource.name,
          r.resource.type,
          r.status.charAt(0).toUpperCase() + r.status.slice(1),
          new Date(r.assigned_at).toLocaleString()
        ]),
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        styles: { 
          fontSize: 9,
          cellPadding: 3,
          overflow: 'linebreak',
          cellWidth: 'wrap'
        },
        margin: { left: margin, right: margin },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 30 },
          2: { cellWidth: 30 },
          3: { cellWidth: 'auto' }
        }
      });
    }

    // Add weather information if available
    if (incident.weather_info) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Weather Conditions', margin, doc.lastAutoTable.finalY + 8);
      
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 12,
        head: [['Condition', 'Value']],
        body: [
          ['Temperature', `${incident.weather_info.temperature}°C`],
          ['Weather', incident.weather_info.condition],
          ['Humidity', `${incident.weather_info.humidity}%`],
          ['Wind Speed', `${incident.weather_info.windSpeed} km/h`],
        ],
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        styles: { 
          fontSize: 9,
          cellPadding: 3,
          overflow: 'linebreak',
          cellWidth: 'wrap'
        },
        margin: { left: margin, right: margin },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 'auto' }
        }
      });
    }

    // Add signature section at the bottom of the page
    const signatureY = pageHeight - 40; // 40mm from bottom
    doc.setDrawColor(0, 0, 0);
    doc.line(margin, signatureY, margin + 50, signatureY);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Authorized by:', margin, signatureY + 8);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(user.full_name, margin, signatureY + 15);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Administrator', margin, signatureY + 22);

    // Save the PDF
    doc.save(`Incident_Report_${incident.id}.pdf`);
    toast.success('Report downloaded successfully');
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
      const typeName = incident.type?.name || 'Unknown';
      acc[typeName] = (acc[typeName] || 0) + 1;
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
            {resolvedIncidents.slice(0, 10).map(incident => (
              <tr key={incident.id} className="bg-dark-900 hover:bg-dark-800 transition">
                <td className="px-4 py-3 text-white">#{incident.id}</td>
                <td className="px-4 py-3 text-white">{incident.title}</td>
                <td className="px-4 py-3">
                  <span className="capitalize text-dark-200">{incident.type?.name || 'Unknown'}</span>
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
                  {incident.resolved_at 
                    ? new Date(incident.resolved_at).toLocaleDateString() 
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