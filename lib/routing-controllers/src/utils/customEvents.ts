import events from 'events';

let emitter = new events.EventEmitter();

emitter.on("customEvent", (message, user) => {
    console.log(`${user}: ${message}`);
});

// emitter.emit("customEvent", "Hello World", "Computer");

const emit = (eventName, message, user) => {
    emitter.emit(eventName, message, user)
}

export { emit, emitter };