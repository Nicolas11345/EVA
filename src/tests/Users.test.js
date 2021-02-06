import React from 'react';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { Users, User } from '../components/Users'

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import SearchIcon from '@material-ui/icons/Search'
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import MenuItem from '@material-ui/core/MenuItem';
import Dialog from '@material-ui/core/Dialog';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormLabel from '@material-ui/core/FormLabel';

configure({ adapter: new Adapter() });

describe('<Users />', () => {
    test('testing component rendering', () => {
        const users = [
            {
                _id : '1'
            },
            {
                _id : '2'
            },
            {
                _id : '3'
            }
        ]

        const wrapper = shallow(<Users user = {{_id : 'id'}} />, { disableLifecycleMethods : true });

        wrapper.setState({ usersFiltered : users });

        expect(wrapper.find(User)).toHaveLength(3);
        expect(wrapper.find(Dialog)).toHaveLength(1);
        expect(wrapper.find(SearchIcon)).toHaveLength(1);
        expect(wrapper.find(Button)).toHaveLength(3);
        expect(wrapper.find(TextField)).toHaveLength(5);
    });

    test('testing button actions', () => {
        const wrapper = shallow(<Users user = {{_id : 'id'}} />, { disableLifecycleMethods : true });
        const instance = wrapper.instance();

        instance.openDialog = jest.fn();
        instance.closeDialog = jest.fn();
        instance.addUser = jest.fn();
        instance.search = jest.fn();

        wrapper.update();

        wrapper.find(Button).at(0).simulate('click'); 
        expect(instance.openDialog).toHaveBeenCalled();

        wrapper.find(Button).at(1).simulate('click'); 
        expect(instance.closeDialog).toHaveBeenCalled();

        wrapper.find(Button).at(2).simulate('click'); 
        expect(instance.addUser).toHaveBeenCalled();

        wrapper.find(TextField).last().simulate('change'); 
        expect(instance.search).toHaveBeenCalled();   
    });
});

describe('<User />', () => {
    test('testing component rendering', () => {
        const user = {
            firstName : 'John',
            lastName : 'Doe',
            fullName : 'John Doe',
            email : 'johndoe@gmail.com',
            role : 'Administrator',
            avatar : ''
        }

        const wrapper = shallow(<User user = {user} />, { disableLifecycleMethods : true });

        expect(wrapper.find(Avatar)).toHaveLength(1);
        expect(wrapper.find(IconButton)).toHaveLength(1);
        expect(wrapper.find(MoreVertIcon)).toHaveLength(1);
        expect(wrapper.find(MenuItem)).toHaveLength(2);
        expect(wrapper.find(Dialog)).toHaveLength(2);
        expect(wrapper.find(FormLabel)).toHaveLength(1);
        expect(wrapper.find(RadioGroup)).toHaveLength(1);
        expect(wrapper.find(Button)).toHaveLength(4);
    });

    test('testing button actions', () => {
        const user = {
            firstName : 'John',
            lastName : 'Doe',
            fullName : 'John Doe',
            email : 'johndoe@gmail.com',
            role : 'Administrator',
            avatar : ''
        }
        
        const wrapper = shallow(<User user = {user} />, { disableLifecycleMethods : true });
        const instance = wrapper.instance();

        instance.openMenu = jest.fn();
        instance.openRoleDialog = jest.fn();
        instance.closeRoleDialog = jest.fn();
        instance.openDeleteDialog = jest.fn();
        instance.closeDeleteDialog = jest.fn();
        instance.changeSelectedRole = jest.fn();
        instance.changeRole = jest.fn();
        instance.deleteUser = jest.fn();

        wrapper.update();

        wrapper.find(IconButton).simulate('click'); 
        expect(instance.openMenu).toHaveBeenCalled();

        wrapper.find(MenuItem).at(0).simulate('click'); 
        expect(instance.openRoleDialog).toHaveBeenCalled();

        wrapper.find(MenuItem).at(1).simulate('click'); 
        expect(instance.openDeleteDialog).toHaveBeenCalled();

        wrapper.find(RadioGroup).simulate('change'); 
        expect(instance.changeSelectedRole).toHaveBeenCalled();

        wrapper.find(Button).at(0).simulate('click'); 
        expect(instance.closeRoleDialog).toHaveBeenCalled();

        wrapper.find(Button).at(1).simulate('click'); 
        expect(instance.changeRole).toHaveBeenCalled();

        wrapper.find(Button).at(2).simulate('click'); 
        expect(instance.closeDeleteDialog).toHaveBeenCalled();

        wrapper.find(Button).at(3).simulate('click'); 
        expect(instance.deleteUser).toHaveBeenCalled();

        
    });
});