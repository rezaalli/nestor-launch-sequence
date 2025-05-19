import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Eye, EyeOff, User, Mail, Calendar, Check } from 'lucide-react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import PasswordChangeForm from './PasswordChangeForm';
import ProfileImageUploader from './ProfileImageUploader';

// Define form schema with validation rules
const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().optional(),
  dateOfBirth: z.string().optional(),
  unitPreference: z.enum(['metric', 'imperial']),
});

type FormData = z.infer<typeof formSchema>;

const AccountInfoForm: React.FC = () => {
  const { user, updateUser, isLoading } = useUser();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [defaultValues, setDefaultValues] = useState<FormData>({
    name: '',
    email: '',
    password: '••••••••••',
    dateOfBirth: '',
    unitPreference: 'metric',
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Update form when user data is loaded
  useEffect(() => {
    if (user) {
      setDefaultValues({
        name: user.name || '',
        email: user.email || '',
        password: '••••••••••',
        dateOfBirth: '',
        unitPreference: user.unitPreference || 'metric',
      });
      
      form.reset({
        name: user.name || '',
        email: user.email || '',
        password: '••••••••••',
        dateOfBirth: '',
        unitPreference: user.unitPreference || 'metric',
      });
    }
  }, [user, form]);

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to update your profile",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Update user context with form data
      updateUser({
        name: data.name,
        email: data.email,
        unitPreference: data.unitPreference,
      });
      
      toast({
        title: "Profile updated",
        description: "Your account information has been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="text-center p-4">Loading user data...</div>;
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Profile Photo */}
          <div className="flex flex-col items-center space-y-4">
            <ProfileImageUploader size="lg" centered={true} />
          </div>

          {/* Name Field */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm text-gray-600 font-medium">Full Name</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      placeholder="Enter your name"
                      {...field}
                      className="w-full pl-4 pr-10 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                    />
                  </FormControl>
                  <User className="h-5 w-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm text-gray-600 font-medium">Email Address</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      {...field}
                      className="w-full pl-4 pr-10 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                    />
                  </FormControl>
                  <Mail className="h-5 w-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm text-gray-600 font-medium">Password</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      type={showPassword ? "text" : "password"}
                      readOnly
                      {...field}
                      className="w-full pl-4 pr-10 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                    />
                  </FormControl>
                  <button 
                    type="button" 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <Button
                  type="button"
                  variant="link"
                  className="text-sm text-blue-900 font-medium p-0 h-auto mt-1"
                  onClick={() => setIsPasswordDialogOpen(true)}
                >
                  Change Password
                </Button>
              </FormItem>
            )}
          />
          
          {/* Date of Birth Field */}
          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm text-gray-600 font-medium">Date of Birth</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      type="date"
                      placeholder="Select your date of birth"
                      {...field}
                      className="w-full pl-4 pr-10 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                    />
                  </FormControl>
                  <Calendar className="h-5 w-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Unit Preference */}
          <FormField
            control={form.control}
            name="unitPreference"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-sm text-gray-600 font-medium">Unit Preference</FormLabel>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <input 
                      type="radio" 
                      id="metric" 
                      className="peer hidden" 
                      checked={field.value === 'metric'}
                      onChange={() => form.setValue('unitPreference', 'metric')}
                    />
                    <label 
                      htmlFor="metric" 
                      className={`flex flex-col items-center justify-center w-full p-4 text-center border border-gray-300 rounded-lg cursor-pointer transition-colors ${
                        field.value === 'metric' 
                          ? 'bg-blue-900 text-white border-blue-900' 
                          : 'text-gray-700'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                      <span>Metric</span>
                      <span className="text-xs mt-1 opacity-75">cm, kg, km</span>
                    </label>
                  </div>
                  <div className="relative">
                    <input 
                      type="radio" 
                      id="imperial" 
                      className="peer hidden"
                      checked={field.value === 'imperial'}
                      onChange={() => form.setValue('unitPreference', 'imperial')}
                    />
                    <label 
                      htmlFor="imperial" 
                      className={`flex flex-col items-center justify-center w-full p-4 text-center border border-gray-300 rounded-lg cursor-pointer transition-colors ${
                        field.value === 'imperial' 
                          ? 'bg-blue-900 text-white border-blue-900' 
                          : 'text-gray-700'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm2-2h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2z" clipRule="evenodd" />
                      </svg>
                      <span>Imperial</span>
                      <span className="text-xs mt-1 opacity-75">in, lb, mi</span>
                    </label>
                  </div>
                </div>
              </FormItem>
            )}
          />
          
          {/* Save Button */}
          <div className="pt-6">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-blue-900 text-white font-medium rounded-lg shadow-sm flex items-center justify-center space-x-2"
            >
              <Check className="h-4 w-4" />
              <span>Save Changes</span>
            </Button>
          </div>
        </form>
      </Form>

      {/* Password Change Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <PasswordChangeForm />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AccountInfoForm;
