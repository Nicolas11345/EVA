import React from 'react';
import Axios from 'axios';
import { connect } from 'react-redux'
import { getUser } from '../store/store'
import _ from "lodash"
import TicketPage from './utils/TicketPage';
import { isEmpty, formatDate } from '../utils'

import Grid from '@material-ui/core/Grid';
import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import {
    Switch,
    Route,
    withRouter
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

export class Tickets extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            tickets : [],
            option : 0,
            page : 0,
            rowsPerPage : 5
        }
    }

    componentDidMount(){
        this.getTickets();
    }

    getTickets(){
        axios.get('/tickets')
            .then(res => {
                if (res.data.length > 0) {
                    this.setState({
                        tickets : res.data
                    });
                }
            })
            .catch(err => {
                console.log("Something went wrong!", err);
            })
    }

    setOption(event){
        this.setState({
            option : event.target.value,
          })
    }

    changePage(event, page){
        this.setState({
            page : page
        });
    }

    changeRowsPerPage(event){
        let rowsPerPage = event.target.value;
        this.setState({
            rowsPerPage : rowsPerPage
        });
    }

    render(){
        let { path, url } = this.props.match;
        let tickets = this.state.tickets;
        let count = tickets.length;
        let page = this.state.page;
        let rowsPerPage = this.state.rowsPerPage;

        if (this.state.option === 1) {
            let ticketsSubmitter = tickets.filter((ticket) => ticket.submitter._id === this.props.user._id);
            let ticketsAssignee = tickets.filter((ticket) => isEmpty(ticket.assignee) ? false : ticket.assignee._id === this.props.user._id);
            tickets = ticketsSubmitter.concat(ticketsAssignee);
        }
        tickets = tickets.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((ticket) => {
            let assignee = ticket.assignee || {};
            return(
                <TableRow key={ticket._id} onClick={() => this.props.history.push(`${url}/${ticket._id}`)} hover={true} className="app-table-row">
                    <TableCell style={{ width: "20%", }}>{ticket.title}</TableCell>
                    <TableCell align="right" style={{ width: "16%", }}>{ticket.submitter.fullName}</TableCell>
                    <TableCell align="right" style={{ width: "16%", }}>{formatDate(ticket.created)}</TableCell>
                    <TableCell align="right" style={{ width: "16%", }}>{assignee.fullName || "None"}</TableCell>
                    <TableCell align="right" style={{ width: "16%", }}>{ticket.priority}</TableCell>
                    <TableCell align="right" style={{ width: "16%", }}>{ticket.status}</TableCell>
                </TableRow>
            )
        });

        return(
            <Switch>
                <Route path={`${path}/:id`}>
                    <TicketPage previousPage = {url} onChange = {() => this.getTickets()} />
                </Route>

                <Route exact path={path}>
                    <Grid container spacing={4}>
                        <Grid item xs={12}>
                            <FormControl>
                                <InputLabel id="tickets-select-label">Tickets</InputLabel>
                                <Select labelId="tickets-select-label" id="tickets-select" value={this.state.option} label="Tickets"
                                onChange = {(event) => this.setOption(event)}>
                                    <MenuItem key="All tickets" value={0}>All tickets</MenuItem>
                                    <MenuItem key="My tickets" value={1}>My tickets</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>  
                            <TableContainer>
                                <Table className="app-table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell style={{ width: "20%", }}>Title</TableCell>
                                            <TableCell align="right" style={{ width: "16%", }}>Submitter</TableCell>
                                            <TableCell align="right" style={{ width: "16%", }}>Created</TableCell>
                                            <TableCell align="right" style={{ width: "16%", }}>Assignee</TableCell>
                                            <TableCell align="right" style={{ width: "16%", }}>Priority</TableCell>
                                            <TableCell align="right" style={{ width: "16%", }}>Status</TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {tickets}
                                    </TableBody>

                                    <TableFooter>
                                        <TableRow>
                                            <TablePagination rowsPerPageOptions={[5, 10, 25]} count={count}
                                                rowsPerPage={rowsPerPage} page={page}
                                                onChangePage={(event, page) => this.changePage(event, page)} 
                                                onChangeRowsPerPage={(event) => this.changeRowsPerPage(event)} />
                                        </TableRow>
                                    </TableFooter>
                                </Table>
                            </TableContainer>
                        </Grid> 
                    </Grid>
                </Route>
            </Switch>  
        );
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Tickets));