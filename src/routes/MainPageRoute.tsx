import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { connect } from "react-redux";
import Home from "components/Home";
import { Config } from "components/System";
import { Account, Organ, Permission, Role } from "components/User";
import {
    CategoryAlarmCode,
    CategoryAlarmLevel,
    CategoryStatus,
    CategoryAlarmType,
} from "components/Category";
import menu_config from "assets/json/menu_config.json";
import Page404 from "components/common/Page404";
import Profile from "components/common/Profile";
import Page401 from "components/common/Page401";
import { Cookie } from "helpers/cookie";
import { IUserInfo } from "models/Apps";
import Setting from "components/common/Setting";
import Support from "components/common/Support";
import {
    CableManagement,
    ConfigurationLogs,
    CurenAlarm,
    DevicePorts,
    Devices,
    DeviceTypes,
    HistoryCurenAlarm,
    Manufacturers,
    NetworkLinks,
} from "components/Network";
import MapComponent from "components/Network/LinksMaps/Map";
import Charts from "uielements/charts/Charts";
import CenterDashboard from "../DashboardAutomation/CenterDashboard";
import RoomDashboard from "../DashboardAutomation/RoomDashboard";
import DashboardRnocSummary from "../DashboardAutomation/DashboardRnoc/DashboardRnocSummary";
import DashboardRnocRoom from "../DashboardAutomation/DashboardRnoc/DashboardRnocRoom";
import ScheduleTriggerForm from "components/RNOC1/R009";
import Ucppoe from "components/INOC1/I003";
import I004_1List from "components/I004_1";
import NornirPlatformView from "components/SNOC/components/NornirPlatformView";
import DashOrigin from "components/SNOC/components/DashOriginWithStore";

import PSCoreTable from "components/SNOC/views/tables/health/PSCoreTable";
import CsTable from "components/SNOC/views/tables/health/CsTable";
import SignalTable from "components/SNOC/views/tables/health/SignalTable";
import OcsTable from "components/SNOC/views/tables/health/OcsTable";
import HistoricalReporting from "components/SNOC/views/tables/health/HistoricalReporting";
import Healthcheck from "components/SNOC/views/forms/health/Healthcheck";
import Schedule from "components/SNOC/views/forms/health/Schedule";
import DnsLacracrnc from "components/SNOC/views/forms/dns/Dnslacracrnc";
import TACConfigPanel from "components/SNOC/views/forms/dns/TACConfigPanel";
import DnsConfigDashboard from "components/SNOC/views/dashboard/DashOrigin/DnsConfigDashboard";
import SbcDashboardWithNavbar from "components/SNOC/views/dashboard/DashOrigin/SbcDashboardWithNavbar";
import CreateConnectionForm from "components/SNOC/views/forms/sbc/CreateConnectionForm";
import DeclareNumberForm from "components/SNOC/views/forms/sbc/DeclareNumberForm";
import RoutingDeclarationForm from "components/SNOC/views/forms/sbc/RoutingDeclarationForm";
import RequestHistoryTable from "components/SNOC/views/forms/sbc/RequestHistoryTable";
import ClearThuebaoDaphien from "components/INOC1/I003";
import LspQuocte from "components/INOC1/I004";
import DataLspQuocte from "components/INOC1/I004_1";
import ConfigReport from "components/RNOC1/R009";
import Sleeping from "components/RNOC1/R005-SleepingCell/R005HomeSleepingCell";
import DashboardR001 from "components/RNOC1/R001";
import DashboardR007 from "components/RNOC1/R009"
/// SNOC
import SnocSubApp from "components/SNOC/SnocSubApp";
import SnocLoginInline from "components/SNOC/auth/SnocLoginInline";
import RequireSnocAuthInline from "components/SNOC/auth/RequireSnocAuthInline";
import HostConfigPanel from "components/SNOC/views/forms/hosts/HostConfigPanel";
import KPIChartDashboard from "components/SNOC/views/forms/kpi/KPIChartDashboard";
import KPISelectorPage from "components/SNOC/views/forms/kpi/KPISelectorPage";
///
// ANM
import Anm_uc1 from 'components/ANM/UC1';
import Anm_uc2 from 'components/ANM/UC2';
import Anm_uc3 from 'components/ANM/UC3';
import Anm_uc4 from 'components/ANM/UC4';
import Anm_uc5 from 'components/ANM/UC5';
import Anm2_uc1 from 'components/ANM2/UC1';
import Anm2_uc2 from 'components/ANM2/UC2';
import Anm2_uc4 from 'components/ANM2/UC4';
import Anm3_uc1 from 'components/ANM3/UC1';

