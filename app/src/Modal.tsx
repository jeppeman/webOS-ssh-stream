import React, {ReactNode, useEffect} from "react";
import {ClickAwayListener, IconButton} from "@material-ui/core";
import {Close} from "@material-ui/icons";
import {Focusable} from "./navigation/focusable";

export const Modal: React.FunctionComponent<{
    open: boolean
    children: ReactNode
    onClose: () => void
}> = ({open, children, onClose}) => {

    useEffect(() => {
        const listener = (e:any) => {
            console.log(e)
        }

        document.addEventListener("keyboardStateChange", listener)

        return () => {
            document.removeEventListener("keyboardStateChange", listener)
        }
    }, [])

    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: open ? "100%" : 0,
            height: open ? window.outerHeight : 0,
            opacity: open ? 1 : 0,
            transition: "opacity 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.5)"
        }}>
            {children && <ClickAwayListener onClickAway={() => onClose()}>
                <div style={{
                    padding: 10,
                    background: "#262626",
                    minWidth: 600,
                    position: "relative"
                }}>
                    <Focusable focusPath="modal-close">
                        <IconButton
                            color="primary"
                            onClick={() => onClose()}
                            style={{position: "absolute", top: 0, right: 0}}>
                            <Close />
                        </IconButton>
                    </Focusable>
                    {children}
                </div>
            </ClickAwayListener>}
        </div>

    )
}