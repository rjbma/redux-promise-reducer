import { assert } from 'chai';
import { createPromiseAction, promiseReducer } from '../src/index.js';

describe('createPromiseAction', function () {

    it('builds default action type from property', function () {
        const action = createPromiseAction({parameter: 'propname'});
        assert.equal('RPR_RESOLVE_PROPNAME', action.type);
    });

    it('assigns property and promise to action', function () {
        const promise = Promise.resolve('ok');
        const action = createPromiseAction({parameter: 'propname', promise});
        assert.equal(action.meta.property, 'propname');
        assert.equal(action.payload.promise, promise);
    });

    it('capitalizes and sets explicit action name', function () {
        const action = createPromiseAction({parameter: 'propname', actionName: 'myaction'});
        assert.equal('RPR_MYACTION', action.type);
    });

});

describe('promiseReducer', function () {
    const promise = Promise.resolve('ok');

    it('default, handles PENDING action', function () {
        const action = {
            type: 'RPR_RESOLVEME_PENDING',
            meta: {property: 'propname'},
            payload: promise
        };
        const state = promiseReducer()({}, action);
        assert.deepEqual(state, {
            propname: {
                pending: true,
                error: false,
                ready: false
            }
        })
    });

    it('default, handles FULFILLED action', function () {
        const action = {
            type: 'RPR_RESOLVEME_FULFILLED',
            meta: {property: 'propname'},
            payload: 'ok'
        };
        const state = promiseReducer()({}, action);
        assert.deepEqual(state, {
            propname: {
                pending: false,
                error: false,
                ready: true,
                data: 'ok'
            }
        })
    });

    it('default, handles REJECTED action', function () {
        const action = {
            type: 'RPR_RESOLVEME_REJECTED',
            meta: {property: 'propname'},
            payload: 'ok'
        };
        const state = promiseReducer()({}, action);
        assert.deepEqual(state, {
            propname: {
                pending: false,
                error: true,
                ready: false
            }
        })
    });

    it('custom, handles PENDING action', function () {
        const action = {
            type: 'RPR_RESOLVEME_PENDING',
            meta: {property: 'propname'},
            payload: promise
        };
        const state = promiseReducer({pendingReducer: () => 'ok'})({}, action);
        assert.equal(state, 'ok');
    });

    it('custom, handles FULFILLED action', function () {
        const action = {
            type: 'RPR_RESOLVEME_FULFILLED',
            meta: {property: 'propname'},
            payload: promise
        };
        const state = promiseReducer({fulfilledReducer: () => 'ok'})({}, action);
        assert.equal(state, 'ok');
    });

    it('custom, handles REJECTED action', function () {
        const action = {
            type: 'RPR_RESOLVEME_REJECTED',
            meta: {property: 'propname'},
            payload: promise
        };
        const state = promiseReducer({rejectedReducer: () => 'ok'})({}, action);
        assert.equal(state, 'ok');
    });

});