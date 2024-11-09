export const COLUMNS = {
  type: { id: "type", label: "Loại" },
  title: { id: "title", label: "Tiêu đề" },
  description: { id: "description", label: "Nội dung" },
  beginTime: { id: "beginTime", label: "Ngày bắt đầu" },
  endTime: { id: "endTime", label: "Ngày kết thúc" },
  owner: { id: "owner", label: "Thành Viên" },
  diffLevel: { id: "diffLevel", label: "Mức độ" },
  progress: { id: "progress", label: "Tiến độ" },
} as const;

export const DEFAULT_COLUMNS = Object.keys(COLUMNS) as (keyof typeof COLUMNS)[];

export const allColumns = Object.values(COLUMNS);