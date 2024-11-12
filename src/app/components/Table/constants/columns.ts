export const COLUMNS = {
  type: { id: 'type', label: 'Loại' },
  title: { id: 'title', label: 'Tiêu đề' },
  description: { id: 'description', label: 'Mô tả' },
  beginTime: { id: 'beginTime', label: 'Thời gian bắt đầu' },
  endTime: { id: 'endTime', label: 'Thời gian kết thúc' },
  owner: { id: 'owner', label: 'Quản lý' },
  diffLevel: { id: 'diffLevel', label: 'Độ khó' },
  progress: { id: 'progress', label: 'Tiến độ' },
} as const;

// Update allColumns to exclude 'type'
export const allColumns = [
  COLUMNS.title,
  COLUMNS.description,
  COLUMNS.beginTime,
  COLUMNS.endTime,
  COLUMNS.owner,
  COLUMNS.diffLevel,
  COLUMNS.progress,
];

// Update DEFAULT_COLUMNS to exclude 'type' if it was included
export const DEFAULT_COLUMNS = [
  'title',
  'description',
  'beginTime',
  'endTime',
  'owner',
  'diffLevel',
  'progress',
];