import React from 'react';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { Profile, ProfileInfo, PasswordReset } from '../components/Profile'

import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import ListItem from '@material-ui/core/ListItem';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import LockIcon from '@material-ui/icons/Lock';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import Snackbar from '@material-ui/core/Snackbar';

configure({ adapter: new Adapter() });

describe('<Profile />', () => {
    test('testing component rendering', () => {
        const wrapper = shallow(<Profile />, { disableLifecycleMethods : true });

        expect(wrapper.find(ListItem)).toHaveLength(3);
        expect(wrapper.find(AccountCircleIcon)).toHaveLength(1);
        expect(wrapper.find(LockIcon)).toHaveLength(1);
        expect(wrapper.find(ExitToAppIcon)).toHaveLength(1);

        wrapper.setState({ page : 0 });

        expect(wrapper.find(ProfileInfo)).toHaveLength(1);
        expect(wrapper.find(PasswordReset)).toHaveLength(0);

        wrapper.setState({ page : 1 });

        expect(wrapper.find(ProfileInfo)).toHaveLength(0);
        expect(wrapper.find(PasswordReset)).toHaveLength(1);
    });

    test('testing button actions', () => {
        const wrapper = shallow(<Profile />, { disableLifecycleMethods : true });
        const instance = wrapper.instance();

        expect(instance.state.page).toEqual(0);

        instance.logOut = jest.fn();

        wrapper.update();

        wrapper.find(ListItem).at(2).simulate('click'); 
        expect(instance.logOut).toHaveBeenCalled();

        wrapper.find(ListItem).at(1).simulate('click'); 
        expect(instance.state.page).toEqual(1);

        wrapper.find(ListItem).at(0).simulate('click'); 
        expect(instance.state.page).toEqual(0);
    });
});

describe('<ProfileInfo />', () => {
    test('testing component rendering', () => {
        const user = {
            firstName : 'John',
            lastName : 'Doe',
            fullName : 'John Doe',
            email : 'johndoe@gmail.com',
            role : 'Administrator',
            avatar : ''
        }

        const wrapper = shallow(<ProfileInfo user = {user} />, { disableLifecycleMethods : true });

        expect(wrapper.find(Avatar)).toHaveLength(1);
        expect(wrapper.find(IconButton)).toHaveLength(1);
        expect(wrapper.find(EditIcon)).toHaveLength(1);
        expect(wrapper.find(Dialog)).toHaveLength(1);
        expect(wrapper.find(Dialog).find(TextField)).toHaveLength(3);
        expect(wrapper.find('.app-card-text').at(0).find('span').text()).toEqual(user.firstName);
        expect(wrapper.find('.app-card-text').at(1).find('span').text()).toEqual(user.lastName);
        expect(wrapper.find('.app-card-text').at(2).find('span').text()).toEqual(user.email);
        expect(wrapper.find('.app-card-text').at(3).find('span').text()).toEqual(user.role);
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

        const wrapper = shallow(<ProfileInfo user = {user}/>, { disableLifecycleMethods : true });
        const instance = wrapper.instance();

        instance.openDialog = jest.fn();
        instance.closeDialog = jest.fn();
        instance.handleFile = jest.fn();
        instance.editProfile = jest.fn();

        wrapper.update();

        wrapper.find(IconButton).simulate('click'); 
        expect(instance.openDialog).toHaveBeenCalled();

        wrapper.find(Dialog).find('#avatar-file-input').simulate('change'); 
        expect(instance.handleFile).toHaveBeenCalled();

        wrapper.find(Dialog).find(DialogActions).find(Button).at(0).simulate('click'); 
        expect(instance.closeDialog).toHaveBeenCalled();

        wrapper.find(Dialog).find(DialogActions).find(Button).at(1).simulate('click');  
        expect(instance.editProfile).toHaveBeenCalled();
    });
});

describe('<PasswordReset />', () => {
    test('testing component rendering', () => {
        const wrapper = shallow(<PasswordReset />, { disableLifecycleMethods : true });

        expect(wrapper.find(TextField)).toHaveLength(3);
        expect(wrapper.find(Button)).toHaveLength(1);
        expect(wrapper.find(Snackbar)).toHaveLength(1);
    });

    test('testing button actions', () => {
        const wrapper = shallow(<PasswordReset />, { disableLifecycleMethods : true });
        const instance = wrapper.instance();

        instance.resetPassword = jest.fn();

        wrapper.update();

        wrapper.find(Button).simulate('click'); 
        expect(instance.resetPassword).toHaveBeenCalled();
    });
});