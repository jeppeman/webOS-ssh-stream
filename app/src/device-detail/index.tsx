import React, {useCallback, useContext, useEffect, useRef, useState} from "react";
import {useRouteMatch} from "react-router";
import {
    Backdrop,
    CircularProgress,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    makeStyles,
    Typography
} from "@material-ui/core";
import {closeConnection, listFilesOnDevice, ListFilesOnDeviceResponsePayload, readFileOnDevice} from "../service";
import {Folder} from "@material-ui/icons";
import {Focusable} from "../navigation/focusable";
import {AppContext} from "../App";
import fetch from "isomorphic-fetch"

const useStyles = makeStyles({
    root: {
        padding: 40
    }
})

const FileSystemEntry: React.FunctionComponent<{
    onClick: () => void
    isDirectory: boolean
    name: string
}> = ({isDirectory, name, onClick}) => {
    return (
        <Focusable focusPath={name}>
            <ListItem button onClick={onClick}>
                <ListItemIcon>
                    {isDirectory && <Folder color="primary"/>}
                </ListItemIcon>
                <ListItemText><Typography>{name}</Typography></ListItemText>
            </ListItem>
        </Focusable>
    )
}

const DeviceDetail = ({}) => {
    const {params: {device}} = useRouteMatch<{ device: string }>()
    const [directoryStack, setDirectoryStack] = useState(["."])
    const [isLoading, setIsLoading] = useState(false)
    const classes = useStyles()
    const [files, setFiles] = useState<ListFilesOnDeviceResponsePayload>([])
    const {registerBackHandler, unregisterBackHandler} = useContext(AppContext)
    const videoRef = useRef<HTMLVideoElement>(null)
    const [url, setUrl] = useState<string>()

    useEffect(() => {
        setIsLoading(true)
        listFilesOnDevice({host: device, directory: directoryStack[directoryStack.length - 1]})
            .then(setFiles)
            .catch(error => {
                console.error(error)
            })
            .finally(() => setIsLoading(false))
        if (directoryStack.length > 1) {
            const backHandler = () => {
                setDirectoryStack(directoryStack.slice(0, directoryStack.length - 1))
                return true
            }
            registerBackHandler(backHandler)
            return () => {
                unregisterBackHandler(backHandler)
            }
        }
    }, [directoryStack.length])

    useEffect(() => {
        return () => {
            closeConnection({host: device}).then()
        }
    }, [])

    const readFile = useCallback((f: string) => {
        readFileOnDevice({host: device, file: f})
            .then(async x => {
                const bytesView = new Uint8Array(x.data)
                // const url = URL.createObjectURL(new Blob([bytesView]))
                videoRef.current!.load()
                // const source = document.createElement("source") as HTMLSourceElement
                // source.src = "./video.mp4"//url
                const y = await (fetch("./video.mp4").then(r => r.blob()))
                // source.src = url
                const url = URL.createObjectURL(y)
                const reader = new FileReader();
                reader.readAsDataURL(y);
                reader.onloadend = function() {
                    var base64data = reader.result;
                    console.log(base64data);
                    /*source.src = base64data as string
                    source.type = "video/mp4"*/
                    videoRef.current!.src = base64data as string
                    videoRef.current!.load()
                    videoRef.current!.play()
                    setUrl(url)
                }

                // console.log(new TextDecoder().decode(bytesView))
                console.log(url)
            })
            .catch(e => console.error(e))
    }, [])

    return (
        <div className={classes.root}>
            <Typography variant="h1">{device}</Typography>
            <List>
                {files.map(file => <FileSystemEntry
                    onClick={() => {
                        if (file.isDirectory) {
                            setDirectoryStack([...directoryStack, file.path])
                        } else {
                            readFile(file.path)
                        }
                    }}
                    key={file.name}
                    {...file}
                />)}
            </List>
            <Backdrop style={{background: "transparent"}} open={isLoading}>
                <CircularProgress/>
            </Backdrop>
            <div style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: !!url ? "100%" : 0,
                height: !!url ? "100%" : 0
            }}>
                <video
                    autoPlay
                    crossOrigin="anonymous"
                    width={!!url ? window.innerWidth : 0}
                    height={!!url ? window.innerHeight : 0}
                    controls
                    ref={videoRef}>
                    {/*<source type="video/mp4" src="./video.mp4"/>*/}
                </video>
            </div>
        </div>
    )
}

export default DeviceDetail