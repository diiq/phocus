import * as React from 'react';
import { ActionContextService, Action, ActionEvent } from '../action-context/action-context';
import { ConstrainFocusService } from '../constrain-focus/constrain-focus';
import { Focus } from '../focus-mixin';

// CSS
import { styles, vars, css } from 'styles/css';


export interface FocusableProps {
  css?: {}
  tabIndex?: number,
  role?: string,
  trigger?: (e: ActionEvent) => void,
  context?: string,
  contextComponent?: any,
  focused?: boolean,
  stealFocus?: () => void
  mouseOverFocus?: boolean
  clickFocus?: boolean
  autofocus?: boolean
  ariaLabel?: string
  ariaValuetext?: string
  title?: string
  testName?: string
  disabled?: boolean
  hasPopup?: boolean
  constrainFocus?: boolean
};

ActionContextService.addContext("focusable", {
  hidden: true,
  actions: {
    trigger: new Action({
      name: "Trigger",
      shortDocumentation: "Perform the action, like a click",
      searchTerms: [],
      actOn: c => c.trigger(),
      defaultKeys: ["Enter"],
      hidden: true
    })
  }
});

export class Focusable extends Focus<FocusableProps, {}> {
  static defaultProps = {
    mouseOverFocus: false,
    clickFocus: true,
    tabIndex: 0,
  };

  root: HTMLDivElement
  newFocus = false
  eventFocusTarget: EventTarget
  removeFocusEvent: () => void

  duringRecurse() {
    if (this.props.trigger) {
      ActionContextService.pushNewContext("focusable", this);
    }
  }

  componentWillMount() {
    if (this.props.constrainFocus) {
      ConstrainFocusService.pushConstraint(() => this.root);
    }
  }

  componentDidMount() {
    if (this.props.focused || this.props.autofocus) {
      this.root.focus();
      this.setContext();
    }
  }

  componentWillUnmount() {
    if (this.props.constrainFocus) ConstrainFocusService.popConstraint();
    // TODO: if actionContext contains this.contextname this.contextComponent combo, then:
    // this.context.setActionContext();
  }

  componentWillReceiveProps(props: FocusableProps) {
    if (!this.props.focused && props.focused) {
      this.newFocus = true;
    }
  }

  componentDidUpdate() {
    if (this.newFocus) {
      this.newFocus = false;
      if (ConstrainFocusService.focusable(this.root)) {
        this.root.focus();
        this.focus();
      }
    }
  }

  focus() {
    if (!this.props.focused && this.props.stealFocus) {
      this.props.stealFocus();
    } else {
      this.setContext();
    }
  }

  refocus() {
    this.root.focus();
  }

  enabled() {
    return this.props.trigger && !this.props.disabled;
  }

  trigger(e?: ActionEvent) {
    if (this.enabled()) this.props.trigger(e);
  }

  setRoot = (r: HTMLDivElement) => {
    this.root = r;
  }

  render() {
    return (
      <div {...css(style.focusable,
        { cursor: this.enabled() ? 'pointer' : null },
        this.props.css) }
        className={this.props.testName}
        aria-label={this.props.ariaLabel}
        aria-valuetext={this.props.ariaValuetext}
        aria-disabled={this.props.disabled}
        title={this.props.title}
        role={this.props.role}
        ref={this.setRoot}
        aria-haspopup={this.props.hasPopup}
        onMouseOver={(e) => {
          if (!this.props.mouseOverFocus) return;
          this.root.focus();
          e.stopPropagation();
        }}
        onClick={e => {
          if (this.enabled && this.props.trigger) {
            this.trigger(e);
            e.preventDefault();
          }
          e.stopPropagation();
        }}
        onMouseDown={e => {
          if (this.props.clickFocus) return;
          e.preventDefault();
        }}
        onFocus={(e) => {
          if (e.target !== this.root) return;
          this.focus();
        }}
        tabIndex={this.props.tabIndex} >
        {this.props.children}
      </div>
    );
  }
}

let style = styles({
  focusable: {
    ...vars.focus
  }
});
