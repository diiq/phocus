import * as React from 'react';
import { Focus } from '../focus-mixin';
import { ConstrainFocusService } from '../constrain-focus/constrain-focus';

// CSS
import { css, Style } from 'styles/css';


export interface UnfocusableProps {
  css?: Style
  context: string
  contextComponent: any
  constrainFocus?: boolean
  role?: string
  title?: string
  id?: string
};

export class Unfocusable extends Focus<UnfocusableProps, {}> {
  root: HTMLElement
  removeFocusEvent: () => void

  componentWillMount() {
    if (this.props.constrainFocus) {
      ConstrainFocusService.pushConstraint(() => this.root);
    }
  }

  componentWillReceiveProps(props: UnfocusableProps) {
    if (!this.props.constrainFocus && props.constrainFocus) {
      ConstrainFocusService.pushConstraint(() => this.root);
    } else if (this.props.constrainFocus && !props.constrainFocus) {
      ConstrainFocusService.popConstraint();
    }
  }

  componentWillUnmount() {
    if (this.props.constrainFocus) ConstrainFocusService.popConstraint();
  }

  setRoot = (r: HTMLDivElement) => {
    this.root = r;
  }

  render() {
    return (
      <div {...css(this.props.css) } ref={this.setRoot} role={this.props.role} title={this.props.title} id={this.props.id}>
        {this.props.children}
      </div>
    );
  }
}
