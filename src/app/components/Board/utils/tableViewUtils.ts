
export const getDiffLevelStyle = (level: number | null | undefined) => {
  if (level === null || level === undefined) return "bg-gray-100 text-gray-800";
  switch (level) {
    case 1:
      return "bg-green-100 text-green-800";
    case 2:
      return "bg-yellow-100 text-yellow-800";
    case 3:
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
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