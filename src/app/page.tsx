"use client";
import { useAppStore } from "./store/appStore";
import React, { useEffect } from "react";
import Notification from "./components/Notification";
import Profile from "./components/Profile";
import HistoryBar from "./components/HistoryBar";
import Board from "./components/Board/components";
import ThemeToggle from "./components/ThemeToggle";

export default function Home() {
  const { history, setHistory } = useAppStore();
  // const { theme } = useTheme();

  // Initialize history with a default item if empty
  useEffect(() => {
    if (!history || history.length === 0) {
      setHistory([
        {
          id: 0,
          url: "/api/project/personal/",
          title: "Root",
        },
      ]);
    }
  }, [history, setHistory]);

  const currentItem =
    history && history.length > 0
      ? history[history.length - 1]
      : { id: 0, url: "/api/project/personal/", title: "Root" };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Header Section */}
      <header className="fixed top-0 left-0 right-0 bg-[var(--background)] border-b border-gray-200 dark:border-gray-800 z-50">
        <div className="w-full px-4">
          {" "}
          {/* Removed container class to allow full width */}
          <div className="h-16 flex items-center">
            {/* Left side - No extra wrapper div */}
            <HistoryBar />

            {/* Right side - Push to the right */}
            <div className="ml-auto flex items-center space-x-6">
              <ThemeToggle />
              <Notification />
              <Profile />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with SideBar */}

      <main className="flex-1 p-6 pt-24">
        {" "}
        {/* Changed p-6 to add pt-24 */}
        <div className="bg-[var(--background)] text-[var(--foreground)] rounded-lg shadow-lg">
          <Board current={currentItem} />
        </div>
      </main>
    </div>
  );
}
