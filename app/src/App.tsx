import React, {useCallback, useEffect, useState} from "react";
import {CSSTransition, TransitionGroup} from "react-transition-group";
import {Route, Switch, useHistory, useLocation} from "react-router-dom";
import {DeviceList} from "./device-list";
import DeviceDetail from "./device-detail";
import Navigable from "./navigation/navigable";
import {makeStyles} from "@material-ui/core";

const useStyles = makeStyles({
    root: {
        display: 'flex',
        "& div.transition-group": {
            position: "relative"
        },
        "& section.route-section": {
            position: "absolute",
            width: "100vw",
            top: 0,
            left: 0
        }
    }
});

export type AppContextType = {
    registerBackHandler: (handler: () => boolean) => void
    unregisterBackHandler: (handler: () => boolean) => void
}
export const AppContext = React.createContext<AppContextType>({
    registerBackHandler: () => null,
    unregisterBackHandler: () => null
})

const App = () => {
    const location = useLocation();
    const history = useHistory();
    const classes = useStyles();
    const [backHandlers, setBackHandlers] = useState<(() => boolean)[]>([])

    const registerBackHandler = useCallback((handler: () => boolean) => {
        setBackHandlers([...backHandlers, handler])
    }, [backHandlers])

    const unregisterBackHandler = useCallback((handler: () => boolean) => {
        setBackHandlers(backHandlers.filter(h => h !== handler))
    }, [backHandlers])

    useEffect(() => {
        const listener = (evt: any) => {
            if (evt.keyCode === 461) {
                const backWasHandled = backHandlers.some(h => h())
                if (!backWasHandled) {
                    if (history.length <= 1) {
                        webOS.platformBack()
                    } else {
                        history.goBack()
                    }
                }
            }
        }
        window.addEventListener("keydown", listener)

        return () => {
            window.removeEventListener("keydown", listener)
        }
    }, [backHandlers.length])

    return (
        <AppContext.Provider value={{registerBackHandler, unregisterBackHandler}}>
            <Navigable>
                <div className={classes.root}>
                    <TransitionGroup className="transition-group" style={{width: "100%"}}>
                        <CSSTransition key={location.pathname} classNames={"fade"} timeout={250}>
                            <section className="route-section" style={{width: "100%"}}>
                                <Switch location={location}>
                                    <Route exact path='/' component={DeviceList}/>
                                    <Route exact path='/device/:device' component={DeviceDetail}/>
                                </Switch>
                            </section>
                        </CSSTransition>
                    </TransitionGroup>
                </div>
            </Navigable>
        </AppContext.Provider>

    )
}

export default App