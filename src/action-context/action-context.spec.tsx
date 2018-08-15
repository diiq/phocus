import { ActionContextServiceClass, Action, ContextBlueprint } from './action-context';

describe("ActionContextService", () => {
  let ActionContextService: ActionContextServiceClass;
  let saveAction: Action = new Action({
    name: "Save project",
    shortDocumentation: "Saves the project",
    defaultKeys: ["Control+s", "Control+p"],
    actOn: () => { },
    searchTerms: ["save", "project"]
  })

  let projectContext: ContextBlueprint = {
    name: "Project editing",
    documentation: "This is where you can change the settings of your project",
    actions: {
      save: saveAction
    }
  }

  let logoutAction: Action = new Action({
    name: "Logout",
    shortDocumentation: "Log out",
    defaultKeys: ["Control+s", "Control+o"],
    actOn: () => { },
    searchTerms: ["log out", "sign out"]
  })

  let rootContext: ContextBlueprint = {
    name: "Root",
    documentation: "These are global actions, available anywhere.",
    actions: {
      logout: logoutAction
    }
  }

  let opaqueContext: ContextBlueprint = {
    name: "Opaque",
    documentation: "Conceal all actions.",
    opaque: true,
    actions: {}
  }

  beforeEach(() => {
    ActionContextService = new ActionContextServiceClass();
    ActionContextService.addContext("project", projectContext);
    ActionContextService.addContext("root", rootContext);
    ActionContextService.addContext("opaque", opaqueContext);
    ActionContextService.newContext();
    ActionContextService.pushNewContext("root", {});
    ActionContextService.enterNewContext();
  });

  it("Can create a new context", () => {
    expect(ActionContextService.currentContext).toBe("root");
    ActionContextService.newContext();
    ActionContextService.pushNewContext("project", {});
    ActionContextService.enterNewContext();
    expect(ActionContextService.currentContext).toBe("project");
  });

  it("Collects available actions", () => {
    const actions1 = ActionContextService.availableActions
    expect(actions1.length).toEqual(1);
    expect(actions1[0].action).toEqual(logoutAction);

    // If I have two contexts on the stack, actions of both are available
    const aThis = {};
    ActionContextService.newContext()
    ActionContextService.pushNewContext("project", aThis);
    ActionContextService.pushNewContext("root", {});
    ActionContextService.enterNewContext();
    const actions2 = ActionContextService.availableActions
    expect(actions2.length).toEqual(2);
    expect(actions2[0].action).toEqual(saveAction);
  });

  it("gets an action for a keypress", () => {
    expect(ActionContextService.actionForKeypress("Control+s").action).toBe(logoutAction);

    // Pushing a context can shadow a keybinding
    ActionContextService.newContext()
    ActionContextService.pushNewContext("project", {});
    ActionContextService.pushNewContext("root", {});
    ActionContextService.enterNewContext();
    expect(ActionContextService.actionForKeypress("Control+s").action).toBe(saveAction);

    // But a command can have multiple bindings
    expect(ActionContextService.actionForKeypress("Control+o").action).toBe(logoutAction);

    // Pushing an opaque context prevents the use of bindings lower in the stack
    // But keeps the root context
    ActionContextService.newContext()
    ActionContextService.pushNewContext("opaque", {});
    ActionContextService.pushNewContext("project", {});
    ActionContextService.pushNewContext("root", {});
    ActionContextService.enterNewContext();
    expect(ActionContextService.actionForKeypress("Control+p")).toBeUndefined();
    expect(ActionContextService.actionForKeypress("Control+o").action).toBe(logoutAction);
  });

  it("can remap an action to a new keybinding", () => {
    expect(ActionContextService.actionForKeypress("Control+o").action).toBe(logoutAction);

    ActionContextService.remapAction(logoutAction, "Control+q");
    expect(ActionContextService.actionForKeypress("Control+o")).toBeUndefined();
    expect(ActionContextService.actionForKeypress("Control+q").action).toBe(logoutAction);
    ActionContextService.remapAction(logoutAction, undefined);
  });

  it("can collect remappings in order to save them", () => {
    expect(ActionContextService.currentRemapping).toEqual([]);
    ActionContextService.remapAction(logoutAction, "Control+q");
    expect(ActionContextService.currentRemapping.length).toEqual(1);
    expect(ActionContextService.currentRemapping[0].action).toEqual("logout");
    expect(ActionContextService.currentRemapping[0].mapping).toEqual("Control+q");
    ActionContextService.remapAction(logoutAction, undefined);
  });
});
