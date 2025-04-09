import { Regular } from 'helpers/regular';
import { IResponseMessage } from 'models/Apps';
import { Message } from 'models/Enums';
import React, { useEffect, useRef, useState } from 'react'
import { connect } from "react-redux";
import { Actions } from 'store/app/Action';
import CtrlButton from './CtrlButton';
import CtrlInput from './CtrlInput';
import CtrlNotification from './CtrlNotification';
interface Props {    
    GetUserInfo?: Function,
    EditUserInfo?: Function,
    ChangePassword?: Function,
    ChangeLoading?: Function
}

const Profile = (props: Props) => {  
    const [InputProfile, setInputProfile] = useState({ FullName: "", UserName: "", Email: "", Phone: "", Address: "" });
    const [InputChangePassword, setInputChangePassword] = useState({ PasswordOld: "", PasswordNew: ""});
    const refNotification = useRef<any>();
    const handleKeyDown = (event:any) => {        
        if(event.keyCode == 13)
        {            
            let tagNameFocus = document.activeElement.tagName.toLowerCase();
            if(tagNameFocus !== 'button')
            {                
                let tab_edit =  document.getElementById("tab_edit");            
                let tab_change_password =  document.getElementById("tab_change_password");
                if(tab_edit.className.includes("active")) {
                    SaveProfile();
                }
                if(tab_change_password.className.includes("active")) {
                    ChangePassword();
                }        
            }    
        }
    }; 

    React.useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
    
        // cleanup this component
        return () => {
          window.removeEventListener('keydown', handleKeyDown);
        };
    });     
    useEffect(() => {

        async function fetchData() {            
            let userInfo = await props.GetUserInfo();        
            if(userInfo) {                   
                setInputProfile({
                    ...InputProfile,
                    FullName: userInfo.FullName,
                    UserName: userInfo.UserName,
                    Email: userInfo.Email,
                    Phone: userInfo.Phone,
                    Address: userInfo.Address
                })                             
            }
        }      
        fetchData();
    }, [])

    const onChange_InputProfile = (key: string, value: string) => {
        setInputProfile({
            ...InputProfile,
            [key]: value
        })
    }  
    const onChange_InputChangePassword = (key: string, value: string) => {
        setInputChangePassword({
            ...InputChangePassword,
            [key]: value
        })
    }        
    const ValidateFormProfile = () => {        
        if(!InputProfile.FullName)
        {
            refNotification.current.showNotification("warning", Message.FullName_Is_Not_Empty);
            return false;
        }
        if(!InputProfile.UserName)
        {
            refNotification.current.showNotification("warning", Message.UserName_Is_Not_Empty);
            return false;
        }
        if(!InputProfile.Email)
        {
            refNotification.current.showNotification("warning", Message.Email_Is_Not_Empty);
            return false;
        }
        else
        {        
          if(!Regular.email(InputProfile.Email))
          {
            refNotification.current.showNotification("warning", Message.Email_Is_Not_Format);
            return false;
          }  
        }
        // if(!InputProfile.Phone)
        // {
        //     refNotification.current.showNotification("warning", Message.Phone_Is_Not_Empty);
        //     return false;
        // } 
        // else
        // {                
        //   if(!Regular.phoneVN(InputProfile.Phone))
        //   {
        //     refNotification.current.showNotification("warning", Message.Phone_Is_Not_Format);
        //     return false;
        //   }   
        // }     
        return true
    }
    const ValidateFormChangePassword = () => {
        if(!InputChangePassword.PasswordOld)
        {
            refNotification.current.showNotification("warning", Message.OldPassword_Is_Not_Empty);
            return false;
        }
        if(!InputChangePassword.PasswordNew)
        {
            refNotification.current.showNotification("warning", Message.NewPassword_Is_Not_Empty);
            return false;
        }
        return true;
    }
    const ChangePassword = async () => {
        if(ValidateFormChangePassword()) {
            let res:IResponseMessage = await props.ChangePassword(InputChangePassword)
            if(res && res.Success)
            {                
                refNotification.current.showNotification("success", res.Message);
            }
        }
    }
    const SaveProfile = async () => {        
        if(ValidateFormProfile()) {                        
            let res:IResponseMessage = await props.EditUserInfo(InputProfile)
            if(res && res.Success)
            {                
                refNotification.current.showNotification("success", res.Message);
            }
        }        
    }
    return(
        <>
            <CtrlNotification ref={refNotification} /> 
            <section className="section profile">
                <div className="row">
                {/* <div className="col-xl-4">
                    <div className="card">
                    <div className="card-body profile-card pt-4 d-flex flex-column align-items-center">
                        <img src="assets/img/profile-img.jpg" alt="Profile" className="rounded-circle" />
                        <h2>Kevin Anderson</h2>
                        <h3>Web Designer</h3>
                        <div className="social-links mt-2">
                        <a href="#" className="twitter"><i className="bi bi-twitter" /></a>
                        <a href="#" className="facebook"><i className="bi bi-facebook" /></a>
                        <a href="#" className="instagram"><i className="bi bi-instagram" /></a>
                        <a href="#" className="linkedin"><i className="bi bi-linkedin" /></a>
                        </div>
                    </div>
                    </div>
                </div> */}
                <div className="col-xl-12">
                    <div className="card">
                    <div className="card-body pt-3">
                        {/* Bordered Tabs */}
                        <ul className="nav nav-tabs nav-tabs-bordered">
                        <li className="nav-item">
                            <button id="tab_edit" className="nav-link active" data-bs-toggle="tab" data-bs-target="#profile-edit">Sửa hồ sơ</button>
                        </li>
                        <li className="nav-item">
                            <button id="tab_change_password" className="nav-link" data-bs-toggle="tab" data-bs-target="#profile-change-password">Thay đổi mật khẩu</button>
                        </li>
                        </ul>
                        <div className="tab-content pt-2">
                        <div className="tab-pane fade show active profile-edit pt-3" id="profile-edit">
                            {/* Profile Edit Form */}
                            <form style={{"width" : "50%"}}>
                            <div className="row mb-3">
                                <CtrlInput key="fullname" placeholder='Họ và tên' value={InputProfile.FullName} onChange={(e:any) => {onChange_InputProfile('FullName', e)}} /> 
                            </div>
                            <div className="row mb-3">
                                <CtrlInput key="username" disabled={true} placeholder='Tên đăng nhập' value={InputProfile.UserName} onChange={(e:any) => {onChange_InputProfile('UserName', e)}} /> 
                            </div>
                            <div className="row mb-3">
                                <CtrlInput key="email" placeholder='Email' value={InputProfile.Email} onChange={(e:any) => {onChange_InputProfile('Email', e)}} />
                            </div>
                            <div className="row mb-3">
                                <CtrlInput key="phone" placeholder='SĐT' value={InputProfile.Phone} onChange={(e:any) => {onChange_InputProfile('Phone', e)}} />
                            </div>
                            <div className="row mb-3">
                                <CtrlInput key="address" placeholder='Địa chỉ' value={InputProfile.Address} onChange={(e:any) => {onChange_InputProfile('Address', e)}} />
                            </div>
                            <div className="text-center">                            
                                <CtrlButton title='Lưu' onClick={SaveProfile} />
                            </div>
                            </form>{/* End Profile Edit Form */}
                        </div>
                        <div className="tab-pane fade pt-3" id="profile-change-password">
                            {/* Change Password Form */}
                            <form style={{"width" : "50%"}}>
                            <div className="row mb-3">
                                <CtrlInput type='password' key="oldpassword" placeholder='Mật khẩu cũ' value={InputChangePassword.PasswordOld} onChange={(e:any) => {onChange_InputChangePassword('PasswordOld', e)}} /> 
                            </div>
                            <div className="row mb-3">
                                <CtrlInput type='password' key="newpassword" placeholder='Mật khẩu mới' value={InputChangePassword.PasswordNew} onChange={(e:any) => {onChange_InputChangePassword('PasswordNew', e)}} /> 
                            </div>
                            <div className="text-center">
                                <CtrlButton title='Đổi mật khẩu' onClick={ChangePassword} />
                            </div>
                            </form>{/* End Change Password Form */}
                        </div>
                        </div>{/* End Bordered Tabs */}
                    </div>
                    </div>
                </div>
                </div>
            </section>
        </>
    )
}
const mapState = ({ ...state }) => ({
    
});
const mapDispatchToProps = {
    GetUserInfo: Actions.GetUserInfo,
    EditUserInfo: Actions.EditUserInfo,
    ChangePassword: Actions.ChangePassword,
    ChangeLoading: Actions.ChangeLoading
};

export default connect(mapState, mapDispatchToProps)(Profile);