/* This is the server-side code of the EVA app
 Author : Nicolas Rioux
*/

// We call the necessary modules to be able to execute the rest of the code
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const AWS = require("aws-sdk");	
const s3 = require('s3');
const User = require('./models/user.model');
const Knowledge = require('./models/knowledge.model');

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(fileUpload());

const uri = "mongodb+srv://Nicolas11345:bob123@cluster0.dz35m.mongodb.net/eva-db?retryWrites=true&w=majority";
mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true }
);
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
})

app.use(session({
            secret: '3b1af4b0-12ef-4c5a-b09d-a4322259a64f', 
            resave: true,
            saveUninitialized: false,
            store: new MongoStore({ 
                mongooseConnection: mongoose.connection 
            }),
            cookie : {
                sameSite: 'strict',
            }
        }));

AWS.config.loadFromPath(path.join(__dirname, 's3-config.json'));
let awsS3Client = new AWS.S3({apiVersion: '2006-03-01'});	
let options = {	
    s3Client: awsS3Client,	
};	
let s3Client = s3.createClient(options);

let params = {	
    localDir: path.join(__dirname, '../storage'),	
    s3Params: {	
        Bucket: 'eva-app-storage',	
        Prefix: 'storage/',	
    },	
};	
let s3Downloader = s3Client.downloadDir(params);

s3Downloader.on('error', function(err) {	
    console.error('S3 unable to sync:', err.stack);	
});	
s3Downloader.on('end', function() {	
    console.log('S3 done downloading');	
});	

params = {	
    localDir: __dirname,	
    s3Params: {	
        Bucket: 'eva-app-storage',	
        Prefix: 'nlp/',	
    },	
};	
let nlpDownloader = s3Client.downloadDir(params);

nlpDownloader.on('error', function(err) {	
    console.error('S3-NLP unable to sync:', err.stack);	
});	
nlpDownloader.on('end', function() {	
    console.log('S3-NLP done downloading');	
});	



const usersRouter = require('./routes/users');
const ticketsRouter = require('./routes/tickets');
const kbRouter = require('./routes/kb');

app.use(function(req, res, next){
    if (req.headers.authorization) {
        next();
    } else {
        if (req.path.includes('storage')) {
            next();
        }
        else if (req.path.includes('users') || req.path.includes('tickets') || req.path.includes('kb') || req.path.includes('profile')) {
            res.redirect('/');
        } else {
            next();
        }
    }
});

app.use('/users', usersRouter);
app.use('/tickets', ticketsRouter);
app.use('/kb', kbRouter);

app.post('/login', function(req, res) {
    User.findOne({ email: req.body.email }).select("+passwordHash").select("+salt")
        .then((user) => {
            if (!user) { 
                res.json('Invalid email'); 
            } else {
                let hash = crypto.createHmac('sha512', user.salt);
                hash.update(req.body.password);
                let value = hash.digest('hex');

                if (value !== user.passwordHash) {
                    res.json('Invalid password');
                } else {
                    req.session.user_id = user._id;
                    res.json('Login successful');
                }
            }   
        })
        .catch(err => res.status(500).json('Error: ' + err));
});

app.get('/login', function(req, res) {
    res.sendFile(path.join(__dirname, '../src', 'login.html'));
});

app.get('/logout', function(req, res){
    req.session.destroy();
    res.redirect('/login');
});

app.get('/demo', function(req,res) {
    User.findOne({ email: "demouser@gmail.com" })
        .then((user) => {
            if (!user) { 
                res.json('Invalid email'); 
            } else {
                req.session.user_id = user._id;
                res.json('Login successful');
            }   
        })
        .catch(err => res.status(500).json('Error: ' + err));
});

app.get('/', function(req, res) {
    if (req.session.user_id) {
        res.sendFile(path.join(__dirname, '../src', 'app.html'));
    } else {
        res.redirect('/login');
    }
});

// We create a local server that listens to port 8080
let portno = process.env.PORT || 8080;

// We have the express static module (http://expressjs.com/en/starter/static-files.html) do all
// the work for us.
app.use('/build',express.static(path.join(__dirname, '../build')));
app.use('/storage',express.static(path.join(__dirname, '../storage')));
app.use(express.static(path.join(__dirname, '../src')));

// We add a middleware function to handle a 404 response

app.use(function(req, res, next){
    res.status(404).sendFile(path.join(__dirname, '../src', '404.html'));
});

let server = app.listen(portno, function () {
    let port = server.address().port;
    console.log('Listening at http://localhost:8080');
});