ProMeX04: Giúp tôi cấu trúc lại  phân chia file sao cho hợp lý có thể dùng thêm các thư viện bên ngoài sao cho tối ưu code đơn giản 

GitHub Copilot: Tôi sẽ giúp bạn cấu trúc lại code theo một cách tổ chức rõ ràng và dễ bảo trì hơn. Đây là các bước và giải pháp được đề xuất:

1. Tổ chức cấu trúc thư mục:
```
src/
  components/
    Table/
      components/
        ColumnSelector/
          ColumnToggle.tsx
          ColumnSelectorModal.tsx
        ManagerModal/
          ManagersModal.tsx 
          ManagerButton.tsx
        TableRow/
          TableRow.tsx
          TableCell.tsx
      hooks/
        useTableData.ts
        useColumnPreferences.ts
        useManagerPermissions.ts
      constants/
        tableConfig.ts
      utils/
        formatters.ts
      types/
        index.ts
      context/
        TableContext.tsx
      Table.tsx
      index.ts
```

2. Phân chia code theo các file:

### types/index.ts
```typescript
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
  managers?: Manager[];
  owner: Owner | null;
  managersCount: number;
}

export interface TableContextValue {
  selectedColumns: string[];
  toggleColumn: (columnId: string) => void;
  resetColumns: () => void;
}

// ...rest of type definitions...
```

### hooks/useTableData.ts
```typescript
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import apiClient from '@/utils';
import { Item } from '../types';

export const useTableData = (currentUrl: string) => {
  const [listProject, setListProject] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const { data } = await apiClient.get<Item[]>(currentUrl);
      const formattedData = data
        .filter(item => item.type !== 'personal')
        .map((item, index) => ({
          ...item,
          index,
          isEditing: false
        }));
      setListProject(formattedData);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  // ... other data management methods

  return {
    listProject,
    setListProject,
    isLoading,
    fetchProjects,
  };
};
```

### components/ColumnSelector/ColumnSelectorModal.tsx
```typescript
import React from 'react';
import { Dialog } from '@headlessui/react';
import { useColumnPreferences } from '../../hooks/useColumnPreferences';
import { ColumnToggle } from './ColumnToggle';

interface ColumnSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ColumnSelectorModal: React.FC<ColumnSelectorModalProps> = ({
  isOpen,
  onClose
}) => {
  const { columns, selectedColumns, toggleColumn, resetColumns } = useColumnPreferences();

  return (
    <Dialog open={isOpen} onClose={onClose}>
      {/* Modal content */}
    </Dialog>
  );
};
```

### context/TableContext.tsx
```typescript
import React, { createContext, useContext, useState, useCallback } from 'react';
import { TableContextValue } from '../types';
import { DEFAULT_COLUMNS } from '../constants/tableConfig';

const TableContext = createContext<TableContextValue | undefined>(undefined);

export const TableProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedColumns, setSelectedColumns] = useState(DEFAULT_COLUMNS);

  const value = {
    selectedColumns,
    toggleColumn: useCallback((columnId: string) => {
      setSelectedColumns(prev => 
        prev.includes(columnId) 
          ? prev.filter(id => id !== columnId)
          : [...prev, columnId]
      );
    }, []),
    resetColumns: useCallback(() => {
      setSelectedColumns(DEFAULT_COLUMNS);
    }, []),
  };

  return (
    <TableContext.Provider value={value}>
      {children}
    </TableContext.Provider>
  );
};

export const useTableContext = () => {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error('useTableContext must be used within TableProvider');
  }
  return context;
};
```

### Table.tsx (Main component)
```typescript
import React from 'react';
import { TableProvider } from './context/TableContext';
import { useTableData } from './hooks/useTableData';
import { TableRow } from './components/TableRow/TableRow';
import { ColumnSelectorModal } from './components/ColumnSelector/ColumnSelectorModal';
import { ManagersModal } from './components/ManagerModal/ManagersModal';

export const Table: React.FC<TableProps> = ({ current, setHistory }) => {
  const {
    listProject,
    isLoading,
    fetchProjects,
    // ... other methods
  } = useTableData(current.url);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <TableProvider>
      <div className="bg-white shadow-md rounded-lg overflow-hidden w-full">
        {/* Table content */}
      </div>
    </TableProvider>
  );
};
```

