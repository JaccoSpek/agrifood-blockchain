export class Message {
  text:string;
  level:string;
}

export class CcRole {
  Admin:boolean;
  Role:string;
}

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

export class Authorization {
  AuthorizedParty:      string;
  CertifyingParty:      string;
  AccreditationID:      string;
  Accreditation:        Accreditation;
  Expires:              string;
  Revoked:              boolean;
  RevocationTimestamp:  string;
}
