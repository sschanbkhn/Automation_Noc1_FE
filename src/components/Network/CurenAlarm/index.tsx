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
import curenAlarmListViewJson from './ListView.json';
import CurenAlarmForm from './Form'
import { IResponseMessage } from 'models/Apps';

interface Props {

}

const CurenAlarmList = (props: Props) => {  
    const [state, dispatch] = useReducer(Reducer, InitState)
    const [curenAlarmId, setCurenAlarmId] = useState('');
    const curenAlarmListView:any = curenAlarmListViewJson;    
    const refNotification = useRef<any>();
    const refConfirm_DeleteItem = useRef<any>();
    const refDynamicTable = useRef<any>();
    const [dialogVisible, setDialogVisible] = useState(false);
    useEffect(() => {        
        Actions.GetItems(dispatch); 
        Actions.GetItem_Device(dispatch);     
    }, [])
    const ActionEvents = {
        onClickCreate: () => {
            setCurenAlarmId('');
            setDialogVisible(true);    
        },
        onClickUpdate: () => {
            if(!getRowId()) { refNotification.current.showNotification("warning", Message.Require_Row_Selection); return; }            
            setCurenAlarmId(getRowId());
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
        // return <CtrlDynamicButton actionDefs={curenAlarmListView.DataGrid.ActionDefs} actions={ActionEvents} />;
        return <></>;
    }    
    const DialogMemo = useMemo(() => {
        return <>
        {dialogVisible == true ?
            <CtrlDialog style={{ width: "40%" }} title={curenAlarmId ? "Sửa lịch sử cấu hình": "Tạo mới lịch sử cấu hình"} dialogVisible={dialogVisible} onCancel={() => setDialogVisible(false)}>
                <CurenAlarmForm Options={state.Options} Id={curenAlarmId} ReloadTableItems = {ReloadTableItems} />
            </CtrlDialog>
            :<div></div>
        }
        </>
    }, [dialogVisible])
    return(
        <>
            <CtrlConfirm ref={refConfirm_DeleteItem} Title="Thao tác này sẽ xóa lịch sử cấu hình" Ok={async () => {await DeleteById()}} Canel={()=>{}} />
            <CtrlNotification ref={refNotification} />   
            {DialogMemo}
            <Card key='curenAlarm' title={curenAlarmListView.DataGrid.Title} buttonGroups={ButtonGroupsRender()}>
                <CtrlDynamicTable 
                    ref={refDynamicTable}
                    id={curenAlarmListView.DataGrid.Key} 
                    key={curenAlarmListView.DataGrid.Key} 
                    columnDefs={curenAlarmListView.DataGrid.ColumnDefs} 
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

export default connect(mapState, mapDispatchToProps)(CurenAlarmList);