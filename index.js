const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./src/routes/userRoutes');
const postRoutes = require('./src/routes/postRoutes');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/users', userRoutes);
app.use('/posts', postRoutes);

app.get('/', (req, res) => {
   res.send('Hello World!');
});

app.listen(port, () => {
   console.log(`Example app listening on port ${port}`);
});