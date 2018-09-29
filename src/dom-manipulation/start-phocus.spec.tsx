import { startPhocus } from "./start-phocus";
import {
  ActionContextService,
  Action,
  ContextBlueprint
} from "../action-context/action-context";
import * as jsdom from "jsdom";

describe("dispatch", () => {
  mutationObserverShim();

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
    startPhocus(document.body);

    const button = document.getElementById("button");
    button.click();
    expect((saveAction.actOn as jest.Mock).mock.calls.length).toBe(1);
  });

  it("Sets a click action for elements that gain a data-phocus-action", () => {
    // Button doesn't have an action to start, but phocus is watching!
    document.body.innerHTML = `
      <div data-phocus-context-name="project" data-phocus-context-argument="my-arg">
        <button id="button" />
      </div>`;
    startPhocus(document.body);

    const button = document.getElementById("button");
    button.setAttribute("data-phocus-action", "save");

    button.click();
    expect((saveAction.actOn as jest.Mock).mock.calls.length).toBe(1);
  });
});

function mutationObserverShim() {
  const dom = new jsdom.JSDOM();
  global["window"] = dom.window;
  global["document"] = dom.window.document;

  require("mutationobserver-shim");

  global["MutationObserver"] = window["MutationObserver"];
}
