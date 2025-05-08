import { expect } from "chai";
import sinon from "sinon";

describe("Game Init", () => {
  it("should call init once", () => {
    const game = { init: () => {} };
    const spy = sinon.spy(game, "init");
    game.init();
    expect(spy.calledOnce).to.be.true;
  });
});
