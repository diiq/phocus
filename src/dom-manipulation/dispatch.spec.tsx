import { dispatch } from "./dispatch";
import {
  ActionContextService,
  Action,
  ContextBlueprint
} from "../action-context/action-context";

describe("dispatch", () => {
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

  ActionContextService.addContext("project", projectContext);

  it("Sets a click action for elements with data-phocus-action", () => {
    document.body.innerHTML = `
      <div data-phocus-context-name="project" data-phocus-context-argument="my-arg">
        <button id="button" data-phocus-action="save" />
      </div>`;
    const button = document.getElementById("button");
    dispatch(document.body);
    button.click();
    expect((saveAction.actOn as jest.Mock).mock.calls.length).toBe(1);
  });

  it("Sets a title for elements with data-phocus-action", () => {
    document.body.innerHTML = `
      <div data-phocus-context-name="project" data-phocus-context-argument="my-arg">
        <button id="button" data-phocus-action="save" />
      </div>`;
    const button = document.getElementById("button");
    dispatch(document.body);
    expect(button.title).toBe("Save project (Control+s)");
    expect(button.getAttribute("aria-label")).toBe("Save project (Control+s)");
  });
});
