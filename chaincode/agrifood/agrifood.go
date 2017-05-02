package main

import (
	"encoding/base64"
	"errors"
	"fmt"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	"github.com/hyperledger/fabric/core/crypto/primitives"
)

var myLogger = shim.NewLogger("Agrifood")

type AgrifoodChaincode struct {
	Roles        []string // list of roles
	Vesselstates []string
}

func (t *AgrifoodChaincode) Init(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {
	myLogger.Info("Init Chaincode...")

	return nil, nil
}

func (t *AgrifoodChaincode) Invoke(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {
	myLogger.Infof("Calling Invoke with function: %s", function)

	// Handle different functions

	myLogger.Errorf("Received unknown function invocation: %s", function)
	return nil, errors.New("Received unknown function invocation")
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
