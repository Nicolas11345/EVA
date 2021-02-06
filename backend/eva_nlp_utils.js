const fs = require('fs');
const path = require('path');
const spawn = require('child_process').spawn;
const natural = require('natural');
const excelToJson = require('convert-excel-to-json');
const AWS = require("aws-sdk");	
const Knowledge = require('./models/knowledge.model');

AWS.config.loadFromPath(path.join(__dirname, 's3-config.json'));	
let awsS3Client = new AWS.S3({apiVersion: '2006-03-01'});	

natural.PorterStemmer.attach();

async function trainModel(){
    try {
        if (fs.existsSync(path.join(__dirname,'eva_nlp_training.json'))) {
            fs.unlinkSync(path.join(__dirname,'eva_nlp_training.json'));
        }
    } catch(err) {
        console.log(err)
    }

    let data = "";

    Knowledge.find()
        .cursor()
        .eachAsync(async function (knowledge) {
            for (let question of knowledge.trainingQuestions) {
                question = (question.tokenizeAndStem()).join(' ');
                let line = {'name' : knowledge.name, 'question': question};
                data += JSON.stringify(line)+'\n'
            }
        })
        .then(() => {
            fs.appendFileSync(path.join(__dirname,'eva_nlp_training.json'), data);
            
            const pythonProcess = spawn('python',[path.join(__dirname,'eva_nlp_model.py'),'1']);

            pythonProcess.stderr.on('data', (err) => {
                console.log("Something's wrong!")
                console.log(err.toString());
            });

            pythonProcess.on('close', () => {
                fs.readFile(path.join(__dirname,'eva_nlp_training.json'), (err, data) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    
                    let params = {
                        Bucket: 'eva-app-storage',
                        Key: 'nlp/eva_nlp_training.json', 
                        Body: data
                    };
                
                    awsS3Client.upload(params, function(err, data) {
                        if (err) {	
                            console.log(err);	
                        } else {                
                            console.log(`File uploaded successfully. ${data.Location}`);
                        }
                    });
                })

                fs.readFile(path.join(__dirname,'eva-nlp-model.pt'), (err, data) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    
                    let params = {
                        Bucket: 'eva-app-storage',
                        Key: 'nlp/eva-nlp-model.pt', 
                        Body: data
                    };
                
                    awsS3Client.upload(params, function(err, data) {
                        if (err) {	
                            console.log(err);	
                        } else {                
                            console.log(`File uploaded successfully. ${data.Location}`);
                        }
                    });
                })
            });
        })
        .catch(err => console.log(err));
}

let predictModel = function(question) {
    return new Promise(function(resolve, reject) {
        question = (question.tokenizeAndStem()).join(' ');

        const pythonProcess = spawn('python',[path.join(__dirname,'eva_nlp_model.py'),'2',question]);

        pythonProcess.stdout.on('data', (data) => {
            if (data.toString().trim() == "-1") {
                resolve(-1);
            } else {
                Knowledge.findOne({ name: data.toString().trim(), })
                    .then((knowledge) => {
                        resolve(knowledge);
                    })
                    .catch(err => console.log(err));
            }
        });

        pythonProcess.stderr.on('data', (err) => {
            console.log("Something's wrong!")
            console.log(err.toString());
            reject(err.toString());
        });
    }); 
}

async function importExcel(file){
    file.mv(__dirname + '/' + file.name, async function(err) {
        if (err) {
            console.log(err);
        } else {
            let excel = excelToJson({
                sourceFile: file.name
            });
            
            excel = excel.Sheet1;

            let names = [];
            let knowledgeList = [];
            
            for (let row of excel) {
                let name = row.A;
                let type = 'Text';
                let answer = row.B;
                let trainingQuestions = [];
        
                for (let [key, value] of Object.entries(row)) {
                    if (key !== 'A' && key !== 'B') {
                        trainingQuestions.push(value);
                    }
                }

                let knowledge = {
                    name : name,
                    type : type,
                    answer : answer,
                    trainingQuestions : trainingQuestions
                }

                names.push(name);
                knowledgeList.push(knowledge);
            }

            Knowledge.find({ name: { $in: names }, })
                .cursor()
                .eachAsync(async function (knowledge) {
                    let newKnowledge = knowledgeList.find((knowledgeItem) => knowledgeItem.name === knowledge.name);
                    let newTrainingQuestions = knowledge.trainingQuestions.concat(newKnowledge.trainingQuestions);
                    knowledge.trainingQuestions = newTrainingQuestions;

                    let newKnowledgeIndex = knowledgeList.findIndex((knowledgeItem) => knowledgeItem.name === knowledge.name);
                    knowledgeList.splice(newKnowledgeIndex, 1);

                    await knowledge.save();
                })
                .then(() => {
                    Knowledge.insertMany(knowledgeList)
                        .then(() => {
                            trainModel()
                                .then(() => {
                                    try {
                                        fs.unlinkSync(__dirname + '/' + file.name);
                                    } catch(err) {
                                        console.log(err);
                                    }
                                });
                        })
                        .catch(err => console.log(err)); 
                })
                .catch(err => console.log(err));    
        }
    });

}

exports.trainModel = trainModel
exports.predictModel = predictModel
exports.importExcel = importExcel