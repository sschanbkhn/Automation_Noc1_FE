import React, { useEffect, useState } from 'react'
import { connect } from "react-redux";
import { NavLink } from 'react-router-dom';
import menu_config from 'assets/json/menu_config.json';
import { Actions } from 'store/app/Action';
import { Cookie } from 'helpers/cookie';
import { IUserInfo } from 'models/Apps';
interface Props {
  Apps: any
}

const Sidebar = (props: Props) => {    
    const DrawSubMenu = (id: any, subMenu: any) => {    
      let html_subMenu:any = [];  
      for(let i = 0;i < subMenu.length;i++)
      {
        if(IsMenuOfUser(subMenu[i])) {
          if(subMenu[i].subMenu && subMenu[i].subMenu.length > 0) {
            html_subMenu.push(
              <li key={"subMenuLi" + i} className="nav-item">
                <a className="nav-link collapsed" data-bs-target={"#" + subMenu[i].code + "-nav"} data-bs-toggle="collapse" href="#">
                  <i className={subMenu[i].icon}></i><span>{subMenu[i].name}</span><i className="bi bi-chevron-down ms-auto"></i>
                </a>
                {DrawSubMenu(subMenu[i].code + "-nav", subMenu[i].subMenu)}
              </li>
            );
          } else {
            html_subMenu.push(<li key={"subMenu" + i}><NavLink className="nav-link" to={subMenu[i].url}><i className={subMenu[i].icon} />{subMenu[i].name}</NavLink></li>);
          }
        }
      }
      return <ul id={id} className="nav-content collapse submenu-indent" data-bs-parent="#sidebar-nav">{html_subMenu}</ul>;
    }
    const DrawMenu = () => {
      let menu:any = menu_config.Menu;
      let html_menu:any = [];
      for(let i = 0;i < menu.length;i++)
      {
        if(IsMenuOfUser(menu[i])) {
          html_menu.push(
            <li key={"li" + i} className="nav-item">
              {
                menu[i].subMenu && menu[i].subMenu.length > 0 ? 
                <>
                  <a className="nav-link collapsed" data-bs-target={"#" + menu[i].code + "-nav"} data-bs-toggle="collapse" href="#">
                    <i className={menu[i].icon}></i><span>{menu[i].name}</span><i className="bi bi-chevron-down ms-auto"></i>
                  </a>
                  {DrawSubMenu(menu[i].code + "-nav", menu[i].subMenu)}
                </> : 
                <NavLink className="nav-link" to={menu[i].url}><i className={menu[i].icon} />{menu[i].name}</NavLink>
              }            
            </li>
          );
        }        
      }           
      return html_menu;
    }
    const IsMenuOfUser = (menu:any) => { 
      let userInfo:IUserInfo = JSON.parse(Cookie.getCookie("UserInfo"));    
      if(userInfo && userInfo.UserName == "admin") return true;   
      if(userInfo != null)
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
      <aside id="sidebar" className="sidebar">
        <ul className="sidebar-nav" id="sidebar-nav">
          {DrawMenu()}
        </ul>
      </aside>
    )
}
const mapState = ({ ...state }) => ({
  Apps: state.apps
});
const mapDispatchToProps = {

};

export default connect(mapState, mapDispatchToProps)(Sidebar);