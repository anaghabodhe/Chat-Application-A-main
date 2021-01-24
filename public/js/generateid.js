   // Generate Unique ID 
   const unique_id = document.getElementById("unique_id");
   const id = Math.random().toString().split(".")[1];

   unique_id.value = id;


   // Copy Game 🔥 !
   // Refer this link before writing copy logic !
    // http://localhost:3000/chat?title=IOT&id=18446139016709107

    const url = window.location.href;

    const title_input = document.getElementById("group_name");
    const copy_url = document.getElementById("url");
    const notify = document.querySelector(".copy_notify");

    title_input.addEventListener("input", function () {
        const name_value = title_input.value;

        const changed_url = url + "/chat?title=" + name_value + "&id=" + id;

        display(changed_url);

    });

    function display(url) {
        console.log("URL :", url);
        copy_url.value = url;
    };

    copy_url.addEventListener("dblclick", function () {
        copy_url.select();

        document.execCommand("copy");

        notify.style.display = "block";

        // Disappear after 1s !
        setInterval(function () {
            notify.style.display = "none";
        }, 1000);
    });
