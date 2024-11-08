import React, { useState } from "react";
import { FaHome, FaEllipsisH } from "react-icons/fa";
import { useAppStore } from '@/app/store/appStore';

const HistoryBar = () => {
  const { history, setHistory } = useAppStore();
  const [showFullHistory, setShowFullHistory] = useState(false);
  const maxVisibleIcons = 3;

  const handleHistoryClick = (index: number) => {
    if (index < history.length - 1) {
      setHistory(history.slice(0, index + 1));
    }
  };

  const handleHomeClick = () => {
    setHistory([{
      id: 0,
      url: `/api/project/personal/`,
      title: "Home",
    }]);
  };

  return (
    <div className="flex items-center">
      <button
        onClick={handleHomeClick}
        className="p-2 text-gray-400 hover:text-white transition-colors"
        aria-label="Home"
      >
        <FaHome className="w-5 h-5" />
      </button>

      {history.length > 1 && (
        <div className="flex items-center">
          {history.slice(1, maxVisibleIcons + 1).map((item, index) => (
            <React.Fragment key={`${item.id}-${index}`}>
              <span className="text-gray-600">/</span>
              <button
                onClick={() => handleHistoryClick(index + 1)}
                className="px-2 py-1 text-sm text-gray-400 hover:text-white transition-colors truncate max-w-[150px]"
              >
                {item.title}
              </button>
            </React.Fragment>
          ))}

          {history.length > maxVisibleIcons + 1 && (
            <div className="relative">
              <button
                onClick={() => setShowFullHistory(!showFullHistory)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                aria-label="More history"
              >
                <FaEllipsisH />
              </button>

              {showFullHistory && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  {history.slice(maxVisibleIcons + 1).map((item, index) => (
                    <button
                      key={`${item.id}-${index}`}
                      onClick={() => {
                        handleHistoryClick(index + maxVisibleIcons + 1);
                        setShowFullHistory(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {item.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HistoryBar;

