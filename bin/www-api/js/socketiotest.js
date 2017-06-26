/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


var socket;


var row = 1;


var trHtmlTemplate = null;


$.get("templates/socket-table-item.html", function (data) {
    trHtmlTemplate = data;
});

var printToTable = function (incomingString, outgoingString)
{
    if (trHtmlTemplate !== null)
    {
    var trimLen = 50;

    var trimmedIncomingString = incomingString.length > trimLen ?
            incomingString.substring(0, trimLen - 3) + "..." :
            incomingString;

    var trimmedOutgoingString = outgoingString.length > trimLen ?
            outgoingString.substring(0, trimLen - 3) + "..." :
            outgoingString;

    var trHtml = trHtmlTemplate;
    trHtml = trHtml.replace("%ROW%", row);
    trHtml = trHtml.replace("%OUTGOING%", outgoingString);
    trHtml = trHtml.replace("%INCOMING%", incomingString);
    trHtml = trHtml.replace("%OUTGOING_SHORT%", trimmedOutgoingString);
    trHtml = trHtml.replace("%INCOMING_SHORT%", trimmedIncomingString);
    trHtml = trHtml.replace("%IN_ID_ROW%", "in_id" + row);
    trHtml = trHtml.replace("%SHARP_IN_ID_ROW%", "#in_id" + row);
    trHtml = trHtml.replace("%OUT_ID_ROW%", "out_id" + row);
    trHtml = trHtml.replace("%SHARP_OUT_ID_ROW%", "#out_id" + row);
    row = row + 1;

    $(trHtml).appendTo($('#socket_tbody'));
    }
};


var emitAndAddToTable = function (channel, request)
{
    if (socket)
    {
        if (trHtmlTemplate)
        {
            socket.emit(channel, request);

            var requestStr = JSON.stringify(request, null, 2);

            var outgoingString = channel + " -- " + requestStr;

            printToTable("-", outgoingString);

        }
    }
};


var userIdCallback = function (response)
{
    
    //var userId = response.authResponse.userID;
    //var accessToken = response.authResponse.accessToken;

    
    $('#sendchannel').val("api");

    $('#sendrequest').val(JSON.stringify({}, null, 2));
    
    

    
    //console.log("Profile user ID get: " + userId);
    //console.log("Profile access Token: " + accessToken);

    socket = io('http://foodtrash.stage.fishrungames.com');

    var onevent = socket.onevent;
    socket.onevent = function (packet) {
        var args = packet.data || [];
        onevent.call(this, packet);    // original call
        packet.data = ["*"].concat(args);
        onevent.call(this, packet);      // additional call to catch-all
    };



    socket.on('connect', function () {
        console.log('connected to server');

        printToTable("connected", "connected");
        
		//emitAndAddToTable('api', {method: "userAuth", table: "tokens", marker: "auth.on_auth", params: {type: "fb"}});

        $("#socketio_state").text("Socket.io state: connected");


    });

    socket.on('*', function (ev, data) {
        console.log('>>- server - api');
        console.log(JSON.stringify(data));
        console.log('>>>- server - api');
        console.log(data);
        console.log('>>>>- server - api');
        console.log(ev);


        var requestStr = JSON.stringify(data, null, 2);

        printToTable(ev + " -- " + requestStr, "-");
    });

    socket.on('disconnect', function () {
        console.log('disconnected from server');
        /*var trHtml = trHtmlTemplate;
         trHtml = trHtml.replace("%OUTGOING%", 'Disconnected');
         trHtml = trHtml.replace("%INCOMING%", 'Disconnected');
         $(trHtml).appendTo($('#socket_tbody'));*/

        $("#socketio_state").text("Socket.io state: disconnected");

        printToTable("disconnected", "disconnected");
    });

    socket.connect();


};


var sendClicked = function ()
{
    var channel = $('#sendchannel').val();
    var request = JSON.parse($('#sendrequest').val());
    
    emitAndAddToTable(channel, request);
   
};

//setUserIdCallback(userIdCallback);


userIdCallback(null);