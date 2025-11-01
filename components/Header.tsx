import React from 'react';
import { Theme, View, Language } from '../types';
import { translations } from '../constants';
import { SunIcon, MoonIcon, DashboardIcon, CameraIcon, BotIcon, LogoIcon } from './Icons';

interface HeaderProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  activeView: View;
  setActiveView: (view: View) => void;
  language: Language;
  setLanguage: (language: Language) => void;
}

const Header: React.FC<HeaderProps> = ({ theme, setTheme, activeView, setActiveView, language, setLanguage }) => {
  const t = translations[language];

  const toggleTheme = () => {
    setTheme(theme === Theme.Light ? Theme.Dark : Theme.Light);
  };
  
  const NavButton = ({ view, icon, label }: { view: View; icon: React.ReactNode; label: string }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`flex flex-col sm:flex-row items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        activeView === view
          ? 'bg-primary/20 text-primary-dark dark:text-primary-light'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <header className="fixed top-0 left-0 right-0 bg-gradient-to-b from-white/80 to-white/60 dark:from-gray-900/80 dark:to-gray-900/60 backdrop-blur-sm shadow-md z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <LogoIcon className="h-8 w-8 text-primary-dark dark:text-primary-light" />
            <h1 className="text-xl sm:text-2xl font-bold text-primary-dark dark:text-primary-light tracking-tight">{t.title}</h1>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <NavButton view={View.Dashboard} icon={<DashboardIcon className="w-5 h-5"/>} label={t.dashboard} />
            <NavButton view={View.Scanner} icon={<CameraIcon className="w-5 h-5"/>} label={t.scanner} />
            <NavButton view={View.Chatbot} icon={<BotIcon className="w-5 h-5"/>} label={t.chatbot} />
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md py-2 pl-3 pr-8 border border-transparent focus:outline-none focus:ring-2 focus:ring-primary transition-colors text-sm"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="ta">தமிழ்</option>
              <option value="pa">ਪੰਜਾਬੀ</option>
              <option value="bn">বাংলা</option>
              <option value="mr">मराठी</option>
              <option value="te">తెలుగు</option>
            </select>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              aria-label={theme === 'light' ? t.darkMode : t.lightMode}
            >
              {theme === Theme.Light ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;