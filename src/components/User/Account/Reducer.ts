
import { InitState, IState }  from "./InitState"
export const Reducer = (state:IState = InitState, action:any) =>
{  
  switch (action.type) { 
    case 'GetItems':
      return {
        ...state,
        DataItems: action.items
      }
    case 'GetTree':        
      let nodeTree = state.DataTree;      
      nodeTree[0].Children = action.tree;        
      return {
        ...state,
        DataTree: nodeTree
      }      
    default:
      return state;
  }
}