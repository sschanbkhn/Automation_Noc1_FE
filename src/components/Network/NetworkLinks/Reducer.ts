
import { InitState, IState }  from "./InitState"
export const Reducer = (state:IState = InitState, action:any) =>
{  
  switch (action.type) { 
    case 'GetItem_DeviceHead':
      let optionsGetItem_DeviceHead:any = [...state.Options];   
      optionsGetItem_DeviceHead.push({ Key : "HeadDeviceId", Options: action.items}) 
      return {
        ...state,
        Options: optionsGetItem_DeviceHead
      }
    case 'GetItem_DeviceLast':
      let optionsGetItem_DeviceLast:any = [...state.Options];   
      optionsGetItem_DeviceLast.push({ Key : "LastDeviceId", Options: action.items}) 
      return {
        ...state,
        Options: optionsGetItem_DeviceLast
      }      
    case 'GetItem_DevicePortHead':
      let optionsGetItem_DevicePortHead:any = [...state.Options];   
      optionsGetItem_DevicePortHead.push({ Key : "HeadDevicePortId", Options: action.items}) 
      return {
        ...state,
        Options: optionsGetItem_DevicePortHead
      }
    case 'GetItem_DevicePortLast':
      let optionsGetItem_DevicePortLast:any = [...state.Options];   
      optionsGetItem_DevicePortLast.push({ Key : "LastDevicePortId", Options: action.items}) 
      return {
        ...state,
        Options: optionsGetItem_DevicePortLast
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