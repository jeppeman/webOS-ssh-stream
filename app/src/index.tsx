import ReactDOM from "react-dom";
import React from "react";
import App from "./App";
import {CssBaseline, MuiThemeProvider} from "@material-ui/core";
import {theme} from "../theme";
import {Router} from "react-router";
import {createMemoryHistory} from "history";

ReactDOM.render(
    <Router history={createMemoryHistory()}>
        <MuiThemeProvider theme={theme}>
            <CssBaseline />
            <App/>
        </MuiThemeProvider>
    </Router>,
    document.querySelector('#root')
);
