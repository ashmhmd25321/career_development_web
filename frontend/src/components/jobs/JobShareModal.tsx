import React, { useState } from 'react';
import { Button, Modal } from '../ui';
import { Job } from '../../types';
import {
  Share2,
  Copy,
  Mail,
  MessageCircle,
  Facebook,
  Twitter,
  Linkedin,
  Link as LinkIcon,
  X
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface JobShareModalProps {
  show: boolean;
  onClose: () => void;
  job: Job;
}

export const JobShareModal: React.FC<JobShareModalProps> = ({ show, onClose, job }) => {
  const [copied, setCopied] = useState(false);
  const [shareMethod, setShareMethod] = useState<string | null>(null);

  const jobUrl = window.location.href;
  const jobTitle = job.title;
  const companyName = job.companyName || 'Company';
  const shareText = `Check out this amazing job opportunity: ${jobTitle} at ${companyName}`;
  const shareDescription = job.description ? job.description.substring(0, 200) + '...' : '';

  const shareOptions = [
    {
      id: 'copy',
      name: 'Copy Link',
      icon: Copy,
      color: 'text-gray-600 hover:text-gray-800',
      bgColor: 'hover:bg-gray-50',
      action: () => handleCopyLink()
    },
    {
      id: 'email',
      name: 'Email',
      icon: Mail,
      color: 'text-blue-600 hover:text-blue-800',
      bgColor: 'hover:bg-blue-50',
      action: () => handleEmailShare()
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'text-green-600 hover:text-green-800',
      bgColor: 'hover:bg-green-50',
      action: () => handleWhatsAppShare()
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      color: 'text-blue-700 hover:text-blue-900',
      bgColor: 'hover:bg-blue-50',
      action: () => handleFacebookShare()
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: Twitter,
      color: 'text-sky-600 hover:text-sky-800',
      bgColor: 'hover:bg-sky-50',
      action: () => handleTwitterShare()
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'text-blue-700 hover:text-blue-900',
      bgColor: 'hover:bg-blue-50',
      action: () => handleLinkedInShare()
    }
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(jobUrl);
      setCopied(true);
      setShareMethod('copy');
      setTimeout(() => {
        setCopied(false);
        setShareMethod(null);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleEmailShare = () => {
    const subject = `Job Opportunity: ${jobTitle}`;
    const body = `${shareText}\n\n${shareDescription}\n\nView the full job posting: ${jobUrl}`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
    onClose();
  };

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + jobUrl)}`;
    window.open(whatsappUrl, '_blank');
    onClose();
  };

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(jobUrl)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
    onClose();
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(jobUrl)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
    onClose();
  };

  const handleLinkedInShare = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(jobUrl)}`;
    window.open(linkedinUrl, '_blank', 'width=600,height=400');
    onClose();
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: jobTitle,
          text: shareText,
          url: jobUrl,
        });
        onClose();
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  return (
    <Modal isOpen={show} onClose={onClose} size="md">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Share Job Opportunity</h3>
              <p className="text-sm text-gray-600">Help others discover this opportunity</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Job Preview */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-gray-900 mb-2">{jobTitle}</h4>
          <p className="text-sm text-gray-600 mb-2">{companyName}</p>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span>{job.jobType?.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</span>
            <span>•</span>
            <span>{job.experienceLevel?.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</span>
            {job.locationType && (
              <>
                <span>•</span>
                <span>{job.locationType?.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</span>
              </>
            )}
          </div>
        </div>

        {/* Native Share Button (Mobile) */}
        {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
          <div className="mb-6">
            <Button
              variant="primary"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleNativeShare}
            >
              <Share2 className="w-5 h-5" />
              Share via Device
            </Button>
          </div>
        )}

        {/* Share Options Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {shareOptions.map((option) => {
            const IconComponent = option.icon;
            const isActive = shareMethod === option.id;
            
            return (
              <Button
                key={option.id}
                variant="outline"
                className={cn(
                  "flex items-center justify-center gap-3 p-4 h-auto transition-all duration-200",
                  option.color,
                  option.bgColor,
                  isActive && "ring-2 ring-primary-500 ring-offset-2"
                )}
                onClick={option.action}
              >
                <IconComponent className="w-5 h-5" />
                <span className="font-medium">
                  {isActive && option.id === 'copy' ? 'Copied!' : option.name}
                </span>
              </Button>
            );
          })}
        </div>

        {/* Direct Link */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <LinkIcon className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">Direct Link:</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyLink}
              className="text-primary-600 hover:text-primary-700"
            >
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 break-all">{jobUrl}</p>
        </div>
      </div>
    </Modal>
  );
};
