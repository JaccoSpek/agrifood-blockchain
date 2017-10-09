To start the demo:
1. The chaincode GO code needs to be vendored, first create the folder, and go there: `mkdir -p chaincode/agrifood/vendor/github.com/hyperledger && cd chaincode/agrifood/vendor/github.com/hyperledger`
2. clone the hyperledger v0.6 branch: `git clone https://github.com/hyperledger/fabric.git -b v0.6`
3. Configure the docker-compose file (`docker-compose.yaml`)
  * services/environment/FRONTEND_ORIGIN: set URL of front-end application (default front-end will start on port 3000)
4. Configure the front-end (`client/frontend/src/app/config.ts`):
  * set the `API_URL` variable to the blockchain API (defaults to port 8081)
5. Build the docker images `docker-compose build` (this takes a while)
6. Launch the application  with `docker-compose up` (the first time doing this, it takes a while)
7. Start the application by navigating to the front-end URL in a browser (e.g. `http://localhost:3000`, when the application runs locally

8. See `blockchain/config/membersrvc.yaml` for usernames/passwords to use (starting from line 117 is a list of users you can use)

9. Log in with a couple of users, so they are known by the webserver (once a user is logged-in, the webserver can use the generated public keys of the users to register in the smart-contract)

10. When logged-in with a user, click "Deploy" to deploy the smart contract

11. Once deployed, you can interact with the smart-contract (go through the entire flow of certifying/producing grapes) using the front-end application (note: works best in the Google Chrome browser)

12. To view the output of the deployed smart-contract, open a new terminal window and enter: `docker logs -f dev-[peerID]-[chaincodeID] 2>&1 | grep Agrifood`, so for example: `docker logs -f dev-vp0-54b08a443b47afee1f4e955ba15f8ee564952d989f99fb536deb86c3b6921953 2>&1 | grep Agrifood`