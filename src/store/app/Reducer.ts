
import { InitState, IState }  from "./InitState"
export const Reducer = (state:IState = InitState, action:any) =>
{  
  switch (action.type) { 
    case 'ChangeLoading':
      return {
        ...state,
        IsLoading: action.isLoading
      }    
    case 'ChangeAuthentication':
      return {
        ...state,
        IsAuthenticated: action.isAuthenticated
      }            
    default:
      return state;
  }
}