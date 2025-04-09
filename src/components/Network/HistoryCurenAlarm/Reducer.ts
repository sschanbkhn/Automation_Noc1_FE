
import { InitState, IState }  from "./InitState"
export const Reducer = (state:IState = InitState, action:any) =>
{  
  switch (action.type) { 
    case 'GetItem_Device':
      let options:any = [...state.Options];   
      options.push({ Key : "DeviceId", Options: action.items}) 
      return {
        ...state,
        Options: options
      }
    case 'GetItems':
      return {
        ...state,
        DataItems: action.items
      }
    default:
      return state;
  }
}