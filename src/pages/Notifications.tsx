
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Gear, ArrowLeft, ChevronDown } from 'lucide-react';
import { useNotifications, NotificationType } from '@/contexts/NotificationsContext';
import StatusBar from '@/components/StatusBar';
import BottomNavbar from '@/components/BottomNavbar';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

const Notifications = () => {
  const { notifications, markAsRead, clearAll, showEcgAlert } = useNotifications();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<'all' | NotificationType>('all');
  const [showSettings, setShowSettings] = useState(false);

  const handleNotificationClick = (id: string) => {
    markAsRead(id);
  };

  const handleGenerateEcgAlert = () => {
    showEcgAlert();
  };

  const filteredNotifications = activeCategory === 'all'
    ? notifications
    : notifications.filter(notification => notification.type === activeCategory);

  // Group notifications by date
  const groupedNotifications = filteredNotifications.reduce((groups, notification) => {
    const date = notification.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(notification);
    return groups;
  }, {} as Record<string, typeof notifications>);

  const renderNotificationIcon = (icon: string, bgColor: string, textColor: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'heart-pulse': <Bell className={textColor} />,
      'battery-quarter': <Bell className={textColor} />,
      'person-walking': <Bell className={textColor} />,
      'bed': <Bell className={textColor} />,
      'arrows-rotate': <Bell className={textColor} />,
      'water': <Bell className={textColor} />,
    };

    return (
      <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center flex-shrink-0`}>
        {iconMap[icon] || <Bell className={textColor} />}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <StatusBar />
      
      {showSettings ? (
        /* Settings View */
        <>
          <div className="px-6 pt-4 pb-3 border-b border-gray-100">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="mr-3"
                onClick={() => setShowSettings(false)}
              >
                <ArrowLeft className="text-gray-700" size={20} />
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">Notification Preferences</h1>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pb-24">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Bell className="text-nestor-blue" size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Mute All Notifications</h3>
                    <p className="text-sm text-gray-600">Temporarily silence all alerts</p>
                  </div>
                </div>
                <Switch />
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium text-gray-900 mb-3">Do Not Disturb</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-sm text-gray-600">From</label>
                    <Select defaultValue="10:00 PM">
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="9:00 PM">9:00 PM</SelectItem>
                        <SelectItem value="9:30 PM">9:30 PM</SelectItem>
                        <SelectItem value="10:00 PM">10:00 PM</SelectItem>
                        <SelectItem value="10:30 PM">10:30 PM</SelectItem>
                        <SelectItem value="11:00 PM">11:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm text-gray-600">To</label>
                    <Select defaultValue="7:00 AM">
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6:00 AM">6:00 AM</SelectItem>
                        <SelectItem value="6:30 AM">6:30 AM</SelectItem>
                        <SelectItem value="7:00 AM">7:00 AM</SelectItem>
                        <SelectItem value="7:30 AM">7:30 AM</SelectItem>
                        <SelectItem value="8:00 AM">8:00 AM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Health Alerts Section */}
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Health Alerts</h2>
              
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Heart Rate</h3>
                    <p className="text-sm text-gray-600">Abnormal heart rate alerts</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Sleep Quality</h3>
                    <p className="text-sm text-gray-600">Sleep pattern insights</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Stress Level</h3>
                    <p className="text-sm text-gray-600">High stress notifications</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Irregular Rhythm</h3>
                    <p className="text-sm text-gray-600">Potential arrhythmia alerts</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
            
            {/* Lifestyle Alerts Section */}
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Lifestyle Nudges</h2>
              
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Activity Goals</h3>
                    <p className="text-sm text-gray-600">Step and movement reminders</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Hydration</h3>
                    <p className="text-sm text-gray-600">Water intake reminders</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Stand Reminders</h3>
                    <p className="text-sm text-gray-600">Prompts to reduce sitting time</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
            
            {/* Device Alerts Section */}
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Device Alerts</h2>
              
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Battery Status</h3>
                    <p className="text-sm text-gray-600">Low battery notifications</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Firmware Updates</h3>
                    <p className="text-sm text-gray-600">Available update alerts</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Connection Status</h3>
                    <p className="text-sm text-gray-600">Device disconnection alerts</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
            
            {/* Save Button */}
            <div className="px-6 py-6">
              <Button 
                className="w-full py-6 bg-nestor-blue"
                onClick={() => {
                  setShowSettings(false);
                  toast.success("Notification preferences saved");
                }}
              >
                Save Preferences
              </Button>
            </div>
          </div>
        </>
      ) : (
        /* Notifications View */
        <>
          <div className="px-6 pt-4 pb-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-900">Notifications</h1>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowSettings(true)}
              >
                <Gear className="text-gray-700" size={20} />
              </Button>
            </div>
          </div>
          
          <div className="px-6 py-3 flex space-x-2 overflow-x-auto hide-scrollbar border-b border-gray-100">
            <Button 
              variant={activeCategory === 'all' ? 'default' : 'outline'} 
              className={activeCategory === 'all' ? 'bg-nestor-blue text-white' : 'bg-gray-100 text-gray-700'} 
              onClick={() => setActiveCategory('all')}
            >
              All
            </Button>
            <Button 
              variant={activeCategory === 'health' ? 'default' : 'outline'} 
              className={activeCategory === 'health' ? 'bg-nestor-blue text-white' : 'bg-gray-100 text-gray-700'} 
              onClick={() => setActiveCategory('health')}
            >
              Health Alerts
            </Button>
            <Button 
              variant={activeCategory === 'device' ? 'default' : 'outline'} 
              className={activeCategory === 'device' ? 'bg-nestor-blue text-white' : 'bg-gray-100 text-gray-700'} 
              onClick={() => setActiveCategory('device')}
            >
              Device Alerts
            </Button>
            <Button 
              variant={activeCategory === 'lifestyle' ? 'default' : 'outline'} 
              className={activeCategory === 'lifestyle' ? 'bg-nestor-blue text-white' : 'bg-gray-100 text-gray-700'} 
              onClick={() => setActiveCategory('lifestyle')}
            >
              Lifestyle
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto pb-24">
            {/* Test ECG Alert Button - For demo purposes */}
            <div className="px-6 py-2">
              <Button 
                variant="destructive" 
                className="w-full mb-2"
                onClick={handleGenerateEcgAlert}
              >
                Simulate ECG Anomaly
              </Button>
            </div>
            
            {Object.entries(groupedNotifications).length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 p-6 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Bell className="text-gray-400" size={24} />
                </div>
                <p className="text-gray-500">No notifications to display</p>
              </div>
            ) : (
              Object.entries(groupedNotifications).map(([date, dateNotifications]) => (
                <div key={date} className="pt-4">
                  <div className="px-6 mb-2">
                    <h2 className="text-sm font-medium text-gray-500">{date}</h2>
                  </div>
                  
                  {dateNotifications.map(notification => (
                    <div 
                      key={notification.id}
                      className="px-6 py-4 border-b border-gray-100"
                      onClick={() => handleNotificationClick(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        {renderNotificationIcon(notification.icon, notification.iconBgColor, notification.iconColor)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-medium text-gray-900">{notification.title}</h3>
                            <span className="text-xs text-gray-500">{notification.time}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{notification.description}</p>
                          <div className="flex space-x-2">
                            {notification.actions?.primary && (
                              <Button 
                                className="px-3 py-1.5 bg-nestor-blue text-white text-xs rounded-lg h-auto"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  notification.actions?.primary?.action();
                                }}
                              >
                                {notification.actions.primary.label}
                              </Button>
                            )}
                            {notification.actions?.secondary && (
                              <Button 
                                variant="outline"
                                className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-lg h-auto"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  notification.actions?.secondary?.action();
                                }}
                              >
                                {notification.actions.secondary.label}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </>
      )}
      
      <BottomNavbar />
    </div>
  );
};

export default Notifications;
