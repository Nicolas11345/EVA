import React from 'react';
import Axios from 'axios';
import { connect } from 'react-redux'
import { getUser } from '../store/store'
import _ from "lodash"
import { isEmpty } from '../utils'

import Grid from '@material-ui/core/Grid';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import LockIcon from '@material-ui/icons/Lock';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Snackbar from '@material-ui/core/Snackbar';
import CloseIcon from '@material-ui/icons/Close';

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

export class ProfileInfo extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            user : this.props.user || {},
            avatarFile : {},
            avatarFileName : this.props.user.avatar || "No file",
            isAvatarChanged : false,
            dialogOpen : false
        }
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

    changeFirstName(event){
        let user = this.state.user;
        user.firstName = event.target.value;

        this.setState({
            user : user,
        })
    }

    changeLastName(event){
        let user = this.state.user;
        user.lastName = event.target.value;

        this.setState({
            user : user,
        })
    }

    changeEmail(event){
        let user = this.state.user;
        user.email = event.target.value;

        this.setState({
            user : user,
        })
    }

    handleFile(){
        let file = $("#avatar-file-input").prop('files')[0];

        if (!file){
            return;
        } else if (file.size > 500000){
            alert("The image size is too big. Please select a picture with size under 500 KB.");
            return;
        }

        this.setState({
            avatarFile : file,
            avatarFileName : file.name,
            isAvatarChanged : true
        })
    }

    uploadFile(){
        let user = this.state.user;
        let formData = new FormData();
        formData.append('file', this.state.avatarFile);

        axios.post('/users/avatar/' + user._id, formData)
            .catch(err => {
                console.log("Something went wrong!", err);
            })
    }

    editProfile(){
        let user = this.state.user;
        user.fullName = user.firstName + " " + user.lastName;
        user.avatar = this.state.avatarFileName;

        if (isEmpty(user.firstName) || isEmpty(user.lastName) || isEmpty(user.email)) {
            alert("Please fill in all fields");
            return;
        }

        axios.post('/users/' + user._id, user)
            .then(res => {
                if (this.state.isAvatarChanged) {
                    this.uploadFile();
                }
                setTimeout(() => this.props.onChange(), 250);
                setTimeout(() => this.closeDialog(), 250);
            })
            .catch(err => {
                console.log("Something went wrong!", err);
            })
    }
 
    render(){
        return(
            <div className="app-card">
                <div className="app-card-title">
                    <h2>My Profile</h2>
                    <Tooltip title="Edit">
                        <IconButton onClick={() => this.openDialog()}>
                            <EditIcon />
                        </IconButton>
                    </Tooltip>

                    <Dialog open={this.state.dialogOpen} onClose={() => this.closeDialog()}>
                        <DialogTitle>Edit Profile</DialogTitle>
                                
                        <DialogContent>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <div style={{ marginBottom: "1.25rem", }}>Avatar file : {this.state.avatarFileName}</div>
                                    <div>
                                        <input type="file" id="avatar-file-input" className="upload" accept="image/jpeg, image/png" 
                                            onChange = {() => this.handleFile()}></input>
                                        <label htmlFor="avatar-file-input">
                                            <Button variant="contained" color="primary" className="primary-background-color" component="span">
                                                Upload New File
                                            </Button>
                                        </label>
                                    </div>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField margin="dense" id="profile-first-name-input" label="First Name" autoComplete={"off"} 
                                        defaultValue={this.state.user.firstName} onChange={(event) => this.changeFirstName(event)} fullWidth />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField margin="dense" id="profile-last-name-input" label="Last Name" autoComplete={"off"} 
                                        defaultValue={this.state.user.lastName} onChange={(event) => this.changeLastName(event)} fullWidth />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField margin="dense" id="profile-email-input" label="Email" autoComplete={"off"} 
                                        defaultValue={this.state.user.email} onChange={(event) => this.changeEmail(event)} fullWidth />
                                </Grid>
                            </Grid>
                        </DialogContent>
                            
                        <DialogActions>
                            <Button onClick={() => this.closeDialog()} className="primary-color">
                                Cancel
                            </Button>
                            <Button onClick={() => this.editProfile()} className="primary-color">
                                Edit
                            </Button>
                        </DialogActions>
                    </Dialog>
                </div>

                <Grid container spacing={4}>
                    <Grid item xs={12}>
                        <div className="profile-avatar-container">
                            <Avatar className="profile-avatar" alt={this.props.user.firstName} 
                                src={isEmpty(this.props.user.avatar) ? "" : `../../storage/users/${this.props.user._id}/${this.props.user.avatar}`} />
                        </div>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <div className="app-card-text">
                            <h3>First Name</h3>
                            <span>{this.props.user.firstName}</span>
                        </div>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <div className="app-card-text">
                            <h3>Last Name</h3>
                            <span>{this.props.user.lastName}</span>
                        </div>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <div className="app-card-text">
                            <h3>Email</h3>
                            <span>{this.props.user.email}</span>
                        </div>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <div className="app-card-text">
                            <h3>Role</h3>
                            <span>{this.props.user.role}</span>
                        </div>
                    </Grid>
                </Grid>
            </div>
        );
    }
}

