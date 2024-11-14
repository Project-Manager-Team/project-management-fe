import { Item } from "./table";

export type ProjectState = {
  listProject: Item[];
  isCreating: boolean;
  isNavigating: boolean;
};

export type ProjectAction =
  | { type: "SET_PROJECTS"; payload: Item[] }
  | { type: "UPDATE_ITEM"; payload: { index: number; item: Partial<Item> } }
  | { type: "UPDATE_COLOR"; payload: { id: number; color: string | null } }
  | { type: "DELETE_ITEM"; payload: number }
  | { type: "ADD_ITEM"; payload: Item }
  | { type: "SET_CREATING"; payload: boolean }
  | { type: "SET_NAVIGATING"; payload: boolean }
  | { type: "TOGGLE_EDIT"; payload: number }
  | { type: "UPDATE_PROGRESS"; payload: { id: number; progress: number } }
  | { type: "CLEAR_PROJECTS" }
  | { type: "REPLACE_ITEM"; payload: { oldId: number | null, newItem: Item } };
