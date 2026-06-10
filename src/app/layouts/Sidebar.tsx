import React, { useEffect, useState } from 'react'
import { connect } from "react-redux";
import { NavLink, useLocation } from 'react-router-dom';
import menu_config from 'assets/json/menu_config.json';
import { Actions } from 'store/app/Action';
import { Cookie } from 'helpers/cookie';
import { IUserInfo } from 'models/Apps';
import { getJwtClaims } from 'components/SNOC/api/snocApiWithAutoToken';

interface Props {
  Apps: any
}

const Sidebar = (props: Props) => {    
    const location = useLocation();
    // State quản lý menu đang mở
    const [openMenus, setOpenMenus] = useState<string[]>([]);

    // Tìm đường dẫn menu để tự động mở
    const findMenuPathByUrl = (menus: any[], targetUrl: string, path: string[] = []): string[] => {
        for (const menu of menus) {
            const currentPath = [...path, menu.code];
            if (menu.url === targetUrl) {
                return currentPath;
            }
            if (menu.subMenu && menu.subMenu.length > 0) {
                const found = findMenuPathByUrl(menu.subMenu, targetUrl, currentPath);
                if (found.length > 0) {
                    return found;
                }
            }
        }
        return [];
    };

    // Tự động mở menu theo route hiện tại
    useEffect(() => {
        const currentPath = location.pathname;
        const autoOpenMenus = findMenuPathByUrl(menu_config.Menu, currentPath);
        setOpenMenus(autoOpenMenus);
    }, [location.pathname]);

    // Toggle menu mở/đóng
    const toggleMenu = (menuCode: string) => {
        setOpenMenus(prev =>
            prev.includes(menuCode)
                ? prev.filter(code => code !== menuCode)
                : [...prev, menuCode]
        );
    };

    // Kiểm tra menu có đang mở không
    const isMenuOpen = (menuCode: string) => openMenus.includes(menuCode);

    // Vẽ submenu đệ quy
    const DrawSubMenu = (subMenu: any[], parentCode: string = ''): JSX.Element => {
        return (
            <ul className="nav-content submenu-indent" style={{ display: 'block', paddingLeft: 0 }}>
                {subMenu.map((item) => {
                    if (!IsMenuOfUser(item)) return null;
                    const itemCode = parentCode ? `${parentCode}-${item.code}` : item.code;
                    const hasSubMenu = item.subMenu && item.subMenu.length > 0;
                    return (
                        <li key={itemCode} className="nav-item" style={{ marginBottom: 2 }}>
                            {hasSubMenu ? (
                                <>
                                    <a
                                        className={`nav-link ${isMenuOpen(itemCode) ? '' : 'collapsed'}`}
                                        href="#"
                                        onClick={e => { e.preventDefault(); toggleMenu(itemCode); }}
                                        style={{ cursor: 'pointer', userSelect: 'none', padding: '6px 12px', lineHeight: 1.2 }}
                                    >
                                        <i className={item.icon}></i>
                                        <span>{item.name}</span>
                                        <i className="bi bi-chevron-down ms-auto" style={{fontSize: 20, fontWeight: 700, marginLeft: 8}}></i>
                                    </a>
                                    {isMenuOpen(itemCode) && (
                                        <div>
                                            {DrawSubMenu(item.subMenu, itemCode)}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <NavLink
                                    className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
                                    to={item.url}
                                >
                                    <i className={item.icon} />
                                    {item.name}
                                </NavLink>
                            )}
                        </li>
                    );
                })}
            </ul>
        );
    };

    // Vẽ menu chính
    const DrawMenu = (): JSX.Element[] => {
        const menu = menu_config.Menu;
        return menu.map((item) => {
            if (!IsMenuOfUser(item)) return null;
            const hasSubMenu = item.subMenu && item.subMenu.length > 0;
            return (
                <li key={item.code} className="nav-item" style={{ marginBottom: 2 }}>
                    {hasSubMenu ? (
                        <>
                            <a
                                className={`nav-link ${isMenuOpen(item.code) ? '' : 'collapsed'}`}
                                href="#"
                                onClick={e => { e.preventDefault(); toggleMenu(item.code); }}
                                style={{ cursor: 'pointer', userSelect: 'none', padding: '6px 12px', lineHeight: 1.2 }}
                            >
                                <i className={item.icon}></i>
                                <span>{item.name}</span>
                                <i className="bi bi-chevron-down ms-auto" style={{fontSize: 20, fontWeight: 700, marginLeft: 8}}></i>
                            </a>
                            {isMenuOpen(item.code) && (
                                <div>
                                    {DrawSubMenu(item.subMenu, item.code)}
                                </div>
                            )}
                        </>
                    ) : (
                        <NavLink
                            className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
                            to={item.url}
                        >
                            <i className={item.icon} />
                            {item.name}
                        </NavLink>
                    )}
                </li>
            );
        }).filter(Boolean);
    };

    const IsMenuOfUser = (menu: any): boolean => {
        // "User Admin Snoc" chỉ hiển thị cho SNOC super user
        if (menu.code === 'hc-snoc-admin-dashboard') {
            const claims = getJwtClaims();
            return Boolean(claims?.is_superuser || claims?.role === 'super');
        }

        let userInfo: IUserInfo = JSON.parse(Cookie.getCookie("UserInfo"));
        if (userInfo && userInfo.UserName == "admin") return true;
        if (userInfo != null) {
            for (let i = 0; i < userInfo.Menus.length; i++) {
                if (userInfo.Menus[i] == menu.code) {
                    return true;
                }
            }
        }
        return false;
    };

    return (      
        <aside id="sidebar" className="sidebar">
            <ul className="sidebar-nav" id="sidebar-nav">
                {DrawMenu()}
            </ul>
        </aside>
    );
};

const mapState = ({ ...state }) => ({
    Apps: state.apps
});

const mapDispatchToProps = {};

export default connect(mapState, mapDispatchToProps)(Sidebar);