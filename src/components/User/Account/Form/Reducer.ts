
import { InitState, IState }  from "./InitState"
export const Reducer = (state:IState = InitState, action:any) =>
{    
  switch (action.type) { 
    case 'GetItem':
      return {
        ...state,
        DataItem: action.item
      }
    case 'GetCategories':
      let categories:any = [];
      categories.push({ Key: action.key, Options: action.items})
      return {
        ...state,
        Options: categories
      }          
    default:
      return state;
  }
}