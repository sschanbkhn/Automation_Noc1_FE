
import { InitState, IState }  from "./InitState"
export const Reducer = (state:IState = InitState, action:any) =>
{    
  switch (action.type) { 
    case 'GetItems_HeadDevicePort':
      return {
        ...state,
        DataItem: action.item
      }    
    case 'GetItem':
      return {
        ...state,
        DataItem: action.item
      }    
    default:
      return state;
  }
}