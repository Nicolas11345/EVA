import React from 'react';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { AskEVA, EVAGreetings, EVAChat, EVAChatItem } from '../components/AskEVA'

import MessageBar from '../components/utils/MessageBar';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import DescriptionIcon from '@material-ui/icons/Description';
import { truncate } from 'lodash';
import { FilterListTwoTone } from '@material-ui/icons';

configure({ adapter: new Adapter() });

describe('<AskEVA />', () => {
    test('testing component rendering', () => {
        const wrapper = shallow(<AskEVA />, { disableLifecycleMethods : true });

        wrapper.setState({ isChatInitiated : false });

        expect(wrapper.find(EVAGreetings)).toHaveLength(1);
        expect(wrapper.find(EVAChat)).toHaveLength(0);

        wrapper.setState({ isChatInitiated : true });

        expect(wrapper.find(EVAGreetings)).toHaveLength(0);
        expect(wrapper.find(EVAChat)).toHaveLength(1);
    });

    test('testing component functions', () => {
        const wrapper = shallow(<AskEVA user = {{ fullName : 'John Doe' }} />, { disableLifecycleMethods : true });
        const instance = wrapper.instance();

        instance.ask = jest.fn();
        instance.componentDidUpdate = jest.fn();

        wrapper.update();

        expect(instance.state.isChatInitiated).not.toBeTruthy();
        expect(instance.state.chatList.length).toEqual(0);

        instance.initiateChat('');

        expect(instance.state.isChatInitiated).toBeTruthy();
        expect(instance.state.chatList.length).toEqual(0);

        instance.handleRequest('Yes', 'Request 1');

        expect(instance.state.chatList.length).toEqual(2);
        expect(instance.state.chatList[0]).toEqual({
            author : 'John Doe',
            message : 'Yes',
            isEVA : false
        });
        expect(instance.state.chatList[1]).toEqual({
            author : 'EVA',
            message : 'Okay, please add a title and a message to the ticket.',
            isEVA : true,
            request : 'Request 1',
            hasFile: false,
            buttonsRequired : false,
            ticketRequired: true
        });

        instance.handleRequest('No', 'Request 2');

        expect(instance.state.chatList.length).toEqual(4);
        expect(instance.state.chatList[2]).toEqual({
            author : 'John Doe',
            message : 'No',
            isEVA : false
        });
        expect(instance.state.chatList[3]).toEqual({
            author : 'EVA',
            message : 'Okay, I will do nothing then.',
            isEVA : true,
            request : 'Request 2',
            hasFile: false,
            buttonsRequired : false,
            ticketRequired: false
        });  
    });
});

describe('<EVAGreetings />', () => {
    test('testing component rendering', () => {
        const user = {
            firstName : 'John'
        }

        const wrapper = shallow(<EVAGreetings user = {user} />, { disableLifecycleMethods : true });

        expect(wrapper.find('h1').first().text()).toEqual('Hey ' + user.firstName + '!');
        expect(wrapper.find(TextField)).toHaveLength(1);
    });

    test('testing component function', () => {
        const user = {
            firstName : 'John'
        }

        const wrapper = shallow(<EVAGreetings user = {user} />, { disableLifecycleMethods : true });
        const instance = wrapper.instance();

        instance.initiateChat = jest.fn();

        wrapper.update();

        wrapper.find(TextField).simulate('keyDown', {key: 'Enter'}); 
        expect(instance.initiateChat).toHaveBeenCalled();
    });
});

describe('<EVAChat />', () => {
    test('testing component rendering', () => {
        const user = {
            fullName : 'John Doe'
        }

        const chatList = [
            {
                author : 'author 1',
                message : 'message 1',
            },
            {
                author : 'author 2',
                message : 'message 2',
            },
            {
                author : 'author 3',
                message : 'message 3',
            },
        ]

        const wrapper = shallow(<EVAChat user = {user} chatList = {chatList} />, { disableLifecycleMethods : true });

        expect(wrapper.find(EVAChatItem)).toHaveLength(3);
        expect(wrapper.find(MessageBar)).toHaveLength(1);
    });
});

describe('<EVAChatItem />', () => {
    test('testing component rendering with user', () => {
        const user = {
            firstName : 'John',
            lastName : 'Doe',
            fullName : 'John Doe',
            avatar : ''
        }

        const chatItem = {
            author : 'John Doe',
            message : 'Hello there',
            isEVA : false
        }

        const wrapper = shallow(<EVAChatItem user = {user} chatItem = {chatItem} />, { disableLifecycleMethods : true });

        expect(wrapper.find('.user-avatar')).toHaveLength(1);
        expect(wrapper.find('.eva-avatar')).toHaveLength(0);
        expect(wrapper.find('.chat-item-author').text()).toEqual(chatItem.author);
        expect(wrapper.find('.chat-item-body').find('p').text()).toEqual(chatItem.message);
    });

    test('testing component rendering with EVA', () => {
        const user = {
            firstName : 'John',
            lastName : 'Doe',
            fullName : 'John Doe',
            avatar : ''
        }

        const chatItem = {
            author : 'EVA',
            message : 'Hello there',
            isEVA : true
        }

        const wrapper = shallow(<EVAChatItem user = {user} chatItem = {chatItem} />, { disableLifecycleMethods : true });

        expect(wrapper.find('.user-avatar')).toHaveLength(0);
        expect(wrapper.find('.eva-avatar')).toHaveLength(1);
        expect(wrapper.find('.chat-item-author').text()).toEqual(chatItem.author);
        expect(wrapper.find('.chat-item-body').find('p').text()).toEqual(chatItem.message);
    });

    test('testing component rendering with EVA - file', () => {
        const user = {
            firstName : 'John',
            lastName : 'Doe',
            fullName : 'John Doe',
            avatar : ''
        }

        const chatItem = {
            author : 'EVA',
            message : 'Hello there',
            isEVA : true,
            hasFile: true,
            file : 'file.txt'
        }

        const wrapper = shallow(<EVAChatItem user = {user} chatItem = {chatItem} />, { disableLifecycleMethods : true });

        expect(wrapper.find(DescriptionIcon)).toHaveLength(1);
        expect(wrapper.find('.chat-item-file-name').find('span').text()).toEqual(chatItem.file);
    });

    test('testing component rendering with EVA - buttons', () => {
        const user = {
            firstName : 'John',
            lastName : 'Doe',
            fullName : 'John Doe',
            avatar : ''
        }

        const chatItem = {
            author : 'EVA',
            message : 'Hello there',
            isEVA : true,
            buttonsRequired : true
        }

        const wrapper = shallow(<EVAChatItem user = {user} chatItem = {chatItem} />, { disableLifecycleMethods : true });

        expect(wrapper.find(Button)).toHaveLength(2);
    });

    test('testing component rendering with EVA - ticket', () => {
        const user = {
            firstName : 'John',
            lastName : 'Doe',
            fullName : 'John Doe',
            avatar : ''
        }

        const chatItem = {
            author : 'EVA',
            message : 'Hello there',
            isEVA : true,
            ticketRequired : true
        }

        const wrapper = shallow(<EVAChatItem user = {user} chatItem = {chatItem} />, { disableLifecycleMethods : true });

        expect(wrapper.find(TextField)).toHaveLength(2);
        expect(wrapper.find(Button)).toHaveLength(1);

        const instance = wrapper.instance();

        instance.createTicket = jest.fn();

        wrapper.update();

        wrapper.find(Button).simulate('click'); 
        expect(instance.createTicket).toHaveBeenCalled();
    });
});
