import React from 'react';
import Axios from 'axios';
import $ from 'jquery';
import { connect } from 'react-redux'
import { getUser } from '../store/store'
import _ from "lodash"
import { isEmpty } from '../utils'

import MessageBar from './utils/MessageBar';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import DescriptionIcon from '@material-ui/icons/Description';

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

export class EVAGreetings extends React.Component{
    constructor(props){
        super(props);
        this.tiaGreetingsRef = React.createRef();
    }

    initiateChat(event){
        let value = event.target.value;
        if (event.key === 'Enter' && value != "") {
            const tiaGreetings = this.tiaGreetingsRef.current;
            tiaGreetings.classList.add("hide-message");
            setTimeout(() => {this.props.onChatInitiation(value)}, 300);
        }
    }

    render(){
        let firstName = this.props.user.firstName || "there";

        return(
            <div className="eva-greetings">
                <div ref={this.tiaGreetingsRef}>
                    <h1>Hey {firstName}!</h1>
                    <h1>How can I help you today?</h1>
                    <div className="eva-greetings-input">
                        <TextField id="your-message-input" label="Your message" autoComplete={"off"} onKeyDown={event => this.initiateChat(event)} fullWidth />
                    </div>
                </div>
            </div>
        );
    }
}

export class EVAChatItem extends React.Component{
    constructor(props){
        super(props);
    }

    createTicket(){
        let title = $(".chat-item-ticket #title").val();
        let message = $(".chat-item-ticket #message").val();

        if (isEmpty(title)) {
            alert("Please give a title to the request");
            return;
        }

        if (isEmpty(message)) {
            alert("Please give a message to the request");
            return;
        }

        let ticket = {
            title : title,
            submitter : this.props.user._id,
            assignee : null,
            priority : "Normal",
            status : "Open",
            created : new Date(),
            chat : [
                {
                    author : this.props.user._id,
                    message : message,
                    date : new Date()
                }
            ]
        };

        this.props.onTicketTransfer(ticket);
    }

    render(){
        let user = this.props.user || {};
        let author = this.props.chatItem.author;
        let message = this.props.chatItem.message;
        let isEVA = this.props.chatItem.isEVA;
        let avatar;

        if (isEVA) {
            avatar = <Avatar className="eva-avatar">EVA</Avatar>
        } else {
            avatar = <Avatar alt={user.firstName} src={isEmpty(user.avatar) ? "" : `../../storage/users/${user._id}/${user.avatar}`} 
                className="user-avatar" />
        }

        let bottomContent = "";

        if (isEVA) {
            let request = this.props.chatItem.request || "";
            let hasFile = this.props.chatItem.hasFile || false;
            let buttonsRequired = this.props.chatItem.buttonsRequired || false;
            let ticketRequired = this.props.chatItem.ticketRequired || false;

            if (hasFile) {
                let id = this.props.chatItem.id;
                let file = this.props.chatItem.file;

                bottomContent = <div className="chat-item-file">
                                    <div className="chat-item-file-icon">
                                        <DescriptionIcon />
                                    </div>
                            
                                    <div className="chat-item-file-name">
                                        <a href={`../../storage/kb/${id}/${file}`} download>
                                        <span>{file}</span>
                                        </a>
                                    </div>
                                </div>

            } else if (buttonsRequired) {
                bottomContent = <div className="chat-item-buttons">
                                    <Button variant="contained" color="primary" className="primary-background-color" 
                                        style={{ marginRight: "0.75rem", }} onClick={() => this.props.onResquestHandling("Yes", request)}>
                                        Yes
                                    </Button>

                                    <Button variant="contained" color="primary" className="primary-background-color" onClick={() => this.props.onResquestHandling("No", request)}>
                                        No
                                    </Button>
                                </div>

            } else if (ticketRequired) {
                bottomContent = <div className="chat-item-ticket">
                                    <div className="chat-item-ticket-message">
                                        <TextField id="title" label="Title" autoComplete={"off"} />
                                        <TextField id="message" label="Message" defaultValue={request} autoComplete={"off"} />
                                    </div>

                                    <Button variant="contained" color="primary" className="primary-background-color" onClick = {() => this.createTicket()}>
                                        Send
                                    </Button>
                                </div>
            }
        }

        return(
            <div className="chat-item">
                {avatar}
                    
                <div className="chat-item-content">
                    <div className="chat-item-title">
                        <span className="chat-item-author">{author}</span>
                    </div>

                    <div className="chat-item-body">
                        <p>{message}</p>
                    </div>

                    {bottomContent}
                </div>
            </div>
        );
    }
}

export class EVAChat extends React.Component{
    constructor(props){
        super(props);
    }

