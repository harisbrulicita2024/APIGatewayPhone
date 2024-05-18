const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const app = express();
const PORT = process.env.PORT || 3000;

const GRPC_SERVICE_HOST = process.env.GRPC_SERVICE_HOST || 'microservice2';
const GRPC_SERVICE_PORT = process.env.GRPC_SERVICE_PORT || 8095;
const JOB_SERVICE_HOST = process.env.JOB_SERVICE_HOST || 'microservice1';
const JOB_SERVICE_PORT = process.env.JOB_SERVICE_PORT || 9000;
const TRACKING_SERVICE_HOST = process.env.TRACKING_SERVICE_HOST || 'microservice3';
const TRACKING_SERVICE_PORT = process.env.TRACKING_SERVICE_PORT || 9850;

app.use(express.json());
app.use(bodyParser.json());

const PROTO_PATH = __dirname + '/user.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});
const userProto = grpc.loadPackageDefinition(packageDefinition).harisbrulicita2024;
const client = new userProto.UserService(`${GRPC_SERVICE_HOST}:${GRPC_SERVICE_PORT}`, grpc.credentials.createInsecure());

app.use('/api/jobs', async (req, res) => {
    try {
        const response = await axios({
            method: req.method,
            url: `http://${JOB_SERVICE_HOST}:${JOB_SERVICE_PORT}/api/jobs${req.url}`,
            data: req.body,
            headers: req.headers,
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(error.response ? error.response.status : 500).send('Proxy error');
    }
});

app.post('/api/users', (req, res) => {
    const callOptions = { deadline: new Date(Date.now() + 5000) };
    client.createUser(req.body, callOptions, (error, response) => {
        if (error) {
            console.error('Error:', error.message);
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
            console.error('Error:', error.message);
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
            url: `http://${TRACKING_SERVICE_HOST}:${TRACKING_SERVICE_PORT}/tracking${req.url}`,
            data: req.body,
            headers: req.headers,
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(error.response ? error.response.status : 500).send('Proxy error');
    }
});

app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});
