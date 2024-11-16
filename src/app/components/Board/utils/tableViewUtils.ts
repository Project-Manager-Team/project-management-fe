const getColorStyle = (color: string) => {
  const colorStyles = {
    gray: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:border dark:border-gray-600',
    green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 dark:border dark:border-green-600',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 dark:border dark:border-yellow-600',
    red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 dark:border dark:border-red-600'
  };
  return colorStyles[color as keyof typeof colorStyles] || colorStyles.gray;
};

export const getDiffLevelStyle = (level: number | null | undefined) => {
  if (level === null || level === undefined) return getColorStyle('gray');
  
  const colorMap: Record<number, string> = {
    1: 'green',
    2: 'yellow',
    3: 'red'
  };

  return getColorStyle(colorMap[level] || 'gray');
};

export const getDiffLevelLabel = (level: number | null | undefined) => {
  switch (level) {
    case 1:
      return "Dễ";
    case 2:
      return "Trung bình";
    case 3:
      return "Khó";
    default:
      return "Không xác định";
  }
};
