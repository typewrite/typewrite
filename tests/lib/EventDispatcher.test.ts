import * as chai from "chai";
import { EventDispatcher } from "../../src/lib/EventDispatcher";
import * as EventInterfaces from "../../src/interfaces/Events";

const expect = chai.expect;
let testGlobalVar = "test";

describe("Test EventDispatcher", () => {

    it(" .on() method should add Event to eventList ", (done) => {

        const dispatcher = new EventDispatcher();

        dispatcher.on("test:event", () => {
            return "test:callBack";
        });

        expect(dispatcher.eventNames().length).to.be.eq(1);
        expect(dispatcher.eventNames()).to.contain.members(["test:event"]);
        done();
    });

    it(" .emit() method executes corresponding callbacks ", (done) => {

        const dispatcher = new EventDispatcher();

        dispatcher.on("test:event", () => {
            testGlobalVar = "newTestValue";
        });
        dispatcher.emit("test:event");

        expect(dispatcher.eventNames().length).to.be.eq(1);
        expect(dispatcher.eventNames()).to.contain.members(["test:event"]);
        expect(testGlobalVar).to.be.eq("newTestValue");
        done();
    });

    it(" .addSubscriber() method execute subscribe tasks. ", (done) => {

        const dispatcher = new EventDispatcher();
        const testSubscriber = new TestSubscriber();
        dispatcher.addSubscriber(testSubscriber);
        dispatcher.emit("test:event");

        expect(dispatcher.eventNames().length).to.be.eq(1);
        expect(dispatcher.eventNames()).to.contain.members(["test:event"]);
        expect(testSubscriber.testProp).to.be.eq("subscribe:changedValue");
        done();
    });

    it(" .removeSubscriber() method execute unSubscribe tasks. ", (done) => {

        const dispatcher = new EventDispatcher();
        const testSubscriber = new TestSubscriber();
        dispatcher.addSubscriber(testSubscriber);
        dispatcher.removeSubscriber(testSubscriber);
        dispatcher.emit("test:event");

        expect(dispatcher.eventNames().length).to.be.eq(0);
        done();
    });

});

class TestSubscriber implements EventInterfaces.EventSubscriber {

    public testProp = "initialValue";

    public subscribe(dispatcher: EventInterfaces.EventDispatcher) {
        const self = this;
        dispatcher.on("test:event", () => {
            self.testProp = "subscribe:changedValue";
        });
    }

    public unSubscribe(dispatcher: EventInterfaces.EventDispatcher) {
        dispatcher.off("test:event");
    }
}
