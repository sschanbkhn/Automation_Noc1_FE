import { CtrlCheckbox, CtrlConfirm, CtrlDialog, CtrlInput, CtrlNotification } from 'components/common';
import Card from 'components/common/Card';
import CtrlButton from 'components/common/CtrlButton';
import CtrlDynamicButton from 'components/common/CtrlDynamicButton';
import CtrlDynamicTable from 'components/common/CtrlDynamicTable';
import CtrlTree from 'components/common/CtrlTree';
import { IResponseMessage } from 'models/Apps';
import { AppName, Guid, Message } from 'models/Enums';
import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { connect } from "react-redux";
import { Actions } from './Action';
import { InitState } from './InitState';
import organListViewJson from './ListView.json';
import { Reducer } from './Reducer';
import AccountForm from './Form'
interface Props {

}

const Account = (props: Props) => {  
    const [state, dispatch] = useReducer(Reducer, InitState)
    const OrganId_Tree = useRef(Guid.Empty)
    const [OrganId_List, setTreeOrganId_List] = useState('');
    const organListView:any = organListViewJson;    
    const refNotification = useRef<any>();
    const refConfirm_DeleteItem = useRef<any>();
    const refDynamicTable = useRef<any>();
    const [dialogVisible, setDialogVisible] = useState(false);
    const [isShowFormSeach, setIsShowFormSearch] = useState(false);
    const [formSearch, setFormSearch] = useState({ LoginName: "", IsActive: false });
    useEffect(() => {
        Actions.getTree(dispatch);
        Actions.GetItems(OrganId_Tree.current, dispatch);     
        AddHightlightToRootElement();           
    }, [])
    const handleKeyDown = (event:any) => {        
        if(event.keyCode == 13)
        {                        
            let tagNameFocus = document.activeElement.tagName.toLowerCase();            
            if(tagNameFocus !== 'button')
            {  
                if(isShowFormSeach)
                {                    
                    OnSearch();                    
                }            
            }            
        }
    };    
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
    
        // cleanup this component
        return () => {
          window.removeEventListener('keydown', handleKeyDown);
        };
    });
    const AddHightlightToRootElement = () => {
        let nodes:any = document.getElementsByClassName("el-tree-node__content");
        for(let i = 0;i < nodes.length;i++)
        {
            if(nodes[i].innerText == AppName)
            {
                var element = nodes[i];
                element.classList.add("highlight-current");
            }
        }
    }
    const onChangeFormSearch = (key: string, value: string) => {
        setFormSearch({
            ...formSearch,
            [key]: value
        })
    }
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
    const ActionEvents = {
        onClickShowFormSearch: () => {
            setIsShowFormSearch(true)
        },
        onClickCreate: () => {
            setTreeOrganId_List('');
            setDialogVisible(true);    
        },
        onClickUpdate: () => {
            if(!getRowId()) { refNotification.current.showNotification("warning", Message.Require_Row_Selection); return; }            
            setTreeOrganId_List(getRowId());
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
        if(isShowFormSeach)
        {
            Actions.GetItemsAndSearch(formSearch.LoginName, formSearch.IsActive, dispatch);     
        }
        else
        {
            Actions.GetItems(OrganId_Tree.current, dispatch);  
        }        
    }
    const getRowId = () => {        
        return refDynamicTable.current.getRowId();
    }
    const ButtonGroupsRender = () => {
        return <CtrlDynamicButton actionDefs={organListView.DataGrid.ActionDefs} actions={ActionEvents} />;
    }  
    const RefeshTree = () => {
        Actions.getTree(dispatch);
    }
    const ButtonGroupsRender_TreeOrgan = () => {
        return <CtrlButton title="Làm mới" onClick={() => {RefeshTree()}} />;
    }
    const onNodeClicked = (data:any, node:any) => {
        RemoveHightlightToRootElement()
        OrganId_Tree.current = data.Id;        
        Actions.GetItems(data.Id, dispatch);  
    }
    const OnSearch = () => {        
        Actions.GetItemsAndSearch(formSearch.LoginName, formSearch.IsActive, dispatch);     
    }
    const DialogMemo = useMemo(() => {
        return <>
        {dialogVisible == true ?
            <CtrlDialog style={{width:"35%"}} title={OrganId_List ? "Sửa tài khoản": "Tạo mới tài khoản"} dialogVisible={dialogVisible} onCancel={() => setDialogVisible(false)}>
                <AccountForm Id={OrganId_List} TreeId={OrganId_Tree.current} TreeData={state.DataTree} ReloadTableItems = {ReloadTableItems} />
            </CtrlDialog>  
            :<div></div>
        }
        </>
    }, [dialogVisible])
    return(
        <>
            <div className='row'>
                <div className='col-sm-4'>
                    <Card key='organ' title={"Cơ cấu tổ chức"} buttonGroups={ButtonGroupsRender_TreeOrgan()}>
                        <CtrlTree onNodeClicked={onNodeClicked} 
                            options={{ children: 'Children', label: 'Name' }}
                            data={state.DataTree} 
                            nodeKey={"Id"}
                            defaultExpandedKeys={[Guid.Empty]}
                            />       
                    </Card>          
                </div>
                <div className='col-sm-8'>
                    <CtrlConfirm ref={refConfirm_DeleteItem} Title="Thao tác này sẽ xóa tài khoản" Ok={async () => {await DeleteById()}} Canel={()=>{}} />
                    <CtrlNotification ref={refNotification} />   
                    {DialogMemo}
                    <Card key='account' title={organListView.DataGrid.Title} buttonGroups={ButtonGroupsRender()}>
                        {
                            isShowFormSeach === true ? 
                            <div>
                                <div className="row">
                                    <div className="col-sm-5">                                    
                                        <CtrlInput placeholder="Tên đăng nhập hoặc email" key={"loginName"} onChange={(e:any) => {onChangeFormSearch('LoginName', e)}} value={formSearch.LoginName} />
                                    </div>                                
                                    <div className="col-sm-2">
                                        <CtrlCheckbox label={"Hoạt động"} key="isActive" onChange={(e:any) => {onChangeFormSearch('IsActive', e)}} value={formSearch.IsActive} />
                                    </div>                    
                                    <div className="col-sm-5">
                                        <CtrlButton title="Tìm kiếm" onClick={() => { OnSearch(); }} />
                                        <CtrlButton title="Đóng" type={"default"} onClick={() => {setIsShowFormSearch(false)}} />
                                    </div>            
                                </div>
                                <hr/>
                            </div>:<div></div>
                        }                        
                        <CtrlDynamicTable 
                            ref={refDynamicTable}
                            id={organListView.DataGrid.Key} 
                            key={organListView.DataGrid.Key} 
                            columnDefs={organListView.DataGrid.ColumnDefs} 
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

export default connect(mapState, mapDispatchToProps)(Account);