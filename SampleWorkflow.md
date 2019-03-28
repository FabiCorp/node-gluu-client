You should have read [Structure of Project](https://gitlab.iosb.fraunhofer.de/kastel/externalServer/blob/master/StructureOfProject.md) in the externalServer repository to succesfully build the project.  

Sample Workflow
================

1. Check if MongoDB is up and running on localhost (port: 5432) 
2. Check if Gluu is up and running
3. Check if your Mi Band 2 is charged and not connected to any device
3. Start the resourceServer:  
go to externalServer/lib and fire
```sh
NO_PROXY="*" node resourceServer.js
```

5. Start the python script:  
go to MiBand2/ and fire  
```sh
python example.py
```

It will connect to the MiBand2 and send the measured data to the resource server.  
The resource server saves the incoming data into the resourceDB database.  

6. Start the java client application:  
go to clientserver/ and fire
```sh
mvn clean spring-boot:run
```

4. Visit http://localhost:4000/login (to obtain PAT)
4. Visit http://localhost:4000/resourceSets and press  (to get the resourceID for the UMA-Authorization process)
4. Visit http://localhost:9551/login (to obtain PAT)
5. Visit http://localhost:9551/hearthRate (to request authorization for requested resource)
5. Visit http://localhost:9551/umaToken (redirected to claims gathering)
5. Fill in the answers for the Claims Gathering Process : Country => USA | City => NY
5. Visit http://localhost:9551/umaToken (exchange UMA-Ticket to RPT)
5. Visit http://localhost:9551/hearthRate (present RPT to gain access for requested resource).  
Now the requested measurement data will be transfered to the clientDB database.
Waiting several seconds, a chart should appear with the collected data.
When adding data, the chart will be updated after a short time period.

5. Visit http://localhost:9551 (trigger the event to delete the measurement data by PEP)  
The chart will automatically update itself and delete the data out of the time frame.

Congratulations, you performed a complete UC + UMA workflow scenario.  
If you want new measurements to display, just rerun the python script at Step 5.
You still need to transfer the data from the resource to the client server by processing through the uma authorization process starting at Step 7.




