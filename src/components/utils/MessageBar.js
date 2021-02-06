import React from 'react';
import TextField from '@material-ui/core/TextField';

export class MessageBar extends React.Component{
    constructor(props){
        super(props);
    }

    sendInput(event){
        let value = event.target.value;
        if (event.key === 'Enter' && value != "") {
            $("#chat-input-text").val("");
            this.props.onInputSending(value);
        }
    }

    render(){
        return(
            <div className="message-input">
                <TextField id="chat-input-text" label="Type Message" autoComplete={"off"} variant="outlined" fullWidth={true} onKeyDown={event => this.sendInput(event)} /> 
            </div>
        );
    }
}

export default MessageBar;