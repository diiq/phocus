import {
  ContextService,
  Action,
  ContextBlueprint
} from "./context-service";
import { HotkeyService } from "./hotkey-service";

describe("actionContextService", () => {
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

  let actionContextService: ContextService

  beforeEach(() => {
    actionContextService = new ContextService(new HotkeyService())
    actionContextService.clear();
    actionContextService.add("project", projectContext);
    actionContextService.add("root", rootContext);
    actionContextService.add("opaque", opaqueContext);
  });

  it("Creates a stack for a dom element", () => {
    document.body.innerHTML =
      '<div data-phocus-context-name="project" data-phocus-context-argument="my-arg">' +
      '  <button id="button" />' +
      "</div>";
    actionContextService.setContext(document.getElementById("button")!!);
    const stack = actionContextService.contextStack;
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
    actionContextService.setContext(document.getElementById("button")!);
    const stack = actionContextService.contextStack;
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
    actionContextService.setContext(document.getElementById("button")!);
    const stack = actionContextService.contextStack;
    expect(stack.length).toBe(1);
    expect(stack[0].context).toBe("root");
    expect(stack[0].argument).toBe("big-arg");
  });

  it("Finds context when called on elements with context on themselves", () => {
    document.body.innerHTML =
      "<div >" +
      '  <button id="button" data-phocus-context-name="root" data-phocus-context-argument="big-arg" />' +
      "</div>";
    actionContextService.setContext(document.getElementById("button")!);
    const stack = actionContextService.contextStack;
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
    actionContextService.setContext(document.getElementById("button")!);
    const stack = actionContextService.contextStack;
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
      actionContextService.setContext(document.getElementById("button")!);
      const actions1 = actionContextService.availableActions;
      expect(actions1?.length).toEqual(1);
      expect(actions1?.[0].action).toEqual(logoutAction);
    });

    it("collects actions in order up the context stack", () => {
      document.body.innerHTML =
        '<div data-phocus-context-name="root" data-phocus-context-argument="big-arg">' +
        '  <div data-phocus-context-name="project" data-phocus-context-argument="my-arg">' +
        '    <button id="button" />' +
        "  </div>" +
        "</div>";
      actionContextService.setContext(document.getElementById("button")!);
      const actions = actionContextService.availableActions;
      expect(actions?.length).toEqual(2);
      expect(actions?.[0].action).toEqual(saveAction);
    });

    it("Does not collect actions through an opaque context", () => {
      document.body.innerHTML =
        '<div data-phocus-context-name="root" data-phocus-context-argument="big-arg">' +
        '  <div data-phocus-context-name="opaque" data-phocus-context-argument="my-arg">' +
        '    <button id="button" />' +
        "  </div>" +
        "</div>";
      actionContextService.setContext(document.getElementById("button")!);
      const actions = actionContextService.availableActions;
      expect(actions?.length).toEqual(0);
    });
  });

  describe("keybindings", () => {
    it("gets an action for a keypress", () => {
      document.body.innerHTML =
        '<div data-phocus-context-name="root" data-phocus-context-argument="big-arg">' +
        '  <button id="button" />' +
        "</div>";
      actionContextService.setContext(document.getElementById("button")!);

      expect(actionContextService.actionForKeypress("Control+s")?.action).toBe(
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
      actionContextService.setContext(document.getElementById("button")!);

      expect(actionContextService.actionForKeypress("Control+s")?.action).toBe(
        saveAction
      );

      // But a command can have multiple bindings
      expect(actionContextService.actionForKeypress("Control+o")?.action).toBe(
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
      actionContextService.setContext(document.getElementById("button")!);
      expect(
        actionContextService.actionForKeypress("Control+p")
      ).toBeUndefined();
      expect(
        actionContextService.actionForKeypress("Control+o")
      ).toBeUndefined();
    });
  });

  it("can remap an action to a new keybinding", () => {
    document.body.innerHTML =
      '<div data-phocus-context-name="root" data-phocus-context-argument="big-arg">' +
      '  <button id="button" />' +
      "</div>";
    actionContextService.setContext(document.getElementById("button")!);

    expect(actionContextService.actionForKeypress("Control+o")?.action).toBe(
      logoutAction
    );
    actionContextService.remapAction(logoutAction, "Control+q");
    expect(actionContextService.actionForKeypress("Control+o")).toBeUndefined();
    expect(actionContextService.actionForKeypress("Control+q")?.action).toBe(
      logoutAction
    );
    actionContextService.remapAction(logoutAction, undefined);
  });

  it("can collect remappings in order to save them", () => {
    expect(actionContextService.currentRemapping).toEqual([]);
    actionContextService.remapAction(logoutAction, "Control+q");
    expect(actionContextService.currentRemapping.length).toEqual(1);
    expect(actionContextService.currentRemapping[0].action).toEqual("logout");
    expect(actionContextService.currentRemapping[0].mapping).toEqual(
      "Control+q"
    );
    actionContextService.remapAction(logoutAction, undefined);
  });
});
