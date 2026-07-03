import { User } from 'lucide-react';

const ProfileHeader = () => (
    <div className="mb-6 flex items-start gap-4">
        <div className="rounded-full bg-gray-200 p-3">
            <User size={32} className="text-gray-600" />
        </div>
        <div>
            <h3 className="text-lg font-semibold text-gray-900">Admin Profile</h3>
            <p className="text-sm text-gray-600">Update your account photo and personal details.</p>
        </div>
    </div>
);

export default ProfileHeader;
