export const formatDateTime = (datetime: string): { time: string; date: string } => {
  const dateObj = new Date(datetime);
  const time = dateObj.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const date = dateObj.toLocaleDateString();
  return { time, date };
};


