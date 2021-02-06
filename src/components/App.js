import React from 'react';
import Axios from 'axios';
import { connect } from 'react-redux'
import { getUser } from '../store/store'
import _ from "lodash"
import AskEVA from './AskEVA'
import Users from './Users';
import Tickets from './Tickets';
import KB from './KB';
import Profile from './Profile';
import { isEmpty, formatDate } from '../utils'

import Paper from '@material-ui/core/Paper';
import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';
import NotificationsIcon from '@material-ui/icons/Notifications';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Badge from '@material-ui/core/Badge';
import ChatIcon from '@material-ui/icons/Chat';
import PeopleIcon from '@material-ui/icons/People';
import AssignmentIcon from '@material-ui/icons/Assignment';
import StorageIcon from '@material-ui/icons/Storage';

import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    useLocation
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

export function Sections(props) {
    let location = useLocation();

    return(
        <List component="nav">
            <ListItem button className={(location.pathname === "/" ? "nav-item active-section" : "nav-item")} component={Link} to="/">
                <ListItemIcon>
                    <ChatIcon style={{ color: "#FFEBEE", }} />
                </ListItemIcon>
                <ListItemText primary="AskEVA" primaryTypographyProps={{ style: { fontSize: "1.1rem", }, }} />
            </ListItem>

            {props.user.role === "Administrator" ? (
            <ListItem button className={(location.pathname.startsWith("/users") ? "nav-item active-section" : "nav-item")} component={Link} to="/users">
                <ListItemIcon>
                    <PeopleIcon style={{ color: "#FFEBEE", }} />
                </ListItemIcon>
                <ListItemText primary="Users" primaryTypographyProps={{ style: { fontSize: "1.1rem", }, }} />
            </ListItem>) : ""}

            <ListItem button className={(location.pathname.startsWith("/tickets") ? "nav-item active-section" : "nav-item")} component={Link} to="/tickets">
                <ListItemIcon>
                    <AssignmentIcon style={{ color: "#FFEBEE", }} />
                </ListItemIcon>
                <ListItemText primary="Tickets" primaryTypographyProps={{ style: { fontSize: "1.1rem", }, }} />
            </ListItem>

            {props.user.role === "Administrator" ? (
            <ListItem button className={(location.pathname.startsWith("/kb") ? "nav-item active-section" : "nav-item")} component={Link} to="/kb">
                <ListItemIcon>
                    <StorageIcon style={{ color: "#FFEBEE", }} />
                </ListItemIcon>
                <ListItemText primary="KB" primaryTypographyProps={{ style: { fontSize: "1.1rem", }, }} />
            </ListItem>) : ""}
        </List>
    );
}

export class SideBar extends React.Component{
    constructor(props){
        super(props);
    }
 
    render(){
        return(
            <div className="sidebar">
                <div className="app-logo">
                   EVA
                </div>
            
                <div className="sidebar-content">
                    <Sections user = {this.props.user} />
                </div>
           </div>
       );
    }
}

