const os = require('os')
const retry = require('retry')
const mongodb = require('mongodb')
const username = require('username')
const moment = require('moment')
var Q=require('q')
const userCollection='users';
const url = 'Mongo DB Url for User Data Storage';
const mongoClient = mongodb.MongoClient
const currentTime = new Date()
const currentHost=os.hostname()
const operation = retry.operation()

function getMachineStatus(document)
{
                 if(document)
                    {
                        console.log('Machine Found');
                         if(document.status=="login")
                           {  
                            console.log('Machine in use...');
                            result='This machine is currently logged in by '+document.userName + " from " + document.updated_on;
                           }
                         else
                           {
                            console.log('Machine is not in use');
                            result='The machine is not logged in by anyone right now. It was last logged in by '+document.userName+' at '+document.updated_on;
                           }                
                    }
                    else
                    {
                        console.log('No Virtual machine found with this name in my dossier....Please retry with a correct machine');
                        result='No Virtual machine found with this name in my dossier....Please retry with a correct machine' ;
                    }
return result;
}

getFreeMachine= function(teamName,callback)
{
    var freeMachine=new Array();
     //Remove all spaces from Machine Name
    const operation = retry.operation()
    username().then(user => {
        operation.attempt(function (currentAttempt) {
            mongoClient.connect(url, (err, db) => {
                //If there is an error in retry operation
                if (operation.retry(err)) return
                //otherwise do following
                const vmDetailsCollection = db.collection('vm-loggedin-details');
                 var cursorTomachineHostDocument = vmDetailsCollection.find({'status':'logout'});
                 cursorTomachineHostDocument.each(function(err,item)
                 { 
                     if(item !=null)
                     { 
                         if(item.team.toLowerCase() == teamName.toLowerCase())
                         {
                            freeMachine.push(item.hostName);
                         }
                     }
                     else
                     {
                         console.log('Reaching at end...... closing connection');
                         db.close();
                         callback(freeMachine);  
 
                     }
                 });

                })
            })
        
    })
}
                
getMachineInfo = function (machineName,callback)
{
   
    var result='Machine Not Found';
     //Remove all spaces from Machine Name
    machineName=machineName.replace(/\s/g, "") ;
    const operation = retry.operation()
    username().then(user => {
        operation.attempt(function (currentAttempt) {
            mongoClient.connect(url, (err, db) => {
                //If there is an error in retry operation
                if (operation.retry(err)) return
                //otherwise do following
                const vmDetailsCollection = db.collection('vm-loggedin-details')
                var machineHostDocument = vmDetailsCollection.findOne({'hostName':machineName}).then(function(doc) {
                        var machineStatus_Promise=Q.denodeify(getMachineStatus);
                        var promiseGetMachineStatus=getMachineStatus(doc);
                        result=promiseGetMachineStatus.toString();
                        promiseGetMachineStatus.then
                        {
                        console.log('completing db operations ');
                        db.close();
                        callback(result);  
                        }
                   });

                })
            })  
    })
}

getMTApplicationInfo = function (appName,callback)
{   
    var applications=new Array();

    mongoClient.connect(url, (err, db) => {                
        const environments = db.collection('environments');
        var matchingApps = environments.find({'Application':{ $regex: new RegExp(".*" + appName.toLowerCase() + ".*", "i") }});
        matchingApps.each(function(err,item){ 
            if(item !=null)
            { 
                //console.log('Matching Application - ' + item.Application);
                applications.push(item.Application + "\'s " + item.Environment + " Environment is hosted on Web Server(s) - " + item.WebServer + ", DB Server(s) - " + item.DBServer + " and the endpoint is " + item.Endpoint);
            }
            else
            {
                //console.log('Reaching at end...... closing connection');
                db.close();
                callback(applications);  
            }
        });
    })         
}

getAllMTApplications = function (callback)
{   
    var applications=new Array();

    mongoClient.connect(url, (err, db) => {                
        const environments = db.collection('environments');
        var matchingApps = environments.find();
        matchingApps.each(function(err,item){ 
            if(item !=null)
            { 
                //console.log('Matching Application - ' + item.Application);
                if(applications.lastIndexOf(item.Application)==-1)
                {
                    applications.push(item.Application);
                }
            }
            else
            {
                //console.log('Reaching at end...... closing connection');
                db.close();
                callback(applications);  
            }
        });
    })         
}
updateField=function(id,valueToChange,userInput,convo,bot,message,callback)
                    {
                       mongoClient.connect(url, (err, db) => {
                            if (operation.retry(err)) return
                                const userCollectionDetails = db.collection(userCollection)
                                 var currentUserDocument = userCollectionDetails.findOne({'id':id}).then(function(doc) {
                                    if(doc)
                                        {
                                            if(valueToChange=="name")
                                            {
                                            userCollectionDetails.update(
                                                {_id:doc._id},
                                                {$set:{
                                                        name: userInput,
                                                      }},dbOperationFinished,callback(doc)); 
                                            }
                                            else if(valueToChange=="username")
                                            {
                                            userCollectionDetails.update(
                                                {_id:doc._id},
                                                {$set:{
                                                        userName: userInput,
                                                      }},dbOperationFinished,callback(doc));

                                            }
                                        }
                       
                                     });

                                var dbOperationFinished = function(){
                                db.close();    
                                }
                    });
        }