import { Injectable } from '@angular/core';

export class KeyValue {
  key:string;
  value:any;
  readonly:boolean;
}

@Injectable()
export class SharedService {
  private keyValueStore: KeyValue[] = [];

  public setKey(key:string, value:any, readonly?:boolean): boolean {
    let found:boolean = false;

    // update existing value
    this.keyValueStore.forEach(function (keyVal:KeyValue) {
      if(keyVal.key == key){
        found = true;
        if(!keyVal.readonly){
          keyVal.value = value;
        } else {
          console.log("Failed to update key/Value: record is static");
        }
      }
    });

    // if not found, create new value
    if(!found){
      let keyVal:KeyValue = {
        "key" : key,
        "value": value,
        "readonly": false
      };

      if(readonly){
        keyVal.readonly = readonly;
      }

      this.keyValueStore.push(keyVal);
    }
    return true;
  }

  public getValue(key:string): any {
    let value:string = null;

    this.keyValueStore.forEach(function (keyVal:KeyValue) {
      if(keyVal.key == key){
        value = keyVal.value;
      }
    });
    return value;
  }
}
