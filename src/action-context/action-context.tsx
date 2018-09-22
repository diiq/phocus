import * as React from "react";
import { Hotkey } from "../hotkey/hotkey";

export type Key = string;
export interface Remapping {
  action: string;
  context: string;
  mapping: string;
}

// A ContextBlueprint describes a set of actions that can all be taken in the
// same context in the app. It's also used to store help messages for these
// contexts.
export interface ContextBlueprint {
  name?: string;
  documentation?: string; // TODO how to do rich text?
  // Usually, you can still call actions from contexts further out in the stack
  // but if a context is opaque, it blocks all keyboard shortcuts from the rest
  // of the stack.
  opaque?: boolean;
  hidden?: boolean;
  actions: { [id: string]: Action };
}

// Contexts nest -- a entry in the stack describes a context and the object the
// context
export interface ContextStackEntry {
  context: string;
  argument: string | undefined;
  element: HTMLElement;
}

export type ActionEvent =
  | React.KeyboardEvent<HTMLElement>
  | React.MouseEvent<HTMLElement>
  | KeyboardEvent;

// Actions have one free argument; when a context is pushed onto the stack, that
// argument is stored along with it. An ActionInContext closes over the argument
// so that the action can be called anywhere
export class ActionInContext {
  constructor(
    public action: Action,
    private contextName: string,
    private argument: any,
    private element: HTMLElement | undefined,
    private service: ActionContextServiceClass
  ) {}

  get hasArgument() {
    return !!this.argument;
  }

  act(e?: ActionEvent) {
    return this.action.actOn(this.argument, this.element, e);
  }

  context() {
    this.service.contexts[this.contextName];
  }
}

// An action is anything you can do in a given context. It can be mapped to a
// keyboard shortcut.
export class Action {
  remappedKey: Key | null = null;
  name: string;
  shortDocumentation: string;
  searchTerms: string[];
  actOn: (argument: any, element?: HTMLElement, e?: ActionEvent) => void;
  defaultKeys: Key[];

  // If true, hide from the action palette
  hidden: boolean;

  constructor(description: {
    name: string;
    shortDocumentation: string;
    searchTerms: string[];
    actOn: (argument: any, element?: HTMLElement, e?: ActionEvent) => void;
    defaultKeys: Key[];
    hidden?: boolean;
  }) {
    this.remappedKey = null;
    this.name = description.name;
    this.shortDocumentation = description.shortDocumentation;
    this.searchTerms = description.searchTerms;
    this.actOn = description.actOn;
    this.defaultKeys = description.defaultKeys;
    this.hidden = description.hidden || false;
  }

  get keys() {
    if (this.remappedKey) return [this.remappedKey];
    return this.defaultKeys;
  }

  label() {
    const key = this.keys[0];
    if (key) {
      return `${this.name} (${key})`;
    } else {
      return this.name;
    }
  }
}

export class ActionContextServiceClass {
  contextStack: ContextStackEntry[];
  contexts: { [id: string]: ContextBlueprint } = {};
  remappingDirty: boolean = false;

  constructor() {
    this.contextStack = [];
  }

  addContext(name: string, context: ContextBlueprint) {
    if (this.contexts[name]) {
      console.warn("Replacing existing context blueprint: ", name);
    }
    this.contexts[name] = context;
  }

  get currentContext() {
    return this.contextStack[0].context;
  }

  private getContextStack(elt: HTMLElement | null): ContextStackEntry[] {
    if (!elt) return [];
    let stack = this.getContextStack(elt.parentElement)
    if (elt.dataset.phocusContextName) {
      stack.unshift({
        context: elt.dataset.phocusContextName,
        argument: elt.dataset.phocusContextArgument,
        element: elt
      });
    }
    return stack;
  }

  setContext(elt: HTMLElement) {
    this.contextStack = this.getContextStack(elt);
  }

  /** Give a user-specific key command for an action. */
  remapAction(action: Action, newMapping: Key) {
    action.remappedKey = newMapping;
  }

  /** Remove a user-specific key command for an action. */
  unremapAction(action: Action) {
    action.remappedKey = null;
  }

  /** Remove a user-specific key command for an action. */
  unmapAction(action: Action) {
    action.remappedKey = "None";
  }

  /** Collect all user-remapped actions so that they can be saved */
  get currentRemapping(): Remapping[] {
    const ll = Object.keys(this.contexts).map(contextName => {
      const context = this.contexts[contextName];
      if (!context) return; // TODO assertion, probs
      return Object.keys(context.actions).map(actionName => {
        const action = context.actions[actionName];
        if (!action.remappedKey) return;
        return {
          action: actionName,
          context: contextName,
          mapping: action.remappedKey
        };
      });
    });
    return [].concat.apply([], ll).filter((x: any) => x);
  }

  restoreRemapping(remapping: Remapping[]) {
    if (!remapping) return;
    remapping.map(m => {
      const context = this.contexts[m.context];
      const action = context.actions[m.action];
      this.remapAction(action, m.mapping);
    });
  }

  /** Collect actions, along with the appropriate argument, from all
   * contexts in the active stack, smallest context first */
  get availableActions() {
    return this.actionsInContexts(this.contextStack);
  }

  private actionsInContexts(contextStack: ContextStackEntry[]) {
    var accum: ActionInContext[] = [];
    for (var i = 0; i < contextStack.length; i++) {
      let contextEntry = contextStack[i];
      let context = this.contextFor(contextEntry);
      if (!context) {
        console.error("Unknown action context:", contextEntry.context);
        return;
      }
      let actions = this.actionsFromContext(contextEntry);
      accum = accum.concat(actions);
      if (context.opaque) {
        break;
      }
    }

    return accum;
  }

  private actionsFromContext(contextEntry: ContextStackEntry) {
    let context = this.contextFor(contextEntry);
    let actionsByName = context.actions;
    return Object.keys(actionsByName).map(name => {
      return new ActionInContext(
        actionsByName[name],
        contextEntry.context,
        contextEntry.argument,
        contextEntry.element,
        this
      );
    });
  }

  private contextFor(contextEntry: ContextStackEntry) {
    return this.contexts[contextEntry.context];
  }

  actionForKeypress(key: Key) {
    const availableActions = this.availableActions;
    if (!availableActions) return;
    return availableActions.find(actionInContext => {
      const action = actionInContext.action;
      return action.keys.indexOf(key) >= 0;
    });
  }

  handleKeypress(event: KeyboardEvent) {
    const key = Hotkey.canonicalKeyFromEvent(event);
    const keyAction = this.actionForKeypress(key);
    if (keyAction) {
      event.preventDefault();
      event.stopPropagation();
      keyAction.act(event);
    }
  }

  actionForName(name: string) {
    const contextEntry = this.contextStack.find(c => name in this.contextFor(c).actions)
    if (!contextEntry) return;
    const context = this.contextFor(contextEntry)
    return new ActionInContext(
      context.actions[name],
      contextEntry.context,
      contextEntry.argument,
      contextEntry.element,
      this
    )
  }

  triggerAction(name: string, e?: ActionEvent) {
    const action = this.actionForName(name)
    if (!action) {
      console.error(`No action found for name ${name}.`, this.contextStack);
      return;
    }
    action.act(e)
  }
}

export const ActionContextService = new ActionContextServiceClass();
