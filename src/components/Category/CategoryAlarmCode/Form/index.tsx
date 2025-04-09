import CtrlDynamicForm from 'components/common/CtrlDynamicForm';
import CtrlNotification from 'components/common/CtrlNotification';
import { IResponseMessage } from 'models/Apps';
import { Message } from 'models/Enums';
import React, { useEffect, useReducer, useRef, useState } from 'react'
import { connect } from "react-redux";
import { InitState } from './InitState';
import { Actions } from './Action';
import { Reducer } from './Reducer';
import categoryFormInputJson from './FormInput.json';
import { CategoryType } from '../InitState';
interface Props {
  Id: string,
  ReloadTableItems: any
}

const CategoryForm = (props: Props) => {  
  const [state, dispatch] = useReducer(Reducer, InitState)
  useEffect(() => {
    Actions.GetItem(props.Id, dispatch);
  }, [props.Id])
  let categoryFormInput:any = categoryFormInputJson;
  const refNotification = useRef<any>();
  const refDynamicForm = useRef<any>();
  const ActionEvents = {
    onClickSave: async () => {
      let isValid = refDynamicForm.current.onValidation();
      if(isValid)
      {        
        let stateValues = refDynamicForm.current.getStateValues();
        let res:IResponseMessage = null;                
        res = await Actions.CheckDuplicateAttributes(stateValues.Id, stateValues.Code, CategoryType, dispatch);
        if(res.Data) 
        {
          refNotification.current.showNotification("warning", Message.DuplicateAttribute_Code);    
          return; 
        }                           
        if(props.Id) 
        {          
          res = await Actions.UpdateItem(stateValues);                      
        }          
        else
        {
          res = await Actions.CreateItem(stateValues);  
        }           
        if(res.Success) {            
          refNotification.current.showNotification("success", res.Message);          
          props.ReloadTableItems();
        }                    
      }
    },
  }
  return(
    <>
      <CtrlNotification ref={refNotification} />   
      <CtrlDynamicForm ref={refDynamicForm} initValues={state.DataItem} formDefs={categoryFormInput} actionEvents={ActionEvents} />
    </>
  )
}
const mapState = ({ ...state }) => ({
  
});
const mapDispatchToProps = {
  
};

export default connect(mapState, mapDispatchToProps)(CategoryForm);