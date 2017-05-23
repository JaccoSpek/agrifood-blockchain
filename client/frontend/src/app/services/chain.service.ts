import { Injectable } from '@angular/core';
import {Headers, Http, RequestOptions} from '@angular/http';
import {Accreditation, CcRole} from '../types';
import 'rxjs/add/operator/toPromise';
import { API_URL } from '../config';

@Injectable()
export class ChainService {
  private apiURL = API_URL;
  private headers = new Headers({'Content-Type': 'application/json'});
  private opts = new RequestOptions({headers:this.headers, withCredentials: true });

  constructor(private http: Http) {}

  login(enrollId: string, enrollSecret: string): Promise<boolean> {
    let url = `${this.apiURL}/enroll`;

    let params = {
      "enrollId": enrollId,
      "enrollSecret": enrollSecret
    };

    return this.http.post(url, JSON.stringify(params), this.opts)
      .toPromise()
      .then((response:any) => {
        return response.text()
      })
      .catch(ChainService.handleError);
  }

  logout(): Promise<boolean> {
    let url = `${this.apiURL}/logout`;

    return this.http.post(url,{},this.opts)
      .toPromise()
      .then((response:any) => {
        return response.text()
      })
      .catch(ChainService.handleError);
  }

  get_enrollment(): Promise<string> {
    let url = `${this.apiURL}/enrollment`;

    return this.http.get(url,this.opts)
      .toPromise()
      .then(response => {
        return response.text()
      })
      .catch(ChainService.handleError);
  }

  deploy(): Promise<String> {
    let url = `${this.apiURL}/deploy`;

    return this.http.post(url, {}, this.opts)
      .toPromise()
      .then(response => response.text() as string)
      .catch(ChainService.handleError);

  }

  get_ccid(): Promise<string> {
    let url = `${this.apiURL}/ccid`;

    return this.http.get(url, this.opts)
      .toPromise()
      .then(response => response.text() as string)
      .catch(ChainService.handleError);
  }

  get_caller_role(): Promise<CcRole> {
    let url = `${this.apiURL}/role`;

    return this.http.get(url, this.opts)
      .toPromise()
      .then(response => response.json() as CcRole)
      .catch(ChainService.handleError);
  }

  get_roles(): Promise<string[]> {
    let url = `${this.apiURL}/roles`;

    return this.http.get(url, this.opts)
      .toPromise()
      .then(response => response.json() as string[])
      .catch(ChainService.handleError);
  }

  add_party(id:string,role:string): Promise<string> {
    let url = `${this.apiURL}/add_party`;

    let args:any = {id:id,role:role};

    return this.http.post(url,args,this.opts)
      .toPromise()
      .then(response => response.text() as string)
      .catch(ChainService.handleError);
  }

  add_signing_accreditation(id:string,description:string,created:string,expires:string): Promise<string> { //"id","description","created_date","expiration_date"
    let url = `${this.apiURL}/ab/add_signing_accreditation`;

    let args:any = {
      id:id,
      description:description,
      created_date:created,
      expiration_date:expires
    };

    return this.http.post(url,JSON.stringify(args),this.opts)
      .toPromise()
      .then(response => response.text() as string)
      .catch(ChainService.handleError);
  }

  get_role_parties(role:string): Promise<string[]> {
    let url = `${this.apiURL}/role_parties/${role}`;

    return this.http.get(url,this.opts)
      .toPromise()
      .then(response => response.json() as any)
      .catch(ChainService.handleError);
  }

  get_party_accreditations(party:string): Promise<Accreditation[]> {
    let url = `${this.apiURL}/get_party_accreditations/${party}`;

    return this.http.get(url,this.opts)
      .toPromise()
      .then(response => response.json() as Accreditation[])
      .catch(ChainService.handleError);
  }

  issue_accreditation(accreditation:string,cert_body:string): Promise<string> {
    let url = `${this.apiURL}/ab/issue_signing_accreditation`;

    let args = {
      accr_id: accreditation,
      cb: cert_body
    };

    return this.http.post(url,args,this.opts)
      .toPromise()
      .then(response => response.text() as string)
      .catch(ChainService.handleError);
  }

  revoke_accreditation(accreditationID:string,timestamp:string): Promise<string> {
    let url = `${this.apiURL}/ab/revoke_signing_accreditation`;

    let args = {
      accr_id:accreditationID,
      timestamp:timestamp
    };

    return this.http.post(url,args,this.opts)
      .toPromise()
      .then(response => response.text() as string)
      .catch(ChainService.handleError);
  }

  get_issued_accreditations(party:string): Promise<Accreditation[]> {
    let url = `${this.apiURL}/get_issued_accreditations/${party}`;

    return this.http.get(url,this.opts)
      .toPromise()
      .then(response => response.json() as Accreditation[])
      .catch(ChainService.handleError);
  }

  grant_signing_authority(accreditation:string,farm:string,expiration_date:string): Promise<string> {
    let url = `${this.apiURL}/cb/grant_signing_authority`;

    let args = {
      accr_id: accreditation,
      farm: farm,
      expiration_date:expiration_date
    };

    return this.http.post(url,args,this.opts)
      .toPromise()
      .then(response => response.text() as string)
      .catch(ChainService.handleError);
  }

  private static handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }

}
