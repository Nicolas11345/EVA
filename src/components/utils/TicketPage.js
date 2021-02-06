import React from 'react';
import Axios from 'axios';
import { connect } from 'react-redux'
import { getUser } from '../../store/store'
import _ from "lodash"
import TicketDialog from './TicketDialog';
import MessageBar from './MessageBar';
import { isEmpty, formatDate } from '../../utils'

import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Avatar from '@material-ui/core/Avatar';
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

 export class TicketPage extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            ticket : {},
            newMessage : false,
            ticketDialogOpen : false,
            deleteDialogOpen : false
        }
    }

    componentDidMount(){
        this.getTicket();
    }

    componentDidUpdate(){
        $("#chat-box").animate({ scrollTop: $('#chat-box').prop("scrollHeight")}, 50);

        if (this.state.newMessage) {
            let ticket = this.state.ticket
            let assignee = ticket.assignee || {};
            ticket.assignee = assignee._id || null;
            this.editTicket(ticket);
        }
    }

    openTicketDialog(){
        this.setState({
            ticketDialogOpen : true
        });
    }
  
    closeTicketDialog(){
        this.setState({
            ticketDialogOpen : false
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

    sendMessage(message){
        let ticket = this.state.ticket;
        ticket.chat.push({
            author : this.props.user,
            message : message,
            date : new Date()
        });
        this.setState({
            ticket : ticket,
            newMessage : true
        })
    }

    getTicket(){
        axios.get('/tickets/' + this.props.match.params.id)
            .then(res => {
                this.props.onChange();
                this.setState({
                    ticket : res.data,
                    newMessage : false
                });
            })
            .catch(err => {
                console.log("Something went wrong!", err);
            })
    }

    editTicket(ticket){
        axios.post('/tickets/' + ticket._id, ticket)
            .then(res => {
                this.getTicket();
            })
            .catch(err => {
                console.log("Something went wrong!", err);
            })
    }

    deleteTicket(){
        let ticket = this.state.ticket;

        axios.delete('/tickets/' + ticket._id)
            .then(res => {
                this.closeDeleteDialog();
                window.location.reload();
            })
            .catch(err => {
                console.log("Something went wrong!", err);
            })
    }

    render(){
        let ticket = this.state.ticket;
        let title = ticket.title || "";
        let submitter = ticket.submitter || {};
        let assignee = ticket.assignee || {};
        let created = ticket.created || {};
        let priority = ticket.priority || "";
        let status = ticket.status || "";

        let chat = ticket.chat || [];

        chat = chat.map((chatItem) => {
            return(
                <div key={chat.indexOf(chatItem).toString()} className="chat-item">
                    <Avatar alt={chatItem.author.firstName} src={isEmpty(chatItem.author.avatar) ? "" : `../../../storage/users/${chatItem.author._id}/${chatItem.author.avatar}`} 
                        className="user-avatar" />
                        
                    <div className="chat-item-content">
                        <div className="chat-item-title">
                            <span className="chat-item-author">{chatItem.author.fullName}</span>
                            <span className="chat-item-date">{formatDate(chatItem.date)}</span>
                        </div>

                        <div className="chat-item-body">
                            <p>{chatItem.message}</p>
                        </div>
                    </div>
                </div>
            )
        })

        return(
            <div>
                <div className="ticket-page-title">
                    <Tooltip title="Back">
                        <IconButton component={Link} to={this.props.previousPage}>
                            <ArrowBackIcon />
                        </IconButton>
                    </Tooltip>
                    <h2>{title}</h2>
                </div>

                <Grid container spacing={4}>
                    <Grid item xs={12} md={8} style={{ height: "38rem", }}>
                        <div className="chat">
                            <div id="chat-box">
                                {chat}
                            </div>

                            <MessageBar onInputSending = {(message) => this.sendMessage(message)} />          
                        </div>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Grid container spacing={4}>
                            <Grid item xs={12}>
                                <div className="app-card">
                                    <div className="app-card-title">
                                        <h2>{title}</h2>
                                        <Tooltip title="Edit">
                                            <IconButton onClick={() => this.openTicketDialog()}>
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>

                                        <TicketDialog open = {this.state.ticketDialogOpen} ticket = {ticket} 
                                            onAction = {(ticket) => this.editTicket(ticket)} onClose = {() => this.closeTicketDialog()} />
                                    </div>

                                    <Grid container spacing={4}>
                                        <Grid item xs={12}>
                                            <div className="profile-avatar-container">
                                                <Avatar className="profile-avatar" alt={submitter.firstName} 
                                                    src={isEmpty(submitter.avatar) ? "" : `../../../storage/users/${submitter._id}/${submitter.avatar}`} />
                                            </div>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <div className="app-card-text">
                                                <h3>Submitter</h3>
                                                <span>{submitter.fullName}</span>
                                            </div>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <div className="app-card-text">
                                                <h3>Created</h3>
                                                <span>{formatDate(created)}</span>
                                            </div>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <div className="app-card-text">
                                                <h3>Assignee</h3>
                                                <span>{assignee.fullName || "None"}</span>
                                            </div>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <div className="app-card-text">
                                                <h3>Priority</h3>
                                                <span>{priority}</span>
                                            </div>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <div className="app-card-text">
                                                <h3>Status</h3>
                                                <span>{status}</span>
                                            </div>
                                        </Grid>
                                    </Grid>
                                </div>
                            </Grid>
                        
                            <Grid item xs={12}>
                                <div className="ticket-page-close"> 
                                    <Button variant="contained" color="primary" className="primary-background-color" onClick={() => this.openDeleteDialog()}>
                                        Close Ticket
                                    </Button>
                                </div>

                                <Dialog open={this.state.deleteDialogOpen} onClose = {() => this.closeDeleteDialog()}>
                                    <DialogTitle>Close Ticket</DialogTitle>
                                        
                                    <DialogContent>
                                        <DialogContentText>
                                            Are you sure you want to close the ticket?
                                        </DialogContentText>
                                    </DialogContent>

                                    <DialogActions>
                                        <Button onClick={() => this.closeDeleteDialog()} className="primary-color">
                                            No
                                        </Button>
                                            
                                        <Button onClick={() => this.deleteTicket()} className="primary-color">
                                            Yes
                                        </Button>
                                    </DialogActions>
                                </Dialog>
                            </Grid>
                        </Grid>
                    </Grid> 
                </Grid>
            </div>  
        );
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TicketPage));