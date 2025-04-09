import CtrlDynamicForm from 'components/common/CtrlDynamicForm';
import CtrlNotification from 'components/common/CtrlNotification';
import { IResponseMessage } from 'models/Apps';
import { Guid, Message } from 'models/Enums';
import React, { useEffect, useReducer, useRef, useState } from 'react'
import { connect } from "react-redux";
import { InitState } from './InitState';
import { Actions } from './Action';
import { Reducer } from './Reducer';
import organFormInputJson from './FormInput.json';
interface Props {
  Id: string,
  TreeId?: string,
  TreeData?: any,
  ReloadTableItems?: any
}

const AccountForm = (props: Props) => {  
  const [state, dispatch] = useReducer(Reducer, InitState)
  useEffect(() => {
      Actions.GetItem(props.Id, props.TreeId, dispatch);
      Actions.GetCategories("RoleId", dispatch);
  }, [props.Id])
  let organFormInput:any = organFormInputJson;
  const refNotification = useRef<any>();
  const refDynamicForm = useRef<any>();
  const ActionEvents = {
    onClickSave: async () => {      
      let isValid = refDynamicForm.current.onValidation();      
      if(isValid)
      {        
        let stateValues = refDynamicForm.current.getStateValues();               
        let res:IResponseMessage = null;                
        res = await Actions.CheckDuplicateAttributes(stateValues.Id, stateValues.UserName, stateValues.Email, dispatch);
        if(stateValues.Id === Guid.Empty && stateValues.PassWord === "")
        {
          refNotification.current.showNotification("warning", Message.Password_Is_Not_Empty);    
          return; 
        }
        if(res.Data) 
        {
          refNotification.current.showNotification("warning", Message.DuplicateAttribute_LoginName);    
          return; 
        }                           
        if(props.Id) 
        {          
          res = await Actions.UpdateItem(stateValues, props.TreeId, stateValues.RoleId);                      
        }          
        else
        {
          res = await Actions.CreateItem(stateValues, props.TreeId, stateValues.RoleId);  
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
      <CtrlDynamicForm ref={refDynamicForm} options={state.Options} initValues={state.DataItem} formDefs={organFormInput} actionEvents={ActionEvents} />
    </>
  )
}
const mapState = ({ ...state }) => ({
  
});
const mapDispatchToProps = {
  
};

export default connect(mapState, mapDispatchToProps)(AccountForm);