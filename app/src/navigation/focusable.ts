import React, {ReactNode} from "react";
import ReactDOM from "react-dom";

import SpatialNavigation from './spatial-navigation';

export type FocusableProps = {
    children: ReactNode
    focusPath: string
    autoFocus?: boolean
    enabled?: boolean
    onEnterPressHandler?: () => void
}

export class Focusable extends React.Component<FocusableProps> {
    constructor(props: any) {
        super(props);
        this.addFocusable = this.addFocusable.bind(this)
    }

    addFocusable() {
        const {focusPath, onEnterPressHandler} = this.props;
        SpatialNavigation.addFocusable(
            ReactDOM.findDOMNode(this),
            {focusPath, onEnterPressHandler}
        );
    }

    removeFocusable() {
        const node = ReactDOM.findDOMNode(this) as HTMLElement
        node?.blur()
        SpatialNavigation.removeFocusable(
            node,
            {onEnterPressHandler: this.props.onEnterPressHandler}
        );
    }

    componentDidMount() {
        const {enabled = true, autoFocus} = this.props
        if (enabled) {
            this.addFocusable()
            if (autoFocus) {
                const node = ReactDOM.findDOMNode(this) as HTMLElement
                node?.focus()
            }
        }
    }

    componentDidUpdate(prevProps: Readonly<FocusableProps>, prevState: Readonly<{}>, snapshot?: any) {
        const {enabled = true} = this.props
        if (!enabled) {
            this.removeFocusable()
        } else {
            this.addFocusable()
        }
    }

    componentWillUnmount() {
        this.removeFocusable()
    }

    render() {
        return this.props.children
    }
}