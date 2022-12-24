import React, {ReactNode} from "react";
import SpatialNavigation from './spatial-navigation';

class Navigable extends React.Component<{
    children: ReactNode
}, { currentFocusPath: string }> {
    state = {currentFocusPath: ""}
    constructor(props: any) {
        super(props);
        this.setFocus = this.setFocus.bind(this)
    }

    setFocus(focusPath: string, overwriteFocusPath?: string) {
        const newFocusPath = overwriteFocusPath || focusPath;
        if (this.state.currentFocusPath !== newFocusPath) {
            SpatialNavigation.setCurrentFocusedPath(newFocusPath);
            this.setState({currentFocusPath: newFocusPath})
        }
    }

    componentDidMount() {
        SpatialNavigation.init(this.setFocus)
    }

    componentDidUpdate() {
        SpatialNavigation.init(this.setFocus)
    }

    componentWillUnmount() {
        SpatialNavigation.destroy()
    }

    render() {
        return this.props.children
    }
}

export default Navigable;