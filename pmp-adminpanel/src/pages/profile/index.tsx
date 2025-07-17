import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';
import { getItem } from '@/utils/storage';
import { TopBar } from '@/components/TopBar';
import { SidebarInset } from '@/components/ui/sidebar';
import { ASSET_BASE_URL } from '@/utils/constants';

const ProfilePage = () => {
  const user: any = getItem('USER');
  return (
    <div className="bg-gradient-to-br flex flex-col items-center justify-center mt-3">
      <TopBar title="Profile" />
      <Card className="w-full max-w-3xl rounded-3xl shadow-2xl border border-gray-200">
        <CardContent className="p-6 flex flex-col items-center text-center">
          {/* Profile Picture */}
          <div className="relative mb-6">
            <img
              src={
                user.profilePic
                  ? ASSET_BASE_URL + user?.profilePic
                  : 'https://ui-avatars.com/api/?name=' +
                    encodeURIComponent(user.fname + ' ' + user.lname) +
                    '&background=random'
              }
              alt="Profile"
              className="w-40 h-40 rounded-full border-4 border-blue-500 object-cover shadow-lg"
            />
            {user.isVerified && (
              <CheckCircle className="w-7 h-7 text-green-500 absolute bottom-2 right-2" />
            )}
          </div>

          {/* Name & Verified Badge */}
          <h1 className="capitalize text-3xl font-extrabold text-gray-800">
            {user.fname} {user.lname}
          </h1>
          <p className="text-gray-500 text-lg mt-1">{user.email}</p>
          <div className="flex gap-2 mt-3">
            {user.role && (
              <Badge className="bg-purple-600 text-white px-3 py-1 text-sm rounded-full">
                {user.role.name}
              </Badge>
            )}

            {user.isVerified && (
              <Badge className="bg-green-600 text-white px-3 py-1 text-sm rounded-full">
                Verified
              </Badge>
            )}
          </div>

          {/* Metadata */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full text-left">
            <div className="bg-gray-50 rounded-xl p-4 shadow-inner">
              <p className="text-gray-400 text-sm">Account Status</p>
              <p className="font-medium text-lg">
                {user.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 shadow-inner">
              <p className="text-gray-400 text-sm">Gender</p>
              <p className="font-medium text-lg capitalize">{user.gender}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 shadow-inner">
              <p className="text-gray-400 text-sm">Phone</p>
              <p className="font-medium text-lg">{user.phone}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 shadow-inner">
              <p className="text-gray-400 text-sm">Created At</p>
              <p className="font-medium text-lg">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