3. Thêm các thư viện để tối ưu:

```bash
# Quản lý state toàn cục
npm install zustand

# Xử lý form
npm install react-hook-form zod @hookform/resolvers

# UI components
npm install @headlessui/react @radix-ui/react-dialog

# Utilities
npm install date-fns clsx tailwind-merge
```

4. Tối ưu performance với React.memo và useMemo:

```typescript
// Optimize TableRow with React.memo
export const TableRow = React.memo<TableRowProps>(({ item, ...props }) => {
  // component logic
});

// Use useMemo for expensive calculations
const sortedProjects = useMemo(() => 
  listProject.sort((a, b) => b.id - a.id),
  [listProject]
);
```

5. Sử dụng Zustand để quản lý state:

```typescript
import create from 'zustand';
import { Item } from '../types';

interface TableStore {
  items: Item[];
  selectedColumns: string[];
  setItems: (items: Item[]) => void;
  toggleColumn: (columnId: string) => void;
  // ... other actions
}

export const useTableStore = create<TableStore>((set) => ({
  items: [],
  selectedColumns: DEFAULT_COLUMNS,
  setItems: (items) => set({ items }),
  toggleColumn: (columnId) => 
    set((state) => ({
      selectedColumns: state.selectedColumns.includes(columnId)
        ? state.selectedColumns.filter(id => id !== columnId)
        : [...state.selectedColumns, columnId]
    })),
  // ... other actions
}));
```

Lợi ích của cấu trúc này:

1. Tách biệt logic và UI
2. Dễ dàng test và maintain
3. Code có thể tái sử dụng
4. Performance tốt hơn với React.memo và useMemo
5. State management rõ ràng với Zustand
6. Xử lý form mạnh mẽ với react-hook-form
7. Typescript type safety
8. UI components có thể tái sử dụng

Bạn có thể triển khai từng phần theo nhu cầu và điều chỉnh cho phù hợp với dự án của mình.

ProMeX04: bắt đầu xử lý từng phần cho code của tôi

GitHub Copilot: Tôi sẽ giúp bạn xử lý code theo từng phần một cách có hệ thống:

### Phần 1: Tổ chức cấu trúc thư mục

```
src/
  components/
    Table/
      components/
        ColumnSelector/
        ManagerModal/
        TableRow/
      hooks/
      constants/
      utils/
      types/
      context/
```

### Bước 1: Tạo types và interfaces

```typescript

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
  managers?: Manager[];
  owner: Owner | null;
  managersCount: number;
}

export interface Owner {
  username: string;
  avatar: string | null;
}

export interface Manager {
  user: User;
  permission_id?: number;
  permissions?: Permissions;
}

export interface User {
  id: number;
  username: string;
  avatar: string | null;
}

export interface Permissions {
  canEdit: boolean;
  canFinish: boolean;
  canAdd: boolean;
  canDelete: boolean;
  canAddMember: boolean;
  canRemoveMember: boolean;
}

export type PermissionKey = keyof Permissions;
```

### Bước 2: Tạo constants

```typescript

export const STORAGE_KEY = 'table-column-preferences';

export const DEFAULT_COLUMNS = [
  'type',
  'title',
  'description',
  'beginTime',
  'endTime',
  'owner',
  'progress',
];

export const COLUMN_DEFINITIONS = [
  { id: 'title', label: 'Tiêu đề' },
  { id: 'description', label: 'Nội dung' },
  { id: 'beginTime', label: 'Ngày bắt đầu' },
  { id: 'endTime', label: 'Ngày Kết thúc' },
  { id: 'owner', label: 'Người sở hữu' },
  { id: 'progress', label: 'Tình trạng' },
];
```

