const dotenv = require('dotenv').config();
const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('Server funcionando!');
});

app.listen(process.env.PORT, () => console.log('Servidor funcionando en el puerto ', process.env.PORT));