import * as React from "react";
import {
  makeFocusContext,
  FocusContextProps
} from "../mixins/make-focus-context";

export interface UnfocusableClassProps {
  style?: React.CSSProperties;
  className?: string;
  context: string;
  contextComponent: any;
  constrainFocus?: boolean;
  role?: string;
  title?: string;
  id?: string;
}

export type UnfocusableProps = UnfocusableClassProps & FocusContextProps;

class UnfocusableClass extends React.Component<UnfocusableClassProps> {
  render() {
    return (
      <div
        style={this.props.style}
        className={this.props.className}
        role={this.props.role}
        title={this.props.title}
        id={this.props.id}
      >
        {this.props.children}
      </div>
    );
  }
}

export const Unfocusable = makeFocusContext<UnfocusableClassProps>(UnfocusableClass);
