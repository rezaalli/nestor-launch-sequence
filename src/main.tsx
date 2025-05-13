
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add Inter font link to document head
const interFontLink = document.createElement('link');
interFontLink.rel = 'stylesheet';
interFontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;500;600;700;800;900&display=swap';
document.head.appendChild(interFontLink);

createRoot(document.getElementById("root")!).render(<App />);
