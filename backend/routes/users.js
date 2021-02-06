const router = require('express').Router();
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const jimp = require('jimp');
const AWS = require("aws-sdk");	
const s3 = require('s3');
const User = require('../models/user.model');
const Ticket = require('../models/ticket.model');

AWS.config.loadFromPath(path.join(__dirname, '../s3-config.json'));	
let awsS3Client = new AWS.S3({apiVersion: '2006-03-01'});	
let options = {	
    s3Client: awsS3Client,	
};	
let s3Client = s3.createClient(options);

function genRandomString(length) {
    return crypto.randomBytes(Math.ceil(length/2))
            .toString('hex')
            .slice(0,length);
};

function sha512(password, salt) {
    let hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    let value = hash.digest('hex');
    return {
        salt: salt,
        passwordHash: value
    };
};

function saltHashPassword(userpassword) {
    let salt = genRandomString(16); 
    let passwordData = sha512(userpassword, salt);
    return passwordData;
}


router.route('/favicon.ico').get((req, res) => { 
    res.status(204).end();
});

router.route('/').get((req, res) => {
    User.find()
        .then(users => res.json(users))
        .catch(err => res.status(500).json('Error: ' + err));
});

router.route('/').post((req, res) => {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const fullName = req.body.fullName;
    const email = req.body.email;
    const role = req.body.role;
    const avatar = req.body.avatar;
    const notifications = req.body.notifications;

    let password = req.body.password;
    let passwordData = saltHashPassword(password);
    const passwordHash = passwordData.passwordHash;
    const salt = passwordData.salt;

    User.find()
        .cursor()
        .eachAsync(async function (user) {
            let notification = {
                section : 'Users',
                message : 'A new user has been added to the app : ' + req.body.fullName,
                date : new Date(),
            }
            user.notifications.push(notification);
            await user.save();
        })

    const newUser = new User({
        firstName,
        lastName,
        fullName,
        email,
        passwordHash,
        salt,
        role,
        avatar,
        notifications,
    });

    newUser.save()
        .then(() => res.json('User added!'))
        .catch(err => res.status(500).json('Error: ' + err));
});

router.route('/session').get((req, res) => {
    User.findById(req.session.user_id)
        .then(user => res.json(user))
        .catch(err => res.status(500).json('Error: ' + err));
});

router.route('/:id').get((req, res) => {
    User.findById(req.params.id)
        .then(user => res.json(user))
        .catch(err => res.status(500).json('Error: ' + err));
});

router.route('/:id').post((req, res) => {
    User.findById(req.params.id)
        .then(user => {
            user.firstName = req.body.firstName;
            user.lastName = req.body.lastName;
            user.fullName = req.body.fullName;
            user.email = req.body.email;
            user.role = req.body.role;
            user.avatar = req.body.avatar;
            user.notifications = req.body.notifications;
  
            user.save()
                .then(() => res.json('User updated!'))
                .catch(err => res.status(500).json('Error: ' + err));
        })
        .catch(err => res.status(500).json('Error: ' + err));
});

  
router.route('/:id').delete((req, res) => {
    Ticket.find({ submitter: req.params.id, })
        .cursor()
        .eachAsync(async function (task) {
            try {
                Ticket.findByIdAndDelete(task._id)
                    .catch(err => res.status(500).json('Error: ' + err));
                        
            } catch(err) {
                res.status(500).json('Error: ' + err)
            }    
        })
        .then(() => {
            Ticket.find({ assignee: req.params.id, })
                .cursor()
                .eachAsync(async function (task) {
                    task.assignee = null
                    task.save()
                        .catch(err => res.status(500).json('Error: ' + err));
                })
                .then(() => {  
                    let dir = path.join(__dirname, '../../storage', '/users/', req.params.id);

                    if (fs.existsSync(dir)) {
                        let files = fs.readdirSync(dir);
                            
                        for (const file of files) {
                            fs.unlinkSync(path.join(dir, file));
                        }

                        fs.rmdirSync(dir);

                        let s3Params = {	
                            Bucket: 'eva-app-storage',	
                            Prefix: 'storage/users/' + req.params.id + '/',	
                        };	
                            
                        let s3Deleter = s3Client.deleteDir(s3Params);	
                            
                        s3Deleter.on('error', function(err) {	
                            console.error('S3 Unable to sync:', err.stack);	
                        });
                    }

                    User.findByIdAndDelete(req.params.id)
                        .then(() => res.json('User deleted.'))
                        .catch(err => res.status(500).json('Error: ' + err));   
                })
                .catch(err => res.status(500).json('Error: ' + err));
        })
        .catch(err => res.status(500).json('Error: ' + err));
});


router.route('/avatar/:id').post((req, res) => {
    try {
        let dir = path.join(__dirname, '../../storage', '/users/', req.params.id);

        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        } else {
            fs.readdir(dir, (err, files) => {
                if (err) {
                    return res.status(500).send(err);
                }
                
                for (const file of files) {
                    fs.unlink(path.join(dir, file), err => {
                        if (err) return res.status(500).send(err);
                    });
                }

                let s3Params = {	
                    Bucket: 'eva-app-storage',	
                    Prefix: 'storage/users/' + req.params.id + '/',	
                };	
                	
                let s3Deleter = s3Client.deleteDir(s3Params);	
                s3Deleter.on('error', function(err) {	
                    console.error('S3 Unable to sync:', err.stack);	
                });
            });
        }

        let fileObject = req.files.file;
        let fileName = req.files.file.name

        fileObject.mv(dir + '/' + fileName, function(err) {
            if (err) {
                return res.status(500).send(err);
            } else {
                jimp.read(dir + '/' + fileName)
                .then(image => {
                    image.resize(320, jimp.AUTO).quality(35).write(dir + '/' + fileName);

                    let params = {	
                        Bucket: 'eva-app-storage',	
                        Key: 'storage/users/' + req.params.id + '/' + fileName,	
                        Body: fileObject.data	
                    };	

                    awsS3Client.upload(params, function(err, data) {	
                        if (err) {	
                            console.log(err);	
                        } else {
                            console.log(`File uploaded successfully. ${data.Location}`);	
                        }
                    });

                    res.json('Avatar updated!');
                })
                .catch(err => res.status(500).json('Error: ' + err));
            }
        });

    } catch(err) {
        res.status(500).json('Error: ' + err);
    }    
});

router.route('/password/:id').post((req, res) => {
    User.findById(req.params.id).select("+passwordHash").select("+salt")
        .then(user => {
            let hash = crypto.createHmac('sha512', user.salt);
            hash.update(req.body.currentPassword);
            let value = hash.digest('hex');

            if (value !== user.passwordHash) {
                res.json('Invalid password');
            } else {
                let password = req.body.newPassword;
                let passwordData = saltHashPassword(password);

                user.passwordHash = passwordData.passwordHash;
                user.salt = passwordData.salt;
    
                user.save()
                    .then(() => res.json('Password updated!'))
                    .catch(err => res.status(500).json('Error: ' + err));
                }
        })
        .catch(err => res.status(500).json('Error: ' + err));
});

module.exports = router;