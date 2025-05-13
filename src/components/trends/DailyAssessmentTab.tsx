
import React from 'react';
import { useAssessment } from '@/contexts/AssessmentContext';
import { cn } from '@/lib/utils';

const DailyAssessmentTab = () => {
  const { healthPatterns } = useAssessment();

  return (
    <div className="px-4 py-6">
      {/* Weekly Summary */}
      <section className="mb-8">
        <div className="bg-white p-5 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Weekly Summary</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            This week suggests a pattern of increased stress and reduced self-care. Indicators point to disrupted sleep coinciding with higher caffeine intake. Your body could benefit from more consistent meal timing and gentle movement to support your overall wellbeing.
          </p>
        </div>
      </section>

      {/* Category Insights */}
      <section className="space-y-4">
        <CategoryInsight 
          title="General Wellness"
          icon={<i className="fa-solid fa-heart-pulse text-green-600"></i>}
          iconBg="bg-green-100"
          iconColor="text-green-600"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Weekly Wellness Trend</span>
              <div className="flex space-x-1">
                <div className="w-2 h-8 rounded-full bg-yellow-500"></div>
                <div className="w-2 h-6 rounded-full bg-green-500"></div>
                <div className="w-2 h-4 rounded-full bg-red-500"></div>
                <div className="w-2 h-7 rounded-full bg-yellow-500"></div>
                <div className="w-2 h-5 rounded-full bg-green-500"></div>
              </div>
            </div>
            <p className="text-sm text-gray-500">Overall wellness fluctuated, with moderate improvement toward week's end</p>
          </div>
        </CategoryInsight>

        <CategoryInsight 
          title="Mental Health"
          icon={<i className="fa-solid fa-brain text-purple-600"></i>}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Weekly Stress Level</span>
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
              </div>
            </div>
            <p className="text-sm text-gray-500">Elevated stress levels reported on 3 days, with anxiety peaks mid-week</p>
          </div>
        </CategoryInsight>

        <CategoryInsight 
          title="Caffeine & Substances"
          icon={<i className="fa-solid fa-mug-hot text-amber-600"></i>}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
        >
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Caffeine Intake</span>
              <span className="text-sm text-red-600">Above Average</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full">
              <div className="h-2 bg-amber-500 rounded-full" style={{width: '85%'}}></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Caffeine consumption exceeded 300mg on 4 days this week</p>
          </div>
        </CategoryInsight>

        <CategoryInsight 
          title="Nutrition"
          icon={<i className="fa-solid fa-utensils text-orange-600"></i>}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
        >
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Balanced Meals</span>
              <span className="text-sm text-yellow-600">3/5 Days</span>
            </div>
            <div className="grid grid-cols-5 gap-1">
              <div className="h-2 bg-orange-500 rounded-full"></div>
              <div className="h-2 bg-orange-500 rounded-full"></div>
              <div className="h-2 bg-orange-500 rounded-full"></div>
              <div className="h-2 bg-gray-200 rounded-full"></div>
              <div className="h-2 bg-gray-200 rounded-full"></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Meal timing consistency could be improved</p>
          </div>
        </CategoryInsight>

        <CategoryInsight 
          title="Physical Activity"
          icon={<i className="fa-solid fa-person-running text-blue-600"></i>}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        >
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Days</span>
              <span className="text-sm text-yellow-600">2/5 Target Days</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-2 flex-grow rounded-full bg-blue-900"></div>
              <div className="h-2 flex-grow rounded-full bg-blue-900"></div>
              <div className="h-2 flex-grow rounded-full bg-gray-200"></div>
              <div className="h-2 flex-grow rounded-full bg-gray-200"></div>
              <div className="h-2 flex-grow rounded-full bg-gray-200"></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">More sedentary days than usual this week</p>
          </div>
        </CategoryInsight>

        <CategoryInsight 
          title="Hydration"
          icon={<i className="fa-solid fa-droplet text-blue-600"></i>}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        >
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Daily Target Achievement</span>
              <span className="text-sm text-red-600">Below Target</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full">
              <div className="h-2 bg-blue-500 rounded-full" style={{width: '60%'}}></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Hydration was below 1L on 4 days this week</p>
          </div>
        </CategoryInsight>

        <CategoryInsight 
          title="Cognitive & Emotional"
          icon={<i className="fa-solid fa-lightbulb text-indigo-600"></i>}
          iconBg="bg-indigo-100"
          iconColor="text-indigo-600"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Focus Quality</span>
              <span className="text-sm text-yellow-600">Moderate</span>
            </div>
            <div className="flex space-x-2">
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1">Morning</div>
                <div className="h-1.5 bg-indigo-200 rounded-full">
                  <div className="h-1.5 bg-indigo-600 rounded-full" style={{width: '70%'}}></div>
                </div>
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1">Afternoon</div>
                <div className="h-1.5 bg-indigo-200 rounded-full">
                  <div className="h-1.5 bg-indigo-600 rounded-full" style={{width: '45%'}}></div>
                </div>
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1">Evening</div>
                <div className="h-1.5 bg-indigo-200 rounded-full">
                  <div className="h-1.5 bg-indigo-600 rounded-full" style={{width: '60%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </CategoryInsight>

        <CategoryInsight 
          title="Chronic Conditions"
          icon={<i className="fa-solid fa-star-of-life text-rose-600"></i>}
          iconBg="bg-rose-100"
          iconColor="text-rose-600"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Condition Status</span>
              <span className="text-sm text-yellow-600">Mild Flare-up</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <i className="fa-solid fa-triangle-exclamation text-yellow-500"></i>
              <span>Minor symptoms noted on 2 days</span>
            </div>
            <p className="text-sm text-gray-500">Consider reviewing trigger patterns</p>
          </div>
        </CategoryInsight>

        <CategoryInsight 
          title="Symptoms & Notes"
          icon={<i className="fa-solid fa-notes-medical text-red-600"></i>}
          iconBg="bg-red-100"
          iconColor="text-red-600"
        >
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <i className="fa-solid fa-circle-exclamation text-red-500"></i>
              <span>Recurring headaches reported (3 days)</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <i className="fa-solid fa-circle-exclamation text-yellow-500"></i>
              <span>Afternoon fatigue noted (4 days)</span>
            </div>
          </div>
        </CategoryInsight>
      </section>
    </div>
  );
};

// Reusable component for category insights
interface CategoryInsightProps {
  title: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  children: React.ReactNode;
}

const CategoryInsight = ({ title, icon, iconBg, iconColor, children }: CategoryInsightProps) => (
  <div className="bg-white p-4 rounded-xl shadow-sm">
    <div className="flex items-center space-x-3 mb-3">
      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", iconBg)}>
        {icon}
      </div>
      <h3 className="font-medium text-gray-900">{title}</h3>
    </div>
    {children}
  </div>
);

export default DailyAssessmentTab;
