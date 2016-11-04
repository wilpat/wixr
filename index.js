'use strict'
const express = require('express');
const app = express();

const sio = require('socket.io');
const path = require('path');

const mongoose = require('mongoose');
const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, "indexc.html");
var url = process.env.MONGOLAB_URI;
mongoose.connect('mongodb://localhost/chat', function(err){
	if(err){
		console.log(err);
	}else{
		console.log('Connecting to mongodb!');
	}
});

var privateSchema = mongoose.Schema({//Declare the MongoDB schema you'd like to use
	nick: String,
	msg: String,
	receiver: String,
	sender: String,
	identifier: String,
	createDate: {type: Date, default :Date.now}
});

var userSchema = mongoose.Schema({//Declare the MongoDB schema you'd like to use
	username: String,
	firstname: String,
	lastname: String,
	gender: String,
	phone: String,
	createDate: {type: Date, default :Date.now}
});

var recordsSchema = mongoose.Schema({//Declare the MongoDB schema you'd like to use
	identifier: String,
	totalMsgs: Number,
	starter : String,
	receiver : String,
	lastMessage : String,
	createDate: {type: Date, default :Date.now}
});


var records = mongoose.model('Record', recordsSchema);//Selects the collection to use

var privateChat = mongoose.model('Private', privateSchema);

var usersrec = mongoose.model('user', userSchema);

app.use(express.static(path.join(__dirname, 'public')));

const server = app
  .use((req, res) => res.sendFile(INDEX) )
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const io = sio(server);
var users = {};

io.on('connection', function(socket){
  console.log('a user with socket: '+ socket.id +' connected');
 
  	function makeAlphabet(str) { 
		   var arr = str.split(''),
		   alpha = arr.sort().join('').replace(/\s+/g, '');
		   return alpha; 
		}
	function recordNew(identifier, starter, sendto, msg){
		var record = new records({identifier: identifier, $inc: {totalMsgs: 1}, starter: starter, receiver: sendto, lastMessage: msg});
	  	var upsertData = record.toObject();
	  	delete upsertData._id;
	  	//db.foo.update({'title.de': {$exists : false}}, {$set: {'title.de': ''}})
	  	records.update({identifier: record.identifier}, upsertData, {upsert: true}, function(err){
	  	//records.update({identifier: record.identifier}, upsertData, {upsert: true}, function(err){
	  		if(err) throw err;
	  	});
	}
	
	socket.on('new-user', function(data){

  		var status = 'online';
	  	socket.usernames = data;
	  	users[socket.usernames] = socket.id;
		update(status);//This lets everyone connected to this person that he or she is online / offline
		usersrec.find({username:data},{}).lean().exec(function (errx, docx){
			socket.emit('user_dets', docx)
			
		});

	});

  socket.on('convos', function(data){
	
		var query = records.find({$or:[{starter:data},{receiver:data}]},{});//check th records table for all persons the logged in user has spoken to
		query.sort('-createDate').exec(function (err, docs){
			if(err) throw err;
			//socket.emit('usernames', docs);
			
			for(var i=docs.length-1; i>= 0; i--)
			{
				//console.log(i);
		       var starter  = docs[i].starter;
		        var receiver = docs[i].receiver;
		        var lasttxt = docs[i].lastMessage;
		    
		        if (starter == socket.usernames){
		          var target = receiver;
		        }else
		        {
		          var target = starter;
		        }
		          
		            var userlast = target+" "+lasttxt;
		            socket.emit('lastly', userlast);//Emit the username and last message for the client to emit back here
		     
	  		}
		})
	  	
  });

    socket.on('lastly2', function(data){//reciver the username and last message to work with

	var check = data;
	var space = check.indexOf(' ');
 	var name = check.substr(0, space);
 	var msg = check.substr(space+1);

    	 usersrec.find({username:name},{}).lean().exec(function (errx, docx){
					if(errx) throw errx;

					//console.log('Loading connected users');
					

					docx[0].message = msg;
					
					socket.emit('usernames', docx);
		      });

    })

      socket.on('convo begin', function(sent){//load up the convo of the recepient on the 
  	var target = sent;
	var user = socket.usernames;
	var join = target+":"+user;
	var identifier = makeAlphabet(join);
	var query = records.find({identifier:identifier},{});//check records table if this person has had a convo with the currently logged in user
		query.exec(function (err, docs){
			if(err) throw err;
			if(docs != ""){//if you have had a convo with this user
				var msg = docs[0].lastMessage;
				recordNew(identifier, user, target,msg);//Update the convo records table
			}else{
				var msg = ""
				recordNew(identifier, user, target,msg);//Update the convo records table
				usersrec.find({username:target},{}).lean().exec(function (errx, docx){
					if(errx) throw errx;

					//console.log('Loading connected users');
					

					docx[0].message = msg;
					
					socket.emit('usernames', docx);
		     	});
			}
		});
	
  });

socket.on('dbcheck', function(data)
{
	var check = data;
	var space = check.indexOf(' ');
 	var name = check.substr(0, space);
 	var receiver = check.substr(space+1);
 	var query = usersrec.find({username:name},{});//check the users table for to validate entering user
 	var query2 = usersrec.find({username:receiver},{});//check the users table for to validate targeted recepient
		query.sort('-createDate').exec(function (err, docs)//checking logged in user
		{
			if(err) throw err;
			if(docs!="")
			{
				query2.sort('-createDate').exec(function (err2, docs2)//Checking target user
				{
					if(err2) throw err2;
					if(docs2 !="")
					{
						socket.emit('exist', 'yes');
					}
					else
					{
						console.log(receiver + ' not exist')
						socket.emit('exist', 'no');
					}
				});
			}
			else
			{
				console.log(name + ' current user not exist')
				socket.emit('exist', 'no');
			}

		});
});
socket.on('user selected', function(data){
	var target = data;
	var user = socket.usernames;
	var join = target+":"+user;
	var identifier = makeAlphabet(join);

var query = privateChat.find({identifier:identifier},{});
query.lean().sort('-createDate').exec(function(err,docs){
		if (err) throw err;
		//console.log('loading messages sent to '+ data);
		//console.log(docs);
		usersrec.find({username:target},{}).lean().exec(function (errx, docx){
					if(errx) throw errx;

					var img = docx[0].image;
					
					//console.log(docs);
				});
				
			socket.emit('specific', docs);
	
	});
});

  function update(status){
  	io.emit('current', status);
  }


  socket.on('private_message', function(sent){
 	var space = sent.indexOf(' ');
 	var name = sent.substr(0, space);
 	var data = sent.substr(space+1);
 	var sender = socket.usernames;
 	var join = sender+':'+name;
 	var identifier = makeAlphabet(join);

 	io.to(users[socket.usernames]).emit('chat message', {msg: data, nick: socket.usernames, target: name});
 	io.to(users[name]).emit('chat message', {msg: data, nick: socket.usernames, target: name});
 	recordNew(identifier, sender, name, data);//Update the convo records table
 	sendmsg(identifier, data, sender, name);//Update the private_msg table
 });

function sendmsg(identifier, msg, sender, receiver){//COntrols sending private msges
	var entermsg = new privateChat({identifier: identifier, msg: msg, sender: sender, receiver: receiver});
	entermsg.save(function(err){
		if(err) throw err;
	});
}
  socket.on('disconnect', function(){
  if(!socket.usernames) return;
   delete users[socket.usernames];
  var status = 'offline';
 update(status);
  });
  
});
