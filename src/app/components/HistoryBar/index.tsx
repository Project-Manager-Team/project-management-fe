'use client'
import React, { useState } from "react";
import "react-toastify/dist/ReactToastify.css";

interface HistoryBarProps {
  history: HistoryItem[];
  setHistory: React.Dispatch<React.SetStateAction<HistoryItem[]>>;
}

interface HistoryItem {
  id: number;
  title: string;
  url: string;
}

const HistoryBar: React.FC<HistoryBarProps> = ({ history, setHistory }) => {
  const [showMore, setShowMore] = useState<boolean>(false);
  const maxVisibleIcons = 5; 

  const handleHistory = (index: number) => {
    setHistory(history.slice(0, index + 1));
  };

  return (
    <div className="flex items-center space-x-2 p-2 bg-white bg-opacity-80 rounded-lg shadow-md w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"> {/* Changed background and scrollbar colors */}
      <button
        onClick={() => handleHistory(0)}
        className="p-2 bg-gray-200 border-none rounded-full cursor-pointer transition-transform transform hover:translate-y-[-3px] active:translate-y-3 shadow-md"
        aria-label="Home"
      >
        <span className="text-xl">🏠</span>
      </button>

      {history.length > 1 && (
        <>
          {history.slice(1, maxVisibleIcons + 1).map((item: HistoryItem, index: number) => (
            <React.Fragment key={`${item.id}-${index}`}>
              <span className="text-gray-500 text-sm">➔</span> {/* Changed text color */}
              <button
                className="p-2 bg-gray-200 text-gray-800 border-none rounded-full cursor-pointer transition-transform transform hover:translate-y-[-3px] active:translate-y-3 shadow-md flex items-center space-x-1" /* Changed background and text color */
                onClick={() => handleHistory(index + 1)}
                aria-label={item.title}
              >
                <span className="text-xl">📁</span>
                <span className="hidden sm:inline">{item.title}</span> {/* Ẩn tiêu đề trên màn hình nhỏ */}
              </button>
            </React.Fragment>
          ))}

          {history.length > maxVisibleIcons + 1 && (
            <>
              <span className="text-gray-500 text-sm">➔</span> {/* Changed text color */}
              <button
                className="p-2 bg-gray-200 text-gray-800 border-none rounded-full cursor-pointer transition-transform transform hover:translate-y-[-3px] active:translate-y-3 shadow-md flex items-center space-x-1" /* Changed background and text color */
                onClick={() => setShowMore(!showMore)}
                aria-label={showMore ? "Hide more" : `Show ${history.length - maxVisibleIcons - 1} more`}
              >
                <span className="text-xl">…</span>
                <span>{showMore ? "Ẩn" : `${history.length - maxVisibleIcons - 1} More`}</span>
              </button>
            </>
          )}

          {showMore &&
            history.slice(maxVisibleIcons + 1).map((item: HistoryItem, index: number) => (
              <React.Fragment key={`${item.id}-${index + maxVisibleIcons + 1}`}>
                <span className="text-gray-500 text-sm">➔</span> {/* Changed text color */}
                <button
                  className="p-2 bg-gray-200 text-gray-800 border-none rounded-full cursor-pointer transition-transform transform hover:translate-y-[-3px] active:translate-y-3 shadow-md flex items-center space-x-1" /* Changed background and text color */
                  onClick={() => handleHistory(index + maxVisibleIcons + 1)}
                  aria-label={item.title}
                >
                  <span className="text-xl">📁</span>
                  <span className="hidden sm:inline">{item.title}</span> {/* Ẩn tiêu đề trên màn hình nhỏ */}
                </button>
              </React.Fragment>
            ))}
        </>
      )}
    </div>
  );
};

export default HistoryBar;

