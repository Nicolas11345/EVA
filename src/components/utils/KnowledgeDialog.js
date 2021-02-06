import React from 'react';
import Axios from 'axios';
import { isEmpty } from '../../utils'

import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import DeleteIcon from '@material-ui/icons/Delete';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

const axios = Axios.create({
    headers: {
        'Authorization':'App'
    }
});

export class KnowledgeDialog extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            knowledge : {},
            answerFile : {},
            isFileChanged : false,
        }
    }

    componentDidUpdate(prevProps){   
        if (this.props.knowledge != prevProps.knowledge) {
            let knowledge = Object.assign({}, this.props.knowledge);
                    
            this.setState({
                knowledge : knowledge,
            });
        }
    }

    changeName(event){
        let knowledge = this.state.knowledge;
        knowledge.name = event.target.value;

        this.setState({
            knowledge : knowledge
        })
    }

    changeAnswer(event){
        let knowledge = this.state.knowledge;
        knowledge.answer = event.target.value;

        this.setState({
            knowledge : knowledge
        })
    }

    addQuestion(){
        let newQuestion = $("#knowledge-training-question-input").val();

        if (isEmpty(newQuestion)) {
            alert("Please write a question");
            return;
        }

        $("#knowledge-training-question-input").val('');

        let knowledge = this.state.knowledge;
        knowledge.trainingQuestions.push(newQuestion);

        this.setState({
            knowledge : knowledge
        })
    }

    deleteQuestion(questionIndex){
        let knowledge = this.state.knowledge;
        knowledge.trainingQuestions.splice(questionIndex, 1);

        this.setState({
            knowledge : knowledge
        })
    }

    handleFile(){
        let file = $("#answer-file-input").prop('files')[0];

        if (!file){
            return;
        } else if (file.size > 1000000){
            alert("The file size is too big. Please select a file with size under 100 MB.");
            return;
        }

        let knowledge = this.state.knowledge;
        knowledge.answer = file.name;

        this.setState({
            answerFile : file,
            knowledge : knowledge,
            isFileChanged : true
        })
    }

    uploadFile(){
        let knowledge = this.state.knowledge;
        let formData = new FormData();
        formData.append('file', this.state.answerFile);

        axios.post('/kb/file/' + knowledge._id, formData)
            .catch(err => {
                console.log("Something went wrong!", err);
            })
    }


    editKnowledge(){
        if (isEmpty(this.state.knowledge.name) || isEmpty(this.state.knowledge.answer) || isEmpty(this.state.knowledge.trainingQuestions)) {
                alert("Please fill in all the fields");
                return;
        }

        if (this.state.isFileChanged) {
            this.uploadFile();
        }

        this.props.onAction(this.state.knowledge);
        this.props.onClose();
    }

    render(){
        let answer;
        if (this.state.knowledge.type === "Text") {
            answer = <Grid item xs={12}>
                        <TextField margin="dense" id="knowledge-answer-input" label="Answer" autoComplete={"off"}
                            defaultValue={this.state.knowledge.answer}
                            onChange={(event) => this.changeAnswer(event)} fullWidth />
                    </Grid>
       
        } else {
            answer = <Grid item xs={12}>
                        <div style={{ marginTop: "0.5rem", marginBottom: "1rem", }}>Answer file : {this.state.knowledge.answer}</div>
                        <div>
                            <input type="file" id="answer-file-input" className="upload" onChange = {() => this.handleFile()}></input>
                            <label htmlFor="answer-file-input">
                                <Button variant="contained" color="primary" className="primary-background-color" component="span">
                                    Upload New File
                                </Button>
                            </label>
                        </div>
                    </Grid>
        }

        let trainingQuestions = this.state.knowledge.trainingQuestions || [];
        trainingQuestions = trainingQuestions.map((question) => {
            return(
                <ListItem key={trainingQuestions.indexOf(question).toString()}>
                    <ListItemText primary={question}/>
                    <ListItemSecondaryAction>
                        <Tooltip title="Delete">
                            <IconButton edge="end" onClick={() => this.deleteQuestion(this.state.knowledge.trainingQuestions.indexOf(question))}>
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                    </ListItemSecondaryAction>
                </ListItem>
            )
        })

        return(
            <Dialog open={this.props.open} onClose={() => this.props.onClose()}>
                <DialogTitle>Edit Knowledge</DialogTitle>
                        
                <DialogContent>
                    <Grid container spacing={1}>
                        <Grid item xs={12}>
                            <TextField margin="dense" id="knowledge-name-input" label="Name" autoComplete={"off"} 
                                defaultValue={this.state.knowledge.name} 
                                onChange={(event) => this.changeName(event)} fullWidth />
                        </Grid>

                        {answer}

                        <Grid item xs={12}>
                            <List>
                                <ListItem>
                                    <TextField margin="dense" id="knowledge-training-question-input" label="Add Training Question" autoComplete={"off"} fullWidth />
                                    <ListItemSecondaryAction>
                                        <Tooltip title="Add">
                                            <IconButton onClick={() => this.addQuestion()}>
                                                <AddCircleIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </ListItemSecondaryAction>
                                </ListItem>
                                
                                {trainingQuestions}
                            </List>
                        </Grid>
                    </Grid>
                </DialogContent>
                    
                <DialogActions>
                    <Button onClick={() => this.props.onClose()} className="primary-color">
                        Cancel
                    </Button>
                    <Button onClick={() => this.editKnowledge()} className="primary-color">
                        Edit
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

export default KnowledgeDialog;