import CtrlDynamicForm from 'components/common/CtrlDynamicForm';
import CtrlNotification from 'components/common/CtrlNotification';
import { IResponseMessage } from 'models/Apps';
import { Message } from 'models/Enums';
import React, { useEffect, useReducer, useRef, useState } from 'react'
import { connect } from "react-redux";
import { InitState } from './InitState';
import { Actions } from './Action';
import { Reducer } from './Reducer';
import networkLinksFormInputJson from './FormInput.json';
interface Props {
  Id: string,
  ReloadTableItems: any
  Options: any
}

const NetworkLinksForm = (props: Props) => {  
  const [state, dispatch] = useReducer(Reducer, InitState)
  const [options, setOptions] = useState(props.Options);
  useEffect(() => {
    Actions.GetItem(props.Id, dispatch);
  }, [props.Id])
  let networkLinksFormInput:any = networkLinksFormInputJson;
  const refNotification = useRef<any>();
  const refDynamicForm = useRef<any>();
  const ActionEvents = {
    onClickSave: async () => {
      let isValid = refDynamicForm.current.onValidation();
      if(isValid)
      {        
        let stateValues = refDynamicForm.current.getStateValues();
        let res:IResponseMessage = null;   
        res = await Actions.CheckDuplicateAttributes(stateValues.Id, stateValues.SerialNumber, dispatch);
        if(res.Data) 
        {
          refNotification.current.showNotification("warning", Message.DuplicateAttribute_Serial);    
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

  const onchangeCtrl = async (ctrlName:string, value:any) => {
    if(ctrlName === "HeadDeviceId") {
      let data = await Actions.GetItems_HeadDevicePort(value, dispatch);
      let opts = [...options];
      opts.push({ Key : "HeadDevicePortId", Options: data})
      setOptions(opts); 
    }
    else if(ctrlName === "LastDeviceId") {
      let data = await Actions.GetItems_LastDevicePort(value, dispatch);
      let opts = [...options];
      opts.push({ Key : "LastDevicePortId", Options: data})
      setOptions(opts); 
    }
  }

  return(
    <>
      <CtrlNotification ref={refNotification} />   
      <CtrlDynamicForm onchangeCtrl={onchangeCtrl} options={options} ref={refDynamicForm} initValues={state.DataItem} formDefs={networkLinksFormInput} actionEvents={ActionEvents} />
    </>
  )
}
const mapState = ({ ...state }) => ({
  
});
const mapDispatchToProps = {
  
};

export default connect(mapState, mapDispatchToProps)(NetworkLinksForm);