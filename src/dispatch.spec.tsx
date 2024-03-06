import { Dispatch } from "./dispatch";
import {
  ContextService,
  Action,
  ContextBlueprint
} from "./context-service";
import { DOMTriggersService } from "./dom-triggers-service";
import { HotkeyService } from "./hotkey-service";

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

  let context = new ContextService(new HotkeyService())
  context.add("project", projectContext);

  let triggers = new DOMTriggersService(context);
  let dispatch = new Dispatch(triggers);

  it("Sets a click action for elements with data-phocus-action", () => {
    document.body.innerHTML = `
      <div data-phocus-context-name="project" data-phocus-context-argument="my-arg">
        <button id="button" data-phocus-action="save" />
      </div>`;
    const button = document.getElementById("button")!;
    dispatch.dispatch(document.body);
    button.click();
    expect((saveAction.actOn as jest.Mock).mock.calls.length).toBe(1);
  });

  it("Sets a title for elements with data-phocus-action", () => {
    document.body.innerHTML = `
      <div data-phocus-context-name="project" data-phocus-context-argument="my-arg">
        <button id="button" data-phocus-action="save" />
      </div>`;
    const button = document.getElementById("button")!;
    dispatch.dispatch(document.body);
    expect(button.title).toBe("Save project (Control+s)");
    expect(button.getAttribute("aria-label")).toBe("Save project (Control+s)");
  });
});
