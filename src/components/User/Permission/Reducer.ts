
import { InitState, IState }  from "./InitState"
export const Reducer = (state:IState = InitState, action:any) =>
{  
  switch (action.type) { 
    case 'GetRoleItems':
      return {
        ...state,
        RoleItems: action.items
      }
    case 'GetMenuItems':
      return {
        ...state,
        MenuItems: action.items
      }
    case 'GetFuncItems':
      return {
        ...state,
        FuncItems: action.items
      }      
    case 'GetMenuChecked':
      return {
        ...state,
        MenuChecked: action.items
      }
    case 'GetFuncChecked':
      return {
        ...state,
        FuncChecked: action.items
      }                            
    default:
      return state;
  }
}