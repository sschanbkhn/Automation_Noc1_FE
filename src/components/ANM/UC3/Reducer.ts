
import { InitState, IState }  from "./InitState"
export const Reducer = (state:IState = InitState, action:any) =>
{  
  switch (action.type) { 
    case 'GetTree':        
      let nodeTree = state.DataTree;      
      nodeTree[0].Children = action.tree;        
      return {
        ...state,
        DataTree: nodeTree
      }     
    case 'GetItem_DeviceType':
      let options_DeviceType:any = [...state.Options];   
      options_DeviceType.push({ Key : "DeviceTypeId", Options: action.items}) 
      return {
        ...state,
        Options: options_DeviceType
      }
    case 'GetItem_Manufacturer':
      let options_Manufacturer:any = [...state.Options];   
      options_Manufacturer.push({ Key : "ManufacturerId", Options: action.items}) 
      return {
        ...state,
        Options: options_Manufacturer
      }  
    case 'GetItem_Organ':
      let options_Organ:any = [...state.Options];   
      options_Organ.push({ Key : "OrganId", Options: action.items}) 
      return {
        ...state,
        Options: options_Organ
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