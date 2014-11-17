var alljoyn = require('alljoyn');
var Pryv = require('pryv');
var pyConn = new Pryv.Connection({ username: 'perkikiki',
  auth: 'ci2lz88080002urwkby93rzb8', staging: true });



// create a bus and sessionId
var bus = alljoyn.BusAttachment('myAppName');
var sessionId = 0;
var portNumber = 27;

// create interface description
var interface = alljoyn.InterfaceDescription();

// create listener
var listener = alljoyn.BusListener(
  function(name){
    console.log("FoundAdvertisedName", name);

    //join session, sessionId is used to send messages.
    sessionId = bus.joinSession(name, portNumber, 0);
     console.log(sessionId);
      // send a signal message
    object.signal(null, sessionId, interface, "Chat", "Hello, I am a client!");
  },
  function(name){
    console.log("LostAdvertisedName", name);
  },
  function(name){
    console.log("NameOwnerChanged", name);
  }
);

// create the interface
bus.createInterface('org.alljoyn.bus.samples.chat', interface);

// add a signal to the interface, specifying what kind of message we will accept
// s = string, d = number, b = boolean
interface.addSignal("Chat", "s",  "msg");

// register the listener on the bus
bus.registerBusListener(listener)

// initialize the bus
bus.start();

// create the BusObject that will send and receive messages
var object = alljoyn.BusObject("/chatService");

// start listening
bus.connect();

// discover devices with prefix 'org.alljoyn'
bus.findAdvertisedName('org.alljoyn.bus.samples.chat')

// create a SessionPortListener for session changes
var portListener = alljoyn.SessionPortListener(
    function(port, joiner){
          console.log("AcceptSessionJoiner", port, joiner);

          // return true to accept the new session member
          return true;
    },
    function(port, sessId, joiner){
        sessionId = sessId;
          console.log("SessionJoined", port, sessionId, joiner);
    }
);

// add the chat interface to the BusObject
object.addInterface(interface);

// register signal handler for BusObject
// this function will be called for each received message
bus.registerSignalHandler(object, 
    function(msg, info){
      console.log("Message received: ", msg['0'], info);
      pyConn.events.create({
        content: msg[0],
        type: 'note/txt',
        streamId : 'alljoyn'
      }, function (error, event) {

      });
    },
    interface, "Chat");
