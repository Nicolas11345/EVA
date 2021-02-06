const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const AWS = require("aws-sdk");	
const s3 = require('s3');
const NLP = require('../eva_nlp_utils');
const Knowledge = require('../models/knowledge.model');

AWS.config.loadFromPath(path.join(__dirname, '../s3-config.json'));	
let awsS3Client = new AWS.S3({apiVersion: '2006-03-01'});	
let options = {	
    s3Client: awsS3Client,	
};	
let s3Client = s3.createClient(options);

router.route('/favicon.ico').get((req, res) => { 
    res.status(204).end();
});

router.route('/').get((req, res) => {
    Knowledge.find()
        .then(kb => res.json(kb))
        .catch(err => res.status(500).json('Error: ' + err));
});

router.route('/').post((req, res) => {
    const name = req.body.name;
    const type = req.body.type;
    const answer = req.body.answer;
    const trainingQuestions = req.body.trainingQuestions;

    const newKnowledge = new Knowledge({
        name,
        type,
        answer,
        trainingQuestions,
    });

    newKnowledge.save() 
        .then((knowledge) => {
            if (req.body.type === 'File') {
                let dir = path.join(__dirname, '../../storage', '/kb/', knowledge._id.toString());

                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir);
                } 

                let fileObject = req.files.file;
                let fileName = req.files.file.name;

                fileObject.mv(dir + '/' + fileName, function(err) {
                    if (err) {
                        return res.status(500).send(err);
                    }

                    let params = {	
                        Bucket: 'eva-app-storage',	
                        Key: 'storage/kb/' + knowledge._id.toString() + '/' + fileName,	
                        Body: fileObject.data	
                    };	
                    
                    awsS3Client.upload(params, function(err, data) {	
                        if (err) {	
                            console.log(err);	
                        } else {	
                            console.log(`File uploaded successfully. ${data.Location}`);
                        }	
                    });
                })
            }

            NLP.trainModel()
                .then(() => res.json('Knowledge created!'));
        })
        .catch(err => res.status(500).json('Error: ' + err));
});

router.route('/predict').post((req, res) => {
    NLP.predictModel(req.body.request)
        .then((knowledge) => res.json(knowledge));
});

router.route('/import').post((req, res) => {
    let fileObject = req.files.file;
    NLP.importExcel(fileObject)
        .then(() => res.json('Excel imported!'));
});

router.route('/:id').get((req, res) => {
    Knowledge.findById(req.params.id)
        .then(knowledge => res.json(knowledge))
        .catch(err => res.status(500).json('Error: ' + err));
});

router.route('/:id').post((req, res) => {
    Knowledge.findById(req.params.id)
        .then(knowledge => {
            knowledge.name = req.body.name;
            knowledge.answer = req.body.answer;
            knowledge.trainingQuestions = req.body.trainingQuestions;
  
            knowledge.save()
                .then((knowledge) => {
                    NLP.trainModel()
                        .then(() => res.json('Knowledge updated!'));
                })
                .catch(err => res.status(500).json('Error: ' + err));
        })
        .catch(err => res.status(500).json('Error: ' + err));
});
  
router.route('/:id').delete((req, res) => {
    try {
        let dir = path.join(__dirname, '../../storage', '/kb/', req.params.id);

        if (fs.existsSync(dir)) {
            let files = fs.readdirSync(dir);
                
            for (const file of files) {
                fs.unlinkSync(path.join(dir, file));
            }

            fs.rmdirSync(dir);

            let s3Params = {	
                Bucket: 'eva-app-storage',	
                Prefix: 'storage/kb/' + req.params.id + '/',	
            };	
                
            let s3Deleter = s3Client.deleteDir(s3Params);	
                
            s3Deleter.on('error', function(err) {	
                console.error('S3 Unable to sync:', err.stack);	
            });
        }

        Knowledge.findByIdAndDelete(req.params.id)
            .then(() => {
                NLP.trainModel()
                    .then(() => res.json('Knowledge deleted.'));
            })
            .catch(err => res.status(500).json('Error: ' + err));

    } catch(err) {
        res.status(500).json('Error: ' + err);
    }      
});

router.route('/file/:id').post((req, res) => {
    try {
        let dir = path.join(__dirname, '../../storage', '/kb/', req.params.id);

        if (!fs.existsSync(dir)) {
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
            });

            let s3Params = {	
                Bucket: 'eva-app-storage',	
                Prefix: 'storage/kb/' + req.params.id + '/',	
            };	
                
            let s3Deleter = s3Client.deleteDir(s3Params);	
            s3Deleter.on('error', function(err) {	
                console.error('S3 Unable to sync:', err.stack);	
            });
        }

        let fileObject = req.files.file;
        let fileName = req.files.file.name

        fileObject.mv(dir + '/' + fileName, function(err) {
            if (err) {
                return res.status(500).send(err);
            }

            let params = {	
                Bucket: 'eva-app-storage',	
                Key: 'storage/kb/' + req.params.id + '/' + fileName,	
                Body: fileObject.data	
            };	

            awsS3Client.upload(params, function(err, data) {	
                if (err) {	
                    console.log(err);	
                } else {                
                    console.log(`File uploaded successfully. ${data.Location}`);
                }
            });

            res.json('File updated!');
        })
    } catch(err) {
        res.status(500).json('Error: ' + err);
    }    
});

module.exports = router;