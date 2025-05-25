import React from 'react';
import { AlertTriangle } from 'lucide-react';
import IncidentForm from '../../components/incidents/IncidentForm';

const IncidentReport: React.FC = () => {
  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <AlertTriangle size={24} className="text-primary-500 mr-2" />
          <h1 className="text-2xl font-bold text-white">Report an Incident</h1>
        </div>
        <p className="text-dark-300">
          Please provide accurate information to help emergency responders assess and address the situation.
        </p>
      </div>
      
      <IncidentForm />
    </div>
  );
};

export default IncidentReport;