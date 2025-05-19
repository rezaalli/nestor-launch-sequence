import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface AccessibilityControlsProps {
  className?: string;
  showLabel?: boolean;
}

// Define SpeechRecognition types for TypeScript
interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
    length: number;
  };
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

// Add types to global Window interface
declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

/**
 * Accessibility Controls component providing voice navigation and text size customization
 */
const AccessibilityControls: React.FC<AccessibilityControlsProps> = ({
  className = '',
  showLabel = true
}) => {
  // Get animation settings from theme
  const { animationsEnabled, setAnimationsEnabled, reducedMotion } = useTheme();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [textSize, setTextSize] = useState(() => {
    // Get stored text size or default to 100%
    return parseInt(localStorage.getItem('nestor-text-size') || '100');
  });
  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem('nestor-high-contrast') === 'true';
  });
  
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognitionAPI) {
        speechRecognitionRef.current = new SpeechRecognitionAPI();
        speechRecognitionRef.current.continuous = true;
        speechRecognitionRef.current.interimResults = false;
        
        // Handle speech recognition results
        speechRecognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
          handleVoiceCommand(transcript);
        };
        
        // Handle errors
        speechRecognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
        };
        
        // Handle end
        speechRecognitionRef.current.onend = () => {
          if (isListening) {
            // Restart if we're supposed to be listening but it stopped
            speechRecognitionRef.current?.start();
          }
        };
      }
      
      // Initialize speech synthesis
      if ('speechSynthesis' in window) {
        speechSynthesisRef.current = new SpeechSynthesisUtterance();
      }
    }
    
    return () => {
      // Clean up
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isListening]);
  
  // Apply text size to document
  useEffect(() => {
    document.documentElement.style.fontSize = `${textSize}%`;
    localStorage.setItem('nestor-text-size', textSize.toString());
  }, [textSize]);
  
  // Apply high contrast mode
  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    localStorage.setItem('nestor-high-contrast', highContrast.toString());
  }, [highContrast]);
  
  // Toggle voice navigation
  const toggleVoiceNavigation = () => {
    if (isListening) {
      // Stop listening
      speechRecognitionRef.current?.stop();
      setIsListening(false);
      speak('Voice navigation off');
    } else {
      // Start listening
      try {
        speechRecognitionRef.current?.start();
        setIsListening(true);
        speak('Voice navigation on. Say "help" for commands.');
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    }
  };
  
  // Handle voice commands
  const handleVoiceCommand = (command: string) => {
    console.log('Voice command:', command);
    
    // Navigation commands
    if (command.includes('go to home') || command === 'home') {
      speak('Going to home page');
      window.location.href = '/';
    } else if (command.includes('go to profile') || command === 'profile') {
      speak('Going to profile page');
      window.location.href = '/profile';
    } else if (command.includes('go back') || command === 'back') {
      speak('Going back');
      window.history.back();
    }
    // UI commands
    else if (command.includes('increase text') || command === 'bigger text') {
      setTextSize(prev => Math.min(prev + 10, 150));
      speak('Increasing text size');
    } else if (command.includes('decrease text') || command === 'smaller text') {
      setTextSize(prev => Math.max(prev - 10, 70));
      speak('Decreasing text size');
    } else if (command.includes('reset text')) {
      setTextSize(100);
      speak('Text size reset');
    } else if (command.includes('high contrast') || command === 'contrast') {
      setHighContrast(prev => !prev);
      speak(highContrast ? 'High contrast off' : 'High contrast on');
    } else if (command.includes('reduce motion') || command === 'stop animation') {
      setAnimationsEnabled(false);
      speak('Reduced motion enabled');
    } else if (command.includes('enable motion') || command === 'start animation') {
      setAnimationsEnabled(true);
      speak('Animations enabled');
    } else if (command === 'help') {
      speak('Available commands: go to home, go to profile, go back, increase text, decrease text, reset text, high contrast, reduce motion, enable motion, close menu');
    } else if (command.includes('close menu') || command === 'close') {
      setIsOpen(false);
      speak('Menu closed');
    }
  };
  
  // Text-to-speech function
  const speak = (text: string) => {
    if (!speechSynthesisRef.current || typeof window === 'undefined') return;
    
    // Cancel any ongoing speech
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      // Set up new utterance
      speechSynthesisRef.current.text = text;
      speechSynthesisRef.current.rate = 1.0;
      speechSynthesisRef.current.pitch = 1.0;
      speechSynthesisRef.current.volume = 1.0;
      
      // Get available voices and use a good one if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Samantha') || 
        voice.name.includes('Google US English Female') ||
        voice.name.includes('Microsoft Zira')
      );
      
      if (preferredVoice) {
        speechSynthesisRef.current.voice = preferredVoice;
      }
      
      // Speak the text
      window.speechSynthesis.speak(speechSynthesisRef.current);
    }
  };
  
  return (
    <div className={`${className}`}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center"
            aria-label="Accessibility options"
          >
            <svg className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 8V3M12 21V16M8 12H3M21 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {showLabel && <span>Accessibility</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <Tabs defaultValue="display">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="display">Display</TabsTrigger>
              <TabsTrigger value="navigation">Navigation</TabsTrigger>
            </TabsList>
            
            <TabsContent value="display" className="space-y-4 mt-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="text-size">Text Size: {textSize}%</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setTextSize(100)}
                    aria-label="Reset text size"
                  >
                    Reset
                  </Button>
                </div>
                <Slider
                  id="text-size"
                  min={70}
                  max={150}
                  step={5}
                  value={[textSize]}
                  onValueChange={(value) => setTextSize(value[0])}
                  aria-label="Adjust text size"
                />
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="high-contrast">High Contrast</Label>
                <Switch
                  id="high-contrast"
                  checked={highContrast}
                  onCheckedChange={setHighContrast}
                  aria-label="Toggle high contrast mode"
                />
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="reduce-motion">Reduce Motion</Label>
                <Switch
                  id="reduce-motion"
                  checked={!animationsEnabled}
                  onCheckedChange={(checked) => setAnimationsEnabled(!checked)}
                  disabled={reducedMotion}
                  aria-label="Toggle reduced motion"
                />
              </div>
              
              {reducedMotion && (
                <p className="text-xs text-muted-foreground">
                  Your system has "prefers-reduced-motion" set, so animations are automatically disabled.
                </p>
              )}
            </TabsContent>
            
            <TabsContent value="navigation" className="space-y-4 mt-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="voice-navigation">Voice Navigation</Label>
                <Switch
                  id="voice-navigation"
                  checked={isListening}
                  onCheckedChange={toggleVoiceNavigation}
                  aria-label="Toggle voice navigation"
                />
              </div>
              
              {isListening && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Voice Commands</CardTitle>
                    <CardDescription className="text-xs">Try saying these commands:</CardDescription>
                  </CardHeader>
                  <CardContent className="text-xs space-y-1">
                    <p><strong>Navigation:</strong> "go to home", "go to profile", "go back"</p>
                    <p><strong>Text Size:</strong> "increase text", "decrease text", "reset text"</p>
                    <p><strong>Display:</strong> "high contrast", "reduce motion"</p>
                    <p><strong>Help:</strong> "help", "close menu"</p>
                  </CardContent>
                </Card>
              )}
              
              <div className="text-xs text-muted-foreground">
                <p>Voice navigation requires microphone access and is only available in supported browsers.</p>
              </div>
              
              <div className="pt-2">
                <Button 
                  onClick={() => speak("This is a test of the text to speech feature")}
                  size="sm"
                  className="w-full"
                >
                  Test Text-to-Speech
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-between items-center mt-4 pt-2 border-t">
            <div className="text-xs text-muted-foreground">
              <a 
                href="/accessibility" 
                className="underline hover:text-foreground"
                onClick={(e) => {
                  e.preventDefault();
                  setIsOpen(false);
                  // You would typically navigate to the full accessibility page here
                }}
              >
                Accessibility Statement
              </a>
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default AccessibilityControls; 