const beep = require("beepbeep");

export function beepStart() {
  beep({
    frequency: 800,
    duration: 1000,
    volume: 0.5
  });
}

export function beepDone() {
  beep({
    frequency: 1200,
    duration: 1000,
    volume: 0.5
  });
}
