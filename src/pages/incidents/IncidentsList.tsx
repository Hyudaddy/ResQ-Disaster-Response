import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ListChecks, Grid3X3, List } from 'lucide-react';
import { useIncidents } from '../../contexts/IncidentContext';
import Button from '../../components/common/Button';
import IncidentCard from '../../components/incidents/IncidentCard';
import IncidentFilters from '../../components/incidents/IncidentFilters';

const IncidentsList: React.FC = () => {
  const { filteredIncidents } = useIncidents();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
      
      {filteredIncidents.length === 0 ? (
        <div className="bg-dark-800 rounded-lg p-8 text-center">
          <ListChecks size={48} className="mx-auto mb-4 text-dark-500" />
          <h3 className="text-xl font-semibold text-white mb-2">No Incidents Found</h3>
          <p className="text-dark-300 mb-6">There are no incidents matching your current filters.</p>
          <Button onClick={() => window.location.reload()}>Reset Filters</Button>
        </div>
      ) : (
        <>
          {/* Display count */}
          <p className="text-dark-300 text-sm mb-4">
            Showing {filteredIncidents.length} incident{filteredIncidents.length !== 1 ? 's' : ''}
          </p>
          
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        <span>Reported by: {incident.reporterName}</span>
                      </div>
                      <div>
                        <span>Location: {incident.location.address || `${incident.location.latitude.toFixed(4)}, ${incident.location.longitude.toFixed(4)}`}</span>
                      </div>
                      <div>
                        <span>
                          {new Date(incident.reportTime).toLocaleDateString()} at{' '}
                          {new Date(incident.reportTime).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default IncidentsList;