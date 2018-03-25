import { EventEmitter } from "events";

export interface EventDispatcher extends EventEmitter {
    off: (eventName: string) => void;
    addSubscriber: (subscriber: EventSubscriber) => void;
    removeSubscriber: (subscriber: EventSubscriber) => void;
}

export interface EventSubscriber {
    subscribe: (dispatcher: EventDispatcher) => void;
    unSubscribe: (dispatcher: EventDispatcher) => void;
}
