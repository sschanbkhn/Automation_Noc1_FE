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
import Hardware_Alarm from "components/INOC1/I002/index";

import PSCoreTable from "components/SNOC/views/tables/health/PSCoreTable";
import CsTable from "components/SNOC/views/tables/health/CsTable";
import SignalTable from "components/SNOC/views/tables/health/SignalTable";
import OcsTable from "components/SNOC/views/tables/health/OcsTable";

import ClearThuebaoDaphien from "components/INOC1/I003";
import LspQuocte from "components/INOC1/I004";
import DataLspQuocte from "components/INOC1/I004_1";
import ConfigReport from "components/RNOC1/R009";
import Sleeping from "components/RNOC1/R005-SleepingCell/R005HomeSleepingCell";
import DashboardAudit from "components/RNOC1/R001";
import DashboardR007 from "components/RNOC1/R009"
// snoc start
import UserGroupDeptManager from "components/SNOC/Admin/UserGroupDeptManager";
import NornirPlatformView from "components/SNOC/components/NornirPlatformView";
import DnsConfigDashboard from "components/SNOC/views/dashboard/DashOrigin/DnsConfigDashboard";
import SbcDashboardWithNavbar from "components/SNOC/views/dashboard/DashOrigin/SbcDashboardWithNavbar";
import DashOrigin from "components/SNOC/views/dashboard/DashOrigin/SystemHealthDashboard";
import DnsLacracrnc from "components/SNOC/views/forms/dns/Dnslacracrnc";
import TACConfigPanel from "components/SNOC/views/forms/dns/TACConfigPanel";
import Healthcheck from "components/SNOC/views/forms/health/Healthcheck";
import Schedule from "components/SNOC/views/forms/health/Schedule";
import CreateConnectionForm from "components/SNOC/views/forms/sbc/CreateConnectionForm";
import DeclareNumberForm from "components/SNOC/views/forms/sbc/DeclareNumberForm";
import RequestHistoryTable from "components/SNOC/views/forms/sbc/RequestHistoryTable";
import RoutingDeclarationForm from "components/SNOC/views/forms/sbc/RoutingDeclarationForm";
import HistoricalReporting from "components/SNOC/views/tables/health/HistoricalReporting";
import RequireSnocAuthInline from "components/SNOC/auth/RequireSnocAuthInline";
import RequireSuperUserInline from "components/SNOC/auth/RequireSuperUserInline";
import SnocLoginInline from "components/SNOC/auth/SnocLoginInline";
import SnocSubApp from "components/SNOC/SnocSubApp";
import HostConfigPanel from "components/SNOC/views/forms/hosts/HostConfigPanel";
import KPIChartDashboard from "components/SNOC/views/forms/kpi/KPIChartDashboard";
import KPISelectorPage from "components/SNOC/views/forms/kpi/KPISelectorPage";
import ScheduleGeneric from "components/SNOC/views/forms/kpi/ScheduleCausecode";

///snoc end
// ANM
import AnmTabs from 'components/ANM/Anmtabs';
import AnmTabs2 from 'components/ANM2/Anmtabs';
import AnmTabs3 from 'components/ANM3/Anmtabs';
import AnmTabs4 from 'components/ANM3/Anmtabs2';

///

// SOC1
import VPN3G4G from "../components/SOC1/S001-VPN3G4G/SOC001VPN3G4G";
import SIPTRUNK from "../components/SOC1/S002-Siptrunk/SOC002SIPTRUNK";

