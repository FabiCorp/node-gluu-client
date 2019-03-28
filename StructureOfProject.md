Structure of Project
=======================

The idea behind the project is to integrate the concept behind usage control into the existing uma workflow.  
The chosen protected resource is the hearth rate, which is measured by the [Xiaomi Mi Band 2](https://en.wikipedia.org/wiki/Xiaomi_Mi_Band) and fetched via bluetooth.

Components
----------

- [MongoDB Database](https://www.mongodb.com/what-is-mongodb)
- Restructured python script to get access to the hearth rate measured with Mi Band ([-> forked project](https://github.com/creotiv/MiBand2))
- Node.js resource server application extended on an existing node openid client project ([-> Node-OpenID-Client](https://github.com/panva/node-openid-client))
- Node.js client server application for testing purposes
- Java client server application with integrated usage control components ([-> MYDATA Control](https://developer.mydata-control.de/))
- Gluu server (Version 3.1.4) as the Authorization-Server ([-> Gluu-Docs](https://gluu.org/docs/ce/3.1.4/))
- UMA-Workflow ([-> UMA-Docs](https://docs.kantarainitiative.org/uma/rec-uma-core.html))

Installation/Configuration Order
---------------------------------

1. [Install MongoDB](https://docs.mongodb.com/manual/administration/install-community)  on the same machine where you want to install the resource and client server.  
2. Install Gluu and setup clients   
([see instructions at GluuClientSetup]())
3. Configure the node.js resource server (and test client server)   
([see instructions at README](https://gitlab.iosb.fraunhofer.de/kastel/externalServer/blob/master/README.md))
4. Configure the python script   
([see instructions at the MiBand2 Repo README](https://gitlab.iosb.fraunhofer.de/kastel/MiBand2/blob/master/README.md))
5. Setup the MYDATA environment (clientID/secret and policies)   
([see instructions at the clientserver Repo MYDATASetup](https://gitlab.iosb.fraunhofer.de/kastel/clientserver/blob/master/MYDATASetup.md))
6. Configure the java client application   
([see instructions at the clientserver Repo README](https://gitlab.iosb.fraunhofer.de/kastel/clientserver/blob/master/README.md))


Run the project
----------------

To deploy the project simply follow the flow at [SampleWorkflow]((https://gitlab.iosb.fraunhofer.de/kastel/externalServer/blob/master/SampleWorkflow.md))



