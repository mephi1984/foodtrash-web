// /projects_dir/server/appChat.js
var PORT = 8020;

var options = {
	//    'log level': 0
};

var express = require('express');

let FB = require('fb');

var trashBinArr = [];

trashBinArr["trash_1dc9226611b656cceaaf485b3cb99355"] = {
	id : "trash_1dc9226611b656cceaaf485b3cb99355",
	name : "Starbucks Trash # 1",
	trashArr : [],
	latitude : 60.167747,
	longitude : 24.943525
};

trashBinArr["trash_a0ca3be2b64d8aa3baf59deb9bef02f1"] = {
	id : "trash_a0ca3be2b64d8aa3baf59deb9bef02f1",
	name : "McDonalds Trash # 1",
	trashArr : [],
	latitude : 60.168877,
	longitude : 24.930082
};

var users = [];

users['test0001'] = {
			id : "test0001",
			first_name : "Crystal",
			gender : "male",
			last_name : "Delgado",
			locale : "en_US",
			avatar : "/img/icon-user-default.png"
};

users['test0002'] = {
			id : "test0002",
			first_name : "Eric",
			gender : "male",
			last_name : "Riley",
			locale : "en_US",
			avatar : "/img/icon-user-default.png"
};

users['test0003'] = {
			id : "test0003",
			first_name : "Elizabeth",
			gender : "male",
			last_name : "Nelson",
			locale : "en_US",
			avatar : "/img/icon-user-default.png"
};

users['test0004'] = {
			id : "test0004",
			first_name : "William",
			gender : "male",
			last_name : "Hansen",
			locale : "en_US",
			avatar : "/img/icon-user-default.png"
};

var news = [];

var leaderboard = [{
		trashCount : 4,
		user : users['test0001']
	},
	{
		trashCount : 3,
		user : users['test0002']
	},
	{
		trashCount : 2,
		user : users['test0003']
	},
	{
		trashCount : 1,
		user : users['test0004']
	}
];


function compareNews(a,b) {
  if (a.date < b.date)
    return 1;
  if (a.date > b.date)
    return -1;
  return 0;
}

function compareLeaderboard(a,b) {
  if (a.trashCount < b.trashCount)
    return 1;
  if (a.trashCount > b.trashCount)
    return -1;
  return 0;
}

/*
var trashIdTable = [];

trashIdTable["6408430002085"] = {
id : "6408430002085",
name : "Valiojogurtti"
};

trashIdTable["6416344001506"] = {
id : "6416344001506",
name : "Avolehtio Paperipiste"
};

trashIdTable["4902071817630"] = {
id : "4902071817630",
name : "Textmark 700"
};*/

var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server, options);

server.listen(PORT);

//app.use('/static', express.static(__dirname + '/www/static'));
/*
app.get('/', function (req, res) {
	res.sendfile(__dirname + '/www/index.html');
});
*/

app.use('/', express.static(__dirname + '/www/'));
app.use('/api/', express.static(__dirname + '/www-api/'));

//подписываемся на событие соединения нового клиента
io.sockets.on('connection', function (client) {
	//подписываемся на событие message от клиента

	client.on('trashBin', function (message) {
		try {
			//посылаем сообщение себе
			client.emit('onTrashBin', {
				result : true,
				trashBinArr : trashBinArr
			});
		} catch (e) {
			console.log(e);
			client.disconnect();
		}

	});

	client.on('news', function (message) {
		try {
			//посылаем сообщение себе
			client.emit('onNews', {
				result : true,
				news : news
			});
		} catch (e) {
			console.log(e);
			client.disconnect();
		}
	});

	client.on('leaderboard', function (message) {
		try {
			//посылаем сообщение себе
			client.emit('onLeaderboard', {
				result : true,
				leaderboard : leaderboard
			});
		} catch (e) {
			console.log(e);
			client.disconnect();
		}
	});

	client.on('putTrash', function (message) {
		try {
			//посылаем сообщение себе

			var trashBinId = message.trashBinId;
			
			//console.log(' putTrash 1');

			if (users[message.userId]) {
				var trash = {
					id : message.trashId,
					name : "Unknown trash"
				};
				
				if (!trashBinArr[trashBinId])
				{
					trashBinArr[trashBinId] = {
						id : trashBinId,
						name : "Unknown Trash Bin",
						trashArr : [],
						latitude : 60.167747,
						longitude : 24.943525
					};
				}
				
				//console.log(' putTrash 2');
				trashBinArr[trashBinId].trashArr.push(trash);

				var newsItem = {
					date : new Date(),
					user : users[message.userId],
					trashBin : trashBinArr[trashBinId],
					trash : trash
				};
				
				//console.log(' putTrash 3');

				console.log('---putTrash');
				console.log(news.length);
				news.push(newsItem);
				console.log(news.length);
				
				news.sort(compareNews);
				
				//console.log(' putTrash 4');

				client.emit('newsAdded', newsItem);
				client.broadcast.emit('newsAdded', newsItem);
				
				//console.log(' putTrash 5');

				//client.emit('onTrashBin', {result: true, trashBinArr : trashBinArr});
				//client.broadcast.emit('onTrashBin', {result: true, trashBinArr : trashBinArr});

				var userExists = false;
				var userPos = -1;
				for (var i = 0; i < leaderboard.length; i++) {
					if (leaderboard[i].user.id === users[message.userId].id) {
						userExists = true;
						userPos = i;
						break;
					}
				}
				
				//console.log(' putTrash 6');

				if (userExists) {
					leaderboard[userPos].trashCount += 1;
				}
				
				leaderboard.sort(compareLeaderboard);

				client.emit('onLeaderboard', {
					result : true,
					leaderboard : leaderboard
				});
				
				//console.log(' putTrash 7');

				client.broadcast.emit('onLeaderboard', {
					result : true,
					leaderboard : leaderboard
				});
				
				//console.log(' putTrash 8');

			}

		} catch (e) {
			console.log(e);
			client.disconnect();
		}
	});

	client.on('register', function (message) {
		try {

			FB.api('me', {
				fields : ['id', 'first_name', 'gender', 'last_name', 'locale', 'middle_name'],
				access_token : message.access_token
			}, (res) => {

				if (!res) {
					client.emit('onRegister', {
						result : false,
						reason : "Invalid FB token"
					});
				}

				if (res.error) {
					client.emit('onRegister', {
						result : false,
						reason : "Invalid FB token"
					});
				} else {
					res.avatar = "http://graph.facebook.com/" + res.id + "/picture?width=200&height=200";
					res.gender = res.gender || "male";

					users[res.id] = res;

					client.emit('onRegister', {
						result : true,
						user : res
					});

					var userExists = false;
					var userPos = -1;
					for (var i = 0; i < leaderboard.length; i++) {
						if (leaderboard[i].user.id === res.id) {
							userExists = true;
							userPos = i;
							break;
						}
					}

					if (!userExists) {
						leaderboard.push({
							user : res,
							trashCount : 0
						});
					}
					
					leaderboard.sort(compareLeaderboard);

					client.emit('onLeaderboard', {
						result : true,
						leaderboard : leaderboard
					});

					client.broadcast.emit('onLeaderboard', {
						result : true,
						leaderboard : leaderboard
					});

				}
			});

		} catch (e) {
			console.log(e);
			client.disconnect();
		}
	});
});