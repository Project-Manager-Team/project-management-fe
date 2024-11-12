import { ProjectState, ProjectAction } from "../types/projectReducer";
import { Item } from "../types/table";

const updateIndexes = (items: Item[]) => {
  return items.map((item, index) => ({ ...item, index }));
};

export const initialState: ProjectState = {
  listProject: [],
  isCreating: false,
  isNavigating: false,
};

export function projectReducer(
  state: ProjectState,
  action: ProjectAction
): ProjectState {
  switch (action.type) {
    case "SET_PROJECTS":
      return {
        ...state,
        listProject: updateIndexes(
          action.payload.map((item) => ({
            ...item,
            isEditing: false,
          }))
        ),
        isCreating: false,
      };

    case "UPDATE_ITEM":
      return {
        ...state,
        listProject: state.listProject.map((item, idx) =>
          idx === action.payload.index
            ? { ...item, ...action.payload.item }
            : item
        ),
      };

    case "DELETE_ITEM":
      return {
        ...state,
        listProject: updateIndexes(
          state.listProject.filter((item) => item.id !== action.payload)
        ),
        isCreating: false,
      };

    case "ADD_ITEM":
      return {
        ...state,
        listProject: [...state.listProject, action.payload],
        isCreating: true,
      };

    case "SET_CREATING":
      return {
        ...state,
        isCreating: action.payload,
      };

    case "SET_NAVIGATING":
      return {
        ...state,
        isNavigating: action.payload,
      };

    case "TOGGLE_EDIT":
      return {
        ...state,
        listProject: state.listProject.map((item, idx) =>
          idx === action.payload
            ? { ...item, isEditing: !item.isEditing }
            : item
        ),
      };

    case "UPDATE_PROGRESS":
      return {
        ...state,
        listProject: state.listProject.map((item) =>
          item.id === action.payload.id
            ? { ...item, progress: action.payload.progress }
            : item
        ),
      };

    case "CLEAR_PROJECTS":
      return {
        ...state,
        listProject: [],
        isCreating: false,
      };

    default:
      return state;
  }
}
