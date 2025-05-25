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
  
  const isOwner = user?.id === incident.reporterId;
  const isResponder = user?.role === 'responder' || user?.role === 'admin';
  const canUpdateStatus = isResponder;
  
  const handleUpdateStatus = async (newStatus: string) => {
    if (!canUpdateStatus) return;
    
    setIsLoading(true);
    
    try {
      await updateIncident(incident.id, {
        status: newStatus as any,
        resolvedTime: ['resolved', 'closed'].includes(newStatus) 
          ? new Date().toISOString() 
          : incident.resolvedTime
      });
      
      toast.success(`Incident status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update incident status');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding a note
  const handleAddNote = async () => {
    if (!note.trim()) {
      toast.error('Please enter a note');
      return;
    }

    setIsLoading(true);
    try {
      await updateIncident(incident.id, {
        responderNotes: note
      });
      toast.success('Note added successfully');
      setShowNoteModal(false);
      setNote('');
    } catch (error) {
      toast.error('Failed to add note');
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-dark-700">
                  <div>
                    <h4 className="text-sm font-medium text-dark-300 mb-2">Location</h4>
                    <div className="flex items-start">
                      <MapPin size={18} className="text-dark-400 mr-2 mt-0.5" />
                      <p className="text-dark-200">
                        {incident.location.address || (
                          <>
                            Latitude: {incident.location.latitude.toFixed(6)}<br />
                            Longitude: {incident.location.longitude.toFixed(6)}<br />
                            {incident.location.municipality && (
                              <>Municipality: {incident.location.municipality}<br /></>
                            )}
                            {incident.location.barangay && (
                              <>Barangay: {incident.location.barangay}<br /></>
                            )}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-dark-300 mb-2">Reported By</h4>
                    <div className="flex items-center">
                      <User size={18} className="text-dark-400 mr-2" />
                      <p className="text-dark-200">{incident.reporterName}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-dark-300 mb-2">Report Time</h4>
                    <div className="flex items-center">
                      <Clock size={18} className="text-dark-400 mr-2" />
                      <div>
                        <p className="text-dark-200">
                          {format(new Date(incident.reportTime), 'PPP p')}
                        </p>
                        <p className="text-xs text-dark-400">
                          {formatDistanceToNow(new Date(incident.reportTime), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {incident.resolvedTime && (
                    <div>
                      <h4 className="text-sm font-medium text-dark-300 mb-2">Resolved Time</h4>
                      <div className="flex items-center">
                        <CheckCircle size={18} className="text-success-500 mr-2" />
                        <div>
                          <p className="text-dark-200">
                            {format(new Date(incident.resolvedTime), 'PPP p')}
                          </p>
                          <p className="text-xs text-dark-400">
                            {formatDistanceToNow(new Date(incident.resolvedTime), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Image gallery */}
                {incident.images && incident.images.length > 0 && (
                  <div className="pt-4 border-t border-dark-700">
                    <h4 className="text-sm font-medium text-dark-300 mb-3">Images</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {incident.images.map((image, index) => (
                        <div 
                          key={index} 
                          className="relative h-24 cursor-pointer group overflow-hidden rounded-md"
                          onClick={() => viewImage(index)}
                        >
                          <img 
                            src={image} 
                            alt={`Incident ${index + 1}`}
                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Image size={20} className="text-white" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Responder notes */}
                {incident.responderNotes && (
                  <div className="pt-4 border-t border-dark-700">
                    <h4 className="text-sm font-medium text-dark-300 mb-2">Responder Notes</h4>
                    <div className="bg-dark-900 rounded-md p-3 border border-dark-700">
                      <p className="text-dark-200 whitespace-pre-line">{incident.responderNotes}</p>
                    </div>
                  </div>
                )}
                
                {/* Admin notes */}
                {incident.adminNotes && user?.role === 'admin' && (
                  <div className="pt-4 border-t border-dark-700">
                    <h4 className="text-sm font-medium text-dark-300 mb-2">Admin Notes</h4>
                    <div className="bg-dark-900 rounded-md p-3 border border-primary-500/30">
                      <p className="text-dark-200 whitespace-pre-line">{incident.adminNotes}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
            
            {/* Sidebar actions and info */}
            <div className="space-y-6">
              {/* Status update (for responders only) */}
              {canUpdateStatus && (
                <Card title="Update Status">
                  <div className="space-y-3">
                    <p className="text-sm text-dark-300 mb-4">
                      Change the current status of this incident:
                    </p>
                    
                    <Button
                      variant={incident.status === 'acknowledged' ? 'primary' : 'secondary'}
                      fullWidth
                      className="justify-start"
                      disabled={incident.status === 'acknowledged' || isLoading}
                      onClick={() => handleUpdateStatus('acknowledged')}
                    >
                      <span className="w-3 h-3 rounded-full bg-info-500 mr-2"></span>
                      Acknowledge
                    </Button>
                    
                    <Button
                      variant={incident.status === 'responding' ? 'primary' : 'secondary'}
                      fullWidth
                      className="justify-start"
                      disabled={incident.status === 'responding' || isLoading || incident.status === 'resolved' || incident.status === 'closed'}
                      onClick={() => handleUpdateStatus('responding')}
                    >
                      <span className="w-3 h-3 rounded-full bg-warning-500 mr-2"></span>
                      Responding
                    </Button>
                    
                    <Button
                      variant={incident.status === 'resolved' ? 'primary' : 'secondary'}
                      fullWidth
                      className="justify-start"
                      disabled={incident.status === 'resolved' || isLoading || incident.status === 'closed'}
                      onClick={() => handleUpdateStatus('resolved')}
                    >
                      <span className="w-3 h-3 rounded-full bg-success-500 mr-2"></span>
                      Resolved
                    </Button>
                    
                    <Button
                      variant={incident.status === 'closed' ? 'primary' : 'secondary'}
                      fullWidth
                      className="justify-start"
                      disabled={incident.status === 'closed' || isLoading}
                      onClick={() => handleUpdateStatus('closed')}
                    >
                      <span className="w-3 h-3 rounded-full bg-dark-500 mr-2"></span>
                      Close
                    </Button>
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
                      <p className="text-xs text-dark-400">{formatDistanceToNow(new Date(incident.updatedAt), { addSuffix: true })}</p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="w-1 bg-dark-500 rounded-full mr-3"></div>
                    <div>
                      <p className="text-sm text-white">Incident reported</p>
                      <p className="text-xs text-dark-400">{formatDistanceToNow(new Date(incident.reportTime), { addSuffix: true })}</p>
                    </div>
                  </div>
                </div>
              </Card>
              
              {/* Add comment functionality for responders */}
              {isResponder && (
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
                  src={incident.images[imageIndex]}
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