export class PasswordReset extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            currentPasswordError : false,
            confirmPasswordError : false,
            snackBarOpen : false
        }
    }

    closeSnackBar(event, reason){
        if (reason === "clickaway") {
          return;
        }
  
        this.setState({
          snackBarOpen : false
        })
     }

    resetPassword(){
        let currentPassword = $("#profile-current-password-input").val();
        let newPassword = $("#profile-new-password-input").val();
        let confirmPassword = $("#profile-confirm-password-input").val();

        if (isEmpty(currentPassword) || isEmpty(newPassword) || isEmpty(confirmPassword)) {
            alert("Please fill in all fields");
            return;
        }

        if (newPassword !== confirmPassword) {
            this.setState({
                currentPasswordError : false,
                confirmPasswordError : true
            })
        } else {
            let user = this.props.user;
            let passwordInfo = {
                currentPassword : currentPassword,
                newPassword : newPassword,
            }

            axios.post('/users/password/' + user._id, passwordInfo)
            .then(res => {
                if (res.data === "Invalid password") {
                    this.setState({
                        currentPasswordError : true,
                        confirmPasswordError : false
                    })
                } else if (res.data === "Password updated!") {
                    this.setState({
                        currentPasswordError : false,
                        confirmPasswordError : false,
                        snackBarOpen : true
                    })
                }
            })
            .catch(err => {
                console.log("Something went wrong!", err);
            })
        }
    }
 
    render(){
        return(
            <div className="app-card">
                <div className="app-card-title">
                    <h2>Reset Password</h2>
                </div>

                <Grid container spacing={4}>
                    <Grid item xs={12}>
                        <TextField id="profile-current-password-input" type="password" label="Current Password" variant="outlined" 
                            error={this.state.currentPasswordError ? true : false} helperText={this.state.currentPasswordError ? "Invalid Current Password" : ""} fullWidth={true} />  
                    </Grid>
                    <Grid item xs={12}>
                        <TextField id="profile-new-password-input" type="password" label="New Password" variant="outlined" fullWidth={true} />  
                    </Grid>
                    <Grid item xs={12}>
                        <TextField id="profile-confirm-password-input" type="password" label="Confirm Password" variant="outlined" 
                            error={this.state.confirmPasswordError ? true : false} helperText={this.state.confirmPasswordError ? "Confirm Password not the same as New Password" : ""} fullWidth={true} />  
                    </Grid>
                    <Grid item xs={12}>
                        <Button onClick={() => this.resetPassword()} variant="contained" color="primary" className="primary-background-color">
                            Reset Password
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
                    message="Password Updated"
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

export class Profile extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            page : 0
        }
    }

    setPage(page){
        this.setState({
            page : page
        })
    }

    logOut(){
        axios.get('/logout')
            .then(res => {
                window.location="/";
            })
            .catch(err => {
                console.log("Something went wrong!", err);
            })
    }
 
    render(){
        return(
            <Grid container spacing={4}>
                <Grid item xs={12} md={3}>
                    <div className="app-card-profile-menu">
                        <List>
                            <ListItem button selected={this.state.page === 0} onClick={() => this.setPage(0)} >
                                <ListItemAvatar>
                                    <Avatar className="primary-background-color">
                                        <AccountCircleIcon />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText primary="My Profile" />
                            </ListItem>
                            <ListItem button selected={this.state.page === 1} onClick={() => this.setPage(1)}>
                                <ListItemAvatar>
                                    <Avatar className="primary-background-color">
                                        <LockIcon />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText primary="Reset Password" />
                            </ListItem>
                            <ListItem button onClick={() => this.logOut()}>
                                <ListItemAvatar>
                                    <Avatar className="primary-background-color">
                                        <ExitToAppIcon />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText primary="Log out" />
                            </ListItem>
                        </List>
                    </div>
                </Grid>

                <Grid item xs={12} md={9}>
                    {this.state.page == 0 ? <ProfileInfo user = {_.cloneDeep(this.props.user)} onChange = {() => this.props.getUser()} /> : <PasswordReset user = {_.cloneDeep(this.props.user)} />}
                </Grid>
            </Grid>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile);