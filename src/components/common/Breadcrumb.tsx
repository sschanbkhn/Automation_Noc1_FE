import React, { useEffect, useState } from 'react'
import { connect } from "react-redux";
import { useLocation } from 'react-router-dom';
import menu_config from 'assets/json/menu_config.json';
interface Props {
       
}

const Breadcrumb = (props: Props) => {  
  let location = useLocation();
  const [root_breadcrumb, set_root_breadcrumb] = useState<any>();
  const [node_breadcrumb, set_node_breadcrumb] = useState<any>();
  useEffect(() => {     
     let root_breadcrumb = '', node_breadcrumb = '', pathname = location.pathname;
     let rootMenu:any = menu_config.Menu;
     for(let i = 0;i < rootMenu.length;i++)
     {
         let menu = rootMenu[i];    
         if(menu.url == pathname) 
         {
          root_breadcrumb = menu;
         }     
         if(menu.subMenu && menu.subMenu.length > 0) 
         {
             for(let j = 0;j < menu.subMenu.length;j++)
             {
                 let subMenu = menu.subMenu[j];
                 if(subMenu.url == pathname) 
                 {
                  root_breadcrumb = menu;
                  node_breadcrumb = subMenu;
                 }
             }
         }
     }
     set_root_breadcrumb(root_breadcrumb);
     set_node_breadcrumb(node_breadcrumb);
  },[location]) 
    return(
        <div className="pagetitle">
          <nav>
            <ol className="breadcrumb">
              <li className="breadcrumb-item">{root_breadcrumb?root_breadcrumb.name:''}</li>
              {node_breadcrumb?<li className="breadcrumb-item active">{node_breadcrumb.name}</li>:<></>}           
            </ol>
          </nav>
        </div>
    )
}
const mapState = ({ ...state }) => ({
    
});
const mapDispatchToProps = {
    
};

export default connect(mapState, mapDispatchToProps)(Breadcrumb);