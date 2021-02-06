import React from 'react';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { Tickets } from '../components/Tickets'

import Table from '@material-ui/core/Table';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import {
    Route,
} from "react-router-dom";

configure({ adapter: new Adapter() });

describe('<Tickets />', () => {
    test('testing component rendering', () => {
        const submitter1 = {
            _id : '1',
            fullName : 'John Doe'
        }

        const submitter2 = {
            _id : '2',
            fullName : 'John2 Doe2'
        }

        const assignee1 = {
            _id : '1',
            fullName : 'John Doe'
        }

        const assignee2 = {
            _id : '2',
            fullName : 'John2 Doe2'
        }

        const match = {
            url : 'url',
            route : 'route'
        }

        let tickets = [
            {
                _id : '1',
                title : 'Title 1',
                submitter : submitter1,
                assignee : assignee2,
                priority : 'Normal',
                status : 'Open',
                created : new Date()
            },
            {
                _id : '2',
                title : 'Title 2',
                submitter : submitter2,
                assignee : assignee1,
                priority : 'High',
                status : 'Open',
                created : new Date()
            },
            {
                _id : '3',
                title : 'Title 3',
                submitter : submitter2,
                assignee : assignee2,
                priority : 'Low',
                status : 'Closed',
                created : new Date()
            }
        ]

        const wrapper = shallow(<Tickets user = {submitter1} match = {match} />, { disableLifecycleMethods : true });

        wrapper.setState({ tickets : tickets });
        wrapper.setState({ option : 0 });

        expect(wrapper.find(Route)).toHaveLength(2);
        expect(wrapper.find(FormControl)).toHaveLength(1);
        expect(wrapper.find(Select)).toHaveLength(1);
        expect(wrapper.find(MenuItem)).toHaveLength(2);
        expect(wrapper.find(Table)).toHaveLength(1);
        expect(wrapper.find(TableRow)).toHaveLength(5);
        expect(wrapper.find(TableRow).at(1).find(TableCell).first().text()).toEqual(tickets[0].title);

        wrapper.setState({ option : 1 });

        expect(wrapper.find(TableRow)).toHaveLength(4);
        expect(wrapper.find(TableRow).at(1).find(TableCell).first().text()).toEqual(tickets[0].title);
    });
});