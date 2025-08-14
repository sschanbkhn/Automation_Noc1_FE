import { CtrlConfirm, CtrlDialog, CtrlNotification } from 'components/common';
import Card from 'components/common/Card';
import CtrlDynamicButton from 'components/common/CtrlDynamicButton';
import CtrlDynamicTable from 'components/common/CtrlDynamicTable';
import { Message } from 'models/Enums';
import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { connect } from "react-redux";
import { InitState } from './InitState';
import { Actions } from './Action';
import { Reducer } from './Reducer';
import devicePortsListViewJson from './ListView.json';
import DevicePortsForm from './Form'
import { IResponseMessage } from 'models/Apps';

interface Props {

}

const DevicePortsList = (props: Props) => {  
    const [state, dispatch] = useReducer(Reducer, InitState)
    const [devicePortsId, setDevicePortsId] = useState('');
    const devicePortsListView:any = devicePortsListViewJson;    
    const refNotification = useRef<any>();
    const refConfirm_DeleteItem = useRef<any>();
    const refDynamicTable = useRef<any>();
    const [dialogVisible, setDialogVisible] = useState(false);
    useEffect(() => {        
        // Actions.GetItems(dispatch); 
        // Actions.GetItem_Device(dispatch);     
    }, [])
    const ActionEvents = {
        onClickCreate: () => {
            setDevicePortsId('');
            setDialogVisible(true);    
        },
        onClickUpdate: () => {
            if(!getRowId()) { refNotification.current.showNotification("warning", Message.Require_Row_Selection); return; }            
            setDevicePortsId(getRowId());
            setDialogVisible(true);            
        },
        onClickDelete: async () => {
            if(!getRowId()) { refNotification.current.showNotification("warning", Message.Require_Row_Selection); return; }
            refConfirm_DeleteItem.current.showConfirm();            
        },
    }
    const DeleteById = async () => {
        let res:IResponseMessage = await Actions.DeleteById(getRowId(),dispatch);             
        if(res.Success) {            
            refNotification.current.showNotification("success", res.Message);          
            ReloadTableItems();
        }  
    }
    const ReloadTableItems = () => {
        Actions.GetItems(dispatch);  
    }
    const getRowId = () => {        
        return refDynamicTable.current.getRowId();
    }
    let ButtonGroupsRender = () => {
        return <CtrlDynamicButton actionDefs={devicePortsListView.DataGrid.ActionDefs} actions={ActionEvents} />;
    }    
    const DialogMemo = useMemo(() => {
        return <>
        {dialogVisible == true ?
            <CtrlDialog size="small" title={devicePortsId ? "Sửa cổng trên thiết bị": "Tạo mới cổng trên thiết bị"} dialogVisible={dialogVisible} onCancel={() => setDialogVisible(false)}>
                <DevicePortsForm Options={state.Options} Id={devicePortsId} ReloadTableItems = {ReloadTableItems} />
            </CtrlDialog>
            :<div></div>
        }
        </>
    }, [dialogVisible])
    return(
        <>
            <CtrlConfirm ref={refConfirm_DeleteItem} Title="Thao tác này sẽ xóa cổng trên thiết bị" Ok={async () => {await DeleteById()}} Canel={()=>{}} />
            <CtrlNotification ref={refNotification} />   
            {DialogMemo}
            <Card key='devicePorts' title={devicePortsListView.DataGrid.Title} buttonGroups={ButtonGroupsRender()}>
                <CtrlDynamicTable 
                    ref={refDynamicTable}
                    id={devicePortsListView.DataGrid.Key} 
                    key={devicePortsListView.DataGrid.Key} 
                    columnDefs={devicePortsListView.DataGrid.ColumnDefs} 
                    dataItems={state.DataItems}>                
                </CtrlDynamicTable>
            </Card>
        </>
    )
}
const mapState = ({ ...state }) => ({

});
const mapDispatchToProps = {
  
};

export default connect(mapState, mapDispatchToProps)(DevicePortsList);