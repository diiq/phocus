import { DOMTriggersService } from "./dom-triggers-service";
import {
  ContextService,
  Action,
  ContextBlueprint
} from "./context-service";
import { HotkeyService } from "./hotkey-service";

describe("makeTriggerable", () => {
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

  let contexts = new ContextService(new HotkeyService())
  let domTriggers = new DOMTriggersService(contexts)
  contexts.add("project", projectContext);

  it("Sets a click action", () => {
    document.body.innerHTML = `
      <div data-phocus-context-name="project" data-phocus-context-argument="my-arg">
        <button id="button" data-phocus-action="save" />
      </div>`;
    const button = document.getElementById("button")!;
    domTriggers.addTrigger(button);
    button.click();
    expect((saveAction.actOn as jest.Mock).mock.calls.length).toBe(1);
  });

  it("Sets a title", () => {
    document.body.innerHTML = `
      <div data-phocus-context-name="project" data-phocus-context-argument="my-arg">
        <button id="button" data-phocus-action="save" />
      </div>`;
    const button = document.getElementById("button")!;
    domTriggers.addTrigger(button);
    expect(button.title).toBe("Save project (Control+s)");
    expect(button.getAttribute("aria-label")).toBe("Save project (Control+s)");
  });

  it("Sets a name if empty", () => {
    document.body.innerHTML = `
      <div data-phocus-context-name="project" data-phocus-context-argument="my-arg">
        <button id="button" data-phocus-action="save" />
      </div>`;
    const button = document.getElementById("button")!;
    domTriggers.addTrigger(button);
    expect(button.textContent).toBe("Save project");
  });

  it("Sets a name if autolabel is set", () => {
    document.body.innerHTML = `
      <div data-phocus-context-name="project" data-phocus-context-argument="my-arg">
        <button id="button" data-phocus-action="save" data-phocus-autolabel=".label">Hello <span class="label"></span></button>
      </div>`;
    const button = document.getElementById("button")!;
    domTriggers.addTrigger(button);
    expect(button.textContent).toBe("Hello Save project");
  });

  it("Does not sets a name if there is content and no autolabel", () => {
    document.body.innerHTML = `
      <div data-phocus-context-name="project" data-phocus-context-argument="my-arg">
        <button id="button" data-phocus-action="save">Hello</button>
      </div>`;
    const button = document.getElementById("button")!;
    domTriggers.addTrigger(button);
    expect(button.textContent).toBe("Hello");
  });
});