///
interface Props {
    Apps: any;
}
const SNOC_CODES = new Set<string>([
  "hc-dashboard",
  "hc-dashboard-dns",
  "hc-dashboard-sbc",
]);

const MainPageRoute = (props: Props) => {
    const GetPage = (code: String) => {
        switch (code) {
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
            case "ConfigReport":
                return <ConfigReport />;
            case "DashboardR001":
                return <DashboardR001 />;
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
            case "NornirPlatformView":
                return <NornirPlatformView />;
            case "CenterDashboard":
                return <CenterDashboard />;
            case "RoomDashboard":
                return <RoomDashboard />;
            case "DashboardR001":
            return <DashboardR001 />;
            case "DashboardR002":
              return <DashboardR001 />; // Tạm thời dùng DashboardR001, sau này thay bằng component thực tế
            case "DashboardR003":
              return <DashboardR001 />; // Tạm thời dùng DashboardR001, sau này thay bằng component thực tế
            case "DashboardR004":
              return <DashboardR001 />; // Tạm thời dùng DashboardR001, sau này thay bằng component thực tế
            case "DashboardR005":
              return <DashboardR001 />; // Tạm thời dùng DashboardR001, sau này thay bằng component thực tế
            case "DashboardR006":
              return <DashboardR001 />; // Tạm thời dùng DashboardR001, sau này thay bằng component thực tế
            case "DashboardR007":
              return <DashboardR007 />;
            case "SleepingCellManagement":
              return <Sleeping />;
              // Tạm thời dùng DashboardR001, sau này thay bằng component thực tế
            case "ScheduleTriggerForm":
                return <ScheduleTriggerForm />;
            case "anm_uc1":
                return <Anm_uc1 />;
            case "ucppoe":
                return <Ucppoe />;
            case "i004_1":
                return <I004_1List />;
            case "hc-dashboard":
                return <DashOrigin />;
            case "hc-schedule":
                return <Schedule />;
            case "hc-checks":
                return <Healthcheck />;
            case "hc-history":
                return <HistoricalReporting />;
            case "hc-dashboard-dns":
                return <DnsConfigDashboard />;
            case "hc-tacs":
                return <TACConfigPanel />;
            case "hc-lacracrnc":
                return <DnsLacracrnc />;
            case "hc-dashboard-sbc":
                return <SbcDashboardWithNavbar />;
            case "ClearThuebaoDaphien":
                return <ClearThuebaoDaphien />;
            case "LspQuocte":
                return <LspQuocte />;
            case "DataLspQuocte":
                return <DataLspQuocte />;

    ///ANM
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
           
    ///
            default:
                return <Page404 />;
        }
    };
    const RouteRender = () => {
        let html = [];
        let rootMenu: any = menu_config.Menu;
        for (let i = 0; i < rootMenu.length; i++) {
            let menu = rootMenu[i];
            if (IsMenuOfUser(menu)) {
                // BỎ QUA các route SNOC (để tránh trùng với nhóm RequireSnocAuthInline phía dưới)
                if (!SNOC_CODES.has(menu.code)) {
                html.push(
                    <Route
                    key={menu.code}
                    path={menu.url}
                    element={GetPage(menu.code)}
                    />
                );
                }
                html.push(
                    <Route key={menu.code} path={menu.url} element={GetPage(menu.code)} />
                );
                
            }
            if (menu.subMenu && menu.subMenu.length > 0) {
                for (let j = 0; j < menu.subMenu.length; j++) {
                    let subMenu = menu.subMenu[j];
                    if (IsMenuOfUser(subMenu)) {
                        html.push(
                            <Route
                                key={subMenu.code}
                                path={subMenu.url}
                                element={GetPage(subMenu.code)}
                            />
                        );
                    }
                }
            }
        }
        return html;
    };
    const IsMenuOfUser = (menu: any) => {
        let userInfo: IUserInfo = JSON.parse(Cookie.getCookie("UserInfo"));
        if (userInfo.UserName == "admin") return true;
        if (userInfo) {
            for (let i = 0; i < userInfo.Menus.length; i++) {
                if (userInfo.Menus[i] == menu.code) {
                    return true;
                }
            }
        }
        return false;
    };
    return (
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
            <Route path="/schedule-trigger-form" element={<ScheduleTriggerForm />} />
            {/* Phần riêng cho SNOC */}
            <Route element={<SnocSubApp />}>
        <Route path="/snoc/login" element={<SnocLoginInline />} />
        <Route element={<RequireSnocAuthInline />}>
          {/* các route SNOC cần login */}
    
          <Route path="/app/dashboard/origin" element={<DashOrigin />} />
          <Route path="/healthcheck/devices" element={<HostConfigPanel />} />
          <Route path="/healthcheck/schedule" element={<Schedule />} />
          <Route path="/healthcheck/checks" element={<Healthcheck />} />
          <Route
            path="/healthcheck/history"
            element={<HistoricalReporting />}
          />
          <Route path="/healthcheck/kpi" element={<KPIChartDashboard />} />
          <Route path="/healthcheck/kpischedule" element={<Schedule />} />
          <Route path="/kpi/:system/:subsystem" element={<KPISelectorPage />} />
          <Route path="/healthcheck/:group" element={<Healthcheck />} />
          <Route
            path="/healthcheck/:group/:subsystem"
            element={<Healthcheck />}
          />
          <Route path="/app/dashboard/dns" element={<DnsConfigDashboard />} />
          <Route path="/dns/tacs" element={<TACConfigPanel />} />
          <Route path="/dns/lacracrnc" element={<DnsLacracrnc />} />
          <Route path="/dns/apns" element={<TACConfigPanel />} />
          <Route
            path="/app/dashboard/sbc"
            element={<SbcDashboardWithNavbar />}
          />

          <Route path="/sbc/dashboard" element={<SbcDashboardWithNavbar />} />
          <Route
            path="/sbc/CreateConnectionForm"
            element={<CreateConnectionForm />}
          />
          <Route
            path="/sbc/DeclareNumberForm"
            element={<DeclareNumberForm />}
          />
          <Route
            path="/sbc/RoutingDeclarationForm"
            element={<RoutingDeclarationForm />}
          />
          <Route
            path="/sbc/RequestHistoryTable"
            element={<RequestHistoryTable />}
          />
        </Route>
      </Route>
      {/* Kết thúc phần SNOC */}
            <Route path="/app/dashboard/origin" element={<DashOrigin />} />
            <Route path="/healthcheck/devices" element={<DashOrigin />} />
            <Route path="/healthcheck/schedule" element={<Schedule />} />
            <Route path="/healthcheck/checks" element={<Healthcheck />} />
            <Route path="/healthcheck/history" element={<HistoricalReporting />} />
            <Route path="/healthcheck/ps-core" element={<PSCoreTable />} />
            <Route path="/healthcheck/cs-core" element={<CsTable />} />
            <Route path="/healthcheck/signal" element={<SignalTable />} />

            <Route path="/healthcheck/ocs" element={<OcsTable />} />
            <Route path="/app/dashboard/dns" element={<DnsConfigDashboard />} />
            <Route path="/dns/tacs" element={<TACConfigPanel />} />
            <Route path="/dns/lacracrnc" element={<DnsLacracrnc />} />
            <Route path="/sbc/dashboard" element={<SbcDashboardWithNavbar />} />
            <Route
                path="/sbc/CreateConnectionForm"
                element={<CreateConnectionForm />}
            />
            <Route path="/sbc/DeclareNumberForm" element={<DeclareNumberForm />} />
            <Route
                path="/sbc/RoutingDeclarationForm"
                element={<RoutingDeclarationForm />}
            />
            <Route
                path="/sbc/RequestHistoryTable"
                element={<RequestHistoryTable />}
            />
        </Routes>
    );
};
const mapState = ({ ...state }) => ({
    Apps: state.apps,
});
const mapDispatchToProps = {};

export default connect(mapState, mapDispatchToProps)(MainPageRoute);
