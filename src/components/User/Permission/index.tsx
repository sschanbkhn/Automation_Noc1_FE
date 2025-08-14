import { CtrlButton, CtrlConfirm, CtrlDynamicTable, CtrlNotification, CtrlTree } from 'components/common';
import Card from 'components/common/Card';
import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { connect } from "react-redux";
import { InitState } from './InitState';
import { Actions } from './Action';
import { Reducer } from './Reducer';
import { IResponseMessage } from 'models/Apps';
import roleListViewJson from './ListView.json';
import menuConfigJson from 'assets/json/menu_config.json';
import Tab from 'components/common/Tab';
import { Message } from 'models/Enums';
interface Props {
       
}
const Permission = (props: Props) => {  
    const [state, dispatch] = useReducer(Reducer, InitState);
    const refNotification = useRef<any>();
    const refTreeMenu = useRef<any>();
    const refTreeFunc = useRef<any>();
    const refConfirm_InitMenu = useRef<any>();
    const refConfirm_InitFunc = useRef<any>();
    const refConfirm_SaveMenu = useRef<any>();
    const refConfirm_SaveFunc = useRef<any>();
    const roleListView:any = roleListViewJson;    
    const menuConfig:any = menuConfigJson;    
    const refDynamicTable = useRef<any>();
    useEffect(() => {
        Actions.GetRolelItems(dispatch);    
        Actions.GetMenuItems(dispatch);     
        Actions.GetFuncItems(dispatch);     
    }, [])
    const InitMenu = () => {
        let res:IResponseMessage = Actions.ResetMenu(menuConfig.Menu,dispatch);             
        refNotification.current.showNotification("success", res.Message);                      
    }
    const InitFunc = () => {
        let res:IResponseMessage = Actions.ResetFunc(dispatch);          
        refNotification.current.showNotification("success", res.Message);        
    }
    const Permission_ButtonGroupsRender = () => {
        let buttons = [];
        buttons.push(<CtrlButton key={'initmenu'} title='Khởi tạo menu' onClick={() => {refConfirm_InitMenu.current.showConfirm();}}></CtrlButton>)
        buttons.push(<CtrlButton key={'initfunc'} title='Khởi tạo chức năng' onClick={() => {refConfirm_InitFunc.current.showConfirm();}}></CtrlButton>)
        return buttons
    }
    const onRowClick = (rowId:any) => {
        if(rowId) {
            let elements:any = document.getElementsByClassName("el-tabs__item");
            let nameActive =  "";
            for(let i = 0;i < elements.length;i++)
            {
                if(elements[i].className.includes("is-active"))
                {
                    nameActive = elements[i].getAttribute("name");
                }                
            }            
            if(nameActive == "menu")
            {
                Actions.GetByRoleId(rowId, false,dispatch)
            }            
            if(nameActive == "func")
            {
                Actions.GetByRoleId(rowId, true,dispatch)
            }            
        }        
    }
    const SaveMenu = async () => {
        let data = refTreeMenu.current.getCheckedKeys(true);     
        let roleId = getRowId();
        if(!roleId) {
            refNotification.current.showNotification("warning", "Yêu cầu chọn vai trò");
            return;
        }
        let res:IResponseMessage = await Actions.SaveWithRoleId(data, roleId, false,dispatch);             
        if(res.Success) {            
            refNotification.current.showNotification("success", res.Message);                      
        }
    }
    const SaveFunc = async () => {
        let data = refTreeFunc.current.getCheckedKeys(true);
        let roleId = getRowId();
        if(!roleId) {
            refNotification.current.showNotification("warning", "Yêu cầu chọn vai trò");
            return;
        }
        let res:IResponseMessage = await Actions.SaveWithRoleId(data, roleId, true,dispatch);             
        if(res.Success) {            
            refNotification.current.showNotification("success", res.Message);                      
        }
    }
    const MenuRender = () => {
        return  <>
            <div className='row' style={{marginBottom:"5px"}}>
                <div className='col-sm-12 align-right'>
                    <CtrlButton title='Lưu' onClick={() => {refConfirm_SaveMenu.current.showConfirm();}} />
                </div>
            </div>                        
            <CtrlTree defaultExpandAll={false} ref={refTreeMenu} nodeKey={"Id"} defaultCheckedKeys={state.MenuChecked} options={{ children: 'Children', label: 'Name' }} data={state.MenuItems} isShowCheckbox={true} />
        </>
    }
    const FuncRender = () => {
        return  <>
            <div className='row' style={{marginBottom:"5px"}}>
                <div className='col-sm-12 align-right'>
                    <CtrlButton title='Lưu' onClick={() => {refConfirm_SaveFunc.current.showConfirm();}} />
                </div>
            </div>                            
            <CtrlTree defaultExpandAll={false} ref={refTreeFunc} nodeKey={"Id"} defaultCheckedKeys={state.FuncChecked} options={{ children: 'Children', label: 'Name' }} data={state.FuncItems} isShowCheckbox={true} />
        </>
    }
    const onTabClick = (tab:any) => {  
        let roleId = getRowId();  
        if(roleId)
        {
            if(tab.props.name == "menu")
            {
                Actions.GetByRoleId(roleId, false,dispatch)
            }
            else if(tab.props.name == "func")
            {
                Actions.GetByRoleId(roleId, true,dispatch)
            }
        }
    }
    const TabRender = () => {
        return <Tab key='permission' onTabClick={onTabClick} activeName='menu' tabsPanel={[{label:"Menu", name: "menu", panel:<MenuRender/>},{label:"Chức năng", name: "func", panel:<FuncRender/>}]} />;
    } 
    const getRowId = () => {        
        return refDynamicTable.current.getRowId();
    }
    return(
        <>
            <CtrlConfirm ref={refConfirm_InitMenu} Title="Bạn có muốn thực hiện thao tác này không ?" Ok={async () => {await InitMenu()}} Canel={()=>{}} />
            <CtrlConfirm ref={refConfirm_InitFunc} Title="Bạn có muốn thực hiện thao tác này không ?" Ok={async () => {await InitFunc()}} Canel={()=>{}} />
            <CtrlConfirm ref={refConfirm_SaveMenu} Title="Bạn có muốn thực hiện thao tác này không ?" Ok={async () => {await SaveMenu()}} Canel={()=>{}} />
            <CtrlConfirm ref={refConfirm_SaveFunc} Title="Bạn có muốn thực hiện thao tác này không ?" Ok={async () => {await SaveFunc()}} Canel={()=>{}} />
            <CtrlNotification ref={refNotification} />   
            <div className='row'>
                <div className='col-sm-6'>
                    <Card key={"role"} title={"Danh sách vai trò"}>
                        <CtrlDynamicTable 
                            onRowClick={onRowClick}
                            ref={refDynamicTable}
                            id={roleListView.DataGrid.Key} 
                            key={roleListView.DataGrid.Key} 
                            columnDefs={roleListView.DataGrid.ColumnDefs} 
                            dataItems={state.RoleItems}>                
                        </CtrlDynamicTable>
                    </Card>          
                </div>
                <div className='col-sm-6'>               
                    <Card key={"permission"} title={"Phân quyền người sử dụng"} buttonGroups={Permission_ButtonGroupsRender()}>
                        {TabRender()}
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

export default connect(mapState, mapDispatchToProps)(Permission);