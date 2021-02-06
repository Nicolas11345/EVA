import React from 'react';
import Axios from 'axios';
import { connect } from 'react-redux'
import { getUser } from '../store/store'
import _ from "lodash"
import { isEmpty, isValidEmail } from '../utils'

import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import SearchIcon from '@material-ui/icons/Search'
import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Divider from '@material-ui/core/Divider';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';

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

export function ActiveUser(props) {
    let user = props.user;
    return(
        <Grid item xs={12} md={6}>
            <List>
                <ListItem>
                    <ListItemAvatar style={{ marginRight: "1rem", }}>
                    <Avatar alt={user.firstName} src={isEmpty(user.avatar) ? "" : `../../storage/users/${user._id}/${user.avatar}`} 
                        className="user-avatar" />
                    </ListItemAvatar>
                    <ListItemText primary={user.fullName} 
                        secondary={
                            <span style={{ display: "flex", flexDirection: "column", }}>
                                <span>{user.role}</span>
                                <span>{user.email}</span>
                            </span>
                        } />
                </ListItem>

                <Divider />
            </List>
        </Grid>
    );
}

export class User extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            user : this.props.user,
            selectedRole : this.props.user.role,
            anchorEl : null,
            roleDialogOpen : false,
            deleteDialogOpen : false,
        }
    }

    openMenu(event){
        this.setState({
            anchorEl : event.currentTarget
        });
    }
  
    closeMenu(){
        this.setState({
            anchorEl : null
        });
     }
  
    openRoleDialog(){
        this.setState({
            roleDialogOpen : true
        });
    }
  
    closeRoleDialog(){
        this.setState({
            roleDialogOpen : false
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

    changeSelectedRole(event){
        this.setState({
            selectedRole : event.target.value
        });
    }

    changeRole(){
        let user = this.state.user;
        user.role = this.state.selectedRole

        axios.post('/users/' + user._id, user)
            .then(res => {
                this.props.onChange();
                this.closeRoleDialog();
            })
            .catch(err => {
                console.log("Something went wrong!", err);
            })
    }

    deleteUser(){
        let user = this.state.user;

        axios.delete('/users/' + user._id)
            .then(res => {
                this.props.onChange();
                this.closeDeleteDialog();
            })
            .catch(err => {
                console.log("Something went wrong!", err);
            })
    }
 
    render(){
        let user = this.state.user;

        return(
            <Grid item xs={12} md={6}>
                <List>
                    <ListItem>
                        <ListItemAvatar style={{ marginRight: "1rem", }}>
                            <Avatar alt={user.firstName} src={isEmpty(user.avatar) ? "" : `../../storage/users/${user._id}/${user.avatar}`} 
                                className="user-avatar" />
                        </ListItemAvatar>
                        <ListItemText primary={user.fullName} 
                            secondary={
                                <span style={{ display: "flex", flexDirection: "column", }}>
                                    <span>{user.role}</span>
                                    <span>{user.email}</span>
                                </span>
                            } />
                        <ListItemSecondaryAction>
                            <IconButton edge="end" onClick={(event) => this.openMenu(event)}>
                                <MoreVertIcon />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>

                    <Divider />
                </List>

                <Menu anchorEl={this.state.anchorEl} keepMounted open={Boolean(this.state.anchorEl)} 
                    onClose={() => this.closeMenu()}>
                    <MenuItem onClick={() => this.openRoleDialog()}>Change Role</MenuItem>
                    <MenuItem className="text-danger" onClick={() => this.openDeleteDialog()}>Delete User</MenuItem>
                </Menu>

                <Dialog open={this.state.roleDialogOpen} onClose = {() => this.closeRoleDialog()}>
                    <DialogTitle>Change Role</DialogTitle>
                        
                    <DialogContent>
                        <FormControl component="fieldset">
                            <FormLabel component="legend">Role</FormLabel>
                            <RadioGroup name="role" value={this.state.selectedRole} onChange={(event) => this.changeSelectedRole(event)}>
                                <FormControlLabel value={"Administrator"} control={<Radio className="primary-color" />} label="Administrator" />
                                <FormControlLabel value={"User"} control={<Radio className="primary-color" />} label="User" />
                            </RadioGroup>
                        </FormControl>
                    </DialogContent>

                    <DialogActions>
                        <Button onClick={() => this.closeRoleDialog()} className="primary-color">
                            Cancel
                        </Button>
                            
                        <Button className="primary-color" onClick={() => this.changeRole()}>
                            Change Role
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={this.state.deleteDialogOpen} onClose = {() => this.closeDeleteDialog()}>
                    <DialogTitle>Delete User</DialogTitle>
                        
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to delete the user?
                        </DialogContentText>
                    </DialogContent>

                    <DialogActions>
                    <Button onClick={() => this.closeDeleteDialog()} className="primary-color">
                        No
                    </Button>
                        
                    <Button className="primary-color" onClick={() => this.deleteUser()}>
                        Yes
                    </Button>
                    </DialogActions>
                </Dialog>
            </Grid>
        );
    }
}

export class Users extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            users : [],
            usersFiltered : [],
            dialogOpen : false
        }
    }

    componentDidMount(){
        this.getUsers();
    }

    openDialog(){
        this.setState({
            dialogOpen : true
        });
    }
  
    closeDialog(){
        this.setState({
            dialogOpen : false
        });
    }

    getUsers(){
        axios.get('/users')
            .then(res => {
                if (res.data.length > 0) {
                    let users = res.data;
                    users.sort((a,b) => {
                        if(a.firstName < b.firstName) { return -1; }
                        if(a.firstName > b.firstName) { return 1; }
                        return 0;
                    })
                    this.setState({
                        users : users,
                        usersFiltered : users
                    });
                }
            })
            .catch(err => {
                console.log("Something went wrong!", err);
            })
    }

    addUser(){
        let firstName = $("#user-first-name-input").val();
        let lastName = $("#user-last-name-input").val();
        let email = $("#user-email-input").val();
        let password = $("#user-password-input").val();

        if (!isValidEmail(email)) {
            alert("Email not valid");
            return;
        }
      
        if (isEmpty(firstName) && isEmpty(lastName) && isEmpty(email) && isEmpty(password)) {
            alert("Please fill in all fields");
        } else {
            let user = {
                firstName : firstName,
                lastName : lastName,
                fullName : firstName + " " + lastName,
                email : email,
                password : password,
                role : "User",
                avatar : "",
                notifications : [],
            }
        
            axios.post('/users', user)
            .then(res => {
                this.getUsers();
                this.closeDialog();
                setTimeout(() => this.props.getUser(), 500);
            })
            .catch(err => {
                console.log("Something went wrong!", err);
            })

        } 
    }

    search(event){
        let search = event.target.value;

        if (isEmpty(search)) {
            this.setState({
                usersFiltered : this.state.users,
            });
        } else {
            let users = this.state.users;
            users = users.filter((user) => user.fullName.toLowerCase().includes(search.toLowerCase().trim()));

            this.setState({
                usersFiltered : users,
            });
        }
    }
 
    render(){
        let users = this.state.usersFiltered;

        users = users.map((user) => {
            if (this.props.user._id === user._id) {
                return <ActiveUser key = {user._id} user = {_.cloneDeep(this.props.user)} />;
            } else {
                return <User key = {user._id} user = {user} onChange = {() => this.getUsers()} />;
            }
        });

        return(
            <Grid container>
                <Grid item xs={12}>
                    <div className="app-card">
                        <div className="app-card-title">
                            <div>
                                <Button variant="contained" color="primary" className="primary-background-color" onClick={() => this.openDialog()}>
                                    + New User
                                </Button>

                                <Dialog open={this.state.dialogOpen} onClose={() => this.closeDialog()}>
                                    <DialogTitle>Add User</DialogTitle>
                                            
                                    <DialogContent>
                                        <TextField margin="dense" id="user-first-name-input" label="First Name" autoComplete={"off"} fullWidth />
                                        <TextField margin="dense" id="user-last-name-input" label="Last Name" autoComplete={"off"} fullWidth />
                                        <TextField margin="dense" id="user-email-input" label="Email" autoComplete={"off"} fullWidth />
                                        <TextField margin="dense" id="user-password-input" label="Password" autoComplete={"off"} fullWidth />
                                    </DialogContent>
                                        
                                    <DialogActions>
                                        <Button onClick={() => this.closeDialog()} className="primary-color">
                                            Cancel
                                        </Button>
                                        <Button className="primary-color" onClick={() => this.addUser()}>
                                            Add
                                        </Button>
                                    </DialogActions>
                                </Dialog>
                            </div>

                            <div>
                                <Grid container spacing={1} alignItems="flex-end">
                                    <Grid item>
                                        <SearchIcon />
                                    </Grid>
                                    <Grid item>
                                        <TextField label="Search" onChange={(event) => this.search(event)} />
                                    </Grid>
                                </Grid>
                            </div>
                        </div>

                        <div>
                            <Grid container spacing={3}>
                                {users}
                            </Grid> 
                        </div>
                    </div>
                </Grid>
            </Grid>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Users);