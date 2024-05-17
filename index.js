const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/jobs', async (req, res) => {
    try {
        const response = await axios({
            method: req.method,
            url: `http://localhost:9000/api/jobs${req.url}`,
            data: req.body,
            headers: req.headers,
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        console.error(`Error`);
        res.status(error.response ? error.response.status : 500).send('Proxy error');
    }
});

const bodyParser = require('body-parser');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = __dirname + '/user.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});
const userProto = grpc.loadPackageDefinition(packageDefinition).harisbrulicita2024;
const client = new userProto.UserService('localhost:8095', grpc.credentials.createInsecure());

app.use(bodyParser.json());

app.post('/api/users', (req, res) => {
    const callOptions = { deadline: new Date(Date.now() + 5000) };
    client.createUser(req.body, callOptions, (error, response) => {
        if (error) {
            console.error('Error');
            res.status(500).send(error);
        } else {
            res.json(response);
        }
    });
});

app.get('/api/users/:id', (req, res) => {
    const callOptions = { deadline: new Date(Date.now() + 5000) };
    client.getUser({ id: parseInt(req.params.id) }, callOptions, (error, response) => {
        if (error) {
            console.error('Error');
            res.status(500).send(error);
        } else {
            res.json(response);
        }
    });
});


app.use('/api/tracking', async (req, res) => {
    try {
        const response = await axios({
            method: req.method,
            url: `http://localhost:9850/tracking${req.url}`,
            data: req.body,
            headers: req.headers,
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        console.error(`Error`);
        res.status(error.response ? error.response.status : 500).send('Error');
    }
});

app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});
