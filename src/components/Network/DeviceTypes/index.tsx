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
import deviceTypesListViewJson from './ListView.json';
import DeviceTypesForm from './Form'
import { IResponseMessage } from 'models/Apps';

interface Props {

}

const DeviceTypesList = (props: Props) => {  
    const [state, dispatch] = useReducer(Reducer, InitState)
    const [deviceTypesId, setDeviceTypesId] = useState('');
    const deviceTypesListView:any = deviceTypesListViewJson;    
    const refNotification = useRef<any>();
    const refConfirm_DeleteItem = useRef<any>();
    const refDynamicTable = useRef<any>();
    const [dialogVisible, setDialogVisible] = useState(false);
    useEffect(() => {        
        // Actions.GetItems(dispatch);     
    }, [])
    const ActionEvents = {
        onClickCreate: () => {
            setDeviceTypesId('');
            setDialogVisible(true);    
        },
        onClickUpdate: () => {
            if(!getRowId()) { refNotification.current.showNotification("warning", Message.Require_Row_Selection); return; }            
            setDeviceTypesId(getRowId());
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
        return <CtrlDynamicButton actionDefs={deviceTypesListView.DataGrid.ActionDefs} actions={ActionEvents} />;
    }    
    const DialogMemo = useMemo(() => {
        return <>
        {dialogVisible == true ?
            <CtrlDialog title={deviceTypesId ? "Sửa loại thiết bị": "Tạo mới loại thiết bị"} dialogVisible={dialogVisible} onCancel={() => setDialogVisible(false)}>
                <DeviceTypesForm Id={deviceTypesId} ReloadTableItems = {ReloadTableItems} />
            </CtrlDialog>
            :<div></div>
        }
        </>
    }, [dialogVisible])
    return(
        <>
            <CtrlConfirm ref={refConfirm_DeleteItem} Title="Thao tác này sẽ xóa loại thiết bị" Ok={async () => {await DeleteById()}} Canel={()=>{}} />
            <CtrlNotification ref={refNotification} />   
            {DialogMemo}
            <Card key='deviceTypes' title={deviceTypesListView.DataGrid.Title} buttonGroups={ButtonGroupsRender()}>
                <CtrlDynamicTable 
                    ref={refDynamicTable}
                    id={deviceTypesListView.DataGrid.Key} 
                    key={deviceTypesListView.DataGrid.Key} 
                    columnDefs={deviceTypesListView.DataGrid.ColumnDefs} 
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

export default connect(mapState, mapDispatchToProps)(DeviceTypesList);