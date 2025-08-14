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
import systemListViewJson from './ListView.json';
import SystemForm from './Form'
import { IResponseMessage } from 'models/Apps';
import CtrlSelect from 'components/common/CtrlSelect';

interface Props {

}

const SystemList = (props: Props) => {  
    const [state, dispatch] = useReducer(Reducer, InitState)
    const [type, setType] = useState("0");
    const [systemId, setSystemId] = useState('');
    const systemListView:any = systemListViewJson;    
    const refNotification = useRef<any>();
    const refConfirm_DeleteItem = useRef<any>();
    const refDynamicTable = useRef<any>();
    const [dialogVisible, setDialogVisible] = useState(false);
    useEffect(() => {        
        Actions.GetItems(type,dispatch);     
    }, [])
    const ActionEvents = {
        onClickCreate: () => {
            setSystemId('');
            setDialogVisible(true);    
        },
        onClickUpdate: () => {
            if(!getRowId()) { refNotification.current.showNotification("warning", Message.Require_Row_Selection); return; }            
            setSystemId(getRowId());
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
        Actions.GetItems(type, dispatch);  
    }
    const getRowId = () => {        
        return refDynamicTable.current.getRowId();
    }
    const onChangeValue = (value:any) => {
        Actions.GetItems(value,dispatch);    
        setType(value)
    }
    let ButtonGroupsRender = () => {
        return <>
                <CtrlSelect key={"type"} value={type} placeholder="Loại cấu hình" options={[{value:"0", label:"Chỉ số đo"}]} onChange={(e:any) => {onChangeValue(e)}} />
                &ensp;
                <CtrlDynamicButton actionDefs={systemListView.DataGrid.ActionDefs} actions={ActionEvents} />                
            </>;
    }    
    const DialogMemo = useMemo(() => {
        return <>
        {dialogVisible == true ?
            <CtrlDialog title={systemId ? "Sửa cấu hình": "Tạo mới cấu hình"} dialogVisible={dialogVisible} onCancel={() => setDialogVisible(false)}>
                <SystemForm Type={type} Id={systemId} ReloadTableItems = {ReloadTableItems} />
            </CtrlDialog>
            :<div></div>
        }
        </>
    }, [dialogVisible])
    return(
        <>
            <CtrlConfirm ref={refConfirm_DeleteItem} Title="Thao tác này sẽ xóa cấu hình" Ok={async () => {await DeleteById()}} Canel={()=>{}} />
            <CtrlNotification ref={refNotification} />   
            {DialogMemo}
            <Card key='system' title={systemListView.DataGrid.Title} buttonGroups={ButtonGroupsRender()}>
                <CtrlDynamicTable 
                    ref={refDynamicTable}
                    id={systemListView.DataGrid.Key} 
                    key={systemListView.DataGrid.Key} 
                    columnDefs={systemListView.DataGrid.ColumnDefs} 
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

export default connect(mapState, mapDispatchToProps)(SystemList);