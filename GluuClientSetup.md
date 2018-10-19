Gluu Client Setup
=================
This setup is specifically made for the servers in this repository.

After finishing the setup from Gluu,  
the next step is to setup two clients (for resource- and client server) in the Gluu Interface.  
Therefore navigate to the OpenID Connect Tab in the Gluu Interface and click to the Clients Tab.  
Now you need to edit following information when adding a new client:
- Client Name: free to chose
- Client Secret: fraunhofer (but also free to chose)
- Add Login Redirect URI (Button): Host address of Server + "/callback"
- Add Scope (Button): OpenID and UmaProtection (All options for testing on the client side)
- Add Response Type(Button): Code (All options for testing on  the client side)
- Add Grant Type(Button): All options for testing on the client side

The other options must not be changed.
After finishing the creation process, an iNum will be created.  
Edit the ServerId entrys in config.js using this iNum for the resource- and client server.
