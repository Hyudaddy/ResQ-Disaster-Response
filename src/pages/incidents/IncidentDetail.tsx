import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  User, 
  CheckCircle, 
  Edit, 
  Trash, 
  MessageSquare,
  Image,
  ChevronRight,
  ChevronLeft,
  X
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useIncidents } from '../../contexts/IncidentContext';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import IncidentTypeBadge from '../../components/common/IncidentTypeBadge';
import IncidentStatusBadge from '../../components/common/IncidentStatusBadge';
import IncidentSeverityBadge from '../../components/common/IncidentSeverityBadge';
import IncidentForm from '../../components/incidents/IncidentForm';
import toast from 'react-hot-toast';
import { IncidentWithDetails, IncidentStatus, ResponderStatus } from '../../types/incident.types';
import { supabase } from '../../lib/supabase';

const IncidentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getIncidentById, updateIncident } = useIncidents();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageIndex, setImageIndex] = useState<number | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [note, setNote] = useState('');
  
  const incident = getIncidentById(id || '');
  
  if (!incident) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-white mb-4">Incident Not Found</h2>
        <p className="text-dark-300 mb-6">The incident you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/incidents')}>
          Back to Incidents
        </Button>
      </div>
    );
  }
  
  const isOwner = user?.id === incident.reporter_id;
  const isResponder = user?.role === 'responder' || user?.role === 'admin';
  const canUpdateStatus = isResponder;
  const canAddNote = isResponder;
  
  const handleUpdateStatus = async (newStatus: IncidentStatus) => {
    if (!canUpdateStatus) return;
    
    setIsLoading(true);
    
    try {
      await updateIncident(incident.id, {
        status: newStatus,
        resolved_at: ['resolved', 'closed'].includes(newStatus) 
          ? new Date().toISOString() 
          : incident.resolved_at
      });
      
      toast.success(`Incident status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update incident status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!note.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Debug log to check user role and ID
      console.log('Current user:', {
        id: user?.id,
        role: user?.role,
        email: user?.email
      });

      // First, add the responder note to the incident_responders table
      const { error: responderError } = await supabase
        .from('incident_responders')
        .insert([{
          incident_id: incident.id,
          responder_id: user!.id,
          assigned_at: new Date().toISOString(),
          notes: note,
          status: 'assigned'
        }]);

      if (responderError) {
        console.error('Error details:', responderError);
        throw responderError;
      }

      // Then update the incident to trigger a refresh
      await updateIncident(incident.id, {
        updated_at: new Date().toISOString()
      });
      
      setNote('');
      setShowNoteModal(false);
      toast.success('Note added successfully');
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note. Please check your permissions.');
    } finally {
      setIsLoading(false);
    }
  };

  // View image in a modal
  const viewImage = (index: number) => {
    setImageIndex(index);
  };

  // Navigate through images
  const nextImage = () => {
    if (imageIndex === null || !incident.images) return;
    setImageIndex((imageIndex + 1) % incident.images.length);
  };

  const prevImage = () => {
    if (imageIndex === null || !incident.images) return;
    setImageIndex((imageIndex - 1 + incident.images.length) % incident.images.length);
  };

  // Close image modal
  const closeImageModal = () => {
    setImageIndex(null);
  };

  return (
    <div>
      {/* Back button and title */}
      <div className="mb-6">
        <button
          className="flex items-center text-dark-300 hover:text-white mb-4 transition"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Incidents
        </button>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {incident.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <IncidentTypeBadge type={incident.type} />
              <IncidentSeverityBadge severity={incident.severity} />
              <IncidentStatusBadge status={incident.status} />
            </div>
          </div>
          
          {(isOwner || user?.role === 'admin') && !isEditing && (
            <div className="flex gap-3">
              <Button
                variant="secondary"
                leftIcon={<Edit size={16} />}
                onClick={() => setIsEditing(true)}
              >
                Edit
              </Button>
              {/* Admin only: Delete option */}
              {user?.role === 'admin' && (
                <Button
                  variant="danger"
                  leftIcon={<Trash size={16} />}
                  onClick={() => {
                    toast('Delete functionality would be implemented here', {
                      icon: '🔒',
                    });
                  }}
                >
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {isEditing ? (
        <IncidentForm
          editMode
          incident={incident}
          onSuccess={() => setIsEditing(false)}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Incident details */}
            <Card className="lg:col-span-2">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Incident Details</h3>
                  <p className="text-dark-200 whitespace-pre-line">{incident.description}</p>
                </div>

                {/* Images */}
                {incident.images && incident.images.length > 0 && (
                  <div className="pt-4 border-t border-dark-700">
                    <h4 className="text-sm font-medium text-dark-300 mb-3">Incident Images</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {incident.images.map((image: any) => (
                        <div 
                          key={image.id} 
                          className="relative aspect-video cursor-pointer group"
                          onClick={() => viewImage(incident.images.indexOf(image))}
                        >
                          <img
                            src={image.url}
                            alt={`Incident image ${image.id}`}
                            className="w-full h-full object-cover rounded-lg transition-transform group-hover:scale-[1.02]"
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm">Click to view</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-dark-700">
                  <div>
                    <h4 className="text-sm font-medium text-dark-300 mb-2">Location</h4>
                    <div className="flex items-start">
                      <MapPin size={18} className="text-dark-400 mr-2 mt-0.5" />
                      <p className="text-dark-200">
                        {incident.location.latitude && incident.location.longitude ? (
                          <>
                            Latitude: {incident.location.latitude.toFixed(6)}<br />
                            Longitude: {incident.location.longitude.toFixed(6)}<br />
                          </>
                        ) : null}
                        {incident.location.municipality && (
                          <>Municipality: {incident.location.municipality}<br /></>
                        )}
                        {incident.location.barangay && (
                          <>Barangay: {incident.location.barangay}<br /></>
                        )}
                        {incident.location.purok && (
                          <>Purok: {incident.location.purok}</>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-dark-300 mb-2">Reported By</h4>
                    <div className="flex items-center">
                      <User size={18} className="text-dark-400 mr-2" />
                      <p className="text-dark-200">{incident.reporter.full_name}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-dark-300 mb-2">Report Time</h4>
                    <div className="flex items-center">
                      <Clock size={18} className="text-dark-400 mr-2" />
                      <div>
                        <p className="text-dark-200">
                          {format(new Date(incident.created_at), 'PPP p')}
                        </p>
                        <p className="text-xs text-dark-400">
                          {formatDistanceToNow(new Date(incident.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {incident.resolved_at && (
                    <div>
                      <h4 className="text-sm font-medium text-dark-300 mb-2">Resolved Time</h4>
                      <div className="flex items-center">
                        <CheckCircle size={18} className="text-success-500 mr-2" />
                        <div>
                          <p className="text-dark-200">
                            {format(new Date(incident.resolved_at), 'PPP p')}
                          </p>
                          <p className="text-xs text-dark-400">
                            {formatDistanceToNow(new Date(incident.resolved_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Responder notes */}
                {incident.responders && incident.responders.length > 0 && (
                  <div className="pt-4 border-t border-dark-700">
                    <h4 className="text-sm font-medium text-dark-300 mb-3">Responder Notes</h4>
                    <div className="space-y-3">
                      {incident.responders.map((responder, index) => (
                        <div key={index} className="bg-dark-900 rounded-md p-3 border border-dark-700">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 rounded-full bg-primary-500/10 flex items-center justify-center">
                                <User size={16} className="text-primary-500" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-medium text-white">
                                  {responder.responder.full_name}
                                </p>
                                <span className="text-xs text-dark-400">
                                  {formatDistanceToNow(new Date(responder.assigned_at), { addSuffix: true })}
                                </span>
                              </div>
                              <p className="text-dark-200 whitespace-pre-line text-sm">{responder.notes}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
            
            {/* Sidebar actions and info */}
            <div className="space-y-6">
              {/* Status update (for responders and admins) */}
              {canUpdateStatus && (
                <Card title="Update Status">
                  <div className="space-y-4">
                    {/* Status flow indicator */}
                    <div className="relative">
                      {/* Progress bar background */}
                      <div className="absolute top-3 left-0 right-0 h-0.5 bg-dark-700"></div>
                      
                      {/* Status steps */}
                      <div className="relative flex justify-between">
                        {['reported', 'acknowledged', 'responding', 'resolved', 'closed'].map((status, index) => (
                          <div key={status} className="flex flex-col items-center">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium z-10 ${
                              incident.status === status
                                ? 'bg-primary-500 text-white'
                                : ['resolved', 'closed'].includes(incident.status) && ['reported', 'acknowledged', 'responding'].includes(status)
                                ? 'bg-success-500 text-white'
                                : 'bg-dark-700 text-dark-300'
                            }`}>
                              {index + 1}
                            </div>
                            <span className="text-xs mt-1 text-dark-300 capitalize text-center max-w-[80px] break-words">
                              {status}
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      {/* Progress bar fill */}
                      <div className="absolute top-3 left-0 h-0.5 bg-primary-500 transition-all duration-300"
                        style={{
                          width: `${(() => {
                            const statusIndex = ['reported', 'acknowledged', 'responding', 'resolved', 'closed'].indexOf(incident.status);
                            return statusIndex >= 0 ? `${(statusIndex / 4) * 100}%` : '0%';
                          })()}`
                        }}
                      ></div>
                    </div>

                    <p className="text-sm text-dark-300">
                      Current status: <span className="text-white font-medium capitalize">{incident.status}</span>
                    </p>
                    
                    <div className="space-y-2">
                      <Button
                        variant={incident.status === 'acknowledged' ? 'primary' : 'secondary'}
                        fullWidth
                        className="justify-start"
                        disabled={['acknowledged', 'responding', 'resolved', 'closed'].includes(incident.status) || isLoading}
                        onClick={() => handleUpdateStatus('acknowledged')}
                      >
                        <span className="w-3 h-3 rounded-full bg-info-500 mr-2"></span>
                        Acknowledge
                      </Button>
                      
                      <Button
                        variant={incident.status === 'responding' ? 'primary' : 'secondary'}
                        fullWidth
                        className="justify-start"
                        disabled={['responding', 'resolved', 'closed'].includes(incident.status) || isLoading || incident.status === 'reported'}
                        onClick={() => handleUpdateStatus('responding')}
                      >
                        <span className="w-3 h-3 rounded-full bg-warning-500 mr-2"></span>
                        Responding
                      </Button>
                      
                      <Button
                        variant={incident.status === 'resolved' ? 'primary' : 'secondary'}
                        fullWidth
                        className="justify-start"
                        disabled={['resolved', 'closed'].includes(incident.status) || isLoading || ['reported', 'acknowledged'].includes(incident.status)}
                        onClick={() => handleUpdateStatus('resolved')}
                      >
                        <span className="w-3 h-3 rounded-full bg-success-500 mr-2"></span>
                        Resolved
                      </Button>
                      
                      <Button
                        variant={incident.status === 'closed' ? 'primary' : 'secondary'}
                        fullWidth
                        className="justify-start"
                        disabled={incident.status === 'closed' || isLoading || incident.status !== 'resolved'}
                        onClick={() => handleUpdateStatus('closed')}
                      >
                        <span className="w-3 h-3 rounded-full bg-dark-500 mr-2"></span>
                        Close
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
              
              {/* Activity log placeholder */}
              <Card title="Recent Activity">
                <div className="space-y-4">
                  <div className="flex">
                    <div className="w-1 bg-primary-500 rounded-full mr-3"></div>
                    <div>
                      <p className="text-sm text-white">Status changed to <strong>{incident.status}</strong></p>
                      <p className="text-xs text-dark-400">{formatDistanceToNow(new Date(incident.updated_at), { addSuffix: true })}</p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="w-1 bg-dark-500 rounded-full mr-3"></div>
                    <div>
                      <p className="text-sm text-white">Incident reported</p>
                      <p className="text-xs text-dark-400">{formatDistanceToNow(new Date(incident.created_at), { addSuffix: true })}</p>
                    </div>
                  </div>
                </div>
              </Card>
              
              {/* Add comment functionality for responders and admins */}
              {canAddNote && (
                <Card title="Add Note">
                  <div>
                    <Button
                      leftIcon={<MessageSquare size={16} />}
                      fullWidth
                      onClick={() => setShowNoteModal(true)}
                    >
                      Add Note
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </div>
          
          {/* Image Modal */}
          {imageIndex !== null && incident.images && (
            <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
              <div className="relative max-w-4xl w-full">
                <img
                  src={incident.images[imageIndex].url}
                  alt={`Incident ${imageIndex + 1}`}
                  className="w-full h-auto max-h-[80vh] object-contain"
                />
                
                <button
                  className="absolute top-0 right-0 bg-dark-900/80 text-white p-2 rounded-full m-2"
                  onClick={closeImageModal}
                >
                  <X size={24} />
                </button>
                
                {incident.images.length > 1 && (
                  <>
                    <button
                      className="absolute left-0 top-1/2 -translate-y-1/2 bg-dark-900/80 text-white p-2 rounded-full m-2"
                      onClick={prevImage}
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      className="absolute right-0 top-1/2 -translate-y-1/2 bg-dark-900/80 text-white p-2 rounded-full m-2"
                      onClick={nextImage}
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
                
                <div className="absolute bottom-0 left-0 right-0 bg-dark-900/80 text-white p-2 text-center">
                  Image {imageIndex + 1} of {incident.images.length}
                </div>
              </div>
            </div>
          )}

          {/* Note Modal */}
          {showNoteModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">Add Note</h3>
                  <button
                    className="text-dark-400 hover:text-white transition-colors"
                    onClick={() => setShowNoteModal(false)}
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <Input
                  label="Note"
                  name="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Enter your note here..."
                  className="mb-4"
                />
                
                <div className="flex justify-end gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => setShowNoteModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddNote}
                    isLoading={isLoading}
                  >
                    Add Note
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default IncidentDetail;