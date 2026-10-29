//halaman experimental
const http = require('node:http');

const port = process.env.port || 3000;

const server = http.createServer((request, response) =>{
    response.setHeader('Content-Type', 'application/json');

    if (request.url === "/"){
        response.statusCode = 200;
        response.end(JSON.stringify({
            status: 'server accepted',
            next: 'next the line project'
        }));
    }

    if (request.url === "api/health"){
        response.statusCode = 200;
        response.end(JSON.stringify({
            status: 'good',
        }));
    }

    response.statusCode = 404;
    response.end(JSON.stringify({
        status: 'nothing here'
    }));

    server.addListener(port , () => {
        console.log(`server berjalan di ${port}`)
    })
})