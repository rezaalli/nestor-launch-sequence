
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import ProfileImageUploader from './ProfileImageUploader';
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";

// Define form schema with validation rules
const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  unitPreference: z.enum(['metric', 'imperial']),
});

type FormData = z.infer<typeof formSchema>;

const AccountInfoForm: React.FC = () => {
  const { user, updateUser } = useUser();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      unitPreference: user.unitPreference,
    },
  });

  const onSubmit = async (data: FormData) => {
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

  return (
    <div className="space-y-6">
      <div className="flex justify-center mb-8">
        <ProfileImageUploader size="lg" />
      </div>
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            placeholder="Enter your name"
            {...form.register('name')}
          />
          {form.formState.errors.name && (
            <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            {...form.register('email')}
          />
          {form.formState.errors.email && (
            <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label>Unit Preference</Label>
          <RadioGroup
            value={form.watch('unitPreference')}
            onValueChange={(value) => form.setValue('unitPreference', value as 'metric' | 'imperial')}
            className="grid grid-cols-2 gap-4"
          >
            <div className="relative">
              <RadioGroupItem
                value="imperial"
                id="imperial"
                className="peer sr-only"
              />
              <Label
                htmlFor="imperial"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-nestor-blue [&:has([data-state=checked])]:border-nestor-blue"
              >
                <span>Imperial</span>
                <span className="text-xs text-gray-500">°F, lbs, miles</span>
              </Label>
            </div>
            <div className="relative">
              <RadioGroupItem
                value="metric"
                id="metric"
                className="peer sr-only"
              />
              <Label
                htmlFor="metric"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-nestor-blue [&:has([data-state=checked])]:border-nestor-blue"
              >
                <span>Metric</span>
                <span className="text-xs text-gray-500">°C, kg, km</span>
              </Label>
            </div>
          </RadioGroup>
        </div>
        
        <Button
          type="submit"
          className="w-full mt-6"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving Changes..." : "Save Changes"}
        </Button>
      </form>
      
      <div className="border-t pt-4">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => window.location.href = '#password-section'}
        >
          Change Password
        </Button>
      </div>
    </div>
  );
};

export default AccountInfoForm;
