# Client-/Resource Servers

This project contains two node server applications (Resource- and Client-Server)  
extended on an existing node openid client project ([-> Node-OpenID-Client](https://github.com/panva/node-openid-client))  
to build a working UMA-Workflow
([-> UMA-Docs](https://docs.kantarainitiative.org/uma/rec-uma-core.html))  
in combination with a Gluu server as
the Authorization-Server ([-> Gluu-Docs](https://gluu.org/docs/ce/3.1.3/)).

In order to run the two servers,   
the config.js file needs to be edited in the following lines:
- var gluuServerAddess -> Host Address from the Gluu server
- var umaRealm -> Host Address without http/https
- var client-/resourceServerAddress/Port -> Host Address and Port for both servers
- clientID and clientSecret for both servers (resource-/clientServer)
(two oauth-clients need to be set up manually in the Gluu interface,
tutorial on how to correctly set up the clients in GluuClientSetup.md)


The Gluu server needs to be up and running in order to start Open-ID/UMA relevant interactions between the servers.

Run both servers seperatly in Terminal:
```sh
node resourceServer.js
```
and
```sh
node clientServer.js
```
