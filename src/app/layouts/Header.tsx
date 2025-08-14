import { HubConnectionBuilder } from '@microsoft/signalr/dist/esm/HubConnectionBuilder';
import { Cookie } from 'helpers/cookie';
import { INotification, IUserInfo } from 'models/Apps';
import { AppName } from 'models/Enums';
import React, { useEffect, useState } from 'react'
import { connect } from "react-redux";
import { useNavigate } from 'react-router-dom';
import { Actions } from 'store/app/Action';
import Vinaphone from 'assets/img/imghome.png';
interface Props {
  UserLogout?: Function  
  //GetListDonVi?: any
}

const Header = (props: Props) => {  
    //const [ connection, setConnection ] = useState(null);
    const [notifications, setNotifications] = useState<Array<INotification>>([]);
    const navigate = useNavigate();
    useEffect(() => {
      //props.GetListDonVi();
      // const newConnection = new HubConnectionBuilder()
      // .withUrl(process.env.HUB_URL + '/notification', {
      //   accessTokenFactory: () => {
      //     return Cookie.getCookie("Token");
      //   }})
      // .withAutomaticReconnect()
      // .build();

      // setConnection(newConnection);
    }, []);
  //   useEffect(() => {
  //     if(userInfo.UserName == "admin")
  //     {
  //       if (connection) {
  //           connection.start()
  //               .then(async (result:any) => {
  //                   console.log('Connected!');
  //                   await connection.invoke('GetNotis', 'admin').then((data:any) => {                       
  //                     SetNotifications(data);
  //                   });        
  //                   connection.on('ReceiveRegisteredUsers', (data:any) => {
  //                     SetNotifications(JSON.parse(data));                      
  //                   })
  //               })
  //               .catch((e:any) => console.log('Connection failed: ', e));
  //       }
  //     }
  // }, [connection]);  
    const NotificationsRender = () => {
      var notis = [], notiClass = "";
      for(let i = 0;i < notifications.length;i++)
      {     
        if(notifications[i].Type == "0")//success
        {
          notiClass = "bi bi-check-circle text-success";
        }
        else if(notifications[i].Type == "1")//warning
        {
          notiClass = "bi bi-exclamation-circle text-warning";
        }
        else if(notifications[i].Type == "2")//error
        {
          notiClass = "bi bi-x-circle text-danger";
        }
        else if(notifications[i].Type == "3")//info
        {
          notiClass = "bi bi-info-circle text-primary";
        }
        notis.push(
          <li key={i+100}>
            <hr className="dropdown-divider" />
          </li>)          
        notis.push(
          <li key={i} className="notification-item">          
            <i className={notiClass} />
            <div>
              <h4>{notifications[i].Title}</h4>
              <p>{notifications[i].Content}</p>
              <p>{notifications[i].CreatedDateTime}</p>
            </div>
          </li>)
      }
      return(
              <ul key={"notification"} className="dropdown-menu dropdown-menu-end dropdown-menu-arrow notifications">
                <li key={0} className="dropdown-header">
                  Bạn có {notifications ? notifications.length : 0} thông báo mới                  
                </li>
                {notis}
                <li key={200}>
                  <hr className="dropdown-divider" />
                </li>
                <li key={201} className="dropdown-footer">
                  <a href="#">Xem tất cả thông báo</a>
                </li>
              </ul>)
    }
    const SetNotifications = (oData:any) => {      
      let notis = [];
      for(let i = 0;i < oData.length;i++)
      {
        let noti:INotification = { 
          Type: oData[i].type, 
          Title: oData[i].title, 
          Content: oData[i].content,
          CreatedDateTime: oData[i].createdDateTime
        }
        notis.push(noti);
      }      
      setNotifications(notis)
    }  
    const toggleSidebar = () => {
      document.body.classList.toggle('toggle-sidebar')
    }
    const Logout = () => {      
      props.UserLogout();
      navigate('/');
    }
    const GoToPageHome = () => {
      navigate('/');
    }
    const GoToPageProfile = () => {
      navigate('/profile');
    }
    const GoToPageSetting = () => {
      navigate('/setting');
    }
    const GoToPageSupport = () => {
      navigate('/support'); 
    }
    // let userInfo:IUserInfo = JSON.parse(Cookie.getCookie("UserInfo"));    
let userInfo:IUserInfo = Cookie.getCookie("UserInfo") ? 
    JSON.parse(Cookie.getCookie("UserInfo")) : 
    { UserName: "Admin", RoleName: "Administrator" };


    return(
      <header id="header" className="header fixed-top d-flex align-items-center">
        <div className="d-flex align-items-center justify-content-between">
          <a href="#" onClick={GoToPageHome} className="logo d-flex align-items-center">
            <img src={Vinaphone} alt="" />            
            <span className="d-none d-lg-block">{AppName}</span>
          </a>
          <i className="bi bi-list toggle-sidebar-btn" onClick={toggleSidebar} />
        </div>{/* End Logo */}
        {/* <div className="search-bar">
          <form className="search-form d-flex align-items-center" method="POST" action="#">
            <input type="text" name="query" placeholder="Tìm kiếm" title="Enter search keyword" />
            <button type="submit" title="Search"><i className="bi bi-search" /></button>
          </form>
        </div> */}
        {/* End Search Bar */}
        <nav className="header-nav ms-auto">
          <ul className="d-flex align-items-center">
            {/* <li className="nav-item d-block d-lg-none">
              <a className="nav-link nav-icon search-bar-toggle " href="#">
                <i className="bi bi-search" />
              </a>
            </li> */}
            {/* End Search Icon*/}
            <li className="nav-item dropdown">
              <a className="nav-link nav-icon" href="#" data-bs-toggle="dropdown">
                <i className="bi bi-bell" />
                <span className="badge bg-primary badge-number">{notifications ? notifications.length : 0}</span>
              </a>{/* End Notification Icon */}
              {NotificationsRender()}
            </li>{/* End Notification Nav */}
            <li className="nav-item dropdown">
              <a className="nav-link nav-icon" href="#" data-bs-toggle="dropdown">
                <i className="bi bi-chat-left-text" />
                <span className="badge bg-success badge-number">3</span>
              </a>{/* End Messages Icon */}
              <ul className="dropdown-menu dropdown-menu-end dropdown-menu-arrow messages">
                <li className="dropdown-header">
                  Bạn có 3 tin nhắn mới
                  {/* <a href="#"><span className="badge rounded-pill bg-primary p-2 ms-2">View all</span></a> */}
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li className="message-item">
                  <a href="#">
                    {/* <img src="assets/img/messages-1.jpg" alt="" className="rounded-circle" /> */}
                    <div>
                      <h4>Người dùng 1</h4>
                      <p>Nội dung 1...</p>
                      <p>4 giờ trước</p>
                    </div>
                  </a>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li className="message-item">
                  <a href="#">
                    {/* <img src="assets/img/messages-2.jpg" alt="" className="rounded-circle" /> */}
                    <div>
                      <h4>Người dùng 2</h4>
                      <p>Nội dung 2...</p>
                      <p>6 giờ trước</p>
                    </div>
                  </a>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li className="message-item">
                  <a href="#">
                    {/* <img src="assets/img/messages-3.jpg" alt="" className="rounded-circle" /> */}
                    <div>
                      <h4>Người dùng 3</h4>
                      <p>Nội dung 3...</p>
                      <p>8 giờ trước</p>
                    </div>
                  </a>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li className="dropdown-footer">
                  <a href="#">Xem tất cả tin nhắn</a>
                </li>
              </ul>{/* End Messages Dropdown Items */}
            </li>{/* End Messages Nav */}
            <li className="nav-item dropdown pe-3">
              <a className="nav-link nav-profile d-flex align-items-center pe-0" href="#" data-bs-toggle="dropdown">                                
                <span className="d-md-block dropdown-toggle ps-2">{userInfo.UserName.toUpperCase()}</span>
              </a>{/* End Profile Iamge Icon */}
              <ul className="dropdown-menu dropdown-menu-end dropdown-menu-arrow profile">
                <li className="dropdown-header">
                  <h6>{userInfo.UserName.toUpperCase()}</h6>
                  <span>{userInfo.RoleName.toUpperCase()}</span>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <a className="dropdown-item d-flex align-items-center" href="#" onClick={GoToPageProfile}>
                    <i className="bi bi-person" />
                    <span>Hồ sơ</span>
                  </a>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <a className="dropdown-item d-flex align-items-center" href="#" onClick={GoToPageSetting}>
                    <i className="bi bi-gear" />
                    <span>Cài đặt</span>
                  </a>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <a className="dropdown-item d-flex align-items-center" href="#" onClick={GoToPageSupport}>
                    <i className="bi bi-question-circle" />
                    <span>Hỗ trợ</span>
                  </a>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <a className="dropdown-item d-flex align-items-center" href="#" onClick={Logout}>
                    <i className="bi bi-box-arrow-right" />
                    <span>Đăng xuất</span>
                  </a>
                </li>
              </ul>{/* End Profile Dropdown Items */}
            </li>{/* End Profile Nav */}
          </ul>
        </nav>{/* End Icons Navigation */}
      </header>
    )
}
const mapState = ({ ...state }) => ({

});
const mapDispatchToProps = {
    UserLogout: Actions.UserLogout,
    //GetListDonVi: Actions.GetListDonVi
};

export default connect(mapState, mapDispatchToProps)(Header);