# redux-promise-reducer
Easily integrate with [redux-promise-middleware](https://github.com/pburtchaell/redux-promise-middleware).

1. Create actions with `createPromiseAction`, passing it a property name and a promise.
2. Those actions are then handled by the middleware, which resolves the promise and dispatches new actions when the status of the promise changes.
3. Those actions are then handled by the reducer, which automatically updates the property specified previously in the state. For each promise, the state now holds information about its status (wether it's resolved, pending or rejected), besides its result when it is resolved, of course.

# Installation

    npm install redux-promise-reducer --save

# Usage

#### 1. Setup the [redux-promise-middleware](https://github.com/pburtchaell/redux-promise-middleware)
Setup your store with the middleware to make sure it handles the actions you'll create for resolving promises.

#### 2. Create the reducer that will handle all the actions created by the middleware. 

You can either use the default reducing functions for the `PENDING`, `FULFILLED` and `REJECTED` actions (see below for details):
```
import { promiseReducer } from 'redux-promise-reducer';
...
const myreducer = promiseReducer();
```
or you can customize how your reducer calculated the next state for each update in the promise state:
```
const myreducer = promiseReducer({
    // here we choose not to change the default reducer for PENDING
    fulfilledReducer: () => 'ok', 
    rejectedReducer: () => 'awww man!'
});
```
#### 3. Make sure your store uses your new reducer

Here we use `redux.combineReducers` to make sure all your promises reside under a specific property (`data` in this case) in your state:
```
import { combineReducers } from 'redux'
const rootReducer = combineReducers({
  data: promiseReducer,
  ... // other reducers heres
})
// create the store using `rootReducer`
```
#### 4. Dispatch actions using the supplied action creator

The action creator `createPromiseAction` creates actions that will be handled by `redux-promise-middleware`. The middleware will immediately invoke a `PENDING` action; it will also make sure that the promise embedded in the action is either `FULFILLED` or `REJECTED`, and will invoke new actions when that happens. These new actions will then be reduced by the reducer we created earlier. 

Every action created by this creator get prefixed with `RPR`. Also, the reducer only handles actions that have this prefix (along with some other requirements, like terminating with either `PENDING`|`FULFILLED`|`REJECTED`). This currently hard-coded.

Some examples:

- create an action with type `RPR_RESOLVE_PROPNAME` (the action name is being inferred from the property name - note it adds `RESOLVE_` to it). Data will be stored in the state under a property named `propname`
```
import { createPromiseAction } from 'redux-promise-reducer';
const promise = Promise.resolve('ok');
const action = createPromiseAction({parameter: 'propname', promise});
```
- you can specify the action name instead. This creates an action with type `RPR_JUST_DO_IT`
```
const promise = Promise.resolve('ok');
const action = createPromiseAction({parameter: 'propname', actionName: 'JUST_DO_IT', promise});
```
Also note the action names are always in caps.

# The default reducing functions
You create your reducer by invoking `promiseReducer`. This functions accepts an object, which holds functions that define how your state is modified in each state of the promise:
```
promiseReducer({
    // function that will determine the next state when a PENDING action is dispatched by the middleware
    pendingReducer: (state, action) => ...  
    fulfilledReducer: (state, action) => ...  
    rejectedReducer: (state, action) => ...  
})
```
You can however omit the whole object, or at least some of its parameters. In that case the default reducing functions will be used, which will produce the following states (note that `propname` is the name of the property that was specified when creating the action with `createPromiseAction`:

For the `PENDING` state:
```
propname: {
    pending: true,
    error: false,
    ready: false
}
```

For the `FULFILLED` state:
```
propname: {
    pending: false,
    error: false,
    ready: true,
    data: ... // result of the promise
}
```

For the `REJECTED` state:
```
propname: {
    pending: true,
    error: true,
    ready: false
}
```