export class AppBar extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            anchorEl1 : null,
            anchorEl2 : null,
        }
    }

    openNotifMenu(event){
        this.setState({
            anchorEl1 : event.currentTarget
        });
    }
  
    closeNotifMenu(){
        this.setState({
            anchorEl1 : null
        });
    }

    openProfileMenu(event){
        this.setState({
            anchorEl2 : event.currentTarget
        });
    }
  
    closeProfileMenu(){
        this.setState({
            anchorEl2 : null
        });
    }

    deleteNotifications(){
        let user = this.props.user;
        user.notifications = [],

        axios.post('/users/' + user._id, user)
            .then(res => {
                this.props.onChange();
            })
            .catch(err => {
                console.log("Something went wrong!", err);
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
        let user = this.props.user || {};
        let notifications = user.notifications || [];

        let notificationsReversed = [];
        for (let i=notifications.length-1; i>=0; i--) {
            notificationsReversed.push(notifications[i]);
        }
        notifications = notificationsReversed;

        notifications = notifications.map((notification) => {
            if (notification.section === "Users") {
                return(
                    <ListItem key={notification._id}>
                        <ListItemAvatar>
                            <Avatar>
                                <PeopleIcon />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={notification.message} secondary={formatDate(notification.date)} />
                    </ListItem>
                );
            } else if (notification.section === "Tickets") {
                return(
                    <ListItem key={notification._id}>
                        <ListItemAvatar>
                            <Avatar>
                                <AssignmentIcon />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={notification.message} secondary={formatDate(notification.date)} />
                    </ListItem>
                );
            }
        })

        return(
            <div className="app-bar">
                <div className="app-bar-content">
                    <div className="app-bar-notifications">
                        <IconButton onClick = {(event) => this.openNotifMenu(event)}>
                            <Badge badgeContent={notifications.length} color="secondary" className="notifications-badge"
                                 invisible={notifications.length > 0 ? false : true}>
                                <NotificationsIcon />
                            </Badge>
                        </IconButton>
                    </div>
                
                    <div className="app-bar-profile">
                        <Avatar className="app-bar-profile-avatar" alt={user.firstName} 
                            src={isEmpty(user.avatar) ? "" : `../../storage/users/${user._id}/${user.avatar}`} />

                        <span className="app-bar-profile-name" onClick = {(event) => this.openProfileMenu(event)}>
                            <span>{user.fullName}</span>
                            <KeyboardArrowDownIcon />
                        </span>
                    </div>

                    <Menu anchorEl={this.state.anchorEl1} getContentAnchorEl={null} keepMounted 
                        anchorOrigin={{ vertical: "bottom", horizontal: "center" }} transformOrigin={{ vertical: "top", horizontal: "center" }}
                        open={Boolean(this.state.anchorEl1)} onClose={() => this.closeNotifMenu()}
                        PaperProps={{ style: {
                                        padding: "0px",
                                        maxHeight: "25rem",
                                        width: "18rem",
                                    }, }}>
                        <Paper className="notifications-menu">
                            <div className="notifications-header">
                                <h5>Notifications</h5>
                                <span className="notifications-clear-all" onClick = {() => this.deleteNotifications()}>Clear all</span>
                            </div>

                            <List>
                                {notifications}
                            </List>
                        </Paper>
                    </Menu>

                    <Menu anchorEl={this.state.anchorEl2} getContentAnchorEl={null} keepMounted 
                        anchorOrigin={{ vertical: "bottom", horizontal: "center" }} transformOrigin={{ vertical: "top", horizontal: "center" }}
                        open={Boolean(this.state.anchorEl2)} onClose={() => this.closeProfileMenu()}
                        PaperProps={{ style: { width: "8rem", }, }}>
                        <MenuItem component={Link} to="/profile" onClick={() => this.closeProfileMenu()}>Profile</MenuItem>
                        <MenuItem onClick={() => this.logOut()}>Logout</MenuItem>
                    </Menu>
                </div>
            </div>
       );
    }
}

export class AppContent extends React.Component{
    constructor(props){
        super(props);
    }
 
    render(){
        return(
            <div id="app-content">
                <AppBar user = {this.props.user} onChange = {() => this.props.onChange()} /> 
 
                <div className ="section-content">
                    <Switch>
                        <Route exact path="/">
                            <h2 className="section-title">AskEVA</h2>  
                            <AskEVA />
                        </Route>
                        <Route path="/users">
                            <h2 className="section-title">Users</h2>
                            <Users />
                        </Route>
                        <Route path="/tickets">
                            <h2 className="section-title">Tickets</h2>
                            <Tickets />
                        </Route>
                        <Route path="/kb">
                            <h2 className="section-title">KB</h2>
                            <KB />
                        </Route>
                        <Route path="/profile">
                            <h2 className="section-title">Profile</h2>
                            <Profile />
                        </Route>
                    </Switch>
                </div>
            </div>
       );
    }
}

export class App extends React.Component{
    constructor(props){
        super(props);
    }

    componentDidMount(){
        this.props.getUser();
    }

    updateApp(){
        this.props.getUser();
    }
 
    render(){
        return(
            <Router>
                <div id="app-container">
                    <SideBar user = {_.cloneDeep(this.props.user)} />
                    <AppContent user = {_.cloneDeep(this.props.user)} onChange = {() => this.updateApp()} />
                </div>
            </Router>
       );
    }
}


export default connect(mapStateToProps, mapDispatchToProps)(App);