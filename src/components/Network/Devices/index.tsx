import { CtrlButton, CtrlConfirm, CtrlDialog, CtrlNotification, CtrlTree } from 'components/common';
import Card from 'components/common/Card';
import CtrlDynamicButton from 'components/common/CtrlDynamicButton';
import CtrlDynamicTable from 'components/common/CtrlDynamicTable';
import { AppName, Guid, Message } from 'models/Enums';
import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { connect } from "react-redux";
import { InitState } from './InitState';
import { Actions } from './Action';
import { Reducer } from './Reducer';
import devicesListViewJson from './ListView.json';
import DevicesForm from './Form'
import { IResponseMessage } from 'models/Apps';

interface Props {

}

const DevicesList = (props: Props) => {  
    const [state, dispatch] = useReducer(Reducer, InitState)
    const [devicesId, setDevicesId] = useState('');
    const devicesListView:any = devicesListViewJson;    
    const refNotification = useRef<any>();
    const refConfirm_DeleteItem = useRef<any>();
    const refDynamicTable = useRef<any>();
    const [dialogVisible, setDialogVisible] = useState(false);
    const OrganId_Tree = useRef(Guid.Empty);
    useEffect(() => {  
        // Actions.GetTree(dispatch);      
        // Actions.GetItem_DeviceType(dispatch);     
        // Actions.GetItem_Manufacturer(dispatch);    
        // Actions.GetItem_Organ(dispatch);             
    }, [])
    const ActionEvents = {
        onClickCreate: () => {
            setDevicesId('');
            setDialogVisible(true);    
        },
        onClickUpdate: () => {
            if(!getRowId()) { refNotification.current.showNotification("warning", Message.Require_Row_Selection); return; }            
            setDevicesId(getRowId());
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
        return <CtrlDynamicButton actionDefs={devicesListView.DataGrid.ActionDefs} actions={ActionEvents} />;
    }    
    const DialogMemo = useMemo(() => {
        return <>
        {dialogVisible == true ?
            <CtrlDialog size="large" title={devicesId ? "Sửa thiết bị": "Tạo mới thiết bị"} dialogVisible={dialogVisible} onCancel={() => setDialogVisible(false)}>
                <DevicesForm  Options={state.Options} Id={devicesId} ReloadTableItems = {ReloadTableItems} />
            </CtrlDialog>
            :<div></div>
        }
        </>
    }, [dialogVisible])
    const RemoveHightlightToRootElement = () => {
        let nodes:any = document.getElementsByClassName("el-tree-node__content");
        for(let i = 0;i < nodes.length;i++)
        {
            if(nodes[i].innerText == AppName)
            {
                var element = nodes[i];
                element.classList.remove("highlight-current");
            }
        }
    }     
    const onNodeClicked = (data:any, node:any) => {
        RemoveHightlightToRootElement()
        OrganId_Tree.current = data.Id;        
        Actions.GetItemsByOrganId(data.Id, dispatch);  
    }    
        const RefeshTree = () => {
            Actions.GetTree(dispatch);
        }
        const ButtonGroupsRender_TreeOrgan = () => {
            return <CtrlButton title="Làm mới" onClick={() => {RefeshTree()}} />;
        }
    return(
        <>
            <CtrlConfirm ref={refConfirm_DeleteItem} Title="Thao tác này sẽ xóa thiết bị" Ok={async () => {await DeleteById()}} Canel={()=>{}} />
            <CtrlNotification ref={refNotification} />   
            {DialogMemo}
            <div className='row'>
                <div className='col-md-3'>
                    <Card key={"organtree"} title={"Cơ cấu tổ chức"} buttonGroups={ButtonGroupsRender_TreeOrgan()}>
                        <CtrlTree onNodeClicked={onNodeClicked} 
                            options={{ children: 'Children', label: 'Name' }}
                            data={state.DataTree} 
                            nodeKey={"Id"}
                            defaultExpandedKeys={[Guid.Empty]}
                            />       
                    </Card>    
                </div>
                <div className='col-md-9'>
                    <Card key='devices' title={devicesListView.DataGrid.Title} buttonGroups={ButtonGroupsRender()}>
                        <CtrlDynamicTable 
                            ref={refDynamicTable}
                            id={devicesListView.DataGrid.Key} 
                            key={devicesListView.DataGrid.Key} 
                            columnDefs={devicesListView.DataGrid.ColumnDefs} 
                            dataItems={state.DataItems}>                
                        </CtrlDynamicTable>
                    </Card>
                </div>
            </div>
        </>
    )
}
const mapState = ({ ...state }) => ({

});
const mapDispatchToProps = {
  
};

export default connect(mapState, mapDispatchToProps)(DevicesList);