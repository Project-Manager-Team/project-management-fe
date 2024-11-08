'use client';
import { useAppStore } from './store/appStore';
import React, { useEffect } from "react";
import Notification from "./components/Notification";
import Profile from "./components/Profile";
import HistoryBar from "./components/HistoryBar";
import Table from "./components/Table";

export default function Home() {
  const { history, setHistory } = useAppStore();

  // Initialize history with a default item if empty
  useEffect(() => {
    if (!history || history.length === 0) {
      setHistory([{
        id: 0,
        url: '/api/project/personal/',
        title: 'Home'
      }]);
    }
  }, [history, setHistory]);

  const currentItem = history && history.length > 0 
    ? history[history.length - 1] 
    : { id: 0, url: '/api/project/personal/', title: 'Home' };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header Section */}
      <header className="fixed top-0 left-0 right-0 bg-gray-900 z-50 border-b border-gray-800">
        <div className="w-full px-4">  {/* Removed container class to allow full width */}
          <div className="h-16 flex items-center">
            {/* Left side - No extra wrapper div */}
            <HistoryBar />
            
            {/* Right side - Push to the right */}
            <div className="ml-auto flex items-center space-x-6">
              <Notification />
              <Profile />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-20">
        <div className="bg-gray-800 rounded-lg shadow-lg">
          <Table current={currentItem} />
        </div>
      </main>
    </div>
  );
}
