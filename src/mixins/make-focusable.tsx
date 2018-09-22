import * as React from "react";
import { ConstrainFocusService } from "../constrain-focus/constrain-focus";
import { findDOMNode } from "react-dom";
import { PhocusContext } from "./make-focus-context";

export interface FocusProps {
  focused?: boolean;
  stealFocus?: () => void;
  autofocus?: boolean;
  mouseOverFocus?: boolean;
  clickFocus?: boolean;
  context?: string;
  tabIndex?: number;
}

export function makeFocusable<P, S={}>(
  Comp: React.ComponentClass<P, S>,
  contextName?: string
) {
  return class Phocusable extends PhocusContext<P & FocusProps, S> {
    contextName = contextName;
    newFocus: boolean = false;
    ref = React.createRef<any>();

    componentDidMount() {
      const dom: any = findDOMNode(this);
      if (!dom) return; // TODO handle string case?
      if (this.props.focused || this.props.autofocus) {
        dom.focus();
      }
      dom.addEventListener("focus", this.onFocus);
      dom.addEventListener("mouseover", this.onMouseOver);
      dom.addEventListener("mousedown", this.onMouseDown);
    }

    componentWillReceiveProps(props: FocusProps) {
      if (!this.props.focused && props.focused) {
        this.newFocus = true;
      }
    }

    componentDidUpdate() {
      if (this.newFocus) {
        this.newFocus = false;
        const dom = findDOMNode(this);
        if (!dom) return;
        if (ConstrainFocusService.focusable(dom as HTMLElement)) {
          (dom as any).focus();
          this.focus();
        }
      }
    }

    focus = () => {
      if (this.props.stealFocus && !this.props.focused) {
        this.props.stealFocus();
      } else {
        this.setContext();
      }
    };

    onFocus = (e: FocusEvent) => {
      if (e.target !== findDOMNode(this)) return;
      this.focus();
    };

    onMouseOver = (e: MouseEvent) => {
      if (!this.props.mouseOverFocus) return;
      const dom: any = findDOMNode(this);
      if (!dom) return; // TODO handle string case?
      dom.focus();
      e.stopPropagation();
    };

    onMouseDown = (e: MouseEvent) => {
      if (!this.props.clickFocus) return;
      e.preventDefault();
    };

    render() {
      return <Comp ref={this.ref} {...this.props} />;
    }
  };
}
