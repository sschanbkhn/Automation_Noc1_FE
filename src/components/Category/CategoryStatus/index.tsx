import { CtrlConfirm, CtrlDialog, CtrlNotification } from 'components/common';
import Card from 'components/common/Card';
import CtrlDynamicButton from 'components/common/CtrlDynamicButton';
import CtrlDynamicTable from 'components/common/CtrlDynamicTable';
import { Message } from 'models/Enums';
import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { connect } from "react-redux";
import { CategoryName, CategoryType, InitState } from './InitState';
import { Actions } from './Action';
import { Reducer } from './Reducer';
import categoryListViewJson from './ListView.json';
import CategoryForm from './Form'
import { IResponseMessage } from 'models/Apps';

interface Props {

}

const CategoryList = (props: Props) => {  
    const [state, dispatch] = useReducer(Reducer, InitState)
    const [categoryId, setCategoryId] = useState('');
    const categoryListView:any = categoryListViewJson;    
    const refNotification = useRef<any>();
    const refConfirm_DeleteItem = useRef<any>();
    const refDynamicTable = useRef<any>();
    const [dialogVisible, setDialogVisible] = useState(false);
    useEffect(() => {        
        Actions.GetItems(CategoryType,dispatch);     
    }, [])
    const ActionEvents = {
        onClickCreate: () => {
            setCategoryId('');
            setDialogVisible(true);    
        },
        onClickUpdate: () => {
            if(!getRowId()) { refNotification.current.showNotification("warning", Message.Require_Row_Selection); return; }            
            setCategoryId(getRowId());
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
        Actions.GetItems(CategoryType,dispatch);  
    }
    const getRowId = () => {        
        return refDynamicTable.current.getRowId();
    }
    let ButtonGroupsRender = () => {
        return <CtrlDynamicButton actionDefs={categoryListView.DataGrid.ActionDefs} actions={ActionEvents} />;
    }    
    const DialogMemo = useMemo(() => {
        return <>
        {dialogVisible == true ?
            <CtrlDialog title={categoryId ? "Sửa " + CategoryName: "Tạo mới " + CategoryName} dialogVisible={dialogVisible} onCancel={() => setDialogVisible(false)}>
                <CategoryForm Id={categoryId} ReloadTableItems = {ReloadTableItems} />
            </CtrlDialog>
            :<div></div>
        }
        </>
    }, [dialogVisible])
    return(
        <>
            <CtrlConfirm ref={refConfirm_DeleteItem} Title={"Thao tác này sẽ xóa " + CategoryName} Ok={async () => {await DeleteById()}} Canel={()=>{}} />
            <CtrlNotification ref={refNotification} />   
            {DialogMemo}
            <Card key='category' title={categoryListView.DataGrid.Title} buttonGroups={ButtonGroupsRender()}>
                <CtrlDynamicTable 
                    ref={refDynamicTable}
                    id={categoryListView.DataGrid.Key} 
                    key={categoryListView.DataGrid.Key} 
                    columnDefs={categoryListView.DataGrid.ColumnDefs} 
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

export default connect(mapState, mapDispatchToProps)(CategoryList);