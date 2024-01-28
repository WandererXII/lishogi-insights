import { EventEmitter } from 'events';

// https://medium.com/trabe/synchronize-cache-updates-in-node-js-with-a-mutex-d5b395457138
export const lock = <T>() => {
  let locked: Record<string, boolean> = {};
  const ee = new EventEmitter();
  ee.setMaxListeners(0);

  return {
    acquire: (key: string) =>
      new Promise<T | undefined>(resolve => {
        if (!locked[key]) {
          locked[key] = true;
          return resolve(undefined);
        }

        const tryAcquire = (value: T) => {
          if (!locked[key]) {
            locked[key] = true;
            ee.removeListener(key, tryAcquire);
            return resolve(value);
          }
        };

        ee.on(key, tryAcquire);
      }),

    // If we pass a value, on release this value
    // will be propagated to all the code that's waiting for
    // the lock to release
    release: (key: string, value: T) => {
      Reflect.deleteProperty(locked, key);
      setImmediate(() => ee.emit(key, value));
    },
  };
};