Hãy cho tôi biết nếu bạn muốn tiếp tục với các phần tiếp theo. Tôi sẽ giúp bạn xử lý:
1. Custom hooks
2. Components tách biệt
3. Context API
4. Utils helpers

Bạn muốn tập trung vào phần nào tiếp theo?

ProMeX04: Giúp tôi sửa vào code luôn

GitHub Copilot: Tôi sẽ giúp bạn tổ chức lại code theo từng bước:

1. Đầu tiên, tạo cấu trúc thư mục:

```bash
mkdir -p src/components/Table/{components,hooks,constants,utils,types,context}
mkdir -p src/components/Table/components/{ColumnSelector,ManagerModal,TableRow}
```

2. Di chuyển interfaces vào file types:

```typescript
// Di chuyển toàn bộ nội dung từ interfaces.ts sang đây
```

3. Tạo hooks cho quản lý dữ liệu bảng:

```typescript
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import apiClient from '@/utils';
import { Item } from '../types';

export const useTableData = (currentUrl: string) => {
  const [listProject, setListProject] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const { data } = await apiClient.get<Item[]>(currentUrl);
      const formattedData = data
        .filter(item => item.type !== 'personal')
        .map((item, index) => ({
          ...item,
          index,
          isEditing: false
        }));
      setListProject(formattedData);
    } catch (error) {
      toast.error('Lấy dữ liệu không thành công');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    listProject,
    setListProject,
    isLoading,
    fetchProjects
  };
};
```

4. Tách component TableRow:

```typescript
// Copy toàn bộ nội dung TableRow.tsx hiện tại vào đây
```

5. Tách các constants:

```typescript
export const STORAGE_KEY = 'table-column-preferences';

export const DEFAULT_COLUMNS = [
  'type',
  'title', 
  'description',
  'beginTime',
  'endTime', 
  'owner',
  'progress'
];

export const COLUMN_DEFINITIONS = [
  { id: 'title', label: 'Tiêu đề' },
  { id: 'description', label: 'Nội dung' },
  // ...rest of columns
];
```

6. Di chuyển ManagersModal vào thư mục riêng:

```typescript
// Copy toàn bộ nội dung ManagersModal hiện tại vào đây
```

7. Cập nhật file index.tsx chính:

```typescript
import { useTableData } from './hooks/useTableData';
// ... các import khác

export default function Table({ current, setHistory, reloadTableData, setReloadTableData }: TableProps) {
  const { listProject, setListProject, isLoading, fetchProjects } = useTableData(current.url);
  // ... rest of the component code
}
```

8. Tách logic column preferences:

```typescript
import { useState, useEffect } from 'react';
import { DEFAULT_COLUMNS, STORAGE_KEY } from '../constants';

export const useColumnPreferences = () => {
  const [selectedColumns, setSelectedColumns] = useState(DEFAULT_COLUMNS);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setSelectedColumns(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to parse saved column preferences');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedColumns));
  }, [selectedColumns]);

  return {
    selectedColumns,
    setSelectedColumns
  };
};
```

9. Tạo utils cho các hàm helper:

```typescript
export const formatDateTime = (datetime: string) => {
  const dateObj = new Date(datetime);
  return {
    time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    date: dateObj.toLocaleDateString()
  };
};
```

10. Cập nhật imports trong mỗi file để phản ánh cấu trúc mới:

```typescript
// Trong mỗi file, cập nhật đường dẫn import tương đối
import { Item } from '../types';
import { formatDateTime } from '../utils/formatters';
// ... etc
```

Để áp dụng các thay đổi này:

1. Tạo các thư mục và file mới theo cấu trúc
2. Di chuyển code vào các file tương ứng
3. Cập nhật các import path
4. Kiểm tra lại các dependency

Bạn muốn tôi giúp chi tiết phần nào tiếp theo?