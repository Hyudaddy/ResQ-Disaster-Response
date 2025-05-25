import React from 'react';
import { X } from 'lucide-react';
import Card from './Card';
import Button from './Button';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose, onAccept }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Terms and Conditions</h2>
          <button
            onClick={onClose}
            className="text-dark-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="prose prose-invert max-w-none">
          <div className="space-y-4 text-dark-200">
            <p>
              Welcome to ResQ. By using our incident reporting system, you agree to the following terms:
            </p>

            <h3 className="text-lg font-semibold text-white">False Report Penalties</h3>
            <p>
              Making false or prank reports is strictly prohibited and may result in:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Monetary fines up to ₱5,000</li>
              <li>Account suspension or permanent ban</li>
              <li>Legal action under applicable laws</li>
            </ul>

            <h3 className="text-lg font-semibold text-white">User Responsibilities</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Provide accurate and truthful information</li>
              <li>Report only genuine emergencies and incidents</li>
              <li>Do not misuse the system for testing or pranks</li>
              <li>Maintain confidentiality of sensitive information</li>
            </ul>

            <p className="text-warning-500">
              By accepting these terms, you acknowledge that making false reports is a serious offense
              that can result in penalties and legal consequences.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={onClose}>
            Decline
          </Button>
          <Button onClick={onAccept}>
            Accept Terms
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default TermsModal;