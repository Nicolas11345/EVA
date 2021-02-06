import React from 'react';
import Axios from 'axios';
import { connect } from 'react-redux'
import { getUser } from '../store/store'
import _ from "lodash"
import KnowledgePage from './utils/KnowledgePage';
import { isEmpty } from '../utils'

import Grid from '@material-ui/core/Grid';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import IconButton from '@material-ui/core/IconButton';
import StorageIcon from '@material-ui/icons/Storage';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import DescriptionIcon from '@material-ui/icons/Description';
import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Snackbar from '@material-ui/core/Snackbar';
import CloseIcon from '@material-ui/icons/Close';

import {
    Switch,
    Route,
    withRouter
} from "react-router-dom";


const axios = Axios.create({
    headers: {
        'Authorization':'App'
    }
});

const mapStateToProps = (state) => {
    return {
        user: state.user
    };
 };
 const mapDispatchToProps = (dispatch) => {
    return {
        getUser: () => dispatch(getUser()),
    };
 };

export class SeeKB extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            page : 0,
            rowsPerPage : 5
        }
    }

    changePage(event, page){
        this.setState({
            page : page
        });
    }

    changeRowsPerPage(event){
        let rowsPerPage = event.target.value;
        this.setState({
            rowsPerPage : rowsPerPage
        });
    }

    render(){
        let kb = this.props.kb || [];
        let url = this.props.url
        let count = kb.length;
        let page = this.state.page;
        let rowsPerPage = this.state.rowsPerPage;

        kb = kb.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((knowledge) => {
            return(
                <TableRow key={knowledge._id} onClick={() => this.props.history.push(`${url}/${knowledge._id}`)} hover={true} className="app-table-row">
                    <TableCell style={{ width: "25%", }}>{knowledge.name}</TableCell>
                    <TableCell tyle={{ width: "75%", }}>{knowledge.answer}</TableCell>
                </TableRow>
            )
        });

        return(
            <TableContainer>
                <Table className="app-table">
                    <TableHead>
                        <TableRow>
                            <TableCell style={{ width: "25%", }}>Name</TableCell>
                            <TableCell tyle={{ width: "75%", }}>Answer</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {kb}
                    </TableBody>

                    <TableFooter>
                        <TableRow>
                            <TablePagination rowsPerPageOptions={[5, 10, 25]} count={count}
                                rowsPerPage={rowsPerPage} page={page}
                                onChangePage={(event, page) => this.changePage(event, page)} 
                                onChangeRowsPerPage={(event) => this.changeRowsPerPage(event)} />
                        </TableRow>
                    </TableFooter>
                </Table>
            </TableContainer>
        );
    }
}

