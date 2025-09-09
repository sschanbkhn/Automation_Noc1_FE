import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { connect } from "react-redux";
import Home from 'components/Home';
import { Config } from 'components/System';
import { Account, Organ, Permission, Role } from 'components/User';
import { CategoryAlarmCode, CategoryAlarmLevel, CategoryStatus, CategoryAlarmType } from 'components/Category';
import menu_config from 'assets/json/menu_config.json'
import Page404 from 'components/common/Page404';
import Profile from 'components/common/Profile';
import Page401 from 'components/common/Page401';
import { Cookie } from 'helpers/cookie';
import { IUserInfo } from 'models/Apps';
import Setting from 'components/common/Setting';
import Support from 'components/common/Support';
import { CableManagement, ConfigurationLogs, CurenAlarm, DevicePorts, Devices, DeviceTypes, HistoryCurenAlarm, Manufacturers, NetworkLinks } from 'components/Network';
import MapComponent from 'components/Network/LinksMaps/Map';
import Charts from 'uielements/charts/Charts';
import CenterDashboard from '../DashboardAutomation/CenterDashboard';
import RoomDashboard from '../DashboardAutomation/RoomDashboard';
import DashboardRnocSummary from '../DashboardAutomation/DashboardRnoc/DashboardRnocSummary';
import DashboardRnocRoom from '../DashboardAutomation/DashboardRnoc/DashboardRnocRoom';
import Anm_uc1 from 'components/ANM/UC1';
import Anm_uc2 from 'components/ANM/UC2';
import Anm_uc3 from 'components/ANM/UC3';
import Anm_uc4 from 'components/ANM/UC4';
import Anm_uc5 from 'components/ANM/UC5';
import Anm2_uc1 from 'components/ANM2/UC1';
import Anm2_uc2 from 'components/ANM2/UC2';
import Anm2_uc4 from 'components/ANM2/UC4';
import Anm3_uc1 from 'components/ANM3/UC1';

interface Props {
    Apps: any
}

const MainPageRoute = (props: Props) => {  
    const GetPage = (code:String) => {
        switch(code)
        {
            case "Home":
                // return <Home />;
                return <CenterDashboard />;
            case "Config":
                return <Config />;
            case "Account":
                return <Account />;              
            case "Organ":
                return <Organ />;
            case "Permission":
                return <Permission />;
            case "Role":
                return <Role />;  
            case "CategoryStatus":
                return <CategoryStatus />; 
            case "CategoryAlarmCode":
                return <CategoryAlarmCode />; 
            case "CategoryAlarmLevel":
                return <CategoryAlarmLevel />; 
            case "CategoryAlarmType":
                return <CategoryAlarmType />;

            case "LinksMaps":
                return <MapComponent />;
            case "CableManagement":
                return <CableManagement />;                
            case "ConfigurationLogs":
                return <ConfigurationLogs />;
            case "CurenAlarm":
                return <CurenAlarm />;
            case "HistoryCurenAlarm":
                return <HistoryCurenAlarm />;  
            case "DevicePorts":
                return <DevicePorts />;              
            case "Devices":
                return <Devices />;
            case "DeviceTypes":
                return <DeviceTypes />;
            case "Manufacturers":
                return <Manufacturers />;  
            case "NetworkLinks":
                return <NetworkLinks />; 
            case "CenterDashboard":
                return <CenterDashboard />;
            case "RoomDashboard":
                return <RoomDashboard />;
            case "DashboardRnoc":
                return <DashboardRnocSummary />;
            case "DashboardRnocRoom":
                return <DashboardRnocRoom />;
            case "anm_uc1":
                return <Anm_uc1 />;
            case "anm_uc2":
                return <Anm_uc2 />;
            case "anm_uc3":
                return <Anm_uc3 />;
            case "anm_uc4":
                return <Anm_uc4 />;
            case "anm_uc5":
                return <Anm_uc5 />;
            case "anm2_uc1":
                return <Anm2_uc1 />;
            case "anm2_uc2":
                return <Anm2_uc2 />;
            case "anm2_uc4":
                return <Anm2_uc4 />;
            case "anm3_uc1":
                return <Anm3_uc1 />;
            default:
                return <Page404 />;                                                                                                         
        }        
    }
    const RouteRender = () => {
        let html = [];
        let rootMenu:any = menu_config.Menu;
        for(let i = 0;i < rootMenu.length;i++)
        {
            let menu = rootMenu[i];
            if(IsMenuOfUser(menu)) {
                html.push(<Route key={menu.code} path={menu.url} element={GetPage(menu.code)} />)
            }
            if(menu.subMenu && menu.subMenu.length > 0) 
            {
                for(let j = 0;j < menu.subMenu.length;j++)
                {
                    let subMenu = menu.subMenu[j];
                    if(IsMenuOfUser(subMenu)) {
                        html.push(<Route key={subMenu.code} path={subMenu.url} element={GetPage(subMenu.code)} />)
                    }
                }
            }
        }
        return html;
    }
    const IsMenuOfUser = (menu:any) => {      
        let userInfo:IUserInfo = JSON.parse(Cookie.getCookie("UserInfo"));
        if(userInfo.UserName == "admin") return true;   
        if(userInfo)
        {
            for(let i = 0;i < userInfo.Menus.length;i++)
            {
              if(userInfo.Menus[i] == menu.code)
              {
                return true
              }
            }
        }
        return false;
      }
    return(
        <Routes>
            {RouteRender()}
            <Route path="/dashboard/field/:fieldName" element={<RoomDashboard />} />
            <Route path="/dashboard" element={<CenterDashboard />} />
            <Route path="/dashboard/room/:roomId" element={<RoomDashboard />} />
            <Route key="Profile" path="/profile" element={<Profile />} />
            <Route key="Setting" path="/setting" element={<Setting />} />
            <Route key="Support" path="/support" element={<Support />} />
            <Route key="401" path="/page401" element={<Page401 />} />
            <Route key="404" path="/page404" element={<Page404 />} />       
        </Routes>
    )
}
const mapState = ({ ...state }) => ({
    Apps: state.apps
});
const mapDispatchToProps = {
    
};

export default connect(mapState, mapDispatchToProps)(MainPageRoute);
