# Phocus: react focus and action management, with hotkeys and context-sensitive help

Phocus does silly things to browser focus, is poorly isolated as a library, and you probably shouldn't use it.

It does let your users set, change, and unset keyboard shortcuts for all manner of actions in your app, and those shortcuts can be context-dependent, based on what object has focus.

## Installing

`yarn add phocus` or `npm install phocus`.

Phocus comes with typescript typings; no need to install them separately.

## Usage

Look you really don't want to do this, OK. Doing this means that every element you put on the page that could possibly accept focus -- down to every link, every form element -- needs to be customized to fit into the phocus stack. It's a genuinely insane choice to make.

## `ActionContextSevice` and `Action`

An action context is a set of actions which are available only when focus is within a specific part of the page. A context consists of a globally unique name, help text, and a list of actions. Each action has a name, help text, default hot keys, and an implementation. Action contexts are then used by `Focusable` and `Unfocusable` components, each of which can be given a context name and an object to pass to the action implementation.

```
// Outside any component, define the context:
ActionContextService.addContext("feature-thumbnail", {
  name: "The Feature Thumbnail",
  documentation: <ThumbnailDocs />,
  hidden: false,
  actions: {
    showBugs: new Action({
      name: "Show bugs",
      shortDocumentation: "Show a list of bugs filed against this feature",
      searchTerms: [],
      actOn: (c: FeatureThumbnail) => {
        c.openBugs();
      },
      defaultKeys: ["b"]
    }),
    showEnhancements: new Action({
      name: "Show enhancements",
      shortDocumentation: "Show a list of enhancements planned for this feature",
      searchTerms: [],
      actOn: (c: FeatureThumbnail) => {
        c.openEnhancements();
      },
      defaultKeys: ["h"]
    }),
    edit: new Action({
      name: "Edit",
      shortDocumentation: "Edit the feature's name or other properties without leaving the feature map.",
      searchTerms: ["edit"],
      actOn: (c: FeatureThumbnail) => {
        c.startEditing();
      },
      defaultKeys: ["e"]
    })
  }
});
```

```
  // Inside render(), use the context:
  <Unfocusable context="feature-thumbnail" contextComponent={this}>
    [Components where the feature-thumbnail actions can be used...]
  </Unfocusable>
```

### `FocusRoot`

There should be only one of these, way up at the top of your document tree. Takes no attributes. (`FocusRoot` is automatically paired with an ActionContext called "phocus-root", which you're welcome to replace).

### `Focusable`

This wrapper can affect the context stack, but can also become focused, and trigger an action when activated. Literally every attribute is optional. Skip 'em all, and you'll have an inert DOM element which can be focused with mouse or keyboard.

* style?: React.CSSProperties;
* className?: string;
* tabIndex?: number;
* role?: string;
* trigger?: (e: ActionEvent) => void;
* context?: string;
* contextComponent?: any;
* focused?: boolean;
* stealFocus?: () => void;
* mouseOverFocus?: boolean;
* clickFocus?: boolean;
* autofocus?: boolean;
* ariaLabel?: string;
* ariaValuetext?: string;
* title?: string;
* disabled?: boolean;
* hasPopup?: boolean;
* constrainFocus?: boolean;

### `Unfocusable`

This wrapper component affects the context stack without being able to take focus itself. Requires a context name, and a `contextComponent`, the argument handed to all the actions within that context.

* context: string;
* contextComponent: any;
* style?: React.CSSProperties;
* className?: string;
* constrainFocus?: boolean;
* role?: string;
* title?: string;
* id?: string;

### `Focus`

A mixin for making new custom components like `Focusable` and `Unfocusable`.


## Example usage

See [Vistimo](https://www.vistimo.com) for a rich and complicated use-case.
