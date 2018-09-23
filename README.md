# Phocus: focus and action management, with context-sensitive hotkeys

Phocus helps you make your apps accessible and power-user-friendly by managing context-sensitive actions. Hotkeys and buttons are tied to the same root action definition, so they're guaranteed to do the same thing.

Phocus lets your users set, change, and unset keyboard shortcuts for all manner of actions in your app, and those shortcuts can be context-dependent, based on what object has focus.

## Example usage

See [Phocus Example](https://diiq.github.io/phocus-example/) for an absolutely stripped-down example of phocus making a todo.

See [Vistimo](https://www.vistimo.com) for a rich and complicated use-case.

## Installing

`yarn add phocus` or `npm install phocus`.

Phocus comes with typescript typings; no need to install them separately.

## Philosophy

The Rules of Phocus:

1. Any element that allows the user to take an action can be focused.
2. Only one element can be focused at a time.
3. Focus moves between elements using the mouse, keyboard, or programmatically
   - Some elements focus on click; some on hover.
4. Some states only allow focus among a subset of all focusable elements (modals, menus)
   - This subset is always contained in exactly one branch of the element tree
5. An element can allow a user to trigger a single context-sensitive action by clicking, or hitting enter when focused. (Some drop-downs trigger on Space for a11y reasons.)
   - Context sensitivity allows the action to be separated from the actee: e.g. the action is ‘delete’, but context is required to know it means ‘delete item X’
6. An user can trigger a variety of actions using keyboard shortcuts;
   - Keyboard shortcuts depend on what element is in focus (and its parents) when the key is pressed.
7. Every action a user can take should be documented. Every hotkey should be rebindable.

Types of interactive elements:

- Buttons (Focusable, triggers action in context)
- Links (Focusable, triggers change in URL)
- Inputs (focusable; not triggerable by clicking)
- Contexts (not focusable by default, defines a set of actions; such as a form, submittable with ‘enter’ when any child is in focus)

All remaining elements are ignored as non-focusable, non-interactive, non-contexts. (Phocus ignores, but does not prevent, interactions such as drag-and-drop).

## Usage

### `ActionContextSevice` and `Action`

An action context is a set of actions which are available only when focus is within a specific part of the page. A context consists of a globally unique name, help text, and a list of actions. Each action has a name, help text, default hot keys, and an implementation.

```
import {
  Action,
  ActionContextService,
} from "phocus";

// Wherever you like, but ideally on startup, define some contexts:
ActionContextService.addContext("feature-thumbnail", {
  name: "The Feature Thumbnail",
  documentation: <ThumbnailDocs />,
  hidden: false,
  actions: {
    showBugs: new Action({
      name: "Show bugs",
      shortDocumentation: "Show a list of bugs filed against this feature",
      searchTerms: [],
      actOn: (id) => {
        let feature = getFeature(id);
        feature.showBugs();
      },
      defaultKeys: ["b"]
    }),
    showEnhancements: new Action({
      name: "Show enhancements",
      shortDocumentation: "Show a list of enhancements planned for this feature",
      searchTerms: [],
      actOn: (id) => {
        let feature = getFeature(id);
        feature.showEnhancements();
      },
      defaultKeys: ["h"]
    }),
    edit: new Action({
      name: "Edit",
      shortDocumentation: "Edit the feature's name or other properties without leaving the feature map.",
      searchTerms: ["edit"],
      actOn: (id, element, event) => {
        // You also get a reference to the context element,
        // and to the triggering event.
        activeEditor(element);
      },
      defaultKeys: ["e"]
    })
  }
});
```

### Markup

In your markup, use attributes to tie your context to the DOM.

`data-phocus-context-argument` defines the first argument that will be passed to any action called within the context; in this case, the actions are all expecting an id string.

```
<div data-phocus-context-name="feature-thumbnail" data-phocus-context-argument="123">
  <button data-phocus-action="showBugs"></button>
  <div>
    <button data-phocus-action="showEnhancements"></button>
    <button data-phocus-action="edit"><i class="pencil-icon" /></button>
  </div>
</div>
```

### Start your engines

Finally, use `startPhocus` to get thins started.

```
import { startPhocus } from "phocus";

// Starting Phocus before your initial page load can slow down
// load times. It's recommended to wait until the initial
// render, and then call
startPhocus(document.body);
```

Contexts can be nested, and are transparent; if a child context does not shadow a parent's hotkey, then that hotkey will work even when the child is focused. A context marked `opaque: true` will shadow all actions in its parent.

Elements with `data-phocus-action` will be giving appropriate aria-labels, and if they contain no inner text, will be filled in with the actions 'name'.

Phocus is always watching for changes, so you can use it alongside any frontend framework.

### Constraining Focus

For modals and the like, it can be important to constrain focus, and prevent it from tabbing onto hidden elements.

```
ConstrainFocusService.pushConstraint(() => element);
```

Takes a function that returns an element (useful if the element in question hasn't been rendered, or changes over time), and will constrain focus to within that element until such time as you call

```
ConstrainFocusService.popConstraint();
```

As the names suggest, there is a stack of constraints; you can push consecutive constraints, and pop them one by one.

### Hotkey remapping

`ActionContextService.currentRemapping` is a JSON object representing the current mapping of hotkeys to actions. If you store this for a user, either in localstorage or on a server, then on subsequent visits, you can use `ActionContextService.restoreRemapping(mapping)` which takes that JSON object and restores the mapping it represents.

`remapAction(action: Action, newMapping)` takes an Action object and a key string (such as "Control+a") and customizes that action with that hotkey.

`unmapAction(action: Action)` removes hotkeys from an Action.

`unremapAction(action)` restores the default hotkeys to an Action.

All three remapping functions are temporary without using `currentRemapping` and `restoreRemapping` to carry the effects across sessions.

### Other useful functions

`stopPhocus(element)` removes all Phocus' event watchers from the dom.

`ActionContextService.availableActions` is the list of actions that could be taken in the currently focused context, and all its parents. This is useful for generating context-sensitive documentation.

`ActionContextService.contextStack` is the list of context-names, arguments, and DOM elements for the current context and all its ancestors.

`ActionContextService.contexts` is an object describing all context blueprints.

`ActionContextService.setContext(element)` will set the context to a given element. Using `document.activeElement` as an argument is the most common, setting the context to the currently focused element.

### Contributing

Phocus is, first and foremost, a tool I use for building products myself. I probably won't accept changes that make it less effective for me, personally.

However, if you like Phocus, and want to contribute, feel free to reach out, and I'll add you to the [Vistimo](https://www.vistimo.com) project that tracks Phocus' progress. 

Github issues are, if not welcome, accepted, and will be read eventually.