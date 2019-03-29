You should have read [Structure of Project](https://gitlab.iosb.fraunhofer.de/kastel/externalServer/blob/master/StructureOfProject.md) in the externalServer repository to succesfully build the project.  

Gluu Client Setup
=================

To start working with Gluu, you need to know that running the Gluu Server on the  
localhost causes a lot of problems. It is better to take another instance to run the software properly.  

I run the server on the dashcam vm from a previous project.   
You could consider reading the [VM Preparation Guide](https://gluu.org/docs/ce/3.1.4/installation-guide/), but in the most cases it is not needed.

To begin to installation process, follow the instructions here: [Installation-Guide](https://gluu.org/docs/ce/3.1.4/installation-guide/install/).

This setup is made explicitly for the servers in this project.  

Create Clients
---------------

After finishing the setup from Gluu,  
the next step is to log into your Admin with your chosen password at the setup process and create two clients (for resource- and client server) in the Gluu Interface.  
Therefore navigate to the OpenID Connect Tab in the Gluu Interface and click the Clients Tab on the left side.
Now you need to edit following information when adding a new client:
- Client Name: free to chose (for instance resourceServer and clientServer)
- Client Secret: fraunhofer 
- Add Login Redirect URI (Button): Host address of resource-/clientServer + "/callback"  
(for example for client server "http://localhost:3000/callback" and for resource server "http://localhost:4000/callback") 
- Add Scope (Button): openid and uma_protection
- Add Response Type(Button): code
- Add Grant Type(Button): authorization_code  
- Client's Registration Expires: press ">>" and pick any date.   
When you leave the dafault value you need to create a client each day/week/month.

Only for the client server must be additonally added:
- Add Claim Redirect URIs: Host address of client server  + "/claimCallback"  
(for example "http://localhost:3000/claimCallback") 

Example: (insert your domain/IP, for testing purposes you can enter localhost)
| Field                       | Node.js Client Server                 | Node.js Resource Server          | Java Client Server                     |
|-----------------------------|---------------------------------------|----------------------------------|----------------------------------------|
| Client Name                 | ClientServer                          | ResourceServer                   | ClientServer                           |
| Client Secret               | fraunhofer                            | fraunhofer                       | fraunhofer                             |
| Login Redirect URI          | http://{domain/IP}:3000/callback      | http://{domain/IP}:4000/callback | http://{domain/IP}:51130/callback      |
| Scope                       | openid + uma_protection               | openid + uma_protection          | openid + uma_protection                |
| Response Type               | code                                  | code                             | code                                   |
| Grant Type                  | authorization_code                    | authorization_code               | authorization_code                     |
| Client Registration Expires | press ">>" and pick any date          | press ">>" and pick any date     | press ">>" and pick any date           |
| Claim Redirect URI          | http://{domain/IP}:3000/claimCallback | Not needed                       | http://{domain/IP}:51130/claimCallback |


All options declared above are mandatory for this project,  
you can experiment by adding other options and change to different Open-ID/UMA workflows in the source code.

After finishing the creation process for both servers, each registered client was given an iNum-Id.   
In the following instructions we need to insert them into the configuration files of the various servers. 

Enable Custom Scripts
---------------

To reach the full UMA-experience, there are several scripts which need to be enabled and linked to the resource.

We are starting by opening the Configuraton Tab in the Gluu Interface and  
navigating to the "Manage Custom Scipts" section on the left.

Now proceed to the "UMA RPT Policices"-Tab and enable the "uma_rpt_policy" script and to the "UMA Claims Gathering"-Tab and enable the "sampleClaimsGathering" script.

