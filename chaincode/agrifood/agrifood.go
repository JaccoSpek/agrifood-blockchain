package main

import (
	"encoding/base64"
	"errors"
	"fmt"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	"github.com/hyperledger/fabric/core/crypto/primitives"
	"encoding/json"
	"time"
)

var myLogger = shim.NewLogger("Agrifood")

type CallerRole struct {
	Admin bool
	Role string
}

type Party struct {
	ID    string   // identifier of party
	Role  string   // role of the party
	Certs []string // encoded certificates
}

// party authorized to use a certain accreditation
type SigningAuthorization struct {
	AuthorizedParty     string
	AccreditationID     string
	Expires             time.Time
	Revoked             bool
	RevocationTimestamp time.Time
}

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

// Grapes asset
type GrapesUnit struct {
	Producer                string
	Created                 time.Time
	UUID                    string
	AccreditationSignatures []AccreditationSignature
	Ownership               []OwnershipEntry
}

// Smart-contract
type AgrifoodChaincode struct {
	roles        []string // list of roles
}

// initialize smart-contract
func (t *AgrifoodChaincode) Init(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {
	myLogger.Info("Init Chaincode...")

	// Roles of parties able to invoke chaincode
	t.roles = []string{"AccreditationBody","CertificationBody","Farm","Auditor","Trader"}

	// Initiate empty arrays
	err := stub.PutState("AdminCerts", []byte("[]"))
	err = stub.PutState("Parties", []byte("[]"))
	err = stub.PutState("SigningAccreditations", []byte("[]"))
	err = stub.PutState("SigningAuthorizations", []byte("[]"))
	err = stub.PutState("GrapeUnits", []byte("[]"))

	if err != nil {
		msg := fmt.Sprintf("Failed initializing variables: %s", err)
		myLogger.Errorf(msg)
		return nil, errors.New(msg)
	}

	// Add encoded certificate to AdminCerts
	add_err := t.addAdminCert(stub, args[0])
	if add_err != nil {
		msg := fmt.Sprintf("Failed adding to AdminCerts array: %s", err)
		myLogger.Errorf(msg)
		return nil, errors.New(msg)
	}

	myLogger.Info("Added certificate to admincerts array")

	return nil, nil
}

/*
Invoke section
*/
func (t *AgrifoodChaincode) Invoke(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {
	myLogger.Infof("Calling Invoke with function: %s", function)

	// Handle different functions
	if function == "add_admin" {
		return t.add_admin(stub, args)
	} else if function == "add_party" {
		return t.add_party(stub, args)
	} else if function == "add_cert" {
		return t.add_cert(stub, args)
	} else if function == "add_signing_accreditation" {
		return t.add_signing_accreditation(stub, args)
	} else if function == "issue_signing_accreditation" {
		return t.issue_signing_accreditation(stub, args)
	} else if function == "revoke_signing_accreditation" {
		return t.revoke_signing_accreditation(stub, args)
	} else if function == "grant_signing_authority" {
		return t.grant_signing_authority(stub, args)
	} else if function == "revoke_signing_authority" {
		return t.revoke_signing_authority(stub, args)
	} else if function == "create_grapes" {
		return t.create_grapes(stub, args)
	} else if function == "certify_grapes" {
		return t.certify_grapes(stub, args)
	}

	myLogger.Errorf("Received unknown function invocation: %s", function)
	return nil, errors.New("Received unknown function invocation")
}

// add admin transaction certificate
func (t *AgrifoodChaincode) add_admin(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	// Can only be called by an admin
	myLogger.Info("Verifying caller is member of admins..")

	correctCaller, err := t.verifyAdmin(stub)

	if err != nil {
		msg := "Failed verifying certificates"
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// caller is not admin, return
	if !correctCaller {
		msg := "The caller is not an admin"
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// Check number of arguments
	if len(args) != 1 {
		msg := "Incorrect number of arguments. Expecting 1"
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// add encoded cert (args[0)) to admin arrays
	add_err := t.addAdminCert(stub, args[0])
	if add_err != nil {
		msg := fmt.Sprintf("Failed adding to AdminCerts array: %s", err)
		myLogger.Errorf(msg)
		return nil, errors.New(msg)
	}

	myLogger.Info("Added certificate to admincerts array")

	return nil, err
}

// add party to world-state
func (t *AgrifoodChaincode) add_party(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	// Can only be called by an admin
	myLogger.Info("Add party..")

	correctCaller, err := t.verifyAdmin(stub)

	if err != nil {
		msg := "Failed verifying certificates"
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// caller is not admin, return
	if !correctCaller {
		msg := "The caller is not an admin"
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// Check number of arguments
	if len(args) != 3 {
		msg := "Incorrect number of arguments. Expecting 3" // ID, Role, Encoded Cert
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// verify role validity
	valid_role := false

	for _, role := range t.roles {
		if args[1] == role {
			valid_role = true
		}
	}

	// if role is not valid, throw error
	if !valid_role {
		msg := "Incorrect role"
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// initiate new party
	party := Party{ID: args[0], Role: args[1], Certs: []string{args[2]}}

	// get parties from storage
	parties, err := t.getParties(stub)
	if err != nil {
		msg := fmt.Sprintf("Error getting parties: %s", err)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// verify uniqueness of ID
	for _, known_party := range parties {
		if known_party.ID == party.ID {
			msg := "Party ID must be unique"
			myLogger.Error(msg)
			return nil, errors.New(msg)
		}
	}

	err = t.saveParty(stub, party, true)
	if err != nil {
		msg := fmt.Sprintf("Error getting parties: %s", err)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	msg := fmt.Sprintf("New party added: %s, role: %s", party.ID, party.Role)
	myLogger.Info(msg)
	return []byte(msg), err
}

// add transaction certificate to party
func (t *AgrifoodChaincode) add_cert(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	// Can only be called by party
	myLogger.Info("Add certificate..")

	party, err := t.getCallerParty(stub)
	if err != nil {
		msg := "Failed retrieving party"
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	myLogger.Debugf("Add cert to: %s", party.ID)

	// Check number of arguments
	if len(args) != 1 {
		msg := "Incorrect number of arguments. Expecting 1"
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// add (encoded) cert to array
	party.Certs = append(party.Certs, args[0])

	// save updated party
	err = t.saveParty(stub, party, false)
	if err != nil {
		msg := "Failed saving party"
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	myLogger.Info("Saved updated party")

	return []byte("Successfully saved party"), nil
}

// add signing certificate
func (t *AgrifoodChaincode) add_signing_accreditation(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	// can only be called by AccreditationBody
	myLogger.Info("Register new signing accreditation")

	party, err := t.getCallerParty(stub)
	if err != nil {
		msg := fmt.Sprintf("Error determining party: %s", err)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	myLogger.Debugf("Received party: %s, role:%s", party.ID, party.Role)

	// check if caller is a AccreditationBody
	if party.Role != t.roles[0] {
		msg := "Caller is not an AccreditationBody"
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// Check number of arguments
	if len(args) != 4 {
		msg := "Incorrect number of arguments. Expecting 4" // ID, description,created,expiration date
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	signingAccreditation := SigningAccreditation{ID:args[0],Description:args[1],Revoked:false}
	signingAccreditation.Created, err = time.Parse(time.RFC3339,args[2])
	if err != nil {
		msg := "Error parsing time (created date)"
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	signingAccreditation.Expires, err = time.Parse(time.RFC3339,args[3])
	if err != nil {
		msg := "Error parsing time (expiration date)"
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// save certificate
	err = t.saveSigningAccreditation(stub, signingAccreditation,true)
	if err != nil {
		msg := fmt.Sprintf("Error saving signing accreditation: %s", err)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	msg := fmt.Sprintf("New signing accreditation added by %s",party.ID)
	myLogger.Info(msg)
	return []byte(msg), nil
}

// issue signing accreditation to certification body
func (t *AgrifoodChaincode) issue_signing_accreditation(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	// can only be called by AccreditationBody
	myLogger.Info("Assign signing accreditation to a certificate body")

	party, err := t.getCallerParty(stub)
	if err != nil {
		msg := fmt.Sprintf("Error determining party: %s", err)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	myLogger.Debugf("Received party: %s, role:%s", party.ID, party.Role)

	// check if caller is a AccreditationBody
	if party.Role != t.roles[0] {
		msg := "Caller is not an AccreditationBody"
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// Check number of arguments
	if len(args) != 2 {
		msg := "Incorrect number of arguments. Expecting 2" // AccreditationID, Certificate body ID
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// get accreditation
	accreditation, err := t.getSigningAccreditation(stub,args[0])
	if err != nil {
		msg := fmt.Sprintf("Error determining accreditation: %s", err)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// see if accreditation is still valid
	if accreditation.Expires.Before(time.Now()) {
		msg := "Error: Accreditation expired"
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	if accreditation.AccreditationBody != party.ID {
		msg := fmt.Sprintf("Error: Accreditation body (%s) is not the issuer of this accreditation (%s)",party.ID, accreditation.ID)
		myLogger.Warning(msg)
		return nil, errors.New(msg)
	}

	// get party
	certBody, err := t.getParty(stub,args[1])
	if err != nil {
		msg := fmt.Sprintf("Error determining party: %s", err)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// verify party is a certificate body
	if certBody.Role != t.roles[1] {
		msg := fmt.Sprintf("Error: supplied party is no CertifiactionBody: %s", err)
		myLogger.Warning(msg)
		return nil, errors.New(msg)
	}

	// set certification body on accreditation
	accreditation.CertificationBody = certBody.ID

	// save updated certificate
	err = t.saveSigningAccreditation(stub, accreditation,false)
	if err != nil {
		msg := "Error saving certificate"
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	msg := fmt.Sprintf("Successfully added %s as certification body on %s",certBody.ID, accreditation.ID)
	myLogger.Info(msg)
	return []byte(msg), nil
}

// revoke signing accreditation
func (t *AgrifoodChaincode) revoke_signing_accreditation(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	// can only be called by AccreditationBody or auditor
	myLogger.Info("Revoke signing accreditation")

	party, err := t.getCallerParty(stub)
	if err != nil {
		msg := fmt.Sprintf("Error determining party: %s", err)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	myLogger.Debugf("Received party: %s, role:%s", party.ID, party.Role)

	// check if caller is a AccreditationBody or auditor
	if party.Role != t.roles[0] || party.Role != t.roles[3] {
		msg := "Caller is not an AccreditationBody"
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// Check number of arguments
	if len(args) != 2 {
		msg := "Incorrect number of arguments. Expecting 2" // AccreditationID, revokeTimestamp
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// get accreditation
	accreditation, err := t.getSigningAccreditation(stub,args[0])
	if err != nil {
		msg := fmt.Sprintf("Error determining accreditation: %s", err)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// verify if accreditation body is owner of certificate
	if party.Role == t.roles[0] && accreditation.AccreditationBody != party.ID {
		msg := fmt.Sprintf("Error: Accreditation body (%s) is not the issuer of this accreditation (%s)",party.ID, accreditation.ID)
		myLogger.Warning(msg)
		return nil, errors.New(msg)
	}

	// Revoke certificate
	accreditation.Revoked = true
	accreditation.RevocationTimestamp, err = time.Parse(time.RFC3339, args[1])
	if err != nil {
		msg := "Error parsing time"
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// save updated accreditation
	err = t.saveSigningAccreditation(stub, accreditation, false)
	if err != nil {
		msg := "Error saving updated accreditation"
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	msg := fmt.Sprintf("Successfully revoked signing accreditation %s", accreditation.ID)
	myLogger.Info(msg)
	return []byte(msg),nil
}

// grant farm sigining authority
func (t *AgrifoodChaincode) grant_signing_authority(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	// can only be called by Certification Body
	myLogger.Info("Grant sigining authority to party")

	party, err := t.getCallerParty(stub)
	if err != nil {
		msg := fmt.Sprintf("Error determining party: %s", err)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	myLogger.Debugf("Received party: %s, role:%s", party.ID, party.Role)

	// check if caller is a CertificationBody
	if party.Role != t.roles[1] {
		msg := "Caller is not a CertificationBody"
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// Check number of arguments
	if len(args) != 3 {
		msg := "Incorrect number of arguments. Expecting 3" // AccreditationID, authorized partyID, Expiration timestamp
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// get accreditation
	accreditation, err := t.getSigningAccreditation(stub,args[0])
	if err != nil {
		msg := fmt.Sprintf("Error determining accreditation: %s", err)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// see if accreditation is still valid
	if accreditation.Expires.Before(time.Now()) {
		msg := "Error: Accreditation expired"
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// verify access rights
	if accreditation.CertificationBody != party.ID {
		msg := fmt.Sprintf("Party %s is not the certification body of %s", party.ID, accreditation.ID)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// verify authorized party
	authorizedParty, err := t.getParty(stub,args[1])
	if err != nil {
		msg := fmt.Sprintf("Error determining authorizedParty: %s", err)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// create and save signing authorization
	signingAuthorization := SigningAuthorization{AuthorizedParty:authorizedParty.ID, AccreditationID:accreditation.ID,Revoked:false}
	signingAuthorization.Expires, err = time.Parse(time.RFC3339,args[2])
	if err != nil {
		msg := "Error parsing time (expiration date)"
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	err = t.saveSigningAuthorization(stub,signingAuthorization,false)
	if err != nil {
		msg := fmt.Sprintf("Error saving signing authorization: %s", err)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	msg := fmt.Sprintf("Successfully granted signing authority of %s to %s",signingAuthorization.AccreditationID,signingAuthorization.AuthorizedParty)
	myLogger.Info(msg)
	return []byte(msg),nil
}

// revoke signing authority
func (t *AgrifoodChaincode) revoke_signing_authority(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	// can only be called by Certification Body or auditor
	myLogger.Info("Revoke sigining authority of party")

	party, err := t.getCallerParty(stub)
	if err != nil {
		msg := fmt.Sprintf("Error determining party: %s", err)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	myLogger.Debugf("Received party: %s, role:%s", party.ID, party.Role)

	// check if caller is a Certification Body or Auditor
	if party.Role != t.roles[1] && party.Role != t.roles[3] {
		msg := "Caller is not a CertificationBody or Auditor"
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// Check number of arguments
	if len(args) != 3 {
		msg := "Incorrect number of arguments. Expecting 3" // AccreditationID, authorized partyID, revokeTimestamp
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// get certificate
	accreditation, err := t.getSigningAccreditation(stub,args[0])
	if err != nil {
		msg := fmt.Sprintf("Error determining accreditation: %s", err)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// verify access rights
	if party.Role != t.roles[1] && accreditation.CertificationBody != party.ID {
		msg := fmt.Sprintf("Party %s is not the certification body of %s", party.ID, accreditation.ID)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// verify authorized party
	authorizedParty, err := t.getParty(stub,args[1])
	if err != nil {
		msg := fmt.Sprintf("Error determining authorizedParty: %s", err)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	signingAuthorization, err := t.getSigningAuthorization(stub, accreditation.ID,authorizedParty.ID)
	if err != nil {
		msg := fmt.Sprintf("Error determining signingAuthorization: %s", err)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// update authorization entry
	signingAuthorization.Revoked = true
	signingAuthorization.RevocationTimestamp, err = time.Parse(time.RFC3339,args[2])
	if err != nil {
		msg := "Error parsing time"
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// save authorization entry
	err = t.saveSigningAuthorization(stub,signingAuthorization,false)
	if err != nil {
		msg := fmt.Sprintf("Error saving updated signingAuthorization: %s", err)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	msg := fmt.Sprintf("Successfully granted signing authority of %s to %s",signingAuthorization.AccreditationID,signingAuthorization.AuthorizedParty)
	myLogger.Info(msg)
	return []byte(msg),nil
}

// create grapes asset
func (t *AgrifoodChaincode) create_grapes(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	// can only be called by a farm
	myLogger.Info("Create grapes asset")

	party, err := t.getCallerParty(stub)
	if err != nil {
		msg := fmt.Sprintf("Error determining party: %s", err)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	myLogger.Debugf("Received party: %s, role:%s", party.ID, party.Role)

	// check if caller is a farm
	if party.Role != t.roles[2] {
		msg := "Caller is not a farm"
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// Check number of arguments
	if len(args) != 2 {
		msg := "Incorrect number of arguments. Expecting 2" // UUID, created
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// define new grapeUnit
	grapesUnit := GrapesUnit{UUID:args[0],Producer:party.ID}
	grapesUnit.Created, err = time.Parse(time.RFC3339, args[1])
	if err != nil {
		msg := "Error parsing time"
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// Add to ownership chain
	ownershipEntry := OwnershipEntry{PartyID:party.ID,Timestamp:grapesUnit.Created}
	// initiate array
	grapesUnit.Ownership = append(grapesUnit.Ownership, ownershipEntry)

	// save grape unit
	err = t.saveGrapeUnit(stub,grapesUnit,true)
	if err != nil {
		msg := "Error saving certificate"
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	msg := fmt.Sprintf("Successfully added grapes (%s), produced by %s",grapesUnit.UUID,grapesUnit.Producer)
	myLogger.Info(msg)
	return []byte(msg), nil
}

// certify grapes
func (t *AgrifoodChaincode) certify_grapes(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	// can only be called by farm
	myLogger.Info("Certify grapes asset")

	party, err := t.getCallerParty(stub)
	if err != nil {
		msg := fmt.Sprintf("Error determining party: %s", err)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	myLogger.Debugf("Received party: %s, role:%s", party.ID, party.Role)

	// check if caller is a farm
	if party.Role != t.roles[2] {
		msg := "Caller is not a farm"
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// Check number of arguments
	if len(args) != 3 {
		msg := "Incorrect number of arguments. Expecting 3" // UUID, certificateID, timestamp
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// get grapes unit
	grapesUnit, err := t.getGrapesUnit(stub,args[0])
	if err != nil {
		msg := fmt.Sprintf("Error determining grapesUnit: %s", err)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// verify if caller is producer of grapes
	if grapesUnit.Producer != party.ID {
		msg := fmt.Sprintf("Caller is not producer of grapes: %s", grapesUnit.UUID)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// verify sigining authority of farm
	signAuth, err := t.getSigningAuthorization(stub,args[1],party.ID)
	if err != nil {
		msg := fmt.Sprintf("Error determining signing authority: %s", err)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// validate sigining authority
	if signAuth.Revoked {
		msg := fmt.Sprintf("No signing authority for %s on %s",signAuth.AccreditationID,party.ID)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// check expiration date
	if signAuth.Expires.Before(time.Now()){
		msg := fmt.Sprintf("Signing authority for %s by %s has expired",signAuth.AccreditationID,party.ID)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// get accreditation
	accreditation, err := t.getSigningAccreditation(stub,signAuth.AccreditationID)
	if err != nil {
		msg := fmt.Sprintf("Error determining accreditation: %s", err)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// see if accreditation is valid
	if accreditation.Revoked {
		msg := fmt.Sprintf("Invalid signing accreditation: %s", accreditation.ID)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// check expiration date
	if accreditation.Expires.Before(time.Now()){
		msg := fmt.Sprintf("Accreditation %s has expired",signAuth.AccreditationID)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// accreditation is valid

	// actually attach accreditation signature to grapes
	signature := AccreditationSignature{Issuer:signAuth.AuthorizedParty, AccreditationID:accreditation.ID,Revoked:false}
	signature.Issued, err = time.Parse(time.RFC3339, args[2])
	if err != nil {
		msg := "Error parsing time"
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// append signature to grapes unit
	grapesUnit.AccreditationSignatures = append(grapesUnit.AccreditationSignatures, signature)

	// save to world-state
	err = t.saveGrapeUnit(stub,grapesUnit,false)
	if err != nil {
		msg := "Error saving grapeUnit"
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	msg := fmt.Sprintf("Successfully signed signature for grapes: %s",grapesUnit.UUID)
	myLogger.Info(msg)
	return []byte(msg),nil
}

// revoke signature on grape units
func (t *AgrifoodChaincode) revoke_signature(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	// can only be called by Auditors and Farms that issued the signature
	myLogger.Info("Revoke signature on grapes unit")

	party, err := t.getCallerParty(stub)
	if err != nil {
		msg := fmt.Sprintf("Error determining party: %s", err)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	myLogger.Debugf("Received party: %s, role:%s", party.ID, party.Role)

	// check if caller is a Farm or Auditor
	if party.Role != t.roles[2] && party.Role != t.roles[3] {
		msg := "Caller is not a Farm or Auditor"
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// Check number of arguments
	if len(args) != 3 {
		msg := "Incorrect number of arguments. Expecting 3" // UUID, certificateID, revokeTimestamp
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// get grape unit from storage
	grapeUnit, err := t.getGrapesUnit(stub,args[0])
	if err != nil {
		msg := fmt.Sprintf("Error determining grapeUnit: %s", err)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// if caller is farm, check if it's the producer of the grapes
	if party.Role == t.roles[2] && grapeUnit.Producer != party.ID {
		msg := fmt.Sprintf("Farm is not producer of targeted grapes: %s", grapeUnit.UUID)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// loop over signatures
	for i, signature := range grapeUnit.AccreditationSignatures {
		// find correct signature
		if signature.AccreditationID == args[2] {
			// revoke signature
			signature.Revoked = true
			signature.RevocationTimestamp, err = time.Parse(time.RFC3339,args[3])
			if err != nil {
				msg := "Error parsing time"
				myLogger.Error(msg)
				return nil, errors.New(msg)
			}

			// update signature
			grapeUnit.AccreditationSignatures[i] = signature
		}
	}

	// save to world-state
	err = t.saveGrapeUnit(stub,grapeUnit,false)
	if err != nil {
		msg := fmt.Sprintf("Error saving updated grapeUnit: %s", err)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// done
	msg := fmt.Sprintf("Successfully revoked signature of %s for grapes: %s",args[2],grapeUnit.UUID)
	myLogger.Info(msg)
	return []byte(msg),nil
}

// transfer grapes to new owner (trader)
func (t *AgrifoodChaincode) transfer_grapes(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	// can only be called by farms and traders
	myLogger.Info("Transfer ownership of grapes")

	party, err := t.getCallerParty(stub)
	if err != nil {
		msg := fmt.Sprintf("Error determining party: %s", err)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	myLogger.Debugf("Received party: %s, role:%s", party.ID, party.Role)

	// check if caller is a Farm or Trader
	if party.Role != t.roles[2] && party.Role != t.roles[4] {
		msg := "Caller is not a Farm or Trader"
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// Check number of arguments
	if len(args) != 3 {
		msg := "Incorrect number of arguments. Expecting 3" // UUID, newParty, timestamp
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// get grapesUnit
	grapesUnit, err := t.getGrapesUnit(stub,args[0])
	if err != nil {
		msg := fmt.Sprintf("Error determining grapesUnit: %s", err)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// verify caller is current owner of grapes
	if grapesUnit.Ownership[len(grapesUnit.Ownership)-1].PartyID != party.ID {
		msg := fmt.Sprintf("Caller is not the current owner of the grapes: %s", grapesUnit.UUID)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// get newParty
	newParty, err := t.getParty(stub, args[1])
	if err != nil {
		msg := fmt.Sprintf("Error determining new party: %s", err)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// create new provenance entry
	ownershipEntry := OwnershipEntry{PartyID:newParty.ID}
	ownershipEntry.Timestamp, err = time.Parse(time.RFC3339,args[2])
	if err != nil {
		msg := fmt.Sprintf("Error parsing timestamp: %s", err)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// verify ownership entry timestamp is after last provenance entry timestamp
	if grapesUnit.Ownership[len(grapesUnit.Ownership)-1].Timestamp.After(ownershipEntry.Timestamp) {
		msg := "new ownership timestamp needs to be after latest ownership entry timestamp"
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// append provenance entry
	grapesUnit.Ownership = append(grapesUnit.Ownership, ownershipEntry)

	// save to world-state
	err = t.saveGrapeUnit(stub,grapesUnit,false)
	if err != nil {
		msg := fmt.Sprintf("Error saving updated grapeUnit: %s", err)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// done
	msg := fmt.Sprintf("Successfully transferred grapes %s from %s to: %s",grapesUnit.UUID,party.ID, ownershipEntry.PartyID)
	myLogger.Info(msg)
	return []byte(msg),nil
}

// save grape unit to world-state
func (t *AgrifoodChaincode) saveGrapeUnit(stub shim.ChaincodeStubInterface, grapeUnit GrapesUnit, new bool) error {
	grapes, err := t.getGrapes(stub)
	if err != nil {
		msg := fmt.Sprintf("Error retrieving signing grapes: %s", err)
		myLogger.Error(msg)
		return errors.New(msg)
	}

	if !new { //update
		// set new grape unit state
		for i, v := range grapes {
			if v.UUID == grapeUnit.UUID {
				grapes[i] = grapeUnit
			}
		}
	} else { // save new
		// verify uniqueness
		for _, v := range grapes {
			if v.UUID == grapeUnit.UUID {
				msg := "Error: GrapeUnits UUID needs to be unique"
				myLogger.Error(msg)
				return errors.New(msg)
			}
		}
		// append to array
		grapes = append(grapes, grapeUnit)
	}

	// serialize grapes
	grapes_b, err := json.Marshal(grapes)
	if err != nil {
		msg := "Error marshalling grapes"
		myLogger.Error(msg)
		return errors.New(msg)
	}

	// save serialized grapes
	err = stub.PutState("GrapeUnits", grapes_b)
	if err != nil {
		msg := "Error saving GrapeUnits"
		myLogger.Error(msg)
		return errors.New(msg)
	}

	return nil
}

// save signing authorization to world-state
func (t *AgrifoodChaincode) saveSigningAuthorization(stub shim.ChaincodeStubInterface, signingAuth SigningAuthorization, new bool) error {
	signing_auths, err := t.getSigningAuthorizations(stub)
	if err != nil {
		msg := fmt.Sprintf("Error retrieving signing authorizations: %s", err)
		myLogger.Error(msg)
		return errors.New(msg)
	}

	if !new { //update
		// set signing authorizations
		for i, v := range signing_auths {
			if v.AuthorizedParty == signingAuth.AuthorizedParty && v.AccreditationID == signingAuth.AccreditationID {
				signing_auths[i] = signingAuth
			}
		}
	} else { // save new
		// verify uniqueness
		for _, v := range signing_auths {
			if v.AuthorizedParty == signingAuth.AuthorizedParty && v.AccreditationID == signingAuth.AccreditationID {
				msg := "Error: sighing authorization needs to be unique"
				myLogger.Error(msg)
				return errors.New(msg)
			}
		}
		// append to array
		signing_auths = append(signing_auths, signingAuth)
	}

	// serialize authorizations
	signing_auths_b, err := json.Marshal(signing_auths)
	if err != nil {
		msg := "Error marshalling signing_auths"
		myLogger.Error(msg)
		return errors.New(msg)
	}

	// save serialized auths
	err = stub.PutState("SigningAuthorizations", signing_auths_b)
	if err != nil {
		msg := "Error saving SigningAuthorizations"
		myLogger.Error(msg)
		return errors.New(msg)
	}

	return nil
}

// save signing certificate to world-state
func (t *AgrifoodChaincode) saveSigningAccreditation(stub shim.ChaincodeStubInterface, signingAccreditation SigningAccreditation, new bool) error {
	signing_accreditations, err := t.getSigningAccreditations(stub)
	if err != nil {
		msg := fmt.Sprintf("Error retrieving signing accreditations: %s", err)
		myLogger.Error(msg)
		return errors.New(msg)
	}

	if !new { //update
		// set new signing accreditation state
		for i, v := range signing_accreditations {
			if v.ID == signingAccreditation.ID {
				signing_accreditations[i] = signingAccreditation
			}
		}
	} else { // save new
		// verify uniqueness
		for _, v := range signing_accreditations {
			if v.ID == signingAccreditation.ID {
				msg := "Error: accreditation ID needs to be unique"
				myLogger.Error(msg)
				return errors.New(msg)
			}
		}
		// append to array
		signing_accreditations = append(signing_accreditations, signingAccreditation)
	}

	// serialize accreditations
	signing_accreditations_b, err := json.Marshal(signing_accreditations)
	if err != nil {
		msg := "Error marshalling signing_accreditations"
		myLogger.Error(msg)
		return errors.New(msg)
	}

	// save serialized signing accreditations
	err = stub.PutState("SigningAccreditations", signing_accreditations_b)
	if err != nil {
		msg := "Error saving SigningAccreditations"
		myLogger.Error(msg)
		return errors.New(msg)
	}

	return nil
}

// save party to world-state
func (t *AgrifoodChaincode) saveParty(stub shim.ChaincodeStubInterface, party Party, new bool) error {
	parties, err := t.getParties(stub)
	if err != nil {
		msg := fmt.Sprintf("Error retrieving parties: %s", err)
		myLogger.Error(msg)
		return errors.New(msg)
	}

	if new {
		// verify uniqueness
		for _, v := range parties {
			if v.ID == party.ID {
				msg := "Error: Party ID needs to be unique"
				myLogger.Error(msg)
				return errors.New(msg)
			}
		}
		// append to array
		parties = append(parties, party)
	} else {
		// set new party state
		for i, p := range parties {
			if p.ID == party.ID {
				parties[i] = party
			}
		}
	}

	// serialize parties
	parties_b, err := json.Marshal(parties)
	if err != nil {
		msg := "Error marshalling parties"
		myLogger.Error(msg)
		return errors.New(msg)
	}

	// save serialized parties
	err = stub.PutState("Parties", parties_b)
	if err != nil {
		msg := "Error saving parties"
		myLogger.Error(msg)
		return errors.New(msg)
	}

	return nil
}

// Add certificate to admin array
func (t *AgrifoodChaincode) addAdminCert(stub shim.ChaincodeStubInterface, cert_encoded string) error {
	// Get current array of admin certs
	certs, err := t.getAdminCerts(stub)
	if err != nil {
		msg := fmt.Sprintf("Error retrieving certs: %s", err)
		myLogger.Errorf(msg)
		return errors.New(msg)
	}

	// append certificate to array
	certs = append(certs, cert_encoded)

	// Serialize array of certificates
	certs_serialized, err := json.Marshal(certs)
	if err != nil {
		msg := fmt.Sprintf("Failed reserializing certs: %s", err)
		myLogger.Errorf(msg)
		return errors.New(msg)
	}

	// Save serialized array of certificates
	save_err := stub.PutState("AdminCerts", certs_serialized)
	if save_err != nil {
		msg := fmt.Sprintf("Failed saving new AdminCerts: %s", err)
		myLogger.Errorf(msg)
		return errors.New(msg)
	}
	myLogger.Debugf("Updated admincerts: %s", string(certs_serialized[:]))

	return nil
}

/*
Query section
*/
func (t *AgrifoodChaincode) Query(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {
	myLogger.Debug("Query Chaincode...")

	// Handle different functions
	if function == "get_roles" {
		return t.get_roles(stub)
	} else if function == "get_caller_role" {
		return t.get_caller_role(stub)
	} else if function == "grape_ownership_trail" {
		return t.grape_ownership_trail(stub, args)
	}  else if function == "grape_signatures" {
		return t.grape_signatures(stub, args)
	} else if function == "signer_certs" {
		return t.signer_certs(stub, args)
	}

	myLogger.Errorf("Received unknown query function: %s", function)
	return nil, errors.New("Received unknown query function")
}

// get available roles
func (t *AgrifoodChaincode) get_roles(stub shim.ChaincodeStubInterface) ([]byte, error) {
	// Return available roles
	myLogger.Info("Get roles..")

	isAdmin, err := t.verifyAdmin(stub)
	if err != nil {
		msg := fmt.Sprintf("Error verifying caller status: %s", err)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	if !isAdmin {
		msg := "Caller is not an admin"
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	roles_b, err := json.Marshal(t.roles)
	if err != nil {
		msg := fmt.Sprintf("Error marshalling roles: %s", err)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	myLogger.Info("Return roles")
	return roles_b,nil
}

// return the role of a caller
func (t *AgrifoodChaincode) get_caller_role(stub shim.ChaincodeStubInterface) ([]byte, error) {
	myLogger.Info("get caller admin status and role")

	isAdmin, err := t.verifyAdmin(stub)
	if err != nil {
		msg := fmt.Sprintf("Error admin status of caller: %s", err)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	party, err := t.getCallerParty(stub)
	party_role := "no role"
	if err == nil {
		party_role = party.Role
	}

	role := CallerRole{Admin: isAdmin, Role:party_role}

	role_b, err := json.Marshal(role)
	if err != nil {
		msg := fmt.Sprintf("Error marshalling caller role: %s", err)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	myLogger.Infof("Caller role: %s",string(role_b[:]))
	return role_b,nil
}

// return grape provenance
func (t *AgrifoodChaincode) grape_ownership_trail(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	// public query function to check ownership trail of grapes
	myLogger.Info("Get ownership trail of grapes..")

	// Check number of arguments
	if len(args) != 1 {
		msg := "Incorrect number of arguments. Expecting 3" // UUID
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// get grapesUnit
	grapesUnit, err := t.getGrapesUnit(stub,args[0])
	if err != nil {
		msg := fmt.Sprintf("Error determining grapesUnit: %s", err)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// serialize ownership trail of grapes
	grapes_ownership_b, err := json.Marshal(grapesUnit.Ownership)
	if err != nil {
		msg := fmt.Sprintf("Error marshalling grapes ownership trail: %s", err)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	myLogger.Info("Return provenance")
	return grapes_ownership_b, nil
}

// return grape certification
func (t *AgrifoodChaincode) grape_signatures(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	// public query function to check accreditation of grapes
	myLogger.Info("Get accreditation of grapes..")

	// Check number of arguments
	if len(args) != 1 {
		msg := "Incorrect number of arguments. Expecting 1" // UUID
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// get grapesUnit
	grapesUnit, err := t.getGrapesUnit(stub,args[0])
	if err != nil {
		msg := fmt.Sprintf("Error determining grapesUnit: %s", err)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// serialize signatures
	grapes_signatures_b, err := json.Marshal(grapesUnit.AccreditationSignatures[0])
	if err != nil {
		msg := fmt.Sprintf("Error marshalling grapes certificates: %s", err)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	myLogger.Info("Return signatures")
	return grapes_signatures_b,nil
}

// return signing authorizations of party for certificate
func (t *AgrifoodChaincode) signer_certs(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	// public query function to return signing authorizations of a farm
	myLogger.Info("Get signing authorizations of a farm..")

	// Check number of arguments
	if len(args) != 1 {
		msg := "Incorrect number of arguments. Expecting 1" // farmID
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// get party
	party, err := t.getParty(stub, args[0])
	if err != nil {
		msg := fmt.Sprintf("Error determining party: %s", err)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}


	all_auths, err := t.getSigningAuthorizations(stub)
	if err != nil {
		msg := fmt.Sprintf("Error determining grapesUnit: %s", err)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	var party_auths []SigningAuthorization
	for _,auth := range all_auths {
		if auth.AuthorizedParty == party.ID {
			party_auths = append(party_auths,auth)
		}
	}

	party_auths_b, err := json.Marshal(party_auths)
	if err != nil {
		msg := fmt.Sprintf("Error marshalling party authorizations: %s", err)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	return party_auths_b, nil
}

// get specific grape unit
func (t *AgrifoodChaincode) getGrapesUnit(stub shim.ChaincodeStubInterface, uuid string) (GrapesUnit, error) {
	grapes, err := t.getGrapes(stub)
	if err != nil {
		msg := fmt.Sprintf("Error retreiving grapes: %s", err)
		myLogger.Error(msg)
		return GrapesUnit{}, errors.New(msg)
	}

	for _, grapeUnit := range grapes {
		if grapeUnit.UUID == uuid {
			return grapeUnit, nil
		}
	}

	return GrapesUnit{}, errors.New("Unable to determine GrapesUnit")
}

// get all grape units
func (t *AgrifoodChaincode) getGrapes(stub shim.ChaincodeStubInterface) ([]GrapesUnit, error) {
	// get grapes
	grapes_b, err := stub.GetState("GrapeUnits")
	if err != nil {
		msg := fmt.Sprintf("Error getting grapes from storage: %s", err)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	var grapes []GrapesUnit
	err = json.Unmarshal(grapes_b, &grapes)
	if err != nil {
		msg := "Error parsing grapes"
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	return grapes, nil
}

// get specific signing authorization
func (t *AgrifoodChaincode) getSigningAuthorization(stub shim.ChaincodeStubInterface, certID string, partyID string) (SigningAuthorization, error) {
	auths, err := t.getSigningAuthorizations(stub)
	if err != nil {
		msg := fmt.Sprintf("Error retreiving auths: %s", err)
		myLogger.Error(msg)
		return SigningAuthorization{}, errors.New(msg)
	}

	for _, auth := range auths {
		if auth.AccreditationID == certID && auth.AuthorizedParty == partyID {
			return auth, nil
		}
	}

	return SigningAuthorization{}, errors.New("Unable to determine signing authorization")
}

// get all signing certificates
func (t *AgrifoodChaincode) getSigningAuthorizations(stub shim.ChaincodeStubInterface) ([]SigningAuthorization, error) {
	// get certificates
	signing_auths_b, err := stub.GetState("SigningAuthorizations")
	if err != nil {
		msg := fmt.Sprintf("Error getting signing authorizations from storage: %s", err)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	var signing_auths []SigningAuthorization
	err = json.Unmarshal(signing_auths_b, &signing_auths)
	if err != nil {
		msg := "Error parsing signing authorizations"
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	return signing_auths, nil
}

// get specific signing accreditation
func (t *AgrifoodChaincode) getSigningAccreditation(stub shim.ChaincodeStubInterface, certID string) (SigningAccreditation, error) {
	accreditations, err := t.getSigningAccreditations(stub)
	if err != nil {
		msg := fmt.Sprintf("Error retreiving accreditations: %s", err)
		myLogger.Error(msg)
		return SigningAccreditation{}, errors.New(msg)
	}

	for _, accreditation := range accreditations {
		if accreditation.ID == certID {
			return accreditation, nil
		}
	}

	return SigningAccreditation{}, errors.New("Unable to determine SigningAccreditation")
}

// get all signing accreditations
func (t *AgrifoodChaincode) getSigningAccreditations(stub shim.ChaincodeStubInterface) ([]SigningAccreditation, error) {
	// get certificates
	signing_accreditations_b, err := stub.GetState("SigningAccreditations")
	if err != nil {
		msg := fmt.Sprintf("Error getting signing accreditations from storage: %s", err)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	var signing_accreditations []SigningAccreditation
	err = json.Unmarshal(signing_accreditations_b, &signing_accreditations)
	if err != nil {
		msg := "Error parsing signing accreditations"
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	return signing_accreditations, nil
}

// get caller party object
func (t *AgrifoodChaincode) getCallerParty(stub shim.ChaincodeStubInterface) (Party, error) {
	// get parties from storage
	parties, err := t.getParties(stub)
	if err != nil {
		msg := fmt.Sprintf("Error retrieving parties: %s", err)
		myLogger.Error(msg)
		return Party{}, errors.New(msg)
	}

	// loop parties and verify role certs, return party ID if party is valid
	for _, party := range parties {
		isParty, err := t.verifyCaller(stub, party.Certs)
		if err != nil {
			msg := "Failed verifying caller"
			myLogger.Error(msg)
			return Party{}, errors.New(msg)
		}

		if isParty {
			return party, err
		}
	}

	return Party{}, errors.New("Unknown caller")
}

// cet specific signing certificate
func (t *AgrifoodChaincode) getParty(stub shim.ChaincodeStubInterface, partyID string) (Party, error) {
	parties, err := t.getParties(stub)
	if err != nil {
		msg := fmt.Sprintf("Error retreiving parties: %s", err)
		myLogger.Error(msg)
		return Party{}, errors.New(msg)
	}

	for _, party := range parties {
		if party.ID == partyID {
			return party, nil
		}
	}

	return Party{}, errors.New("Unable to determine party")
}

// get all parties
func (t *AgrifoodChaincode) getParties(stub shim.ChaincodeStubInterface) ([]Party, error) {
	// get parties
	parties_b, err := stub.GetState("Parties")
	if err != nil {
		msg := fmt.Sprintf("Error getting parties from storage: %s", err)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	var parties []Party
	err = json.Unmarshal(parties_b, &parties)
	if err != nil {
		msg := fmt.Sprintf("Error parsing parties: %s", err)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}
	return parties, nil
}

// get admin certificates
func (t *AgrifoodChaincode) getAdminCerts(stub shim.ChaincodeStubInterface) ([]string, error) {
	// Get current array of admin certs
	certsStr, err := stub.GetState("AdminCerts")
	if err != nil {
		msg := fmt.Sprintf("Failed getting AdminCerts value: %s", err)
		myLogger.Errorf(msg)
		return nil, errors.New(msg)
	}

	//myLogger.Debugf("Current certs: %s",string(certsStr[:]))

	// Parse array of certificates
	var certs = []string{}
	err = json.Unmarshal(certsStr, &certs)

	if err != nil {
		msg := fmt.Sprintf("Failded deocding certificates: %s", err)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	return certs, nil
}

// verify admin certificate
func (t *AgrifoodChaincode) verifyAdmin(stub shim.ChaincodeStubInterface) (bool, error) {
	// Get admin certificates
	certs, err := t.getAdminCerts(stub)
	if err != nil {
		msg := fmt.Sprintf("Failed fetching AdminCerts: %s", err)
		myLogger.Error(msg)
		return false, errors.New(msg)
	}

	return t.verifyCaller(stub, certs)
}

// verify caller
func (t *AgrifoodChaincode) verifyCaller(stub shim.ChaincodeStubInterface, certs []string) (bool, error) {
	// check all identities in array
	for i := 0; i < len(certs); i++ {
		// decode certificate
		cert_decoded, err := base64.StdEncoding.DecodeString(certs[i])
		if err != nil {
			return false, errors.New("Failed decoding cert")
		}

		// check caller
		ok, err := t.isCaller(stub, cert_decoded)
		if err != nil {
			msg := "Failed checking identity"
			myLogger.Error(msg)
			return false, errors.New(msg)
		}

		// return if verified
		if ok {
			return true, err
		}
	}

	// identity not verified
	return false, nil
}

// check if caller is owner of certificate
func (t *AgrifoodChaincode) isCaller(stub shim.ChaincodeStubInterface, certificate []byte) (bool, error) {
	//myLogger.Debug("Check caller...")

	// In order to enforce access control, we require that the
	// metadata contains the signature under the signing key corresponding
	// to the verification key inside certificate of
	// the payload of the transaction (namely, function name and args) and
	// the transaction binding (to avoid copying attacks)

	// Verify \sigma=Sign(certificate.sk, tx.Payload||tx.Binding) against certificate.vk
	// \sigma is in the metadata

	sigma, err := stub.GetCallerMetadata()
	if err != nil {
		return false, errors.New("Failed getting metadata")
	}
	payload, err := stub.GetPayload()
	if err != nil {
		return false, errors.New("Failed getting payload")
	}
	binding, err := stub.GetBinding()
	if err != nil {
		return false, errors.New("Failed getting binding")
	}

	//myLogger.Debugf("passed certificate [%x]", certificate)
	//myLogger.Debugf("passed sigma [%x]", sigma)
	//myLogger.Debugf("passed payload [%x]", payload)
	//myLogger.Debugf("passed binding [%x]", binding)

	ok, err := stub.VerifySignature(
		certificate,
		sigma,
		append(payload, binding...),
	)
	if err != nil {
		myLogger.Errorf("Failed checking signature [%s]", err)
		return ok, err
	}
	return ok, err
}

func main() {
	primitives.SetSecurityLevel("SHA3", 256)
	err := shim.Start(new(AgrifoodChaincode))
	if err != nil {
		fmt.Printf("Error starting DinalogChaincode: %s", err)
	}
}
