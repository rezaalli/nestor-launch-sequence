# Nestor Launch Sequence

## Project Overview
Nestor is a health and wellness tracking application that helps users monitor their daily health metrics, nutrition, and lifestyle factors. The app provides personalized insights and recommendations based on collected data.

## Key Features
- User authentication and profile management
- Daily health assessments
- Nutrition tracking and meal logging
- Lifestyle check-ins
- Trends and insights visualizations
- Notifications for important health events

## Environment Setup

### Required Environment Variables
Create a `.env` file in the root directory with the following variables:

```
# Supabase configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Development settings (set to 'true' only in development)
VITE_ENABLE_DEV_MODE=false

# App settings
VITE_APP_NAME=Nestor
```

## Development

### Installation
```bash
npm install
```

### Running the Development Server
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```

## Recent Improvements
- Enhanced security by removing hardcoded credentials and implementing proper environment variable usage
- Improved authentication flow with better error handling
- Fixed development mode toggle to ensure proper authentication in production

## Planned Improvements
- Implement route-based code splitting for better performance
- Create a more robust error handling system
- Add comprehensive loading states to all data-fetching operations
- Implement React.memo for performance-critical components
- Add comprehensive test coverage

## Tech Stack
- React with TypeScript
- Vite for bundling
- Supabase for backend and authentication
- Tailwind CSS with shadcn/ui components
- React Router for navigation
- React Query for data fetching and caching
- Recharts for data visualization

# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/d0604425-8585-4716-bdb4-91caa4a5cf16

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/d0604425-8585-4716-bdb4-91caa4a5cf16) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/d0604425-8585-4716-bdb4-91caa4a5cf16) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Health Feature Implementation - Phase 3

### Health Forecast System

The Nestor app now includes an advanced Health Forecast system that predicts future health trends and provides personalized interventions:

#### Core Features

- **Weather-Inspired Prediction System**: Visual health forecasts showing predicted trends for heart rate, recovery, stress, sleep quality, and activity levels
- **Multi-Timeframe Predictions**: 7-day, 30-day, and 90-day forecasts
- **Detailed Metric Insights**: Comprehensive analysis of each health metric, including contributing factors
- **Personalized Interventions**: AI-suggested actions to improve predicted outcomes
- **Prediction Accuracy Tracking**: Monitoring system that tracks how accurate past predictions have been
- **Habit Formation Tracking**: Tool for converting forecast interventions into trackable habits with streaks and completion metrics

#### Integration Points

- Available directly from the Insights page
- Accessible via the Advanced Insights page under the "Forecast" tab
- Follows the established design language with adaptive colors and motion system

#### Technical Highlights

- Built with React, TypeScript, and Framer Motion for smooth animations
- Adaptive UI respecting accessibility settings
- Interactive visualizations with tooltips and detailed breakdowns
- Integrated with the existing adaptive color system

### How to Use

1. **Access the Forecast**: Navigate to the Insights page and look for the Health Forecast card, or go to Advanced Insights and select the Forecast tab
2. **View Predictions**: Select your desired timeframe (7, 30, or 90 days) to see predictions for all health metrics
3. **Explore Details**: Click on any metric card to see detailed predictions and contributing factors
4. **Personalized Interventions**: Review suggested interventions at the bottom of the page
5. **Check Accuracy**: Toggle to the Accuracy view to see how reliable previous predictions have been
6. **Track Habits**: Switch to the Habits tab to track habits created from forecast interventions

### Habit Formation System

The Habit Formation feature complements the Health Forecast by helping users track their progress with building habits suggested by the predictive system:

#### Key Features

- **Forecast-Driven Habits**: Habits are directly tied to forecast interventions with predicted impact
- **Visual Tracking**: Calendar view showing completion status for each day
- **Streak Tracking**: Current and longest streak monitoring for motivation
- **Impact Visualization**: Visual representation of how habits affect different health metrics
- **Adaptive Categorization**: Habits organized by category (sleep, activity, nutrition, mindfulness)
- **Progress Indicators**: Clear visualization of completion rate and progress toward goals

This system creates a virtuous cycle where predictions lead to habit formation, which improves health metrics, leading to better future predictions.

---
