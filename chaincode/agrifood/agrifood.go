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

type Party struct {
	Id    string   // identifier of party
	Role  string   // role of the party
	Certs []string // encoded certificates
}

// party authorized to use a certain certificate
type SigningAuthorization struct {
	AuthorizedParty 	string
	CertificateID		string
	Revoked			bool
	RevocationTimestamp	time.Time
}

// certificate to issue
type SigningCertificate struct {
	ID			string
	Description		string
	AccreditationBody	string
	CertificationBody	string
	Created			time.Time
	Revoked			bool
	RevocationTimestamp	time.Time
	Authorizations		[]SigningAuthorization
}

// signature to attach to assets
type CertificateSignature struct {
	Issuer			string
	SignatureID		string
	Issued			time.Time
	Revoked			bool
	RevocationTimestamp	time.Time
}

// Entity in provenance chain
type ProvenanceEntity struct {
	PartyID		string
	Timestamp	time.Time
}

// Grapes asset
type GrapesUnit struct {
	Producer	string
	Created		string
	UUID		string
	Certificates	[]string // refers to signature ID
	Provenance	[]ProvenanceEntity
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

	// Initiate empty array for AdminCerts
	err := stub.PutState("AdminCerts", []byte("[]"))

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
	party := Party{Id: args[0], Role: args[1], Certs: []string{args[2]}}

	// get parties from storage
	parties, err := t.getParties(stub)
	if err != nil {
		msg := fmt.Sprintf("Error getting parties: %s", err)
		myLogger.Error(msg)
		return nil, errors.New(msg)
	}

	// verify uniqueness of ID
	for _, known_party := range parties {
		if known_party.Id == party.Id {
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

	msg := fmt.Sprintf("New party added: %s, role: %s", party.Id, party.Role)
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

	myLogger.Debugf("Add cert to: %s", party.Id)

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

// save party to world-state
func (t *AgrifoodChaincode) saveParty(stub shim.ChaincodeStubInterface, party Party, new bool) error {
	parties, err := t.getParties(stub)
	if err != nil {
		msg := fmt.Sprintf("Error retrieving parties: %s", err)
		myLogger.Error(msg)
		return errors.New(msg)
	}

	if new {
		parties = append(parties, party)
	} else {
		// set new vessel state
		for i, p := range parties {
			if p.Id == party.Id {
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

	// save serialized vessels
	err = stub.PutState("parties", parties_b)
	if err != nil {
		msg := "Error saving parties"
		myLogger.Error(msg)
		return errors.New(msg)
	}

	//myLogger.Debugf("Parties: %s",string(parties_b[:]))

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

	// handle diferent functions

	myLogger.Errorf("Received unknown query function: %s", function)
	return nil, errors.New("Received unknown query function")
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

// get all parties
func (t *AgrifoodChaincode) getParties(stub shim.ChaincodeStubInterface) ([]Party, error) {
	// get vessels
	parties_b, err := stub.GetState("parties")
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
