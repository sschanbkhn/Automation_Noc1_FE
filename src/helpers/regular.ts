export class Regular {
  static email = (email:any) => {
    let pattern:any = new RegExp('^([0-9a-zA-Z]([-.\\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\\w]*[0-9a-zA-Z]\\.)+[a-zA-Z]{2,9})$');
    return pattern.test(email);
  };

  static phoneVN = (phone:any) => {    
    let pattern:any = new RegExp('(84|0[3|5|7|8|9])+([0-9]{8})');    
    return pattern.test(phone);
  };
}

