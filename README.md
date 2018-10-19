Client-/Resource Servers
==============================
This project contains two node server applications (Resource- and Client-Server)  
extended on an existing node openid client project ([-> Node-OpenID-Client](https://github.com/panva/node-openid-client))  
to build a working UMA-Workflow
([-> UMA-Docs](https://docs.kantarainitiative.org/uma/rec-uma-core.html))  
in combination with a Gluu server (Version 3.1.3) as
the Authorization-Server ([-> Gluu-Docs](https://gluu.org/docs/ce/3.1.3/)).

In order to run the two servers,   
the config.js file needs to be edited in the following lines:
- var gluuServerAddess -> Host Address from the Gluu server
- var umaRealm -> Host Address without http/https
- var client-/resourceServerAddress/Port -> Host Address and Port for both servers
- clientID and clientSecret for both servers (resource-/clientServer)
(two oauth-clients need to be set up manually in the Gluu interface,
tutorial on how to correctly set up the clients in GluuClientSetup.md)

Run both servers seperatly in Terminal:
```sh
node resourceServer.js
node clientServer.js
```
To avoid issues when running the servers local behind a proxy type following in front:
```sh
NO_PROXY="localhost" node resourceServer.js
NO_PROXY="localhost" node clientServer.js
```

OpenID Workflow URLs (for both servers)
---

- **/login** Trigger the OpenID Authorization Process to obtain PAT (Protection API Token, needed to access UMA relevant Gluu-Endpoints)
- **/callback** This URL is called by the Gluu Authorization Server after */login* | Delievers TokenSet
- **/userInfo** Delievers OpenID-secured User-Information specified with chosen scopes

UMA Flow URLs (resourceServer)
---
- **/measurementData**  Endpoint for the MiBand2-MeasurementData (will be saved in measurementData.txt)
- **/resourceRegistration** Registers HearthRateService with hearthRate scope (hardcoded)
- **/resourceSets** Overwiew for all registered ResourceSet-IDs
- **/resourceSets/[id]** Delievers information for a ResourceSet with the given ID
- **/hearthRate** Endpoint for the clientServer to trigger the Resource Authorization Process and access the resource (hearth rate) by presenting an sufficent RPT (Requesting Party Token)
- **/permission** Endpoint to obtain a UMA-Ticket (in general will be forwarded to clientServer)

- **/resourceDeletion** (Work in Progress)

UMA Flow URLs (clientServer)
---

- **/getHearthRate** Endpoint to communicate with resourceServer and start UMA-Authorization Process (creates hearthRate.txt after successfull resource request)
- **/umaToken** Delievers a new TokenSet (RPT and PCT) in exchange for presenting an adequate UMA-Ticket

Example UMA-Workflow
---

The Gluu server needs to be up and running in order to start OpenID/UMA relevant interactions between the servers.

The measurement data from the MiBand2-Project needs to successfully reached the resource server and the **measurementData.txt** is created.

### resourceServer

1. /login (to obtain PAT)
2. /registerResource (only call when not already registered)
3. Login to the Gluu Interface and add an Authorization Policy (UMA_RPT_POLICY) to the hearthRate UMA scope 
4. /resourceSet and /resourceSet/[id] (to get the ResourceID for the UMA-Authorization Process)  

After registering the Resource and having all relevant information:
### clientServer

1. /login (to obtain PAT)
2. /hearthRate (to request authorization for requested resource)
3. /umaToken (exchange UMA-Ticket to RPT)
4. /hearthRate (present RPT to gain access for requested Resource)

Now the **hearthRate.txt** should be created with the same data as in **measurementData.txt**
