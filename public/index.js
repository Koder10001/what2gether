var socket = io("/");
var userName = "";
window.onload = function(){
    // done
    socket.on('connect', () => {
        socket.emit("leave");
      });
    socket.on("disconnect",()=>{
        socket.connect();
    })
    // message
    socket.on("chat",function(data){
        $("#chatField").innerHTML += 
        '<div class="chatContent">'+
            '<div class="userName">' + data["name"] + '</div>' +
            '<div class="content">' + data["msg"] + '</div>'+
        '</div>';
        scrollToBottom();
    })
    


    // video
    socket.on("addURL",function(data){
        $("#vid").src = data;
        $("#vid").onloadedmetadata = function(){
            socket.emit("ready");
        }
    })
    socket.on("play",function(){
        $("#vid").play();
    })
    socket.on("pause",function(data){
        $("#vid").pause();
        $("#vid").currentTime = data;
    })
    socket.on("lateJoin",function(data){
        $("#vid").src = data["src"];
        $("#vid").currentTime = data["time"];
        $("#vid").onloadedmetadata = function(){
            socket.emit("play");
        }
    })
}








//button :3
    










// add video url to video tag
$("#url").addEventListener("keydown",function(event){
    if(event.keyCode == 13){
        checkUsername();
        socket.emit("url",this.value);
    }
})
// get room list
$("#list").addEventListener("click",function(){
    //edited
    checkUsername();
    $("#full").classList.add("show")
    $("#full").classList.remove("hide");
    socket.emit("list",null,function(data){
        $("#listContainer > .container").innerHTML = "";
        data.forEach(room => {
            $("#listContainer > .container").innerHTML += 
            "<div class='room' onclick='join(this.childNodes[0].innerText)'>"+
            "<div class='a'>" + room["name"] + "</div>"+
            "<div class='b'>"+ room["ppl"] +"</div>"+
            "</div>";
        });
    })
})
// show room list
$("#full").addEventListener("click",function(event){
    if(event.target == this){
        this.classList.add("hide")
        this.classList.remove("show");
    }
})
// create/join room
$("#create").addEventListener("click",function(){
    join($("#roomName").value);
})
// send message
$("#msg").addEventListener("keydown",function(event){
    if(event.keyCode == 13){
        let chatMSG = new Object();
        chatMSG["name"] = userName;
        chatMSG["msg"] = $("#msg").value;
        socket.emit("chat",chatMSG,function(data){
            $("#msg").value = "";
            $("#chatField").innerHTML += 
                '<div class="chatContent">'+
                    '<div class="userName me">' + data["name"] + '</div>' +
                    '<div class="content">' + data["msg"] + '</div>'+
                '</div>';
            scrollToBottom();
        });
    }
})


// video event
$("#vid").onpause = function(){
    socket.emit("pause",this.currentTime);
}
$("#vid").onplay = function(){
    socket.emit("play");
}









//function 













function checkUsername(){
    while(userName.trim() == ""){
        userName = prompt("You are ? (10 characters)").substring(0,10).trim();
    }
}
function join(data){
    if(data.trim().length > 0 && data.trim().length <= 20 ){
        socket.emit("join",{room:data,username: userName},function(data){
            $("#cur").innerText = data;
        });
        $("#full").classList.add("hide")
        $("#full").classList.remove("show");
    }
}
function $(node){
    var a = document.querySelectorAll(node);
    if(a.length == 1){
        return a[0];
    }
    else {
        return a;
    }
}
function scrollToBottom() {
    $("#chatField").scrollTop = $("#chatField").scrollHeight;
  }