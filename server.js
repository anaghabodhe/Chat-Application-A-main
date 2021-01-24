// Initialisation
// Dependency Used - Express,ws
const express = require("express");
const webSocket = require("ws");
const ejs = require("ejs");
const socket = require("socket.io");
const host = "127.0.0.1";
const port = 3000;


var app = express();

app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.set("view engine","ejs");

app.use(express.static(__dirname+"/public"));

// Create users array 
// @desc - stores users rooms with unique ids
const rooms = []

app.get("/",function(request,response){
    response.render("room");
});

app.get("/chat",function(request,response){
    response.render("chat");
});

// app.use("/test",express.static(__dirname+"/public"));

// app.get("/",function(request,response){
//     response.send(` <form action="/createForm" method="POST">
//                     <input type="text" name="title" placeholder="Group Title" autocomplete="off">
//                     <button>Create Room</button>
//                   `);
// });

// app.post("/createForm",function(request,response){


//     // Using ARRAYS :
//     // Collect title and generate random id
//     const title = request.body.title;

//     // Generate ID
//     const random_number = Math.random();  //0.7417505903009085
//     const stringified_number = random_number.toString();  //'0.7417505903009085' in string type
//     const string = stringified_number.split(".");  // ['0','7417505903009085']
//     const id = string[1]; // '7417505903009085'

//     //Create Object
//     // const user = {
//     //     id : id,
//     //     title : title
//     // }
    
//     const user = { id, title};

//     // Push objects into the users array !
//     users.push(user);
    
//     console.log("Users :", users);

//     response.json({
//         "success" : "Data stored in array !✔"
//     });

// });

const server = app.listen(port,host,function(){
    console.log("Server is running...");
});

// Create websocket server

// Functions
function pushRoom(id,group_name,name,socket_id,status){
    //Push room to the rooms array !
    // Create object
    const room = {
        id,group_name, names:[{ name : name, client_id: socket_id,status:status}]
    };

    // // Push this room into the rooms arrays
    rooms.push(room);

    console.log("Rooms :",rooms);

    return room;
};

function pushNames(index,name,socket_id,status){
 // Push name of the client into names array !
    rooms[index].names.push({name : name, client_id : socket_id,status:status});
    console.log("Clients :",rooms[index].names);

    console.log("Rooms :",rooms);  

    return rooms[index];
};

function userRetrieve(group_id,client_id){

    const getIndex = rooms.findIndex((room)=>room.id===group_id);

    try {
        const userIndex = rooms[getIndex].names.findIndex((name)=>name.client_id === client_id);
        return rooms[getIndex].names[userIndex];
    } catch (error) {
        console.log("Error :",error);
        return null;
    };
    
};


function deleteUser(group_id,client_id){
    const room = rooms.find((room)=>room.id === group_id);

    if(room === undefined){
        return -1;
    }

    const userIndex = room.names.findIndex((user)=>user.client_id === client_id);

    if(userIndex != -1){
        room.names.splice(userIndex,1);
    }
};

const io = socket(server);

io.on("connection",function(client){

    // Send connection message to server
    client.on("join",function(data){
        console.log(data);

        // Collect all information from data
        // const id = data.id;
        // const group_name = data.group_name;
        // const client_name = data.name;

        const { id, group_name, name} = data;

        // Search for room index in rooms array
        const getIndex = rooms.findIndex((room)=>room.id === id);
        console.log(getIndex);

        if(getIndex >= 0){
            // // Push name of the client into names array !
            // rooms[getIndex].names.push({name : name, client_id : client.id});
            // console.log("Clients :",rooms[getIndex].names);

            // console.log("Rooms :",rooms);
            let status = "Participant";
            const room = pushNames(getIndex,name,client.id,status);

            client.join(room.id);
            
            client.to(room.id).broadcast.emit("enter",{
                message : `${name} entered the chat !`,
                time : new Date().toLocaleTimeString()
            });

            io.to(room.id).emit("room",{
                title: group_name,
                names : room.names
            });

        }else{
            // // Create object
            // const room = {
            //     id,group_name, names:[{ name : name, client_id: client.id}]
            // };

            // // Push this room into the rooms arrays
            // rooms.push(room);

            // console.log("Rooms :",rooms);

            let status = "Admin";

            const room = pushRoom(id,group_name,name,client.id,status);

            client.join(room.id);

            io.to(room.id).emit("room",{
                title: group_name,
                names : room.names
            });
        }

    });


    // Collect messages from client
    client.on("message", function(data){
        console.log(data.message);

        // Send recieved message to client again !
        // client.broadcast.emit("server_message",{
        //     name : data.name,
        //     success : data.message,
        //     time : new Date().toLocaleTimeString()
        // });

        client.to(data.id).broadcast.emit("server_message",{
            message : data.message,
            name : data.name,
            time : new Date().toLocaleTimeString()
        });
    });


    //Send typing message
    client.on("typing",function(data){
        client.to(data.id).broadcast.emit("server_type_message",{
            type : data.type,
            name : data.name
        });
    });

    client.on("close", function(data){
        // const id = data.id;
        const {id} = data;

        const user = userRetrieve(id,client.id);

        console.log("User :",user);

        if(user === null || user== undefined){
            client.to(id).broadcast.emit("leave",{
                message : `${user} has left the chat !`
            });
        }else{
            client.to(id).broadcast.emit("leave",{
                message : `${user.name} has left the chat !`,
                time : new Date().toLocaleTimeString()
            });
        }

        // Delete user
        deleteUser(id,client.id);

        const room = rooms.find((room)=>room.id=== id);

        if(room === undefined){
            return -1;
        }

        io.to(id).emit("room",{
            names : room.names,
            title: room.group_name
        });
    });


    console.log("Client added !");
});

// const wss = new webSocket.Server({
//     server : server
// });

// let i = 0;

// wss.on("connection",function(client){

//     // Handle messages from client
//     client.on("message",function(data){
//         console.log(`Data : ${data}`);

//         // Convert string to object or array
//         const parsed_data = JSON.parse(data);

//         // Add broadcasting
//         wss.clients.forEach(function(ws){                
//             ws.send(JSON.stringify({
//                 "server_message" : parsed_data.message
//             }));
//         });
//     });

//     if(i === 0){
//         console.log(`Connected with ${++i} client !`);
//     }else{
//         console.log(`Connected with ${++i} clients !`);
//     };

//     client.on("close",function(){
//         console.log("Client left !");
//         i--;
//     })

// });