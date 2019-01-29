const express = require('express');
const {handler} = require('./api');

const app = express();
app.use('/api', handler);

app.listen(3000);
console.log('Running Nanobridge API Server...');
