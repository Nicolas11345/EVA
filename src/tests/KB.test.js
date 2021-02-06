import React from 'react';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { KB, SeeKB, NewKnowledge, ImportExcel } from '../components/KB'

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import ListItem from '@material-ui/core/ListItem';
import StorageIcon from '@material-ui/icons/Storage';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import DescriptionIcon from '@material-ui/icons/Description';
import Table from '@material-ui/core/Table';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Snackbar from '@material-ui/core/Snackbar';

import {
    Route,
} from "react-router-dom";

configure({ adapter: new Adapter() });

describe('<KB />', () => {
    test('testing component rendering', () => {
        const match = {
            url : 'url',
            route : 'route'
        }

        const wrapper = shallow(<KB match = {match} />, { disableLifecycleMethods : true });

        expect(wrapper.find(Route)).toHaveLength(2);
        expect(wrapper.find(ListItem)).toHaveLength(3);
        expect(wrapper.find(StorageIcon)).toHaveLength(1);
        expect(wrapper.find(AddCircleIcon)).toHaveLength(1);
        expect(wrapper.find(DescriptionIcon)).toHaveLength(1);

        wrapper.setState({ page : 0 });

        expect(wrapper.find(SeeKB)).toHaveLength(1);
        expect(wrapper.find(NewKnowledge)).toHaveLength(0);
        expect(wrapper.find(ImportExcel)).toHaveLength(0);

        wrapper.setState({ page : 1 });

        expect(wrapper.find(SeeKB)).toHaveLength(0);
        expect(wrapper.find(NewKnowledge)).toHaveLength(1);
        expect(wrapper.find(ImportExcel)).toHaveLength(0);

        wrapper.setState({ page : 2 });

        expect(wrapper.find(SeeKB)).toHaveLength(0);
        expect(wrapper.find(NewKnowledge)).toHaveLength(0);
        expect(wrapper.find(ImportExcel)).toHaveLength(1);
    });

    test('testing button actions', () => {
        const match = {
            url : 'url',
            route : 'route'
        }

        const wrapper = shallow(<KB match = {match} />, { disableLifecycleMethods : true });
        const instance = wrapper.instance();

        expect(instance.state.page).toEqual(0);

        wrapper.find(ListItem).at(0).simulate('click'); 
        expect(instance.state.page).toEqual(0);

        wrapper.find(ListItem).at(1).simulate('click'); 
        expect(instance.state.page).toEqual(1);

        wrapper.find(ListItem).at(2).simulate('click'); 
        expect(instance.state.page).toEqual(2);
    });
});

describe('<SeeKB />', () => {
    test('testing component rendering', () => {
        const kb = [
            {
                _id : '1',
                name : 'Name 1',
                answer : 'Answer 1'

            },
            {
                _id : '2',
                name : 'Name 2',
                answer : 'Answer 2'

            },
            {
                _id : '3',
                name : 'Name 3',
                answer : 'Answer 3'

            }
        ]

        const wrapper = shallow(<SeeKB kb = {kb} />, { disableLifecycleMethods : true });

        expect(wrapper.find(Table)).toHaveLength(1);
        expect(wrapper.find(TableRow)).toHaveLength(5);
        expect(wrapper.find(TableRow).at(1).find(TableCell).first().text()).toEqual(kb[0].name);
    });
});

describe('<NewKnowledge />', () => {
    test('testing component rendering - Text', () => {
        const wrapper = shallow(<NewKnowledge />, { disableLifecycleMethods : true });

        wrapper.setState({ answerType : "Text" });

        expect(wrapper.find(TextField)).toHaveLength(3);
        expect(wrapper.find(FormControl)).toHaveLength(1);
        expect(wrapper.find(Select)).toHaveLength(1);
        expect(wrapper.find(MenuItem)).toHaveLength(2);
        expect(wrapper.find(Button)).toHaveLength(1);
        expect(wrapper.find(Snackbar)).toHaveLength(1);
    });

    test('testing component rendering - File', () => {
        const wrapper = shallow(<NewKnowledge />, { disableLifecycleMethods : true });

        wrapper.setState({ answerType : "File" });

        expect(wrapper.find(TextField)).toHaveLength(2);
        expect(wrapper.find(FormControl)).toHaveLength(1);
        expect(wrapper.find(Select)).toHaveLength(1);
        expect(wrapper.find(MenuItem)).toHaveLength(2);
        expect(wrapper.find(Button)).toHaveLength(2);
        expect(wrapper.find(Snackbar)).toHaveLength(1);
    });

    test('testing button actions', () => {
        const wrapper = shallow(<NewKnowledge />, { disableLifecycleMethods : true });

        wrapper.setState({ answerType : "File" });

        const instance = wrapper.instance();

        instance.changeAnswerType = jest.fn();
        instance.handleFile = jest.fn();
        instance.send = jest.fn();

        wrapper.update();

        wrapper.find(Select).simulate('change');
        expect(instance.changeAnswerType).toHaveBeenCalled();

        wrapper.find('#answer-file-input').simulate('change');
        expect(instance.handleFile).toHaveBeenCalled();

        wrapper.find(Button).at(1).simulate('click'); 
        expect(instance.send).toHaveBeenCalled();
    });
});

describe('<ImportExcel />', () => {
    test('testing component rendering', () => {
        const wrapper = shallow(<ImportExcel />, { disableLifecycleMethods : true });

        expect(wrapper.find(Button)).toHaveLength(2);
        expect(wrapper.find(Snackbar)).toHaveLength(1);
    });

    test('testing button action', () => {
        const wrapper = shallow(<ImportExcel />, { disableLifecycleMethods : true });

        const instance = wrapper.instance();

        instance.handleFile = jest.fn();
        instance.import = jest.fn();

        wrapper.update();

        wrapper.find('#excel-file-input').simulate('change'); 
        expect(instance.handleFile).toHaveBeenCalled();

        wrapper.find(Button).at(1).simulate('click'); 
        expect(instance.import).toHaveBeenCalled();
    });
});