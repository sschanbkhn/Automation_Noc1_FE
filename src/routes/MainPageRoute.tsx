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
import Anm_uc1 from "components/ANM/UC1";
import DashboardR001 from "components/RNOC1/R001";
import Ucppoe from "components/INOC1/I003";
import NornirPlatformView from "components/SNOC/components/NornirPlatformView";
import DashOrigin from "components/SNOC/views/dashboard/DashOrigin/SystemHealthDashboard";

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
import ConfigReport from "components/RNOC1/R009";
import ClearThuebaoDaphien from "components/INOC1/I003";
import LspQuocte from "components/INOC1/I004";
import DataLspQuocte from "components/INOC1/I004.1";

interface Props {
  Apps: any;
}

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
      case "DashboardRnoc":
        return <DashboardRnocSummary />;
      case "DashboardRnocRoom":
        return <DashboardRnocRoom />;
      case "ScheduleTriggerForm":
        return <ScheduleTriggerForm />;
      case "anm_uc1":
        return <Anm_uc1 />;
      case "ucppoe":
        return <Ucppoe />;
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
