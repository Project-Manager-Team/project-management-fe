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
        isNavigating: false, // Reset navigation state
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
        listProject: updateIndexes([
          ...state.listProject,
          action.payload
        ])
        // Removed isCreating: false from here
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
      const updatedList = state.listProject.map((item, idx) => {
        if (idx === action.payload) {
          return {
            ...item,
            isEditing: !item.isEditing,
          };
        }
        return item;
      });
      return {
        ...state,
        listProject: updatedList,
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

    case "REPLACE_ITEM":
      return {
        ...state,
        listProject: updateIndexes(
          state.listProject.map(item => 
            item.id === action.payload.oldId ? action.payload.newItem : item
          )
        ),
        isCreating: false
      };

    default:
      return state;
  }
}
