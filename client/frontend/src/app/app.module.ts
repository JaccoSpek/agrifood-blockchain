import { NgModule}         from '@angular/core';
import { BrowserModule }    from '@angular/platform-browser';
import { HttpModule}       from '@angular/http';
import { FormsModule }      from '@angular/forms';

import { AppComponent }     from './app.component';
import { SharedService }    from './services/shared.service';
import { ChainService }     from './services/chain.service';
import { AppRoutingModule } from './modules/app-routing.module';

import { AuthComponent } from './components/auth.component';
import { ChaincodeIdComponent } from './components/chaincode-id.component';
import { AdminComponent } from './components/admin.component';

@NgModule({
  imports:      [ BrowserModule, HttpModule, FormsModule, AppRoutingModule ],
  declarations: [
    AppComponent,
    AuthComponent,
    ChaincodeIdComponent,
    AdminComponent
  ],
  providers:    [ SharedService, ChainService ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
