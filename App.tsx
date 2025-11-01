import React, { useState, useEffect } from 'react';
import { Theme, View, Language } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import CropScanner from './components/CropScanner';
import Chatbot from './components/Chatbot';

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(Theme.Light);
  const [activeView, setActiveView] = useState<View>(View.Dashboard);
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === Theme.Dark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const renderView = () => {
    switch (activeView) {
      case View.Dashboard:
        return <Dashboard language={language} />;
      case View.Scanner:
        return <CropScanner language={language} />;
      case View.Chatbot:
        return <Chatbot language={language} />;
      default:
        return <Dashboard language={language} />;
    }
  };

  return (
    <div className={`min-h-screen font-sans bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300`}>
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1499529112087-3cb3b73cec95?q=80&w=1974&auto=format&fit=crop')", opacity: theme === 'dark' ? 0.1 : 0.2 }}
      />
      <div className="relative min-h-screen flex flex-col">
        <Header 
          theme={theme} 
          setTheme={setTheme} 
          activeView={activeView} 
          setActiveView={setActiveView}
          language={language}
          setLanguage={setLanguage}
        />
        <main className="flex-grow pt-16">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;
