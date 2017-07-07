import { Injectable } from '@angular/core';
import {Headers, Http, RequestOptions} from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { API_URL } from '../config';

@Injectable()
export class WalletService {
  private apiURL = API_URL;
  private headers = new Headers({'Content-Type': 'application/json'});
  private opts = new RequestOptions({headers:this.headers, withCredentials: true });

  constructor(private http: Http) {}

  login(username:string, password:string):Promise<boolean> {
    let url:string = `${this.apiURL}/auth/login`;

    let params = {
      "username": username,
      "password": password
    };

    return this.http.post(url, JSON.stringify(params), this.opts)
      .toPromise()
      .then((response:any) => {
        return response.text()
      })
      .catch(WalletService.handleError);
  }

  getStatus():Promise<string> {
    let url:string = `${this.apiURL}/auth/status`;

    return this.http.get(url, this.opts)
      .toPromise()
      .then(response => response.text() as string)
      .catch(WalletService.handleError);
  }

  logout():Promise<string> {
    let url:string = `${this.apiURL}/auth/logout`;

    return this.http.get(url, this.opts)
      .toPromise()
      .then(response => response.text() as string)
      .catch(WalletService.handleError);
  }

  private static handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }

}
