import * as React from 'react';
import { ActionContextService, ActionEvent } from 'focus';
import { func } from 'prop-types';

export interface FocusProps {
  context?: string
  contextComponent?: any
  trigger?: (e: ActionEvent) => void
};

export class Focus<P extends FocusProps, S> extends React.Component<P, S> {
  static childContextTypes = {
    setActionContext: func,
    actionInContext: func
  }

  static contextTypes = {
    setActionContext: func,
    actionInContext: func
  }

  getChildContext() {
    return {
      setActionContext: () => this.recurseActionContext(),
      actionInContext: (action: string, context?: string) => {
        return this.actionInContext(action, context)
      }
    };
  }

  setContext() {
    ActionContextService.newContext();
    this.recurseActionContext();
  }

  duringRecurse() {
    // This method is a placeholder. Replace it in chilluns when you need to
    // take additional steps during context recursion.
  }

  recurseActionContext() {
    if (this.props.context) {
      ActionContextService.pushNewContext(
        this.props.context,
        this.props.contextComponent
      );
    }
    this.duringRecurse();
    this.context.setActionContext();
  }

  actionInContext(action: string, contextName?: string) {
    // "This is the context you're looking for"
    if (contextName && contextName === this.props.context) {
      return ActionContextService.actionInContext(
        contextName,
        action,
        this.props.contextComponent);

      // You're looking for a specific context, but this ain't it. Move along.
    } else if (contextName) {
      return this.context.actionInContext(action, contextName);

      // You don't care what context; this one'll do
    } else if (ActionContextService.hasAction(this.props.context, action)) {
      return ActionContextService.actionInContext(
        this.props.context,
        action,
        this.props.contextComponent);

      // I can't help you -- I don't have that action in this context. Try next door.
    } else {
      return this.context.actionInContext(action, contextName);
    }
  }
}