export class NewKnowledge extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            answerType : "Text",
            answerFile : {},
            answerFileName : "No file",
            snackBarOpen : false
        }
    }

    changeAnswerType(event){
        this.setState({
            answerType : event.target.value
        })
    }
  
    closeSnackBar(event, reason){
        if (reason === 'clickaway') {
            return;
        }

        this.setState({
            snackBarOpen : false
        })
    }

    handleFile(){
        let file = $("#answer-file-input").prop('files')[0];

        if (!file){
            alert("Please select a file");
            return;
        } else if (file.size > 1000000){
            alert("The file size is too big. Please select a file with size under 100 MB.");
            return;
        }

        this.setState({
            answerFile : file,
            answerFileName : file.name
        })
    }

    send(){
        let name = $("#knowledge-name-input").val();
        let trainingQuestion = $("#knowledge-training-question-input").val();

        if (isEmpty(name) || isEmpty(trainingQuestion)) {
            alert("Please fill in all fields");
            return;
        }

        let trainingQuestions = [];
        trainingQuestions.push(trainingQuestion);

        let type = this.state.answerType;

        let formData = new FormData();
        formData.append('name', name);
        formData.append('trainingQuestions', trainingQuestions);
        formData.append('type', type);

        if (type === "Text"){
            let answer = $("#knowledge-answer-input").val();

            if (isEmpty(answer)) {
                alert("Please fill in all fields");
                return;
            }

            formData.append('answer', answer);
        } else {
            if (this.state.answerFileName === "No file"){
                alert("Please select a file");
                return;
            }

            formData.append('answer', this.state.answerFileName);
            formData.append('file', this.state.answerFile);
        }

        axios.post('/kb', formData)
            .then(res => {
                this.props.onChange();
                this.setState({
                    snackBarOpen : true
                }) 
            })
            .catch(err => {
                console.log("Something went wrong!", err);
            })
    }

    render(){
        let answerContent;
        let answerType = this.state.answerType;

        if (answerType === "Text") {
            answerContent = <TextField id="knowledge-answer-input" label="Answer" variant="outlined" autoComplete={"off"} fullWidth={true} />
        } else {
            answerContent = <div>
                                <input type="file" id="answer-file-input" className="upload" onChange = {() => this.handleFile()}></input>
                                <label htmlFor="answer-file-input">
                                    <Button variant="contained" color="primary" className="primary-background-color" component="span">
                                        Choose file
                                    </Button>
                                </label>
                                <span style={{ paddingLeft: "0.5rem", }}>{this.state.answerFileName} selected</span>
                            </div>  
        }

        return(
            <div className="app-card">
                <div className="app-card-title">
                    <h2>New Knowledge</h2>
                </div>

                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <TextField id="knowledge-name-input" label="Name" variant="outlined" autoComplete={"off"} fullWidth={true} />  
                    </Grid>
                    <Grid item xs={12}>
                        <TextField id="knowledge-training-question-input" label="Training Question" variant="outlined" autoComplete={"off"} fullWidth={true} />  
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl variant="outlined" fullWidth={true}>
                            <InputLabel id="answer-type-label">Answer Type</InputLabel>
                            <Select labelId="answer-type-label" id="answer-type-input" value={this.state.answerType} label="Answer Type"
                            onChange = {(event) => this.changeAnswerType(event)}>
                                <MenuItem value={"Text"}>Text</MenuItem>
                                <MenuItem value={"File"}>File</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        {answerContent} 
                    </Grid>
                    <Grid item xs={12}>
                        <Button onClick={() => this.send()} variant="contained" color="primary" className="primary-background-color">
                            Send to EVA
                        </Button>  
                    </Grid>
                </Grid>

                <Snackbar
                    anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                    }}
                    open={this.state.snackBarOpen}
                    autoHideDuration={3000}
                    onClose={(event, reason) => this.closeSnackBar(event, reason)}
                    message="New Knowledge sent to EVA"
                    action={
                    <React.Fragment>
                        <IconButton size="small" aria-label="close" color="inherit" onClick={(event, reason) => this.closeSnackBar(event, reason)}>
                        <CloseIcon fontSize="small" />
                        </IconButton>
                    </React.Fragment>
                    }
                />  
            </div>
        );
    }
}

