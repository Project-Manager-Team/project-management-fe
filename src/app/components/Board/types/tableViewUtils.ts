
import { Item } from "./table";

export interface ViewUtilsProps {
  handleUpdateProgress: (id: number, progress: number) => void;
  handleChange: (index: number, field: keyof Item, value: string | number | boolean) => void;
  handleEditItem: (index: number) => void;
  handleDeleteItem: (id: number) => void;
}

export interface StyleUtilsType {
  getDiffLevelStyle: (level: number | null | undefined) => string;
  getDiffLevelLabel: (level: number | null | undefined) => string;
}