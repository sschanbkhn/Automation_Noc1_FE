import CtrlDynamicForm from 'components/common/CtrlDynamicForm';
import CtrlNotification from 'components/common/CtrlNotification';
import { IResponseMessage } from 'models/Apps';
import { Message } from 'models/Enums';
import React, { useEffect, useReducer, useRef, useState } from 'react'
import { connect } from "react-redux";
import { InitState } from './InitState';
import { Actions } from './Action';
import { Reducer } from './Reducer';
import organFormInputJson from './FormInput.json';
import { Tree } from 'helpers/tree';
interface Props {
  Id: string,
  TreeId?: string,
  TreeData?: any,
  ReloadTableItems?: any,
  Options?: any
}

const OrganForm = (props: Props) => {  
  const [state, dispatch] = useReducer(Reducer, InitState)
  useEffect(() => {
      Actions.GetItem(props.Id, props.TreeId, dispatch);
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
        stateValues.ParentId = props.TreeId;   
        let organParent = Tree.getNodeFromTree(props.TreeData[0], stateValues.ParentId)
        if(stateValues.PermFeature)
        {
          stateValues.PermFeature = stateValues.PermFeature.join(",");  
        }
        if(stateValues.PermWorkFlow)
        {
          stateValues.PermWorkFlow = stateValues.PermWorkFlow.join(",");  
        }
        if(organParent && organParent.Type == 1 && stateValues.Type == 0)
        {
          refNotification.current.showNotification("warning", Message.DeptNotInOrgan);  
          return;  
        }             
        let res:IResponseMessage = null;                
        res = await Actions.CheckDuplicateAttributes(stateValues.Id, stateValues.Code, stateValues.ParentId, dispatch);
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
      <CtrlDynamicForm ref={refDynamicForm} options={props.Options} initValues={state.DataItem} formDefs={organFormInput} actionEvents={ActionEvents} />
    </>
  )
}
const mapState = ({ ...state }) => ({
  
});
const mapDispatchToProps = {
  
};

export default connect(mapState, mapDispatchToProps)(OrganForm);