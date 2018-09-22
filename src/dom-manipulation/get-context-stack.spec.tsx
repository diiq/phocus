import {
  getContextStack
} from "./get-context-stack";

describe("getContextStack", () => {
  it("Creates a stack for a dom element", () => {
    document.body.innerHTML =
    '<div data-phocus-context-name="my-context" data-phocus-context-argument="my-arg">' +
    '  <button id="button" />' +
    '</div>';
    const stack = getContextStack(document.getElementById('button'))
    expect(stack.length).toBe(1);
    expect(stack[0].context).toBe("my-context");
    expect(stack[0].argument).toBe("my-arg");
  });

  it("Creates a nested stack for nested dom elements", () => {
    document.body.innerHTML =
    '<div data-phocus-context-name="bigger-context" data-phocus-context-argument="big-arg">' +
    '  <div data-phocus-context-name="my-context" data-phocus-context-argument="my-arg">' +
    '    <button id="button" />' +
    '  </div>' +
    '</div>';
    const stack = getContextStack(document.getElementById('button'))
    expect(stack.length).toBe(2);
    expect(stack[1].context).toBe("bigger-context");
    expect(stack[1].argument).toBe("big-arg");
  });

  it("Skips elements without contexts", () => {
    document.body.innerHTML =
    '<div data-phocus-context-name="bigger-context" data-phocus-context-argument="big-arg">' +
    '  <div>' +
    '    <button id="button" />' +
    '  </div>' +
    '</div>';
    const stack = getContextStack(document.getElementById('button'))
    expect(stack.length).toBe(1);
    expect(stack[0].context).toBe("bigger-context");
    expect(stack[0].argument).toBe("big-arg");
  });

  it("Handles elements with no arguments", () => {
    document.body.innerHTML =
    '<div data-phocus-context-name="bigger-context">' +
    '  <div>' +
    '    <button id="button" />' +
    '  </div>' +
    '</div>';
    const stack = getContextStack(document.getElementById('button'))
    expect(stack.length).toBe(1);
    expect(stack[0].context).toBe("bigger-context");
    expect(stack[0].argument).toBe(undefined);
  });
});
