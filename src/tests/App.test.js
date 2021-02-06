import React from 'react';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { AppBar, Sections } from '../components/App'

import Avatar from '@material-ui/core/Avatar';;
import ListItem from '@material-ui/core/ListItem';
import IconButton from '@material-ui/core/IconButton';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ChatIcon from '@material-ui/icons/Chat';
import PeopleIcon from '@material-ui/icons/People';
import AssignmentIcon from '@material-ui/icons/Assignment';
import StorageIcon from '@material-ui/icons/Storage';

configure({ adapter: new Adapter() });

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useLocation: () => ({
        pathname: "localhost:8080/"
    })
}));

describe('<AppBar />', () => {
    test('testing component rendering', () => {
        const user = {
            fullName : 'John Doe',
            notifications : [
                {
                    _id : '1',
                    section : 'Users',
                    message : 'message 1',
                    date : new Date()
                },
                {
                    _id : '2',
                    section : 'Users',
                    message : 'message 2',
                    date : new Date()
                },
                {
                    _id : '3',
                    section : 'Tickets',
                    message : 'message 3',
                    date : new Date()
                }
            ]
        }

        const wrapper = shallow(<AppBar user = {user} />, { disableLifecycleMethods : true });

        expect(wrapper.find('.app-bar-profile-name').find('span').first().text()).toEqual(user.fullName);
        expect(wrapper.find(ListItem)).toHaveLength(3);
        expect(wrapper.find(Avatar)).toHaveLength(4);
        expect(wrapper.find(PeopleIcon)).toHaveLength(2);
        expect(wrapper.find(AssignmentIcon)).toHaveLength(1);
        expect(wrapper.find(IconButton)).toHaveLength(1);
        expect(wrapper.find(KeyboardArrowDownIcon)).toHaveLength(1);
        expect(wrapper.find(Menu)).toHaveLength(2);
        expect(wrapper.find(MenuItem)).toHaveLength(2);
    });

    test('testing button actions', () => {
        const wrapper = shallow(<AppBar />, { disableLifecycleMethods : true });
        const instance = wrapper.instance();

        instance.openNotifMenu = jest.fn();
        instance.openProfileMenu = jest.fn();
        instance.closeProfileMenu = jest.fn();
        instance.deleteNotifications = jest.fn();
        instance.logOut = jest.fn();

        wrapper.update();

        wrapper.find(IconButton).simulate('click');
        expect(instance.openNotifMenu).toHaveBeenCalled();

        wrapper.find('.app-bar-profile-name').simulate('click');
        expect(instance.openProfileMenu).toHaveBeenCalled();

        wrapper.find('.notifications-clear-all').simulate('click');
        expect(instance.deleteNotifications).toHaveBeenCalled();

        wrapper.find(MenuItem).at(0).simulate('click'); 
        expect(instance.closeProfileMenu).toHaveBeenCalled();
        
        wrapper.find(MenuItem).at(1).simulate('click'); 
        expect(instance.logOut).toHaveBeenCalled();
    });
});

describe('<Sections />', () => {
    test('testing component rendering with administrator', () => {
        const user = {
            role : 'Administrator',
        }

        const wrapper = shallow(<Sections user = {user} />, { disableLifecycleMethods : true });

        expect(wrapper.find(ChatIcon)).toHaveLength(1);
        expect(wrapper.find(PeopleIcon)).toHaveLength(1);
        expect(wrapper.find(AssignmentIcon)).toHaveLength(1);
        expect(wrapper.find(StorageIcon)).toHaveLength(1);
        expect(wrapper.find(ListItem)).toHaveLength(4);
    });

    test('testing component rendering with user', () => {
        const user = {
            role : 'User',
        }

        const wrapper = shallow(<Sections user = {user} />, { disableLifecycleMethods : true });

        expect(wrapper.find(ChatIcon)).toHaveLength(1);
        expect(wrapper.find(PeopleIcon)).toHaveLength(0);
        expect(wrapper.find(AssignmentIcon)).toHaveLength(1);
        expect(wrapper.find(StorageIcon)).toHaveLength(0);
        expect(wrapper.find(ListItem)).toHaveLength(2);
    });
});