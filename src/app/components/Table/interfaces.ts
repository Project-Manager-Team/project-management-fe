export interface Item {
  id: number;
  index: number;
  type: string;
  title: string | null;
  description: string | null;
  beginTime: string | null;
  endTime: string | null;
  progress: number;
  manager: string | null;
  parentId: number | null;
  isEditing: boolean;
  managers?: { username: string; avatar: string | null }[];
  [key: string]: unknown;
}

export interface HistoryItem {
  id: number;
  title: string;
  url: string;
}

export interface Current {
  url: string;
  id?: number;
  title: string;
}

export interface TableRowProps {
  item: Item;
  handleChange: (
    index: number,
    name: string,
    value: string | number | boolean | null
  ) => void;
  handleEditItem: (index: number) => void;
  handleDeleteItem: (id: number | null) => void;
  setHistory: React.Dispatch<React.SetStateAction<HistoryItem[]>>;
  setReloadTableData: React.Dispatch<React.SetStateAction<boolean>>;
  handleUpdateProgress: (id: number, progress: number) => void;
}
