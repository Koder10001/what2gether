var server = require('http').createServer(handler);
var io = require('socket.io')(server);
var fs = require('fs');
var info = new Object();
var ready = new Object();
var https = require("https");
function handler(req,res) {
  if(req.url == "/"){
    req.url = "/index.html";
  }
  fs.readFile(__dirname + "/public" + req.url,function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end(err.toString());
    }
    res.writeHead(200);
    res.end(data);
  });
  // var file = fs.createReadStream(__dirname + "/public" + req.url);
  // file.pipe(res);
}



server.listen(process.env.PORT || 80,function(){
  console.log("listening on port "+(process.env.PORT || 80))
});


io.on('connection', function (socket) {
  socket.leaveAll();
  socket.on("join",function(data,callback){
    let room = html(data["room"]).trim();
    let username = handleUsername(data["username"]);
    if(username.length > 0 && username.length <= 20 && room.length > 0 && room.length <= 20){
      if(Object.keys(info).indexOf(room) != -1 && io.sockets.adapter.rooms[room]["length"] == 0){
        console.log(info);
        info[room] = undefined;
        console.log(info);
      }
      socket.leaveAll();
      socket.join(html(room));
      socket.userName = html(username);
      io.in(room).emit("chat",{name: html(username), msg: " joined"});
      callback(html(room));
      if(info[room] != undefined){
        io.in(room).emit("pause");
        socket.emit("lateJoin",info[room]);
      }
    }
  })
  socket.on("leave",function(){
    console.log("asdf");
    socket.leaveAll();
  })
  socket.on("list",function(a,callback){
    let rooms = [];
    arr(io.sockets.adapter.rooms).forEach(room => {
      rooms.push({name : room, ppl : io.sockets.adapter.rooms[room]["length"]});
    });
    callback(rooms);
  })



  // chat


  socket.on("chat",function(data, callback){
    data["name"] = handleUsername(data["name"]);
    data["msg"] = html(data["msg"])
    if(data["name"] != "" && data["msg"] != ""){
      socket.to(thisRoom(socket)).emit("chat",data);
      callback(data);
    }
  })


  // video

  socket.on("url",function(data){
    io.in(thisRoom(socket)).emit("addURL",data);
    info[thisRoom(socket)] = new Object();
    info[thisRoom(socket)]["src"] = data;
    info[thisRoom(socket)]["time"] = null;
    ready[thisRoom(socket)] = 0;
  })
  socket.on("ready",function(){
    ready[thisRoom(socket)] = ready[thisRoom(socket)] + 1;
    if(ready[thisRoom(socket)] == (io.sockets.adapter.rooms[thisRoom(socket)]["length"])){
      io.in(thisRoom(socket)).emit("play");
    }
  })
  socket.on("pause",function(data){
    info[thisRoom(socket)] = data;
    io.in(thisRoom(socket)).emit("pause",data);
  })
  socket.on("play",function(){
    io.in(thisRoom(socket)).emit("play");
  })
});



//function :3


function thisRoom(obj){
  return Object.keys(obj.rooms)[0];
}
function arr(obj){
  return Object.keys(obj);
}
function html(str) {
  return String(str.trim())
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function handleUsername(a){
  return html(a.substring(0,10).trim());
}

setInterval(()=>{
  https.get("https://what2gether.herokuapp.com/");
},5000)