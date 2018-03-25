import * as EventInterfaces from "../interfaces/Events";
import { EventEmitter } from "events";

export class EventDispatcher extends EventEmitter implements EventInterfaces.EventDispatcher {

    public off(eventName: string, listener?: () => void) {
        if (listener === undefined) {
            // Remove all
            const listeners = this.listeners(eventName);
            listeners.map((listenerFn: () => void) => {
                this.removeListener(eventName, listenerFn);
            });

        } else {
            this.removeListener(eventName, listener);
        }
    }

    public addSubscriber(subscriber: EventInterfaces.EventSubscriber) {
        subscriber.subscribe(this);
    }

    public removeSubscriber(subscriber: EventInterfaces.EventSubscriber) {
        subscriber.unSubscribe(this);
    }
}
