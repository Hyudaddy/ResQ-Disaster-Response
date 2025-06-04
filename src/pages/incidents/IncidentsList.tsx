import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ListChecks, Grid3X3, List, AlertTriangle, RefreshCw } from 'lucide-react';
import { useIncidents } from '../../contexts/IncidentContext';
import Button from '../../components/common/Button';
import IncidentCard from '../../components/incidents/IncidentCard';
import IncidentFilters from '../../components/incidents/IncidentFilters';
import { format } from 'date-fns';
import Card from '../../components/common/Card';

const IncidentsList: React.FC = () => {
  const { incidents, filteredIncidents, loading, error, refreshIncidents, setFilter } = useIncidents();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    // Refresh incidents when component mounts
    refreshIncidents();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center text-center">
          <AlertTriangle className="w-12 h-12 text-danger-500 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Failed to Load Incidents</h3>
          <p className="text-dark-300 mb-4">{error}</p>
          <Button onClick={refreshIncidents} leftIcon={<RefreshCw size={16} />}>
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  if (filteredIncidents.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center text-center">
          <AlertTriangle className="w-12 h-12 text-warning-500 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Incidents Found</h3>
          <p className="text-dark-300 mb-6">
            {incidents.length === 0
              ? 'There are no incidents reported yet.'
              : 'No incidents match your current filters.'}
          </p>
          {incidents.length > 0 && (
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setFilter({})}
                leftIcon={<RefreshCw size={16} />}
              >
                Reset Filters
              </Button>
              <Button
                variant="primary"
                onClick={refreshIncidents}
                leftIcon={<RefreshCw size={16} />}
              >
                Refresh Incidents
              </Button>
            </div>
          )}
        </div>
      </Card>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center mb-2">
            <ListChecks size={24} className="text-primary-500 mr-2" />
            <h1 className="text-2xl font-bold text-white">Incidents</h1>
          </div>
          <p className="text-dark-300">
            View and manage all reported incidents
          </p>
        </div>
        
        <div className="flex gap-3">
          <div className="bg-dark-800 rounded-md flex p-1">
            <button
              className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-dark-700 text-white' : 'text-dark-400 hover:text-dark-200'}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <Grid3X3 size={18} />
            </button>
            <button
              className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-dark-700 text-white' : 'text-dark-400 hover:text-dark-200'}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <List size={18} />
            </button>
          </div>
          
          <Link to="/incidents/report">
            <Button>Report Incident</Button>
          </Link>
        </div>
      </div>
      
      <IncidentFilters />
      
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredIncidents.map(incident => (
            <IncidentCard key={incident.id} incident={incident} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredIncidents.map(incident => (
            <Link 
              key={incident.id} 
              to={`/incidents/${incident.id}`}
              className="block"
            >
              <div className="bg-dark-800 hover:bg-dark-800/80 border border-dark-700 hover:border-primary-500/50 rounded-lg p-4 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <h3 className="text-lg font-semibold text-white mr-3">{incident.title}</h3>
                    <div className="flex gap-2">
                      <div className="hidden md:block">
                        <IncidentCard.IncidentTypeBadge type={incident.type} />
                      </div>
                      <IncidentCard.IncidentSeverityBadge severity={incident.severity} />
                    </div>
                  </div>
                  <IncidentCard.IncidentStatusBadge status={incident.status} />
                </div>
                
                <p className="text-dark-300 text-sm mb-3 line-clamp-1">{incident.description}</p>
                
                <div className="flex flex-wrap justify-between text-xs text-dark-400">
                  <div>
                    <span>Reported by: {incident.reporter.full_name}</span>
                  </div>
                  <div>
                    <span>
                      Location: {incident.location.municipality}, {incident.location.barangay}
                      {incident.location.purok ? `, ${incident.location.purok}` : ''}
                    </span>
                  </div>
                  <div>
                    <span>
                      {format(new Date(incident.created_at), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default IncidentsList;