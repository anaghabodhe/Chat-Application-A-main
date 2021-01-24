
    // Get url parameters
    const url_string = window.location.href;
    const url = new URL(url_string);

    const id = url.searchParams.get("id");
    const group_name = url.searchParams.get("title");

    console.log("Group ID :", id);
    console.log("Group Name :", group_name);


    // // Take controls of input box and button
    const text_input = document.getElementById("text");
    const button = document.getElementById("send_button");

    // Message Container
    const message_box = document.querySelector(".cont");

    //Title Container 
    const title_box = document.querySelector(".group_title");

    // Names list
    const names_list = document.getElementById("list");

    const name = prompt("What's your name ?");

    // // Initialise connection using pure websockets
    // const ws = new WebSocket("ws://127.0.0.1:3000/test");

    // //Check whether server has accepted your connection request or not ! if yes then function will execute
    // ws.onopen = function () {
    //     console.log("Connection established with server !");
    // };

    // // Collect value from input box and send it to the websocket server
    // button.addEventListener("click", sendData);

    // // Create function sendData
    // function sendData() {
    //     console.log(text_input.value);

    //     // Send this input value to server
    //     const obj = {
    //         message: text_input.value
    //     };

    //     ws.send(JSON.stringify(obj));

    //     // Clear input box
    //     text_input.value = "";
    // };

    // // Collect data sent by server !
    // ws.onmessage = function (data) {
    //     console.log(data);

    //     // Display on body
    //     message_container.innerHTML += `<p>${data.data} - From server <span>${new Date().toLocaleTimeString()}</span></p>`;
    // };

    //Initialise connection using socket.io
    const socket = io();

    //Check whether server has accepted your connection request or not ! if yes then function will execute
    socket.on("join", function (data) {
        console.log(data.message);
    });

    // Send credentials to server !
    socket.emit("join", {
        id: id,
        group_name: group_name,
        name: name
    });


    socket.on("enter", function (data) {
        // Display on body
        // alert_message.innerHTML += `<h1>${data.message} <span>7.08PM</span></h1>`;
        const div = document.createElement("div");
        div.classList.add("alert");
        div.innerHTML = `<h1>${data.message} <span>${data.time}</span></h1>`;
        message_box.appendChild(div);
    });

    window.onbeforeunload = function () {
        socket.emit("close", {
            id: id
        });
    };


    // Collect value from input box and send it to the websocket server
    button.addEventListener("click", sendData);

    // Create function sendData
    function sendData() {
        console.log("Sent :", text_input.value);
        // // Display on body
        // input_messages.innerHTML += `<p>${text_input.value} - <span>${new Date().toLocaleTimeString()}</span></p>`;
        const div = document.createElement("div");
        div.classList.add("input");

        div.innerHTML = `<div class="message">
                            <p id="text"><strong>YOU</strong> : ${text_input.value}</p>
                            <p id="time"><em>${new Date().toLocaleTimeString()}</em></p>
                        </div>`;
        message_box.appendChild(div);


        // Send this input value to server
        socket.emit("message", {
            message: text_input.value,
            name: name,
            id: id
        });

        // Clear input box
        text_input.value = "";
    };

    // Collect data sent by server !
    socket.on("server_message", function (data) {
        console.log("Recieved :", data.message);

        // Display on body
        // message_container.innerHTML += `<p>${data.message} - From ${data.name} <span>${data.time}</span></p>`;
        const div = document.createElement("div");
        div.classList.add("output");
        div.innerHTML = `<div class="message">
                            <p id="text"><strong>${data.name}</strong> : ${data.message}</p>
                            <p id="time"><em>${data.time}</em></p>
                         </div>`;
        message_box.appendChild(div);


        type.innerHTML = "";
    });

    // Typing...
    text_input.addEventListener("input", typing);

    function typing() {
        console.log("Typing...");
        console.log(name);
        socket.emit("typing", {
            type: "Typing...",
            name: name,
            id: id
        });
    };

    socket.on("server_type_message", function (data) {
        console.log(data);
        type.innerHTML = `<span>${data.type} - from ${data.name}</span>`;
    });


    socket.on("leave", function (data) {
        // Display on body
        // message_container.innerHTML += `<h1>${data.message}</h1>`;
        const div = document.createElement("div");
        div.classList.add("alert");
        div.innerHTML = `<h1>${data.message} <span>${data.time}</span></h1>`;
        message_box.appendChild(div);
    });


    // Room Information !
    socket.on("room", function (data) {
        console.log(data);

        // Title
        title_box.innerHTML = `<h2>${data.title} <i class="fa fa-users" aria-hidden="true"></i></h2>`;

        // Names display !
        const { names } = data;

        let html = ""
        names.forEach(element => {
            html += `<li>${element.name}(<strong>${element.status}</strong>) <i class="fa fa-circle" aria-hidden="true"></i></li>`;
        });

        names_list.innerHTML = html;
    });