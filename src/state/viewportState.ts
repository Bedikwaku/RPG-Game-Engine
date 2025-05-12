type ViewOffsetListener = (x: number, y: number) => void;
let offset = { x: 0, y: 0 };
const listeners: ViewOffsetListener[] = [];

export const viewport = {
  x: 0,
  y: 0,
  width: 15,
  height: 15,
};

export const viewOffset = {
  get x() {
    return offset.x;
  },
  set x(value: number) {
    offset.x = value;
    notifyListeners();
  },
  get y() {
    return offset.y;
  },
  set y(value: number) {
    offset.y = value;
    notifyListeners();
  },
  set(x: number, y: number) {
    offset.x = x;
    offset.y = y;
    notifyListeners();
  },
};

function notifyListeners() {
  for (const listener of listeners) {
    listener(offset.x, offset.y);
  }
}

export function subscribeToViewOffset(listener: ViewOffsetListener) {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index !== -1) listeners.splice(index, 1);
  };
}

export const viewScale = 1;
