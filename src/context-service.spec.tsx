import {
  ContextService,
  Action,
  ContextBlueprint
} from "./context-service";
import { HotkeyService } from "./hotkey-service";

describe("this.ActionContextService", () => {
  let saveAction: Action = new Action({
    name: "Save project",
    shortDocumentation: "Saves the project",
    defaultKeys: ["Control+s", "Control+p"],
    actOn: () => {},
    searchTerms: ["save", "project"]
  });

  let projectContext: ContextBlueprint = {
    name: "Project editing",
    documentation: "This is where you can change the settings of your project",
    actions: {
      save: saveAction
    }
  };

  let logoutAction: Action = new Action({
    name: "Log out",
    shortDocumentation: "Log out",
    defaultKeys: ["Control+s", "Control+o"],
    actOn: () => {},
    searchTerms: ["log out", "sign out"]
  });

  let rootContext: ContextBlueprint = {
    name: "Root",
    documentation: "These are global actions, available anywhere.",
    actions: {
      logout: logoutAction
    }
  };

  let opaqueContext: ContextBlueprint = {
    name: "Opaque",
    documentation: "Conceal all actions.",
    opaque: true,
    actions: {}
  };

  beforeEach(() => {
    this.ActionContextService = new ContextService(new HotkeyService())
    this.ActionContextService.clear();
    this.ActionContextService.add("project", projectContext);
    this.ActionContextService.add("root", rootContext);
    this.ActionContextService.add("opaque", opaqueContext);
  });

  it("Creates a stack for a dom element", () => {
    document.body.innerHTML =
      '<div data-phocus-context-name="project" data-phocus-context-argument="my-arg">' +
      '  <button id="button" />' +
      "</div>";
    this.ActionContextService.setContext(document.getElementById("button"));
    const stack = this.ActionContextService.contextStack;
    expect(stack.length).toBe(1);
    expect(stack[0].context).toBe("project");
    expect(stack[0].argument).toBe("my-arg");
  });

  it("Creates a nested stack for nested dom elements", () => {
    document.body.innerHTML =
      '<div data-phocus-context-name="root" data-phocus-context-argument="big-arg">' +
      '  <div data-phocus-context-name="project" data-phocus-context-argument="my-arg">' +
      '    <button id="button" />' +
      "  </div>" +
      "</div>";
    this.ActionContextService.setContext(document.getElementById("button"));
    const stack = this.ActionContextService.contextStack;
    expect(stack.length).toBe(2);
    expect(stack[1].context).toBe("root");
    expect(stack[1].argument).toBe("big-arg");
  });

  it("Skips elements without contexts", () => {
    document.body.innerHTML =
      '<div data-phocus-context-name="root" data-phocus-context-argument="big-arg">' +
      "  <div>" +
      '    <button id="button" />' +
      "  </div>" +
      "</div>";
    this.ActionContextService.setContext(document.getElementById("button"));
    const stack = this.ActionContextService.contextStack;
    expect(stack.length).toBe(1);
    expect(stack[0].context).toBe("root");
    expect(stack[0].argument).toBe("big-arg");
  });

  it("Finds context when called on elements with context on themselves", () => {
    document.body.innerHTML =
      "<div >" +
      '  <button id="button" data-phocus-context-name="root" data-phocus-context-argument="big-arg" />' +
      "</div>";
    this.ActionContextService.setContext(document.getElementById("button"));
    const stack = this.ActionContextService.contextStack;
    expect(stack.length).toBe(1);
    expect(stack[0].context).toBe("root");
    expect(stack[0].argument).toBe("big-arg");
  });

  it("Handles elements with no arguments", () => {
    document.body.innerHTML =
      '<div data-phocus-context-name="root">' +
      "  <div>" +
      '    <button id="button" />' +
      "  </div>" +
      "</div>";
    this.ActionContextService.setContext(document.getElementById("button"));
    const stack = this.ActionContextService.contextStack;
    expect(stack.length).toBe(1);
    expect(stack[0].context).toBe("root");
    expect(stack[0].argument).toBe(undefined);
  });

  describe("availableActions", () => {
    it("collects actions from the current context", () => {
      document.body.innerHTML =
        '<div data-phocus-context-name="root" data-phocus-context-argument="big-arg">' +
        '    <button id="button" />' +
        "</div>";
      this.ActionContextService.setContext(document.getElementById("button"));
      const actions1 = this.ActionContextService.availableActions;
      expect(actions1.length).toEqual(1);
      expect(actions1[0].action).toEqual(logoutAction);
    });

    it("collects actions in order up the context stack", () => {
      document.body.innerHTML =
        '<div data-phocus-context-name="root" data-phocus-context-argument="big-arg">' +
        '  <div data-phocus-context-name="project" data-phocus-context-argument="my-arg">' +
        '    <button id="button" />' +
        "  </div>" +
        "</div>";
      this.ActionContextService.setContext(document.getElementById("button"));
      const actions = this.ActionContextService.availableActions;
      expect(actions.length).toEqual(2);
      expect(actions[0].action).toEqual(saveAction);
    });

    it("Does not collect actions through an opaque context", () => {
      document.body.innerHTML =
        '<div data-phocus-context-name="root" data-phocus-context-argument="big-arg">' +
        '  <div data-phocus-context-name="opaque" data-phocus-context-argument="my-arg">' +
        '    <button id="button" />' +
        "  </div>" +
        "</div>";
      this.ActionContextService.setContext(document.getElementById("button"));
      const actions = this.ActionContextService.availableActions;
      expect(actions.length).toEqual(0);
    });
  });

  describe("keybindings", () => {
    it("gets an action for a keypress", () => {
      document.body.innerHTML =
        '<div data-phocus-context-name="root" data-phocus-context-argument="big-arg">' +
        '  <button id="button" />' +
        "</div>";
      this.ActionContextService.setContext(document.getElementById("button"));

      expect(this.ActionContextService.actionForKeypress("Control+s").action).toBe(
        logoutAction
      );
    });

    it("Pushing a context can shadow a keybinding", () => {
      document.body.innerHTML =
        '<div data-phocus-context-name="root" data-phocus-context-argument="big-arg">' +
        '  <div data-phocus-context-name="project" data-phocus-context-argument="my-arg">' +
        '    <button id="button" />' +
        "  </div>" +
        "</div>";
      this.ActionContextService.setContext(document.getElementById("button"));

      expect(this.ActionContextService.actionForKeypress("Control+s").action).toBe(
        saveAction
      );

      // But a command can have multiple bindings
      expect(this.ActionContextService.actionForKeypress("Control+o").action).toBe(
        logoutAction
      );
    });

    it("Pushing an opaque context prevents the use of bindings lower in the stack", () => {
      document.body.innerHTML =
        '<div data-phocus-context-name="root" data-phocus-context-argument="big-arg">' +
        '  <div data-phocus-context-name="opaque" data-phocus-context-argument="my-arg">' +
        '    <button id="button" />' +
        "  </div>" +
        "</div>";
      this.ActionContextService.setContext(document.getElementById("button"));
      expect(
        this.ActionContextService.actionForKeypress("Control+p")
      ).toBeUndefined();
      expect(
        this.ActionContextService.actionForKeypress("Control+o")
      ).toBeUndefined();
    });
  });

  it("can remap an action to a new keybinding", () => {
    document.body.innerHTML =
      '<div data-phocus-context-name="root" data-phocus-context-argument="big-arg">' +
      '  <button id="button" />' +
      "</div>";
    this.ActionContextService.setContext(document.getElementById("button"));

    expect(this.ActionContextService.actionForKeypress("Control+o").action).toBe(
      logoutAction
    );
    this.ActionContextService.remapAction(logoutAction, "Control+q");
    expect(this.ActionContextService.actionForKeypress("Control+o")).toBeUndefined();
    expect(this.ActionContextService.actionForKeypress("Control+q").action).toBe(
      logoutAction
    );
    this.ActionContextService.remapAction(logoutAction, undefined);
  });

  it("can collect remappings in order to save them", () => {
    expect(this.ActionContextService.currentRemapping).toEqual([]);
    this.ActionContextService.remapAction(logoutAction, "Control+q");
    expect(this.ActionContextService.currentRemapping.length).toEqual(1);
    expect(this.ActionContextService.currentRemapping[0].action).toEqual("logout");
    expect(this.ActionContextService.currentRemapping[0].mapping).toEqual(
      "Control+q"
    );
    this.ActionContextService.remapAction(logoutAction, undefined);
  });
});
