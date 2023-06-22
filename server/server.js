import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import router from './router/route.js';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';

const app = express();

/** middlewares */
app.use(express.json());
app.use(cors());
app.use(morgan('tiny'));
app.disable('x-powered-by'); // less hackers know about our stack
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = 8080;

mongoose.connect('mongodb+srv://Tripsy-Ravi:Ravi%401234.@auth.8dyviis.mongodb.net/', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
});

/** HTTP GET Request */
app.get('/', (req, res) => {
    res.status(201).json("Home GET Request");
});

app.use('/api', router);


app.listen(port, () => {
            
    console.log(`Server connected to http://localhost:${port}`);
})

