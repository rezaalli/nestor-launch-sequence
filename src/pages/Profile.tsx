
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AccountInfoForm from '@/components/AccountInfoForm';
import PasswordChangeForm from '@/components/PasswordChangeForm';
import ProfileImageUploader from '@/components/ProfileImageUploader';
import DataExport from '@/components/DataExport';
import DevicesDetailScreen from '@/components/DevicesDetailScreen';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileProps {
  onShowOnboarding?: () => void;
}

const Profile: React.FC<ProfileProps> = ({ onShowOnboarding }) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleShowOnboarding = () => {
    if (onShowOnboarding) {
      onShowOnboarding();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      
      <div className="mb-6">
        <ProfileImageUploader />
      </div>

      <Tabs defaultValue="account">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="account" className="flex-1">Account</TabsTrigger>
          <TabsTrigger value="devices" className="flex-1">Devices</TabsTrigger>
          <TabsTrigger value="settings" className="flex-1">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <Card>
            <CardContent className="pt-6">
              <AccountInfoForm />
              <div className="mt-8">
                <PasswordChangeForm />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="devices">
          <DevicesDetailScreen />
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Export Data</h3>
                <p className="text-sm text-gray-500">Download all your health data as a CSV file</p>
                <DataExport />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Onboarding</h3>
                <p className="text-sm text-gray-500">Go through the onboarding process again</p>
                <Button variant="outline" onClick={handleShowOnboarding}>Start Onboarding</Button>
              </div>
              
              <div className="space-y-2 pt-4 border-t">
                <h3 className="text-lg font-medium text-red-500">Danger Zone</h3>
                <p className="text-sm text-gray-500">Sign out of your account</p>
                <Button variant="destructive" onClick={handleSignOut}>Sign Out</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
