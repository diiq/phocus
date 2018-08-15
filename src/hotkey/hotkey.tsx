const keys = {
  3: ['Cancel', 'Cancel'],
  6: ['Help', 'Help'],
  8: ['Backspace', 'Backspace'],
  9: ['Tab', 'Tab'],
  12: ['Clear', 'Clear'],
  13: ['Enter', 'Enter'],
  16: ['Shift', 'Shift'],
  17: ['Control', 'Control'],
  18: ['Alt', 'Alt'],
  19: ['Pause', 'Pause'],
  20: ['CapsLock', 'CapsLock'],
  27: ['Escape', 'Escape'],
  28: ['Convert', 'Convert'],
  29: ['NonConvert', 'NonConvert'],
  30: ['Accept', 'Accept'],
  31: ['ModeChange', 'ModeChange'],
  32: [' ', ' '],
  33: ['PageUp', 'PageUp'],
  34: ['PageDown', 'PageDown'],
  35: ['End', 'End'],
  36: ['Home', 'Home'],
  37: ['ArrowLeft', 'ArrowLeft'],
  38: ['ArrowUp', 'ArrowUp'],
  39: ['ArrowRight', 'ArrowRight'],
  40: ['ArrowDown', 'ArrowDown'],
  41: ['Select', 'Select'],
  42: ['Print', 'Print'],
  43: ['Execute', 'Execute'],
  44: ['PrintScreen', 'PrintScreen'],
  45: ['Insert', 'Insert'],
  46: ['Delete', 'Delete'],
  48: ['0', ')'],
  49: ['1', '!'],
  50: ['2', '@'],
  51: ['3', '#'],
  52: ['4', '$'],
  53: ['5', '%'],
  54: ['6', '^'],
  55: ['7', '&'],
  56: ['8', '*'],
  57: ['9', '('],
  91: ['OS', 'OS'],
  93: ['ContextMenu', 'ContextMenu'],
  144: ['NumLock', 'NumLock'],
  145: ['ScrollLock', 'ScrollLock'],
  181: ['VolumeMute', 'VolumeMute'],
  182: ['VolumeDown', 'VolumeDown'],
  183: ['VolumeUp', 'VolumeUp'],
  186: [';', ':'],
  187: ['=', '+'],
  188: [',', '<'],
  189: ['-', '_'],
  190: ['.', '>'],
  191: ['/', '?'],
  192: ['`', '~'],
  219: ['[', '{'],
  220: ['\\', '|'],
  221: [']', '}'],
  222: ["'", '"'],
  224: ['Meta', 'Meta'],
  225: ['AltGraph', 'AltGraph'],
  246: ['Attn', 'Attn'],
  247: ['CrSel', 'CrSel'],
  248: ['ExSel', 'ExSel'],
  249: ['EraseEof', 'EraseEof'],
  250: ['Play', 'Play'],
  251: ['ZoomOut', 'ZoomOut']
};
var letter = '';
for (var i = 65; i < 91; i++) {
  letter = String.fromCharCode(i);
  keys[i] = [letter.toLowerCase(), letter.toUpperCase()];
}

export class HotkeyClass {
  isMacLike: boolean

  // TODO change map for mac/PC
  displayMap = {
    "Alt": "Alt+",
    "Meta": "\u2318+",
    "OS": "\u229E+",
    "Shift": "\u21E7",
    "Control": "Ctrl+"
  };
  modifiers = ["Control", "Alt", "Shift", "Meta", "OS"];

  constructor() {
    this.isMacLike = !!navigator.platform.match(/(Mac|iPhone|iPod|iPad)/i);
  }

  keyName(key: string) {
    const keyString = {
      " ": "Space",
    }[key];
    return keyString || key;
  }

  modifierKeyNameForPlatform(key: string) {
    return this.displayMap[key];
  }

  displayKey(canonicalKey: string) {
    const parts = canonicalKey.split("+");
    const key = parts.pop();
    const modifiers = parts.map(key => {
      return this.modifierKeyNameForPlatform(key);
    });
    return modifiers.join("") + key;
  }

  canonicalKeyFromEvent(e: KeyboardEvent) {
    var key = keys[e.keyCode][e.getModifierState('Shift') ? 1 : 0]
    if (this.modifiers.indexOf(key) >= 0) {
      return "";
    }

    const modifiers = this.modifiers.map(key => {
      return e.getModifierState(key) ? key + "+" : "";
    });
    return modifiers.join("") + this.keyName(key);
  }
}

export const Hotkey = new HotkeyClass();
