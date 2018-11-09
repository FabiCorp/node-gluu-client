Gluu Client Setup
=================

This setup is made explicitly for the servers in this repository.
Create Clients
---------------

After finishing the setup from Gluu,  
the next step is to setup two clients (for resource- and client server) in the Gluu Interface.  
Therefore navigate to the OpenID Connect Tab in the Gluu Interface and click the Clients Tab on the left side.  
Now you need to edit following information when adding a new client:
- Client Name: free to chose (for instance resourceServer and clientServer)
- Client Secret: fraunhofer
- Add Login Redirect URI (Button): Host address of Server + "/callback"
- Add Scope (Button): OpenID and UmaProtection
- Add Response Type(Button): Code
- Add Grant Type(Button): Authorization_Code  

Only for the Client Server must be additonally added:
- Add Claim Redirect URIs: Host address of Server  + "/claimCallback"  

All options declared above are mandatory for this project,  
you can experiment by adding other options and change to different Open-ID/UMA workflows in the source code.

After finishing the creation process for both servers, two iNum IDs should be created.  
Edit the ServerID entrys in lib/config.ini (for the client- and resource server) using the created iNum ID.

Enable Custom Scripts
---------------

To get the full UMA-experience, there are several scripts which need to be enabled and linked to the resource.

We are starting by opening the Configuraton Tab in the Gluu Interface and  
navigating to the "Manage Custom Scipts" section on the left.

Now proceed to the "UMA RPT Policices"-Tab and enable the "uma_rpt_policy" script and to the "UMA Claims Gathering"-Tab and enable the "sampleClaimsGathering" script.

```
Warning: You need to create a resource entry with the resource server (/registerResource)  
or manually over the Gluu Interface to finish the last step.
Informations about the resource can be found at lib/resources/resource.json
```

Now head over to the UMA-Tab and enter the "Scopes"-Tab.  
The resource you are looking for, when created the resource correctly, should be named "hearthRate".   
Click it and choose the UMA_RPT_POLICY when adding a authorization policy.  
Update the entry afterwards.
