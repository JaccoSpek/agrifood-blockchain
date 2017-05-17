export class Message {
  text:string;
  level:string;
}

export class CcRole {
  Admin:boolean;
  Role:string;
}

/*
 // accreditation to issue
 type SigningAccreditation struct {
 ID			string
 Description		string
 AccreditationBody	string
 CertificationBody	string
 Created			time.Time
 Expires			time.Time
 Revoked			bool
 RevocationTimestamp	time.Time
 }
 */
export class Accreditation {
  ID:string;
  description:string;
  AccreditationBody:string;
  CertificationBody:string;
  Created:string;
  Expires:string;
  Revoked:boolean;
  RevocationTimestamp:string;
}
