import React, { useState } from 'react';
import { Filter, X, Search } from 'lucide-react';
import { useIncidents } from '../../contexts/IncidentContext';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import { IncidentType, IncidentSeverity, IncidentStatus } from '../../types/incident.types';

const IncidentFilters: React.FC = () => {
  const { filter, setFilter } = useIncidents();
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filter.searchQuery || '');

  // Type filters
  const incidentTypes: IncidentType[] = ['fire', 'flood', 'earthquake', 'storm', 'medical', 'infrastructure', 'other'];
  const [selectedTypes, setSelectedTypes] = useState<IncidentType[]>(filter.type || []);
  
  // Severity filters
  const severityLevels: IncidentSeverity[] = ['low', 'medium', 'high', 'critical'];
  const [selectedSeverities, setSelectedSeverities] = useState<IncidentSeverity[]>(filter.severity || []);
  
  // Status filters
  const statusOptions: IncidentStatus[] = ['reported', 'acknowledged', 'responding', 'resolved', 'closed'];
  const [selectedStatuses, setSelectedStatuses] = useState<IncidentStatus[]>(filter.status || []);
  
  // Date filters
  const [fromDate, setFromDate] = useState(filter.fromDate || '');
  const [toDate, setToDate] = useState(filter.toDate || '');

  // Handle type selection
  const toggleType = (type: IncidentType) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  // Handle severity selection
  const toggleSeverity = (severity: IncidentSeverity) => {
    if (selectedSeverities.includes(severity)) {
      setSelectedSeverities(selectedSeverities.filter(s => s !== severity));
    } else {
      setSelectedSeverities([...selectedSeverities, severity]);
    }
  };

  // Handle status selection
  const toggleStatus = (status: IncidentStatus) => {
    if (selectedStatuses.includes(status)) {
      setSelectedStatuses(selectedStatuses.filter(s => s !== status));
    } else {
      setSelectedStatuses([...selectedStatuses, status]);
    }
  };

  // Get colors for severity
  const getSeverityColor = (severity: IncidentSeverity) => {
    switch (severity) {
      case 'low': return 'bg-info-500/20 text-info-500 border-info-500/30';
      case 'medium': return 'bg-warning-500/20 text-warning-500 border-warning-500/30';
      case 'high': return 'bg-danger-500/20 text-danger-500 border-danger-500/30';
      case 'critical': return 'bg-danger-500/30 text-danger-500 border-danger-500/50';
      default: return 'bg-dark-700 text-dark-300 border-dark-600';
    }
  };

  // Get colors for status
  const getStatusColor = (status: IncidentStatus) => {
    switch (status) {
      case 'reported': return 'bg-primary-500/20 text-primary-500 border-primary-500/30';
      case 'acknowledged': return 'bg-info-500/20 text-info-500 border-info-500/30';
      case 'responding': return 'bg-warning-500/20 text-warning-500 border-warning-500/30';
      case 'resolved': return 'bg-success-500/20 text-success-500 border-success-500/30';
      case 'closed': return 'bg-dark-700 text-dark-300 border-dark-600';
      default: return 'bg-dark-700 text-dark-300 border-dark-600';
    }
  };

  // Get colors for type
  const getTypeColor = (type: IncidentType) => {
    switch (type) {
      case 'fire': return 'bg-danger-500/20 text-danger-500 border-danger-500/30';
      case 'flood': return 'bg-info-500/20 text-info-500 border-info-500/30';
      case 'earthquake': return 'bg-warning-500/20 text-warning-500 border-warning-500/30';
      case 'storm': return 'bg-info-500/20 text-info-500 border-info-500/30';
      case 'medical': return 'bg-primary-500/20 text-primary-500 border-primary-500/30';
      case 'infrastructure': return 'bg-warning-500/20 text-warning-500 border-warning-500/30';
      case 'other': return 'bg-dark-700 text-dark-300 border-dark-600';
      default: return 'bg-dark-700 text-dark-300 border-dark-600';
    }
  };

  // Apply filters
  const applyFilters = () => {
    setFilter({
      type: selectedTypes.length > 0 ? selectedTypes : undefined,
      severity: selectedSeverities.length > 0 ? selectedSeverities : undefined,
      status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      searchQuery: searchQuery || undefined,
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedTypes([]);
    setSelectedSeverities([]);
    setSelectedStatuses([]);
    setFromDate('');
    setToDate('');
    setSearchQuery('');
    setFilter({});
  };

  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle search submission
  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilter({
      ...filter,
      searchQuery: searchQuery || undefined,
    });
  };

  return (
    <Card className="mb-6">
      <div className="space-y-4">
        {/* Search and Toggle */}
        <div className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={submitSearch} className="flex-1">
            <Input
              placeholder="Search incidents..."
              value={searchQuery}
              onChange={handleSearch}
              leftIcon={<Search size={18} />}
              className="mb-0"
            />
          </form>
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="secondary"
            leftIcon={<Filter size={18} />}
          >
            {isExpanded ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>

        {/* Filter chips - always visible summary */}
        {(selectedTypes.length > 0 || selectedSeverities.length > 0 || selectedStatuses.length > 0 || fromDate || toDate) && (
          <div className="flex flex-wrap gap-2 pt-3 border-t border-dark-700">
            {selectedTypes.map(type => (
              <span 
                key={type} 
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border cursor-pointer"
                onClick={() => toggleType(type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
                <X size={14} className="ml-1" />
              </span>
            ))}
            
            {selectedSeverities.map(severity => (
              <span 
                key={severity} 
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border cursor-pointer ${getSeverityColor(severity)}`}
                onClick={() => toggleSeverity(severity)}
              >
                {severity.charAt(0).toUpperCase() + severity.slice(1)}
                <X size={14} className="ml-1" />
              </span>
            ))}
            
            {selectedStatuses.map(status => (
              <span 
                key={status} 
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border cursor-pointer ${getStatusColor(status)}`}
                onClick={() => toggleStatus(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                <X size={14} className="ml-1" />
              </span>
            ))}
            
            {(fromDate || toDate) && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-dark-700 text-dark-300 border border-dark-600">
                Date Filter Active
                <X 
                  size={14} 
                  className="ml-1 cursor-pointer" 
                  onClick={() => {
                    setFromDate('');
                    setToDate('');
                    setFilter({
                      ...filter,
                      fromDate: undefined,
                      toDate: undefined,
                    });
                  }} 
                />
              </span>
            )}
            
            <button
              className="text-xs text-primary-500 hover:text-primary-400"
              onClick={clearFilters}
            >
              Clear All
            </button>
          </div>
        )}

        {/* Expanded filters */}
        {isExpanded && (
          <div className="pt-4 space-y-6 border-t border-dark-700 animate-fadeIn">
            {/* Incident Types */}
            <div>
              <h4 className="text-sm font-medium text-dark-200 mb-2">Incident Type</h4>
              <div className="flex flex-wrap gap-2">
                {incidentTypes.map(type => (
                  <button
                    key={type}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      selectedTypes.includes(type)
                        ? getTypeColor(type)
                        : 'bg-dark-800 text-dark-300 border-dark-700 hover:bg-dark-700'
                    }`}
                    onClick={() => toggleType(type)}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Severity */}
            <div>
              <h4 className="text-sm font-medium text-dark-200 mb-2">Severity</h4>
              <div className="flex flex-wrap gap-2">
                {severityLevels.map(severity => (
                  <button
                    key={severity}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      selectedSeverities.includes(severity)
                        ? getSeverityColor(severity)
                        : 'bg-dark-800 text-dark-300 border-dark-700 hover:bg-dark-700'
                    }`}
                    onClick={() => toggleSeverity(severity)}
                  >
                    {severity.charAt(0).toUpperCase() + severity.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <h4 className="text-sm font-medium text-dark-200 mb-2">Status</h4>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map(status => (
                  <button
                    key={status}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      selectedStatuses.includes(status)
                        ? getStatusColor(status)
                        : 'bg-dark-800 text-dark-300 border-dark-700 hover:bg-dark-700'
                    }`}
                    onClick={() => toggleStatus(status)}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-dark-200 mb-2">From Date</h4>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="mb-0"
                />
              </div>
              <div>
                <h4 className="text-sm font-medium text-dark-200 mb-2">To Date</h4>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="mb-0"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-dark-700">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
              >
                Clear All
              </Button>
              <Button
                size="sm"
                onClick={applyFilters}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default IncidentFilters;