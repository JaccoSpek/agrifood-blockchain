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
  Description:string;
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

export class AccreditationSignature {
  Issuer:               string;
  AccreditationID:      string;
  Issued:               string;
  Revoked:              boolean;
  RevocationTimestamp:  string;
  Valid:                boolean;
}

export class OwnershipEntry {
  PartyID:    string;
  Timestamp:  string;
}

export class GrapeAsset {
  UUID:                     string;
  Producer:                 string;
  Created:                  string;
  AccreditationSignatures:  AccreditationSignature[];
  Ownership:                OwnershipEntry[];
}