//
interface Props {
    Apps: any;
}
const SNOC_CODES = new Set<string>([
  "hc-dashboard",
  "hc-dashboard-dns",
  "hc-dashboard-sbc",
  "hc-snoc-admin-dashboard",
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
                return <DashboardAudit />;
            case "CableManagement":
                return <CableManagement />;
            case "Hardware_Alarm":
                return <Hardware_Alarm />;
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
            case "audit-cau-hinh-vo-tuyen":
            return <DashboardAudit />;
            case "DashboardR002":
              return <DashboardAudit />; // Tạm thời dùng DashboardAudit, sau này thay bằng component thực tế
            case "DashboardR003":
              return <DashboardAudit />; // Tạm thời dùng DashboardAudit, sau này thay bằng component thực tế
            case "DashboardR004":
              return <DashboardAudit />; // Tạm thời dùng DashboardAudit, sau này thay bằng component thực tế
            case "DashboardR005":
              return <DashboardAudit />; // Tạm thời dùng DashboardAudit, sau này thay bằng component thực tế
            case "DashboardR006":
              return <DashboardAudit />; // Tạm thời dùng DashboardAudit, sau này thay bằng component thực tế
            case "DashboardR007":
              return <DashboardR007 />;
            case "SleepingCellManagement":
              return <Sleeping />;
              // Tạm thời dùng DashboardR001, sau này thay bằng component thực tế
            case "ScheduleTriggerForm":
                return <ScheduleTriggerForm />;
            // case "anm_uc1":
            //     return <Anm_uc1 goToTab={() => {}} setFilters={() => {}} />;
            case "ucppoe":
                return <Ucppoe />;
            case "i004_1":
                return <I004_1List />;
            // snoc start
            case "hc-dashboard":
                return <DashOrigin />;
            case "hc-dashboard-dns":
                return <DnsConfigDashboard />;
            case "hc-dashboard-sbc":
                return <SbcDashboardWithNavbar />;
            case "ClearThuebaoDaphien":
                return <ClearThuebaoDaphien />;
                //snoc end

            case "hc-schedule":
                return <Schedule />;
            case "hc-checks":
                return <Healthcheck />;
            case "hc-history":
                return <HistoricalReporting />;
           
            case "hc-tacs":
                return <TACConfigPanel />;
            case "hc-lacracrnc":
                return <DnsLacracrnc />;
           
            case "ClearThuebaoDaphien":
                return <ClearThuebaoDaphien />;
            case "LspQuocte":
                return <LspQuocte />;
            case "DataLspQuocte":
                return <DataLspQuocte />;

        // menu ANM
            case "anm_uc1":
                return <AnmTabs />;
            case "anm2_uc1":
                return <AnmTabs2 />;
            case "anm3_uc1":
                return <AnmTabs3 />;
            case "anm4_uc1":
                return <AnmTabs4 />;
                // end menu ANM
    /// SOC1
              case "soc001-vpn3G4G":  
                return <VPN3G4G />;
                case "soc002-siptrunk":
                return <SIPTRUNK />;
    ///
            default:
                return <Page404 />;
        }
    };
//     const RouteRender = () => {
//     const html: JSX.Element[] = [];
//     const rootMenu: any = menu_config.Menu;

//     for (const menu of rootMenu) {
//       if (!IsMenuOfUser(menu)) continue;

//       // 🔒 SNOC config BỎ QUA HOÀN TOÀN route SNOC ở đây start
//       if (!SNOC_CODES.has(menu.code)) {
//         html.push(
//           <Route key={menu.code} path={menu.url} element={GetPage(menu.code)} />
//         );
//       }
//       // 🔒 SNOC config BỎ QUA HOÀN TOÀN route SNOC ở đây end
//       if (menu.subMenu?.length) {
//         for (const sub of menu.subMenu) {
//           if (IsMenuOfUser(sub) && !SNOC_CODES.has(sub.code)) {
//             html.push(
//               <Route
//                 key={sub.code}
//                 path={sub.url}
//                 element={GetPage(sub.code)}
//               />
//             );
//           }
//         }
//       }
//     }
//     return html;
//   };
    const RouteRender = () => {
        let html = [];
        let rootMenu: any = menu_config.Menu;
        for (let i = 0; i < rootMenu.length; i++) {
            let menu = rootMenu[i];
            if (IsMenuOfUser(menu)) {
                // BỎ QUA các route SNOC (để tránh trùng với nhóm RequireSnocAuthInline phía dưới)
                if (!SNOC_CODES.has(menu.code)) {
                        html.push(
                        <Route key={menu.code} path={menu.url} element={GetPage(menu.code)} />
                        );
                    }
                html.push(
                    <Route key={menu.code} path={menu.url} element={GetPage(menu.code)} />
                );
                
            }
            if (menu.subMenu && menu.subMenu.length > 0) {
                for (let j = 0; j < menu.subMenu.length; j++) {
                    let subMenu = menu.subMenu[j];
                    if (IsMenuOfUser(subMenu) && !SNOC_CODES.has(subMenu.code)) {
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
          {/* chỉ super mới vào được khu Admin */}
          <Route element={<RequireSuperUserInline />}>
            <Route path="/app/snoc/admin" element={<UserGroupDeptManager />} />
          </Route>

          <Route path="/healthcheck/devices" element={<HostConfigPanel />} />
          <Route path="/healthcheck/schedule" element={<Schedule />} />
          <Route path="/healthcheck/checks" element={<Healthcheck />} />
          <Route
            path="/healthcheck/history"
            element={<HistoricalReporting />}
          />
          <Route path="/healthcheck/kpi" element={<KPIChartDashboard />} />
          <Route
            path="/healthcheck/kpischedule"
            element={<ScheduleGeneric />}
          />
          <Route path="/kpi/:system/:subsystem" element={<KPISelectorPage />} />
          <Route path="/healthcheck/:group" element={<DashOrigin />} />
          <Route
            path="/healthcheck/:group/:subsystem"
            element={<DashOrigin />}
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
            {/* /// SOC1 */}
             <Route path="/s001-vpn3G4G" element={<VPN3G4G />} />
            <Route path="/s002-siptrunk" element={<SIPTRUNK />} />
        </Routes>
    );
};
const mapState = ({ ...state }) => ({
    Apps: state.apps,
});
const mapDispatchToProps = {};

export default connect(mapState, mapDispatchToProps)(MainPageRoute);
