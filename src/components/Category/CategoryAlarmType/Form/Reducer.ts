
import { InitState, IState }  from "./InitState"
export const Reducer = (state:IState = InitState, action:any) =>
{    
  switch (action.type) { 
    case 'GetItem':
      return {
        ...state,
        DataItem: action.item
      }    
    default:
      return state;
  }
}