import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronDown, ChevronRight, ChevronUp, Image } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface HelpSupportSectionProps {
  onBack: () => void;
}

const HelpSupportSection: React.FC<HelpSupportSectionProps> = ({ onBack }) => {
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<'main' | 'wear' | 'faq' | 'contact' | 'feedback'>('main');
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [featureRequest, setFeatureRequest] = useState(false);
  const [expandedFaqs, setExpandedFaqs] = useState<Record<string, boolean>>({});

  // Toggle FAQ expansion
  const toggleFaq = (id: string) => {
    setExpandedFaqs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Handle mood selection for feedback
  const handleMoodSelect = (mood: number) => {
    setSelectedMood(mood);
  };

  // Handle support form submission
  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Support request submitted",
      description: "Our team will contact you shortly."
    });
    setActiveSection('main');
  };

  // Handle feedback form submission
  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Thank you for your feedback!",
      description: "We appreciate your input."
    });
    setActiveSection('main');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Main Help Options Section */}
      {activeSection === 'main' && (
        <>
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center">
            <button className="mr-4" onClick={onBack}>
              <ArrowLeft className="h-5 w-5 text-gray-800" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Help & Support</h1>
          </div>
          
          {/* Help Options */}
          <div className="px-6 py-6">
            <div 
              className="p-5 bg-white border border-gray-200 rounded-lg shadow-sm mb-4 flex items-center"
              onClick={() => setActiveSection('wear')}
            >
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mr-4">
                <span className="text-blue-900">👋</span>
              </div>
              <div className="flex-1">
                <h3 className="text-gray-900 font-medium">How to Wear</h3>
                <p className="text-gray-600 text-sm">Learn the proper way to wear your Nestor</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
            
            <div 
              className="p-5 bg-white border border-gray-200 rounded-lg shadow-sm mb-4 flex items-center"
              onClick={() => setActiveSection('faq')}
            >
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mr-4">
                <span className="text-blue-900">❓</span>
              </div>
              <div className="flex-1">
                <h3 className="text-gray-900 font-medium">FAQs</h3>
                <p className="text-gray-600 text-sm">Find answers to common questions</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
            
            <div 
              className="p-5 bg-white border border-gray-200 rounded-lg shadow-sm mb-4 flex items-center"
              onClick={() => setActiveSection('contact')}
            >
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mr-4">
                <span className="text-blue-900">🎧</span>
              </div>
              <div className="flex-1">
                <h3 className="text-gray-900 font-medium">Contact Support</h3>
                <p className="text-gray-600 text-sm">Get help from our support team</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
            
            <div 
              className="p-5 bg-white border border-gray-200 rounded-lg shadow-sm mb-4 flex items-center"
              onClick={() => setActiveSection('feedback')}
            >
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mr-4">
                <span className="text-blue-900">💬</span>
              </div>
              <div className="flex-1">
                <h3 className="text-gray-900 font-medium">Submit Feedback</h3>
                <p className="text-gray-600 text-sm">Share your thoughts and suggestions</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </>
      )}

      {/* How to Wear Section */}
      {activeSection === 'wear' && (
        <>
          <div className="px-6 py-4 border-b border-gray-100 flex items-center">
            <button className="mr-4" onClick={() => setActiveSection('main')}>
              <ArrowLeft className="h-5 w-5 text-gray-800" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Wearing Your Nestor</h1>
          </div>
          
          <div className="px-6 py-6">
            {/* Carousel indicators */}
            <div className="flex justify-center mb-4">
              <div className="flex space-x-2">
                <div className="w-8 h-2 bg-blue-900 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              </div>
            </div>
            
            {/* Step 1 */}
            <div className="mb-6">
              <div className="h-64 mb-4 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <span className="block text-5xl mb-2">📱</span>
                  <span>Image: Person wearing Nestor device</span>
                </div>
              </div>
              <h3 className="text-gray-900 font-medium mb-2">Step 1: Position Device</h3>
              <p className="text-gray-600">Place Nestor on the underside of your wrist with the sensor side facing your skin.</p>
            </div>
            
            <div className="mt-auto pt-6">
              <Button 
                className="w-full py-6 bg-blue-900 text-white font-medium rounded-lg shadow-sm"
                onClick={() => setActiveSection('main')}
              >
                Got it
              </Button>
            </div>
          </div>
        </>
      )}

      {/* FAQs Section */}
      {activeSection === 'faq' && (
        <>
          <div className="px-6 py-4 border-b border-gray-100 flex items-center">
            <button className="mr-4" onClick={() => setActiveSection('main')}>
              <ArrowLeft className="h-5 w-5 text-gray-800" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">FAQs</h1>
          </div>
          
          <div className="px-6 py-6">
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button 
                  className="w-full flex justify-between items-center p-4 bg-white"
                  onClick={() => toggleFaq('faq1')}
                >
                  <span className="text-gray-900 font-medium">How long does the battery last?</span>
                  {expandedFaqs['faq1'] ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                {expandedFaqs['faq1'] && (
                  <div className="px-4 pb-4">
                    <p className="text-gray-600">Nestor's battery lasts up to 7 days on a single charge, depending on usage. You'll receive a notification when battery level drops below 20%.</p>
                  </div>
                )}
              </div>
              
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button 
                  className="w-full flex justify-between items-center p-4 bg-white"
                  onClick={() => toggleFaq('faq2')}
                >
                  <span className="text-gray-900 font-medium">Is Nestor water resistant?</span>
                  {expandedFaqs['faq2'] ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                {expandedFaqs['faq2'] && (
                  <div className="px-4 pb-4">
                    <p className="text-gray-600">Yes, Nestor is water resistant up to 50 meters (5 ATM). You can wear it while swimming or showering without concern.</p>
                  </div>
                )}
              </div>
              
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button 
                  className="w-full flex justify-between items-center p-4 bg-white"
                  onClick={() => toggleFaq('faq3')}
                >
                  <span className="text-gray-900 font-medium">How do I clean my Nestor?</span>
                  {expandedFaqs['faq3'] ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                {expandedFaqs['faq3'] && (
                  <div className="px-4 pb-4">
                    <p className="text-gray-600">Clean your Nestor regularly with a soft, dry cloth. For more thorough cleaning, you can use a slightly damp cloth with mild soap, then dry completely.</p>
                  </div>
                )}
              </div>
              
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button 
                  className="w-full flex justify-between items-center p-4 bg-white"
                  onClick={() => toggleFaq('faq4')}
                >
                  <span className="text-gray-900 font-medium">Can I wear Nestor with any watch?</span>
                  {expandedFaqs['faq4'] ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                {expandedFaqs['faq4'] && (
                  <div className="px-4 pb-4">
                    <p className="text-gray-600">Nestor is designed to be compatible with most watches. It works best with watches that have a band width between 18-24mm.</p>
                  </div>
                )}
              </div>
              
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button 
                  className="w-full flex justify-between items-center p-4 bg-white"
                  onClick={() => toggleFaq('faq5')}
                >
                  <span className="text-gray-900 font-medium">How accurate is the heart rate monitor?</span>
                  {expandedFaqs['faq5'] ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                {expandedFaqs['faq5'] && (
                  <div className="px-4 pb-4">
                    <p className="text-gray-600">Nestor's heart rate monitor is clinically validated to be within ±5 BPM of medical-grade equipment during normal daily activities.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Contact Support Section */}
      {activeSection === 'contact' && (
        <>
          <div className="px-6 py-4 border-b border-gray-100 flex items-center">
            <button className="mr-4" onClick={() => setActiveSection('main')}>
              <ArrowLeft className="h-5 w-5 text-gray-800" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Contact Support</h1>
          </div>
          
          <div className="px-6 py-6">
            <form onSubmit={handleSupportSubmit}>
              <div className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm text-gray-600 font-medium">Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900" 
                    placeholder="Your name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm text-gray-600 font-medium">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900" 
                    placeholder="your@email.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm text-gray-600 font-medium">Category</label>
                  <div className="relative">
                    <select 
                      id="category" 
                      className="w-full p-4 border border-gray-300 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                    >
                      <option>Device Issues</option>
                      <option>App Problems</option>
                      <option>Account Help</option>
                      <option>Billing Questions</option>
                      <option>Other</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm text-gray-600 font-medium">Message</label>
                  <textarea 
                    id="message" 
                    rows={4} 
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900" 
                    placeholder="Describe your issue in detail..."
                  ></textarea>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm text-gray-600 font-medium">Screenshot (optional)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-5 flex flex-col items-center justify-center">
                    <Image className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 text-center mb-3">Upload a screenshot to help us understand your issue</p>
                    <Button 
                      type="button" 
                      variant="outline"
                      className="px-4 py-2 bg-gray-100 text-gray-700 font-medium text-sm"
                    >
                      Upload Image
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <Button 
                  type="submit" 
                  className="w-full py-6 bg-blue-900 text-white font-medium rounded-lg shadow-sm"
                >
                  Submit
                </Button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Submit Feedback Section */}
      {activeSection === 'feedback' && (
        <>
          <div className="px-6 py-4 border-b border-gray-100 flex items-center">
            <button className="mr-4" onClick={() => setActiveSection('main')}>
              <ArrowLeft className="h-5 w-5 text-gray-800" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Share Feedback</h1>
          </div>
          
          <div className="px-6 py-6">
            <form onSubmit={handleFeedbackSubmit}>
              <div className="space-y-6">
                <div>
                  <p className="text-gray-600 mb-4">How has your experience been with Nestor?</p>
                  <div className="flex justify-between mb-4">
                    {[1, 2, 3, 4, 5].map(mood => (
                      <button 
                        key={mood}
                        type="button" 
                        className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${
                          selectedMood === mood 
                            ? 'border-blue-900 bg-blue-50' 
                            : 'border border-gray-300 bg-white'
                        }`}
                        onClick={() => handleMoodSelect(mood)}
                      >
                        {mood === 1 && '😞'}
                        {mood === 2 && '😐'}
                        {mood === 3 && '🙂'}
                        {mood === 4 && '😊'}
                        {mood === 5 && '😍'}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="feedback-message" className="text-sm text-gray-600 font-medium">Your feedback</label>
                  <textarea 
                    id="feedback-message" 
                    rows={5} 
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900" 
                    placeholder="Tell us what you think..."
                  ></textarea>
                </div>
                
                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        id="feature-request" 
                        className="sr-only"
                        checked={featureRequest}
                        onChange={() => setFeatureRequest(!featureRequest)}
                      />
                      <div className={`w-10 h-6 rounded-full ${featureRequest ? 'bg-blue-900' : 'bg-gray-200'}`}></div>
                      <div 
                        className={`dot absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          featureRequest ? 'transform translate-x-4' : ''
                        }`}
                      ></div>
                    </div>
                    <div className="ml-3 text-gray-700 font-medium">This is a feature request</div>
                  </label>
                </div>
              </div>
              
              <div className="mt-8">
                <Button 
                  type="submit"
                  className="w-full py-6 bg-blue-900 text-white font-medium rounded-lg shadow-sm"
                >
                  Send Feedback
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default HelpSupportSection; 