const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: { origin: "*" } // avoid CORS errors when connecting from React
});

// allow access to html files in the public folder
app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('A device has connected');

    socket.on('scan-barcode', (barcodeNumber) => {
        console.log('Barcode read: ', barcodeNumber);

        // broadcast to the cashier's React App in real-time
        io.emit('display-barcode', barcodeNumber);
    })
});

http.listen(5000, () => {
    console.log('Server is running on port 5000');
});