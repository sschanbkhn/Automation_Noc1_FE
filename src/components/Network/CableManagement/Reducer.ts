
import { InitState, IState }  from "./InitState"
export const Reducer = (state:IState = InitState, action:any) =>
{  
  switch (action.type) { 
    case 'GetItem_HeadDevice':
      let optionsGetItem_DeviceHead:any = [...state.Options];   
      optionsGetItem_DeviceHead.push({ Key : "HeadDeviceId", Options: action.items}) 
      return {
        ...state,
        Options: optionsGetItem_DeviceHead
      }
    case 'GetItem_LastDevice':
      let optionsGetItem_DeviceLast:any = [...state.Options];   
      optionsGetItem_DeviceLast.push({ Key : "LastDeviceId", Options: action.items}) 
      return {
        ...state,
        Options: optionsGetItem_DeviceLast
      }      
    case 'GetItem_NetworkLinks':
      let optionsGetItem_NetworkLinks:any = [...state.Options];   
      optionsGetItem_NetworkLinks.push({ Key : "LineId", Options: action.items}) 
      return {
        ...state,
        Options: optionsGetItem_NetworkLinks
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