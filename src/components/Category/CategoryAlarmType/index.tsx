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
import categoryAlarmTypeListViewJson from './ListView.json';
import CategoryAlarmTypeForm from './Form'
import { IResponseMessage } from 'models/Apps';

interface Props {

}

const CategoryAlarmTypeList = (props: Props) => {  
    const [state, dispatch] = useReducer(Reducer, InitState)
    const [categoryAlarmTypeId, setCategoryAlarmTypeId] = useState('');
    const categoryAlarmTypeListView:any = categoryAlarmTypeListViewJson;    
    const refNotification = useRef<any>();
    const refConfirm_DeleteItem = useRef<any>();
    const refDynamicTable = useRef<any>();
    const [dialogVisible, setDialogVisible] = useState(false);
    useEffect(() => {        
        Actions.GetItems(dispatch); 
        Actions.GetItem_LevelId(dispatch);     
    }, [])
    const ActionEvents = {
        onClickCreate: () => {
            setCategoryAlarmTypeId('');
            setDialogVisible(true);    
        },
        onClickUpdate: () => {
            if(!getRowId()) { refNotification.current.showNotification("warning", Message.Require_Row_Selection); return; }            
            setCategoryAlarmTypeId(getRowId());
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
        return <CtrlDynamicButton actionDefs={categoryAlarmTypeListView.DataGrid.ActionDefs} actions={ActionEvents} />;
    }    
    const DialogMemo = useMemo(() => {
        return <>
        {dialogVisible == true ?
            <CtrlDialog title={categoryAlarmTypeId ? "Sửa loại cảnh báo": "Tạo mới loại cảnh báo"} dialogVisible={dialogVisible} onCancel={() => setDialogVisible(false)}>
                <CategoryAlarmTypeForm Options={state.Options} Id={categoryAlarmTypeId} ReloadTableItems = {ReloadTableItems} />
            </CtrlDialog>
            :<div></div>
        }
        </>
    }, [dialogVisible])
    return(
        <>
            <CtrlConfirm ref={refConfirm_DeleteItem} Title="Thao tác này sẽ xóa loại cảnh báo" Ok={async () => {await DeleteById()}} Canel={()=>{}} />
            <CtrlNotification ref={refNotification} />   
            {DialogMemo}
            <Card key='categoryAlarmType' title={categoryAlarmTypeListView.DataGrid.Title} buttonGroups={ButtonGroupsRender()}>
                <CtrlDynamicTable 
                    ref={refDynamicTable}
                    id={categoryAlarmTypeListView.DataGrid.Key} 
                    key={categoryAlarmTypeListView.DataGrid.Key} 
                    columnDefs={categoryAlarmTypeListView.DataGrid.ColumnDefs} 
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

export default connect(mapState, mapDispatchToProps)(CategoryAlarmTypeList);