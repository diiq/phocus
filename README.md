# Phocus: focus and action management, with context-sensitive hotkeys

Phocus helps you make your apps accessible and power-user-friendly by managing context-sensitive actions.

Phocus lets your users set, change, and unset keyboard shortcuts for all manner of actions in your app, and those shortcuts are context-dependent, based on what DOM element has focus.

Hotkeys and buttons are tied to the same root action definition, so they're guaranteed to do the same thing.

## Example usage

See [Phocus Example](https://diiq.github.io/phocus-example/) for an absolutely stripped-down example of a phocus-based todo list.

See [Vistimo](https://www.vistimo.com) for a rich and complicated use-case.

## Installing

`yarn add ng-phocus` or `npm install ng-phocus`.

NgPhocus comes with typescript typings; no need to install them separately.

## Basic Usage
### Defining the available actions: `ActionContextSevice` and `Action`

Phocus works because it forces you to define all the actions available to a user *separately* from the display logic of your app. That's convenient because it lets hotkey and buttons refer to the same actions -- but it also lets you document all those actions clearly for the user, and makes it possible for users to bind different hotkeys to different actions if they like.

Each action has a name, help text, default hot keys, and an implementation.

```
import { Action } from "phocus";

new Action({
  // This is the human-readable name of the action
  name: "Delete",

  shortDocumentation: "Removes the product from your cart",

  // actOn is the actual implementation of the action, and
  // takes up to three arguments:
  //   a contextual argument (here, the id of the product),
  //   the HTMLElement of the context,
  //   and the triggering event.
  // Usually, the contextual argument is all you need.
  actOn: (id, element, event) => {
    CartProducts.remove(id)
  },

  // The default hotkeys for triggering this action.
  defaultKeys: ["Backspace"]
}),
```

To define actions, you also need to explain the context of those actions; "delete" means something different depending on where you do it!

An ActionContext is a set of actions which are available only when focus is within a specific part of the page. An ActionContext consists of a globally unique name, help text, and a list of actions.

```
import {
  Action,
  ActionContextService,
} from "phocus";

// Whenever you like, but ideally on startup, define some contexts:
ActionContextService.addContext("cart-product-listing", {
  name: "Product",
  documentation: "A single product in your cart. You haven't bought it yet, but you're planning on it!",

  // Include this context in documentation
  hidden: false,

  // Allow actions from parent contexts to appear in this context
  opaque: false,

  actions: {
    // 'delete' is the machine-readable name of this action.
    delete: new Action({
      name: "Delete",
      shortDocumentation: "Removes the product from your cart",
      actOn: (id) => {
        CartProducts.remove(id)
      },
      defaultKeys: ["Backspace"]
    }),
    increase: new Action({
      name: "Add one",
      shortDocumentation: "Add another one of this product to your cart",
      actOn: (id) => {
        CartProducts.addOne(id)
      },
      defaultKeys: ["+"]
    }),
    decrease: new Action({
      name: "Remove one",
      shortDocumentation: "Remove one of this product from your cart. If you only have one in your cart, remove the product entirely",
      actOn: (id) => {
        CartProducts.removeOne(id)
      },
      defaultKeys: ["-"]
    })
  }
});
```

### Using the actions you defined

Now that you've defined your actions, and the contexts they can be taken in, you can use those actions on your page:

```
<div data-phocus-context-name="cart-product-listing" data-phocus-context-argument="55">
    <button data-phocus-action="delete"></button>
    <button data-phocus-action="increase">-1</button>
    <button data-phocus-action="decrease" doNotLabel>+1</button>
  </div>
</div>
```

The value of the `data-phocus-context-name` attribute is the machine-readable name of the context you provided to ActionContextService.

The `data-phocus-context-argument` attribute will get passed as the first argument to all actions within this context.

`data-phocus-action` is the machine-readable name of the action you provided in the context definition.

Note that the "delete" button has no text. Phocus will autmatically inject the human-readable name of the action into that button. The other buttons have text already, and phocus will leave them alone.

Phocus will also automatically generate `label`s for each button, which will include both the human-readable action name and the first hotkey for that action, if there is one. This is useful for buttons which are just icons -- screenreaders will read the label, and confused users can hover over an unclear icon to learn more.

If you don't want Phocus to automatically generate a `label` attribute, use `doNotLabel`.

#### Nesting

Contexts can be nested. Actions with the same name will shadow actions in parent contexts. Hotkeys with the same bindings will shadow one another.

If you declare a context to be `opaque: true`, the actions and hotkeys of parent contexts cannot be used within that context.

### Start your engines

Finally, use `startPhocus` to make phocus start listening for actions.

```
// Once the page has rendered for the first time
startPhocus(document.body);


// If you'd ever like phocus to stop functioning
// stopPhocus(document.body)
```

Provide `startPhocus` with a root element; phocus will not operate outside that element. This should almost always be `document.body`, to ensure it encompasses modals and other portal-y edge-cases.

## Advanced usage

### Constraining Focus

For modals, it can be important to constrain focus, and prevent users from tabbing onto hidden elements.

```
ConstrainFocusService.pushConstraint(() => element);
```

`pushConstraint` takes a function that returns an element (this is useful if the element in question hasn't been rendered, or if it will change over time), and it will force the focus to remain within the children of that element until you call

```
ConstrainFocusService.popConstraint();
```

As the names suggest, there is a stack of constraints; you can push consecutive constraints, and pop them one by one.

Upon popping a constraint, focus will be restored to whatever element had focus before the constraint was added.

### Hotkey remapping

`ActionContextService.currentRemapping` is a JSON object representing the current mapping of hotkeys to actions. If you store this for a user, then on subsequent visits, you can use `ActionContextService.restoreRemapping(mapping)` which takes that JSON object and restores the mapping it represents.

`ActionContextService.remapAction(action: Action, newMapping)` takes an Action object and a key string (such as "Control+a") and customizes that action with that hotkey.

`ActionContextService.unmapAction(action: Action)` removes hotkeys from an Action.

`ActionContextService.unremapAction(action)` restores the default hotkeys to an Action.

All three remapping functions store bindings in localStorage by default. You must call `ActionContextService.restoreRemapping()` with no arguments to restore bindings from localStorage.

Use of localStorage can be overridden (e.g. to use a server instead) by using `onRemapping(callback: (remapping: Remapping[]) => void)` to set how bindings are saved whenever they change, OR by using `currentRemapping` and `restoreRemapping` to carry bindings across sessions whenever and however you like.

### Other useful functions

`ActionContextService.addDefaultContext(name: string, argument: any, element?: any)` sets a root context (named by name) to be available everywhere, no matter what is focused. You can add as many default contexts as you like; `ActionContextService.removeDefaultContext` takes the same arguments and removes the context from the set of defaults.

`ActionContextService.availableActions` changes based on the focused element on the page; it is the list of actions that could be taken in the current context, and all its parents. This is useful for generating context-sensitive documentation. Contexts with `hidden: true` will not appear in `availableActions`.

`ActionContextService.contextStack` is the list of context-names, arguments, and DOM elements for the current context and all its ancestors.

`ActionContextService.contexts` is an object describing all context blueprints.

`ActionContextService.setContext(element)` will set the context to a given element, regardless of what element has focus.

`PhocusService.focusInContext(phocusId[, element])` will focus on an element with the attribute `phocusId="some-string"`; but it will focus on the element that is the nearest context sibling. That is, if such an element exists in the currently focused context, it will focus on it. Otherwise it will look for one in the parent context, then the grandparent context. This allows multiple elements on the page to have the same phocusId, while still allowing us to focus on the most contextually meaningful one, not just the first in the DOM.

`PhocusService.focusMomentarily(element | selector)` will focus on *any* element, even if it is not focusable; but once focus leaves that element, it will not be refocusable using tab. This is useful for single-page apps that strive to be screenreader-friendly. WHen changing routes in an SPA, screenreaders often hear nothing -- there was no page-load, so the narration says nothing. By focusing on an H1 after changing routes, you can let screenreader users know that the page has changed, and by removing the H1 from the focus rotation afterwards, you maintain expectations of what's focusable.


## Philosophy

Phocus is based on a simple set of assumptions about how the point of focus moves through an app, and how user actions relate to that focus.
The Rules of Phocus:

1. Any DOM element that allows the user to take an action can be focused.
   - This is for accessibility; not all users can or want to use a mouse, and making actions focusable makes them keyboard accessible. Note: this is not true by default in safari -- buttons are not keyboard-focusable!
2. Only one DOM element can be focused at a time.
   - If we're using the browser's built-in focus (which is mandatory for accessibility) then this is inescapable!
3. Focus moves between DOM elements using the mouse, keyboard, or programmatically
   - Some DOM elements focus on click; some on hover.
4. Some states only allow focus among a subset of all focusable DOM elements, but that subset is always contained in exactly one branch of the DOM element tree
   - This is true for things like modals. When a modal is active, accesibility guidelines suggest that users should not be able to focus on items in the background, as it is easy for screenreader users to lose the context of the modal entirely.
5. Some DOM elements (usually buttons) allow users to trigger an action by clicking, or by hitting enter when focused. The full meaning of a button is often determined by its context in the DOM: e.g. a button says ‘delete product’, but which product it will delete depends on which product listing it appears in.
6. An user can trigger a variety of actions using keyboard shortcuts, and the behavior of a keyboard shortcut depends on what DOM element is in focus (and its parents) when the hotkey is pressed.
7. Every action a user can take should be documented. Every hotkey should be rebindable.

Types of interactive DOM elements:

- Buttons (Focusable, triggers action in context)
- Links (Focusable, triggers change in URL)
- Inputs (focusable; not triggerable by clicking)
- Contexts (not focusable by default, defines a set of actions; such as a form, submittable with ‘enter’ when any child is in focus)

All remaining elements are ignored as non-focusable, non-interactive, non-contexts. (Phocus ignores, but does not prevent, interactions such as drag-and-drop).


### Contributing

If you like Phocus, and want to contribute, feel free to reach out with a pull request. My first responsibility is to my products and my clients that already use Phocus, so I can't always accept changes, but your help is welcome.

Make bug reports using github issues.
