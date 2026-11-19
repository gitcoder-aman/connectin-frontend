import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import { Button } from '@/components/common/Button';
import { UserProfile } from '@/types/auth';
import { Info } from 'lucide-react';

interface ProfileBioModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSave: (updates: Partial<UserProfile>) => void;
}

export const ProfileBioModal: React.FC<ProfileBioModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
}) => {
  const [name, setName] = useState(profile.name || '');
  const [headline, setHeadline] = useState(profile.headline || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [location, setLocation] = useState(profile.location || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: name.trim() || profile.name,
      headline: headline.trim(),
      bio: bio.trim(),
      location: location.trim(),
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Profile Information"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Backend Note Alert */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-start gap-2">
          <Info className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-800">Backend Integration Note:</span>{' '}
            ConnectIn's backend `userService` manages authentication and core registration details.
            Your headline, bio, and location are stored in your profile preferences.
          </div>
        </div>

        <Input
          label="Display Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
          required
        />

        <Input
          label="Professional Headline"
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          placeholder="e.g. Senior Software Engineer at Tech Corp"
        />

        <Input
          label="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Bengaluru, Karnataka, India"
        />

        <Textarea
          label="About / Summary"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Write a summary about your experience, passions, and interests..."
          rows={4}
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
