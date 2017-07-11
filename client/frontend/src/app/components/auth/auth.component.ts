import {Component, OnInit}    from '@angular/core';
import {SharedService} from "../../services/shared.service";
import {WalletService} from "../../services/wallet.service";
import {Message} from "../../types";

@Component({
  moduleId: module.id,
  selector: 'auth',
  templateUrl: 'auth.component.html'
})
export class AuthComponent implements OnInit{
  private userID:string;
  private msg:Message;

  constructor(private sharedService:SharedService, private walletService:WalletService) {};

  ngOnInit():void {
    this.walletService.getStatus()
      .then(result => {
        console.log(result);
        this.userID = result;
        this.sharedService.notifyOther({option: 'login',value: result});
      })
      .catch(err =>{
        console.log(err.text())
      });
  }

  login(username:string, password:string):void {
    console.log("Login %s",username);

    // login
    if(typeof username != "undefined" && typeof password != "undefined"){
      this.msg = { text: "Loggin in...", level:"alert-info"};

      this.walletService.login(username,password)
        .then(result => {
          this.msg = null;
          console.log(result);

          this.userID = username;
          this.sharedService.notifyOther({option: 'login',value: username});
        })
        .catch(err => {
          this.msg = { text: "Unable to login: "+err.text(), level:"alert-danger" };
        })

    } else {
      this.msg = { text: "Please provide login details", level:"alert-warning"};
    }
  }

  logout():void {
    console.log("Logout");

    this.walletService.logout()
      .then(() => {
        this.userID = null;
        this.sharedService.notifyOther({option: 'login',value: null});
        this.sharedService.setKey("enrolledId",null);
        this.sharedService.setKey("role",null);
        this.sharedService.notifyOther({option: 'enroll',value: null});
        this.sharedService.notifyOther({option: 'role',value: null});
      })
      .catch(err => {
        this.msg = { text: "Unable to logout: "+err.text(), level:"alert-danger" };
      })
  }
}
