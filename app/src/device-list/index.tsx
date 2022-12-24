import React, {useCallback, useEffect, useState} from "react";
import {connectToDevice, findDevicesOnNetwork} from "../service";
import {
    Backdrop,
    Button, Checkbox,
    CircularProgress,
    InputBaseComponentProps,
    List,
    ListItem, ListItemIcon,
    ListItemProps,
    ListItemText,
    makeStyles,
    TextField,
    Typography
} from "@material-ui/core";
import {Modal} from "../Modal";
import {useHistory} from "react-router-dom";
import {Focusable} from "../navigation/focusable";
import {useStorage} from "../use-storage";

const useStyles = makeStyles({
    root: {
        padding: 40
    },
    modalTitle: {
        marginBottom: 30
    },
    modalInput: {
        marginBottom: 10
    },
    modalSubmit: {
        marginTop: 10
    }
})

const Device: React.FunctionComponent<Omit<ListItemProps<"div">, "button"> & {
    device: string
    focusEnabled: boolean
    focusPath: string
}> = ({device, focusEnabled, focusPath, ...props}) => {
    return (
        <Focusable enabled={focusEnabled} focusPath={focusPath}>
            <ListItem button {...props}>
                <ListItemText><Typography>{device}</Typography></ListItemText>
            </ListItem>
        </Focusable>
    )
}

const DeviceToConnectTo: React.FunctionComponent<{
    device: string
    classes: ReturnType<typeof useStyles>
}> = ({device, classes}) => {
    const history = useHistory()
    const {get, set, clear} = useStorage<{ username: string, password: string }>(`${device}_credentials`)
    const [username, setUsername] = useState(get()?.username || "")
    const [password, setPassword] = useState(get()?.password || "")
    const [isLoading, setIsLoading] = useState(false)
    const [rememberCredentials, setRememberCredentials] = useState(false)

    useEffect(() => {
        if (username && password) {
            connect().then()
        }
    }, [])

    const connect = useCallback(async () => {
        if (isLoading) return
        setIsLoading(true)
        try {
            console.log(`Trying to connect to ${device}...`)
            await connectToDevice({host: device, username, password})
            set({username, password})
            console.log(`Successfully connected to ${device}`)
            history.push(`/device/${device}`)
        } catch (e) {
            clear()
            console.error(e)
        } finally {
            setIsLoading(false)
        }
    }, [username, password, isLoading])

    return (
        <div style={{
            display: "flex",
            flexDirection: "column"
        }}>
            <Typography
                className={classes.modalTitle}
                variant="h4">
                Connect to {device}
            </Typography>
            <TextField
                className={classes.modalInput}
                id="username"
                label="Username"
                InputProps={{inputComponent: FocusableInput, autoFocus: true}}
                onChange={e => setUsername(e.currentTarget.value)}
                variant="outlined"/>
            <TextField
                className={classes.modalInput}
                id="password"
                InputProps={{inputComponent: FocusableInput}}
                label="Password"
                onChange={e => setPassword(e.currentTarget.value)}
                variant="outlined"/>

            <div style={{display: "flex", alignItems: "center",}}>
                <Focusable focusPath="connect-remember-credentials">
                    <Checkbox
                        color="primary"
                        checked={rememberCredentials}
                        onChange={(_, value) => setRememberCredentials(value)}/>
                </Focusable>
                <Typography onClick={() => setRememberCredentials(!rememberCredentials)}>Remember
                    credentials</Typography>
            </div>
            <Focusable focusPath="connect-to-device-submit">
                <Button
                    className={classes.modalSubmit}
                    variant="outlined"
                    color="primary"
                    onClick={connect}>
                    {isLoading ? <CircularProgress size={24}/> : "Connect"}
                </Button>
            </Focusable>
        </div>
    )
}

const FocusableInput: React.FunctionComponent<InputBaseComponentProps> = (
    {id, inputRef, ...props}
) => <Focusable focusPath={id!}><input ref={inputRef} id={id} {...props}/></Focusable>

export const DeviceList: React.FunctionComponent<{}> = () => {
    const classes = useStyles()
    const [deviceToConnectTo, setDeviceToConnectTo] = useState<string>()
    const [isLoading, setIsLoading] = useState(true)
    const [modalVisible, setModalVisible] = useState(false)
    const [devices, setDevices] = useState<string[]>([])

    useEffect(() => {
        findDevicesOnNetwork()
            .then(setDevices)
            .catch(error => console.error(error))
            .finally(() => setIsLoading(false))
    }, [])

    useEffect(() => {
        if (!!deviceToConnectTo) {
            setModalVisible(true)
        } else {
            setModalVisible(false)
        }
    }, [deviceToConnectTo])

    return (
        <div className={classes.root}>
            <Typography variant="h1">Chichi</Typography>
            <List>
                {devices.map((device, i) =>
                    <Device
                        key={`${device}_${i}`}
                        focusEnabled={!(!!deviceToConnectTo)}
                        focusPath={`${device}_${i}`}
                        tabIndex={i + 1}
                        onClick={() => setDeviceToConnectTo(device)}
                        device={device}/>)
                }
            </List>
            <Backdrop
                style={{background: "transparent"}}
                open={isLoading}>
                <CircularProgress/>
            </Backdrop>
            <Modal
                onClose={() => setDeviceToConnectTo(undefined)}
                open={modalVisible}>
                {deviceToConnectTo && <DeviceToConnectTo
                    classes={classes}
                    device={deviceToConnectTo}/>
                }
            </Modal>
        </div>
    )
}