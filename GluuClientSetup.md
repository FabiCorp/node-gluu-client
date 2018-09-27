Gluu Client Setup
=================
This setup is specifically made for the servers in this repository.

After finishing the setup from Gluu, the next step is to setup two clients (for Resource- and ClientServer) in the Gluu Interface.  
Therefore navigate to the OpenID Connect Tab in the Gluu Interface and click to the Clients Tab.  
Now you need to edit following information when adding a new client:
- Client Name: free to chose
- Client Secret(Change Client Secret Button): fraunhofer (but also free to chose)
- Add Login Redirect URI (Button): Host address of Server + "/callback"
- Add Scope (Button): OpenID and UmaProtection (All options for testing on the client side)
- Add Response Type(Button): Code (all options for testing on  the client side)
- Add Grant Type(Button): All options for testing on the client side

The other options must not be changed.
