import {createTheme} from "@material-ui/core";

export const theme = createTheme({
    typography: {
        fontSize: 14,
        fontFamily: "Munken Sans",
    },
    palette: {
        primary: {
            main: '#4AD0EC',
            dark: '#4AD0EC',
            light: '#4AD0EC',
            contrastText: '#e0e0e0'
        },
        secondary: {
            main: '#A48652',
            dark: '#93784a',
            light: '#b09260',
            contrastText: '#e0e0e0'
        },
        background: {
            default: '#262626',
            paper: '#262626'
        },
        text: {
            primary: "#e0e0e0",
            secondary: "#e0e0e0"
        },
        error: {
            main: "#990000"
        }
    }
})