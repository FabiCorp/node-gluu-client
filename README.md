You should have read [Structure of Project](https://gitlab.iosb.fraunhofer.de/kastel/externalServer/blob/master/StructureOfProject.md) in the externalServer repository to succesfully build the project.  

Client-/Resource Servers
==============================
This project contains two node server applications (Resource- and Client-Server)  
extended on an existing node openid client project ([-> Node-OpenID-Client](https://github.com/panva/node-openid-client))  
to build a working UMA-Workflow
([-> UMA-Docs](https://docs.kantarainitiative.org/uma/rec-uma-core.html))  
in combination with a Gluu server (Version 3.1.4) as
the Authorization-Server ([-> Gluu-Docs](https://gluu.org/docs/ce/3.1.4/)).

In order to run the two servers,   
the config.js file needs to be edited in the following lines:
- var gluuServerAddess -> Host address from the Gluu server
- var umaRealm -> Host address without http/https
- var client-/resourceServer address and port -> Host address and port for both servers
- clientID and clientSecret for both servers (resource-/clientServer)  
You get the clientIDs from the Gluu administration.   
We need to fetch the two iNum-IDs which were generated in the GluuClientSetup instruction process.  
The clientSecret should be "fraunhofer" unless you have chosen another at the gluu client creation.

Run both servers seperatly in terminal (at **externalServer/lib**):
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
- **/callback** This URL is called by the Gluu Authorization Server as a callback from  **/login** | Delievers TokenSet
- **/userInfo** Delievers OpenID-secured User-Information specified with chosen scopes

UMA Flow URLs (resource server)
---
- **/resourceRegistration** Registers HearthRateService with hearthRate scope (hardcoded)
- **/resourceSets** Overwiew for all registered ResourceSet-IDs
- **/resourceSets/[id]** Delievers information for a ResourceSet with the given ID
- **/hearthRate** Endpoint for the clientServer to trigger the Resource Authorization Process and access the resource (hearth rate) by presenting a RPT (Requesting Party Token) with sufficent rights
- **/permission** Endpoint to obtain a UMA-Ticket (in general will be forwarded to client server)


UMA Flow URLs (client server)
---

- **/getHearthRate** Endpoint to communicate with resourceServer and start UMA-Authorization Process (creates hearthRate.txt after successfull resource request)
- **/umaToken** Delievers a new TokenSet (RPT and PCT) in exchange for presenting an adequate UMA-Ticket



