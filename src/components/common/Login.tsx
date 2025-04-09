import React, { useEffect, useRef, useState } from 'react'
import { connect } from "react-redux";
import { CtrlDialog, CtrlInput,CtrlNotification } from './';
import { Actions } from 'store/app/Action';
import { Message } from 'models/Enums';
import CtrlButton from './CtrlButton';
import GoogleLogin from 'react-google-login';
import FacebookLogin from 'react-facebook-login';
import { gapi } from "gapi-script";
import { IResponseMessage } from 'models/Apps';
import { Regular } from 'helpers/regular';
import { useNavigate } from 'react-router-dom';
import Vinaphone from 'assets/img/nhacuatoi.png';
import speedtestvnpt from 'assets/img/login.jpg';
interface Props {
    UserLogin?: Function,
    UserSocialLogin?: Function,
    UserSignup?: Function,
    SendEmailRestorePassword?: Function,   
}

const Login = (props: Props) => {  
    const navigate = useNavigate();
    const [InputLogin, setInputLogin] = useState({ UserName: "", PassWord: "" }); 
    const [Email_RestorePassword, setEmail_RestorePassword] = useState(""); 
    const [InputSignupSocial, setInputSignupSocial] = useState({ Type: "", FullName: "", UserName: "", Password: "", Email: "", Token_Google: "", Token_Facebook: "", ClientId: "", ClientSecret: ""});
    const [dialogVisible_SocialLogin, setDialogVisible_SocialLogin] = useState(false);
    const [dialogVisible_RestorePassword, setDialogVisible_RestorePassword] = useState(false);
    const refNotification = useRef<any>();
    const clientId_google = process.env.ClientId_Google;   
    const clientSecret_google = process.env.ClientSecret_Google;    
    const clientId_facebook = process.env.ClientId_Facebook;
    const clientSecret_facebook = process.env.ClientSecret_Facebook;    
    const handleKeyDown = (event:any) => {
        if(event.keyCode == 13)
        {
            let tagNameFocus = document.activeElement.tagName.toLowerCase();
            if(tagNameFocus !== 'button')
            {
                if(dialogVisible_SocialLogin)
                {                    
                    Signup();                    
                }
                else if(dialogVisible_RestorePassword)
                {
                    SendEmail();
                }
                else
                {             
                    Login();
                }                
            }            
        }
    };
    useEffect(() => {
        gapi.load("client:auth2", () => {
            gapi.client.init({
              clientId: clientId_google,
              plugin_name: "Google Login",
            });
          });
    }, []);
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
    
        // cleanup this component
        return () => {
          window.removeEventListener('keydown', handleKeyDown);
        };
    });
    const Login = () => {        
        if(ValidateFormLogin()) {
            props.UserLogin(InputLogin);                    
        }
    }
    const Signup = async () => {                
        if(ValidateFormSignUp()) {
            let res:IResponseMessage = await props.UserSignup(InputSignupSocial);   
            if(res && res.Success)
            {
                refNotification.current.showNotification("success", res.Message);
                setDialogVisible_SocialLogin(false);
            }
        }
    }
    const SendEmail = async () => {               
        if(!Email_RestorePassword)
        {
            refNotification.current.showNotification("warning", Message.Email_Is_Not_Empty);
            return false;
        }
        else
        {        
          if(!Regular.email(Email_RestorePassword))
          {
            refNotification.current.showNotification("warning", Message.Email_Is_Not_Format);
            return false;
          }  
        } 
        let address = window.location.origin + "/" + "restore-password";        
        let res:IResponseMessage = await props.SendEmailRestorePassword(address, Email_RestorePassword);   
        if(res && res.Success)
        {
            refNotification.current.showNotification("success", res.Message);
            setDialogVisible_RestorePassword(false);            
        }
    }
    const onChangeFormLogin = (key: string, value: string) => {
        setInputLogin({
            ...InputLogin,
            [key]: value
        })
    }
    const onChangeFormSignupSocial = (key: string, value: string) => {
        setInputSignupSocial({
            ...InputSignupSocial,
            [key]: value
        })
    }
    const ValidateFormLogin = () => {   
        if(!InputLogin.UserName)
        {
            refNotification.current.showNotification("warning", Message.UserName_Is_Not_Empty);
            return false;
        }
        if(!InputLogin.PassWord)
        {
            refNotification.current.showNotification("warning", Message.Password_Is_Not_Empty);
            return false;
        }
        return true;
    }
    const ValidateFormSignUp = () => {        
        if(!InputSignupSocial.FullName)
        {
            refNotification.current.showNotification("warning", Message.FullName_Is_Not_Empty);
            return false;
        }
        if(!InputSignupSocial.UserName)
        {
            refNotification.current.showNotification("warning", Message.UserName_Is_Not_Empty);
            return false;
        }
        if(!InputSignupSocial.Password)
        {
            refNotification.current.showNotification("warning", Message.Password_Is_Not_Empty);
            return false;
        } 
        return true;
    }
    const responseGoogle = async (res:any) => {   
        var isSuccess = res.hasOwnProperty("profileObj");
        if(isSuccess)
        {
            var info = res["profileObj"];   
            let tempInputSignupSocial = {
                Type: "Google",
                FullName: info.name,
                UserName: info.givenName + info.familyName,
                Email: info.email,
                Token_Google: res.tokenId,
                Token_Facebook: "",
                ClientId: clientId_google,
                ClientSecret: clientSecret_google,
            }         
            let isLogged = await props.UserSocialLogin(tempInputSignupSocial);     
            if(isLogged) return;
            setInputSignupSocial({
                ...InputSignupSocial,
                Type: tempInputSignupSocial.Type,
                FullName:  tempInputSignupSocial.FullName,
                UserName: tempInputSignupSocial.UserName,
                Email: tempInputSignupSocial.Email,
                Token_Google: tempInputSignupSocial.Token_Google,
                Token_Facebook: tempInputSignupSocial.Token_Facebook,
            })            
            if (document.activeElement instanceof HTMLElement)
                document.activeElement.blur();            
            setDialogVisible_SocialLogin(true)
        }   
        else
        {
            refNotification.current.showNotification("success", Message.LoginGoogleError);
        }
    }
    const responseFacebook = async (res:any) => {            
        var isSuccess = res.hasOwnProperty("userID");
        if(isSuccess)
        {
            var info = res;
            let tempInputSignupSocial = {
                Type: "Facebook",
                FullName: info.name,
                UserName: info.name.replaceAll(' ',''),
                Email: info.email,
                Token_Google: "",
                Token_Facebook: res.accessToken,
                ClientId: clientId_facebook,
                ClientSecret: clientSecret_facebook,
            }
            let isLogged = await props.UserSocialLogin(tempInputSignupSocial);     
            if(isLogged) return;
            setInputSignupSocial({
                ...InputSignupSocial,
                Type: tempInputSignupSocial.Type,
                FullName: tempInputSignupSocial.FullName,
                UserName: tempInputSignupSocial.UserName,
                Email: tempInputSignupSocial.Email,
                Token_Google: tempInputSignupSocial.Token_Google,
                Token_Facebook: tempInputSignupSocial.Token_Facebook,
            })         
            if (document.activeElement instanceof HTMLElement)
                document.activeElement.blur();                                       
            setDialogVisible_SocialLogin(true)
        }  
        else
        {
            refNotification.current.showNotification("success", Message.LoginFacebookError);
        }
    }
    return (
        <>        
            <CtrlNotification ref={refNotification} />    
            <CtrlDialog title={"Gửi email khôi phục mật khẩu"} dialogVisible={dialogVisible_RestorePassword} onCancel={() => setDialogVisible_RestorePassword(false)}>
                <div className="row g-3 needs-validation form-register">
                    <div className="col-12">                      
                        <CtrlInput key="email" placeholder='Email' value={Email_RestorePassword} onChange={(e:any) => {setEmail_RestorePassword(e)}} />                        
                    </div>
                    <div className="col-12">                            
                        <CtrlButton title='Đồng ý' onClick={SendEmail} isFullWidth={true} />
                    </div>                    
                </div>                   
            </CtrlDialog>
            <CtrlDialog title={"Đăng ký tài khoản"} dialogVisible={dialogVisible_SocialLogin} onCancel={() => setDialogVisible_SocialLogin(false)}>
                <div className="row g-3 needs-validation form-register">
                    <div className="col-12">                      
                        <CtrlInput disabled={true} key="email" placeholder='Email' value={InputSignupSocial.Email} onChange={(e:any) => {onChangeFormSignupSocial('Email', e)}} />
                        <label style={{color:"#1B74E4", fontSize: "0.9em"}}><b>Email đã được xác thực bởi {InputSignupSocial.Type}</b></label>
                    </div>
                    <div className="col-12">                      
                        <CtrlInput key="fullname" placeholder='Họ và tên' value={InputSignupSocial.FullName} onChange={(e:any) => {onChangeFormSignupSocial('FullName', e)}} /> 
                    </div>
                    <div className="col-12">                      
                        <CtrlInput key="username" placeholder='Tên đăng nhập' value={InputSignupSocial.UserName} onChange={(e:any) => {onChangeFormSignupSocial('UserName', e)}} /> 
                    </div>
                    <div className="col-12">                      
                        <CtrlInput key="password" placeholder='Mật khẩu' type='password' value={InputSignupSocial.Password} onChange={(e:any) => {onChangeFormSignupSocial('Password', e)}} /> 
                    </div>                  
                    <div className="col-12">                            
                        <CtrlButton title='Đăng ký' onClick={Signup} isFullWidth={true} />
                    </div>                                                              
                </div>
            </CtrlDialog>   
            <section className="section register min-vh-100 d-flex flex-column align-items-center justify-content-center py-4">
                <div className="container">
                <div className="row justify-content-center">
                <div className="col-lg-7 col-md-4 d-flex flex-column align-items-center justify-content-center">
                <img src={speedtestvnpt} alt="" style={{width:"100%"}} />  
                    </div>
                    <div className="col-lg-4 col-md-6 d-flex flex-column align-items-center justify-content-center">
                    <div className="card mb-3">
                        <div className="card-body">
                        <div className="pt-4 pb-2">          
                            <h6 className="text-center">
                                <img src={Vinaphone} alt="" style={{width:"150px"}} />   
                            </h6>               
                            <h6 className="card-login-title text-center pb-0 fs-4">
                                <span className="title-underline">Đăng nhập </span> 
                                <span> hệ thống</span>
                            </h6>                        
                        </div>
                        <div className="row g-3 needs-validation form-login">
                            <div className="col-12">                            
                                <CtrlInput key="userName" placeholder='Tên đăng nhập hoặc email' value={InputLogin.UserName} onChange={(e:any) => {onChangeFormLogin('UserName', e)}} /> 
                            </div>
                            <div className="col-12">                            
                                <CtrlInput type='password'key="password" placeholder='Mật khẩu' value={InputLogin.PassWord} onChange={(e:any) => {onChangeFormLogin('PassWord', e)}} /> 
                            </div>
                            <div className="col-12">                            
                                <CtrlButton title='Đăng nhập' onClick={Login} isFullWidth={true} />
                            </div>
                            {/* <hr className="marginTop10 marginBottom10"/>
                            <div className="col-12 marginTop0 marginBottom0">    
                                <GoogleLogin
                                    clientId={clientId_google}
                                    className="googleLogin"
                                    buttonText="Login"
                                    onSuccess={responseGoogle}
                                    onFailure={responseGoogle}
                                    cookiePolicy={'single_host_origin'} />                                
                            </div>
                            <div className="col-12 marginTop5 marginBottom0">                                    
                                <FacebookLogin
                                    appId={clientId_facebook}
                                    cssClass="facebookLogin"
                                    autoLoad={false}
                                    fields="name,email,picture"
                                    onClick={() => {}}
                                    callback={responseFacebook} />
                            </div>                             */}
                            <div className="col-12">
                            <p className="small mb-0">Bạn chưa có tài khoản? 
                                {/* <a href="#" onClick={() => { navigate('/register'); }}>&ensp;Đăng ký tài khoản</a> */}
                                <a href="#">&ensp;Đăng ký tài khoản</a>
                                &ensp;*&ensp;
                                <a href="#" onClick={() => {setDialogVisible_RestorePassword(true)}}>Khôi phục mật khẩu</a>
                            </p>
                            </div>
                        </div>
                        </div>
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
    UserLogin: Actions.UserLogin,
    UserSocialLogin: Actions.UserSocialLogin,
    UserSignup: Actions.UserSignup,
    SendEmailRestorePassword: Actions.SendEmailRestorePassword
};

export default connect(mapState, mapDispatchToProps)(Login);