    render(){
        let chatList = this.props.chatList;
        chatList = chatList.map((chatItem) => <EVAChatItem key = {chatList.indexOf(chatItem).toString()} user = {this.props.user} chatItem = {chatItem} 
                                                onResquestHandling = {(res, request) => this.props.onResquestHandling(res, request)} 
                                                onTicketTransfer = {(ticket) => this.props.onTicketTransfer(ticket)}/>);

        return(
            <div className="chat">
                <div id="chat-box">
                    {chatList}
                </div>

                <MessageBar onInputSending = {(request) => this.props.onInputSending(request)} />          
            </div>
        );
    }
}

export class AskEVA extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            chatList : [],
            isChatInitiated : false
        };
    }

    componentDidUpdate(){
        $("#chat-box").animate({ scrollTop: $('#chat-box').prop("scrollHeight")}, 50);
    }

    initiateChat(message){
        this.setState({
            isChatInitiated : true
        });
        this.ask(message);
    }

    ask(request){
        let chatList = this.state.chatList;
        chatList.push({
            author : this.props.user.fullName || "",
            message : request,
            isEVA : false
        });
        this.setState({
            chatList : chatList
        })

        axios.post('/kb/predict', {request : request})
            .then(res => {
                if (res.data != "-1" && isEmpty(res.data)){
                    alert("Something went wrong with EVA");
                    return;
                }

                let response;

                if (res.data == "-1") {
                    response = "Sorry, I can't help you with that. Would you like to create a ticket?";
                    chatList.push({
                        author : "EVA",
                        message : response,
                        isEVA : true,
                        request : request,
                        hasFile: false,
                        buttonsRequired : true,
                        ticketRequired : false
                    });
                    this.setState({
                        chatList : chatList
                    });

                } else {
                    let knowledge = res.data

                    if (knowledge.type === "File"){
                        response = "Hey! I found this file. Hope this helps!";
                        chatList.push({
                            author : "EVA",
                            message : response,
                            isEVA : true,
                            request : request,
                            hasFile: true,
                            id : knowledge._id,
                            file : knowledge.answer,
                            buttonsRequired : false,
                            ticketRequired : false
                        });
                        this.setState({
                            chatList : chatList
                        });

                    } else {
                        response = knowledge.answer;
                        chatList.push({
                            author : "EVA",
                            message : response,
                            isEVA : true,
                            request : request,
                            hasFile: false,
                            buttonsRequired : false,
                            ticketRequired : false
                        });
                        this.setState({
                            chatList : chatList
                        });
                    }
                }
            })
            .catch(err => {
                console.log("Something went wrong!", err);
            })
    }

    handleRequest(res, request){
        let chatList = this.state.chatList;
        let response;
        $(".chat-item-buttons").remove();

        if (res == "Yes" && request != "") {
            response = "Okay, please add a title and a message to the ticket.";
            chatList.push({
                author : this.props.user.fullName || "",
                message : res,
                isEVA : false
            });
            chatList.push({
                author : "EVA",
                message : response,
                isEVA : true,
                request : request,
                hasFile: false,
                buttonsRequired : false,
                ticketRequired: true
            });
            this.setState({
                chatList : chatList
            });

        } else if (res == "No") {
            response = "Okay, I will do nothing then.";
            chatList.push({
                author : this.props.user.fullName || "",
                message : res,
                isEVA : false
            });
            chatList.push({
                author : "EVA",
                message : response,
                isEVA : true,
                request : request,
                hasFile: false,
                buttonsRequired : false,
                ticketRequired : false
            });
            this.setState({
                chatList : chatList
            });

        } else {
            response = "Sorry, something went wrong";
            chatList.push({
                author : "EVA",
                message : response,
                isEVA : true,
                request : request,
                hasFile: false,
                buttonsRequired : false
            });
            this.setState({
                chatList : chatList
            });
        }
    }

    transferTicket(ticket){
        $(".chat-item-ticket").remove();

        axios.post('/tickets', ticket)
            .then(res => {
                let response = "Okay, a ticket has been created.";
                let chatList = this.state.chatList;
                chatList.push({
                    author : "EVA",
                    message : response,
                    isEVA : true,
                    hasFile: false,
                    request : ticket.chat[0].message,
                    buttonsRequired : false,
                    ticketRequired : false
                });
                this.setState({
                    chatList : chatList
                });
                this.props.getUser();
            })
            .catch(function (err) {
                console.log("Something went wrong!", err);
            });
    }

    render(){
        let evaContent;
        if (this.state.isChatInitiated) {
            evaContent = <EVAChat user = {this.props.user} chatList = {this.state.chatList} onInputSending = {(request) => this.ask(request)} 
                            onResquestHandling = {(res, request) => this.handleRequest(res, request)}
                            onTicketTransfer = {(ticket) => this.transferTicket(ticket)} />;
        } else {
            evaContent = <EVAGreetings user = {this.props.user} onChatInitiation = {(message) => this.initiateChat(message)} />;
        }

        return(
            <div className="eva-section">
                {evaContent}
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AskEVA);