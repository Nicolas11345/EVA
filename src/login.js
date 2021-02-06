import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { isEmpty } from './utils'

import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    root: {
        height: '100vh',
    },
    image: {
        backgroundImage: 'url(https://source.unsplash.com/random)',
        backgroundRepeat: 'no-repeat',
        backgroundColor:
        theme.palette.type === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    },
    paper: {
        margin: theme.spacing(8, 4),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
}));

export function SignInSide() {
    const classes = useStyles();
    const [emailError, setEmailError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);

    function login(){
        let email = $("#email").val();
        let password = $("#password").val();
    
        if (isEmpty(email) || isEmpty(password)) {
            alert("Please fill in all fields");
            return;
        }
    
        let login = {
            email : email,
            password : password,
        }
    
        axios.post('/login/', login)
            .then(res => {
                if (res.data === "Invalid email") {
                    setEmailError(true);
                    setPasswordError(false);
                } else if (res.data === "Invalid password") {
                    setEmailError(false);
                    setPasswordError(true);
                } else if (res.data === "Login successful") {
                    setEmailError(false);
                    setPasswordError(false);
                    window.location="/";
                }
            })
            .catch(err => {
                console.log("Something went wrong!", err);
            })
    }

    function demoLogin(){    
        axios.get('/demo')
            .then(res => {
                window.location="/";
            })
            .catch(err => {
                console.log("Something went wrong!", err);
            })
    }

    return (
        <Grid container component="main" className={classes.root}>
            <CssBaseline />
            <Grid item xs={false} sm={4} md={7} className={classes.image} />
            <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                <div className={classes.paper}>
                    <Avatar className={classes.avatar}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Sign in
                    </Typography>
                    <div className={classes.form}>
                        <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        error={emailError ? true : false}
                        helperText={emailError ? "Invalid Email" : ""}
                        />
                        <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        error={passwordError ? true : false}
                        helperText={passwordError ? "Invalid Password" : ""}
                        />
                        <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                        onClick={() => login()}
                        >
                        Sign In
                        </Button>
                        <Grid container>
                            <Grid item xs>
                                <Link href="#" variant="body2" onClick={() => demoLogin()}>
                                Sign in as a Demo User
                                </Link>
                            </Grid>
                        </Grid>
                    </div>
                </div>
            </Grid>
        </Grid>
    );
}

ReactDOM.render(<SignInSide />, document.getElementById('login'));