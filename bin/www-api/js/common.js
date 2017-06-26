

var callApi = function (request, marker, callbackFunc)
{

    var socket = io(apiDomain);

    socket.on('connect', function () {

        console.log('connected to server');

        socket.emit('api', request);

    });

    socket.on('api', function (data) {

		if (data.code === 200 && data.result === true)
        {
            if (data.marker === marker)
            {
                callbackFunc(data.response);
            }
        }
    });

    socket.on('disconnect', function () {
        console.log('disconnected from server');
    });

    socket.connect();

};



