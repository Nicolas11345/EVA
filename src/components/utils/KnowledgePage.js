import React from 'react';
import Axios from 'axios';
import KnowledgeDialog from './KnowledgeDialog';

import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContentText from '@material-ui/core/DialogContentText';

import {
    Link,
    withRouter
} from "react-router-dom";

const axios = Axios.create({
    headers: {
        'Authorization':'App'
    }
});

export class KnowledgePage extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            knowledge : {},
            knowledgeDialogOpen : false,
            deleteDialogOpen : false
        }
    }

    componentDidMount(){
        this.getKnowledge();
    }

    openKnowledgeDialog(){
        this.setState({
            knowledgeDialogOpen : true
        });
    }
  
    closeKnowledgeDialog(){
        this.setState({
            knowledgeDialogOpen : false
        });
    }

    openDeleteDialog(){
        this.setState({
            deleteDialogOpen : true
        });
    }

    closeDeleteDialog(){
        this.setState({
            deleteDialogOpen : false
        });
    }

    getKnowledge(){
        axios.get('/kb/' + this.props.match.params.id)
            .then(res => {
                this.props.onChange();
                this.setState({
                    knowledge : res.data,
                });
            })
            .catch(err => {
                console.log("Something went wrong!", err);
            })
    }

    editKnowledge(knowledge){
        axios.post('/kb/' + knowledge._id, knowledge)
            .then(res => {
                this.getKnowledge();
            })
            .catch(err => {
                console.log("Something went wrong!", err);
            })
    }

    deleteKnowledge(){
        let knowledge = this.state.knowledge;

        axios.delete('/kb/' + knowledge._id)
            .then(res => {
                this.closeDeleteDialog();
                window.location.reload();
            })
            .catch(err => {
                console.log("Something went wrong!", err);
            })
    }

    render(){
        let trainingQuestions = this.state.knowledge.trainingQuestions || [];
        trainingQuestions = trainingQuestions.map((question) => {
            return(
                <Grid key={trainingQuestions.indexOf(question).toString()} item xs={12} md={6}>
                    <div className="app-card-text">
                        <span>{question}</span>
                    </div>
                </Grid>
            )
        })

        return(
            <div>
                <div className="knowledge-page-title">
                    <Tooltip title="Back">
                        <IconButton component={Link} to={this.props.previousPage}>
                            <ArrowBackIcon />
                        </IconButton>
                    </Tooltip>
                    <h2>{this.state.knowledge.name}</h2>
                </div>

                <Grid container spacing={4}>
                    <Grid item xs={12}>
                        <div className="app-card">
                            <div className="app-card-title">
                                <h2>Info</h2>
                                <Tooltip title="Edit">
                                    <IconButton onClick={() => this.openKnowledgeDialog()}>
                                        <EditIcon />
                                    </IconButton>
                                </Tooltip>

                                <KnowledgeDialog open = {this.state.knowledgeDialogOpen} knowledge = {this.state.knowledge} 
                                        onAction = {(knowledge) => this.editKnowledge(knowledge)} onClose = {() => this.closeKnowledgeDialog()} />
                            </div>

                            <Grid container spacing={4}>
                                <Grid item xs={6}>
                                    <div className="app-card-text">
                                        <h3>Name</h3>
                                        <span>{this.state.knowledge.name}</span>
                                    </div>
                                </Grid>
                                <Grid item xs={6}>
                                    <div className="app-card-text">
                                        <h3>Answer Type</h3>
                                        <span>{this.state.knowledge.type}</span>
                                    </div>
                                </Grid>
                                <Grid item xs={12}>
                                    <div className="app-card-text">
                                        <h3>Answer</h3>
                                        <span>{this.state.knowledge.answer}</span>
                                    </div>
                                </Grid>
                                <Grid item xs={12}>
                                    <div className="app-card-text">
                                        <h3>Training Questions</h3>
                                        <Grid container spacing={4}>
                                            {trainingQuestions}
                                        </Grid>
                                    </div>
                                </Grid>
                            </Grid>
                        </div>
                    </Grid>

                    <Grid item xs={12}>
                        <Button variant="contained" color="secondary" onClick={() => this.openDeleteDialog()}>
                            Delete Knowledge
                        </Button>

                        <Dialog open={this.state.deleteDialogOpen} onClose = {() => this.closeDeleteDialog()}>
                            <DialogTitle>Delete Knowledge</DialogTitle>
                                
                            <DialogContent>
                                <DialogContentText>
                                    Are you sure you want to delete the knowledge?
                                </DialogContentText>
                            </DialogContent>

                            <DialogActions>
                                <Button onClick={() => this.closeDeleteDialog()} className="primary-color">
                                    No
                                </Button>
                                    
                                <Button onClick={() => this.deleteKnowledge()} className="primary-color">
                                    Yes
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </Grid>
                </Grid>
            </div>
        );
    }
}

export default withRouter(KnowledgePage);