'use strict';

const ID = (value) => value;
const NOOP = () => {};
const NOOP_FACTORY = () => NOOP;

const RuntimeKind = {
  ReactNative: 'react-native',
  UI: 'ui',
  Custom: 'custom',
};

globalThis._WORKLET = false;
globalThis.__RUNTIME_KIND = RuntimeKind.ReactNative;

const workletsMock = {
  isShareableRef: () => true,
  makeShareable: ID,
  makeShareableCloneOnUIRecursive: ID,
  makeShareableCloneRecursive: ID,
  shareableMappingCache: new Map(),
  getStaticFeatureFlag: () => false,
  setDynamicFeatureFlag: NOOP,
  isSynchronizable: () => false,
  getRuntimeKind: () => RuntimeKind.ReactNative,
  RuntimeKind,
  createWorkletRuntime: NOOP_FACTORY,
  runOnRuntime: ID,
  scheduleOnRuntime: (callback) => callback(),
  createSerializable: ID,
  isSerializableRef: ID,
  serializableMappingCache: new Map(),
  createSynchronizable: ID,
  callMicrotasks: NOOP,
  executeOnUIRuntimeSync: (fn) => fn,
  runOnJS: (fn) => (...args) => queueMicrotask(() => fn(...args)),
  runOnUI: (fn) => (...args) => fn(...args),
  runOnUIAsync: (fn) => (...args) => Promise.resolve(fn(...args)),
  runOnUISync: (fn) => fn(),
  scheduleOnRN: (fn, ...args) => fn(...args),
  scheduleOnUI: (fn, ...args) => fn(...args),
  unstable_eventLoopTask: NOOP_FACTORY,
  isWorkletFunction: () => false,
  WorkletsModule: {},
};

module.exports = {
  __esModule: true,
  ...workletsMock,
};
