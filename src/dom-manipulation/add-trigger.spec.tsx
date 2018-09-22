import { addTrigger } from "./add-trigger";
import {
  ActionContextServiceClass,
  Action,
  ContextBlueprint
} from "../action-context/action-context";

describe("makeTriggerable", () => {
  let ActionContextService: ActionContextServiceClass;
  let saveAction: Action = new Action({
    name: "Save project",
    shortDocumentation: "Saves the project",
    defaultKeys: ["Control+s", "Control+p"],
    actOn: jest.fn(),
    searchTerms: ["save", "project"]
  });

  let projectContext: ContextBlueprint = {
    name: "Project editing",
    documentation: "This is where you can change the settings of your project",
    actions: {
      save: saveAction
    }
  };

  beforeEach(() => {
    ActionContextService = new ActionContextServiceClass();
    ActionContextService.addContext("project", projectContext);
  });

  it("Sets the tab index", () => {
    document.body.innerHTML =
    '<div data-phocus-context-name="project" data-phocus-context-argument="my-arg">' +
    '  <button id="button" />' +
    "</div>";
    const button = document.getElementById("button");
    addTrigger(button, "save");

    expect(saveAction.actOn.mock.calls.length).toBe(1)
  });
});
