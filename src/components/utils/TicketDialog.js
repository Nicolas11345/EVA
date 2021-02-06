import React from 'react';
import Axios from 'axios';
import { isEmpty } from '../../utils'

import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

const axios = Axios.create({
    headers: {
        'Authorization':'App'
    }
});

export class TicketDialog extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            ticket : {},
            users : []
        }
    }

    componentDidUpdate(prevProps){   
        if (this.props.ticket != prevProps.ticket) {
            axios.get('/users')
                    .then(res => {
                        let users = res.data;
                        let ticket = Object.assign({}, this.props.ticket);
                        let assignee = ticket.assignee || {};
                        ticket.assignee = assignee._id || null;
                        users = users.filter((user) => user._id !== ticket.submitter._id)
                        this.setState({
                            ticket : ticket,
                            users : users
                        });
                    })
                    .catch(err => {
                        console.log("Something went wrong!", err);
                    })
        }
    }

    changeTitle(event){
        let ticket = this.state.ticket;
        ticket.title = event.target.value;

        this.setState({
            ticket : ticket
        })
    }

    changeDescription(event){
        let ticket = this.state.ticket;
        ticket.description = event.target.value;

        this.setState({
            ticket : ticket
        })
    }

    changeAssignee(event){
        let ticket = this.state.ticket;
        ticket.assignee = event.target.value;

        this.setState({
            ticket : ticket
        })
    }

    changePriority(event){
        let ticket = this.state.ticket;
        ticket.priority = event.target.value;

        this.setState({
            ticket : ticket
        })
    }

    changeStatus(event){
        let ticket = this.state.ticket;
        ticket.status = event.target.value;

        this.setState({
            ticket : ticket
        })
    }

    editTicket(){
        if (isEmpty(this.state.ticket.title) || isEmpty(this.state.ticket.priority) || isEmpty(this.state.ticket.status)) {
            alert("Please fill in all the fields");
            return;
        }

        this.props.onAction(this.state.ticket);
        this.props.onClose();
    }

    render(){
        let users = this.state.users || [];
        users = users.map((user) => <MenuItem key={user._id} value={user._id}>{user.fullName}</MenuItem>);

        return(
            <Dialog open={this.props.open} onClose={() => this.props.onClose()}>
                <DialogTitle>Edit Ticket</DialogTitle>
                        
                <DialogContent>
                    <Grid container spacing={1}>
                        <Grid item xs={12}>
                            <TextField margin="dense" id="ticket-title-input" label="Title" autoComplete={"off"} 
                                defaultValue={this.state.ticket.title} 
                                onChange={(event) => this.changeTitle(event)} fullWidth />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Assignee</InputLabel>
                                <Select id="ticket-assignee-select" value={this.state.ticket.assignee || ""} label="Assignee"
                                    onChange={(event) => this.changeAssignee(event)}>
                                    {users}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Priority</InputLabel>
                                <Select id="ticket-priority-select" value={this.state.ticket.priority || ""} label="Priority"
                                    onChange={(event) => this.changePriority(event)}>
                                    <MenuItem value={"Low"}>Low</MenuItem>
                                    <MenuItem value={"Normal"}>Normal</MenuItem>
                                    <MenuItem value={"High"}>High</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select id="ticket-status-select" value={this.state.ticket.status || ""} label="Status"
                                    onChange={(event) => this.changeStatus(event)}>
                                    <MenuItem value={"Open"}>Open</MenuItem>
                                    <MenuItem value={"Closed"}>Closed</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>                   
                </DialogContent>
                    
                <DialogActions>
                    <Button onClick={() => this.props.onClose()} className="primary-color">
                        Cancel
                    </Button>
                    <Button onClick={() => this.editTicket()} className="primary-color">
                        Edit
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

export default TicketDialog;