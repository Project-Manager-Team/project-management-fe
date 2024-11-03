'use client';
import React, { useState } from "react";
import Notification from "./components/Notification";
import Profile from "./components/Profile";
import HistoryBar from "./components/HistoryBar";
import Table from "./components/Table";

export default function Home() {
  const [reloadTableData, setReloadTableData] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryItem[]>([
    {
      id: 0,
      url: `/project/personal/`,
      title: "Home",
    },
  ]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 w-full">
      <div className="fixed top-0 left-0 w-full bg-gray-900 z-50">
        <div className="w-full p-2 flex justify-start items-center">
          <HistoryBar history={history} setHistory={setHistory} />
          <div className="flex space-x-4 ml-4">
            <Notification setReloadTableData={setReloadTableData} />
            <Profile />
          </div>
        </div>
      </div>
      <div className="w-full p-4 pt-20 sm:p-6 mt-16">
        <Table
          setHistory={setHistory}
          reloadTableData={reloadTableData}
          current={history[history.length - 1]}
          setReloadTableData={setReloadTableData}
        />
        {/* Removed ToastContainer as it's now in layout.tsx via ToastProvider */}
      </div>
    </div>
  );
}

interface HistoryItem {
  id: number;
  title: string;
  url: string;
}
