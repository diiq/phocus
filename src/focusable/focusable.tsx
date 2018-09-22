import * as React from "react";
import { ActionEvent } from "../action-context/action-context";
import { makeTriggerable, TriggerProps } from "../mixins/make-triggerable";
import { FocusProps } from "../mixins/make-focusable";
import { FocusContextProps } from "../mixins/make-focus-context";

export type _ = TriggerProps | FocusProps | FocusContextProps;

export interface FocusableClassProps {
  style?: React.CSSProperties;
  className?: string;
  role?: string;
  title?: string;
  id?: string;
  ariaLabel?: string;
  ariaValuetext?: string;
  trigger?: (e: ActionEvent) => void;
  disabled?: boolean;
  tabIndex?: number;
}

class FocusableClass extends React.Component<FocusableClassProps> {
  trigger(e: ActionEvent) {
    this.props.trigger && this.props.trigger(e);
  }

  render() {
    return (
      <div
        style={this.props.style}
        className={this.props.className}
        role={this.props.role}
        title={this.props.title}
        id={this.props.id}
        tabIndex={this.props.tabIndex || 0}
        aria-label={this.props.ariaLabel}
        aria-valuetext={this.props.ariaValuetext}
        aria-disabled={this.props.disabled}
      >
        {this.props.children}
      </div>
    );
  }
}

export const Focusable = makeTriggerable(FocusableClass);