export class ImportExcel extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            excelFile : {},
            excelFileName : "No file",
            snackBarOpen : false
        }
    }

    closeSnackBar(event, reason){
        if (reason === 'clickaway') {
            return;
        }

        this.setState({
            snackBarOpen : false
        })
    }

    handleFile(){
        let file = $("#excel-file-input").prop('files')[0];
  
        if (!file){
            alert("Please select a file");
            return;
        }
  
        this.setState({
            excelFile : file,
            excelFileName : file.name
        })
    }

    import(){
        if (this.state.excelFileName === "No file"){
            alert("Please select a file");
            return;
        }

        let formData = new FormData();
        formData.append('file', this.state.excelFile);

        axios.post('/kb/import', formData)
            .then(res => {
                this.props.onChange();
                this.setState({
                    snackBarOpen : true
                }) 
            })
            .catch(err => {
                console.log("Something went wrong!", err);
            })
    }

    render(){
        return(
            <div className="app-card">
                <div className="app-card-title">
                    <h2>Import Excel</h2>
                </div>

                <Grid container spacing={4}>
                    <Grid item xs={12}>
                        <div>
                            <input type="file" id="excel-file-input" className="upload" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
                                onChange = {() => this.handleFile()}></input>
                            <label htmlFor="excel-file-input">
                                <Button variant="contained" color="primary" className="primary-background-color" component="span">
                                    Choose file
                                </Button>
                            </label>
                            <span style={{ paddingLeft: "0.5rem", }}>{this.state.excelFileName} selected</span>
                        </div>   
                    </Grid>
                    <Grid item xs={12}>
                        <p>Make sure the excel file follows the structure : Each row is a unique knowledge where : </p> 
                        <ul>
                            <li style={{ marginBottom: "0.25rem", }}>First column : Name of the knowledge</li>
                            <li style={{ marginBottom: "0.25rem", }}>Second column : Answer of the knolwedge</li>
                            <li style={{ marginBottom: "0.25rem", }}>Third column and beyond : All the training questions of the knowledge, 
                                one question per column</li>
                        </ul>
                        <p>The image below is an example of what is expected</p>
                        <img src="../images/import_excel_example.png" alt="image_example"></img>
                    </Grid>
                    <Grid item xs={12}>
                        <Button onClick={() => this.import()} variant="contained" color="primary" className="primary-background-color">
                            Import Excel
                        </Button>  
                    </Grid>
                </Grid>

                <Snackbar
                    anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                    }}
                    open={this.state.snackBarOpen}
                    autoHideDuration={3000}
                    onClose={(event, reason) => this.closeSnackBar(event, reason)}
                    message="Excel Imported"
                    action={
                    <React.Fragment>
                        <IconButton size="small" aria-label="close" color="inherit" onClick={(event, reason) => this.closeSnackBar(event, reason)}>
                        <CloseIcon fontSize="small" />
                        </IconButton>
                    </React.Fragment>
                    }
                />  
            </div>
        );
    }
}

export class KB extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            kb : [],
            page : 0,
        }
    }

    componentDidMount(){
        this.getKB();
    }

    getKB(){
        axios.get('/kb')
            .then(res => {
                if (res.data.length > 0) {
                    this.setState({
                        kb : res.data
                    });
                }
            })
            .catch(err => {
                console.log("Something went wrong!", err);
            })
    }

    setPage(page){
        this.setState({
          page : page
        });
     }

    render(){
        let { path, url } = this.props.match;
        let page = this.state.page;
        let KBContent

        if (page === 0) {
            KBContent = <SeeKB url = {url} history = {this.props.history} kb = {this.state.kb} onChange = {() => this.getKB()} />;
          } else if (page === 1) {
            KBContent = <NewKnowledge onChange = {() => this.getKB()} />;
          } else if (page === 2) {
            KBContent = <ImportExcel onChange = {() => this.getKB()} />;
          }

        return(
            <Switch>
                <Route path={`${path}/:id`}>
                    <KnowledgePage previousPage = {url} onChange = {() => this.getKB()} />
                </Route>

                <Route exact path={path}>
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={3}>
                            <div className="app-card-profile-menu">
                                <List>
                                    <ListItem button selected={page === 0} onClick={() => this.setPage(0)} >
                                        <ListItemAvatar>
                                            <Avatar className="primary-background-color">
                                                <StorageIcon />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText primary="See KB" />
                                    </ListItem>
                                    <ListItem button selected={page === 1} onClick={() => this.setPage(1)}>
                                        <ListItemAvatar>
                                            <Avatar className="primary-background-color">
                                                <AddCircleIcon />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText primary="New Knowledge" />
                                    </ListItem>
                                    <ListItem button selected={page === 2} onClick={() => this.setPage(2)}>
                                        <ListItemAvatar>
                                            <Avatar className="primary-background-color">
                                                <DescriptionIcon />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText primary="Import Excel" />
                                    </ListItem>
                                </List>
                            </div>
                        </Grid>

                        <Grid item xs={12} md={9}>
                            {KBContent}
                        </Grid> 
                    </Grid>
                </Route>
            </Switch>  
        );
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(KB));