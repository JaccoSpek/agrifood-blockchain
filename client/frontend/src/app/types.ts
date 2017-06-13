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

/*
 // signature to attach to assets
 type AccreditationSignature struct {
 Issuer              string
 AccreditationID     string
 Issued              time.Time
 Revoked             bool
 RevocationTimestamp time.Time
 }

 // Entity in ownership chain
 type OwnershipEntry struct {
 PartyID		string
 Timestamp	time.Time
 }

 */

export class AccreditationSignature {
  Issuer:               string;
  AccreditationID:      string;
  Issued:               string;
  Revoked:              boolean;
  RevocationTimestamp:  string;
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
