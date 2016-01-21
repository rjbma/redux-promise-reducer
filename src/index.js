// a prefix to easily identify relevant actions
const NAMESPACE = 'RPR';
// status of the promise. Suffixed to the action names
const [ PENDING, FULFILLED, REJECTED ] = ['PENDING', 'FULFILLED', 'REJECTED'];
// regex that check if an action is relevant or not
const ACTION_TYPE_REGEX = new RegExp(`^${NAMESPACE}.([A-Z_]+)_(${PENDING}|${FULFILLED}|${REJECTED})$`)

/**
 * Create an action for resolving the specified promise.
 * @param namespace a prefix for the action's type
 * @param parameter if specified, the promise's result will be stored in a property with this name by the default reducer
 * @param actionName name of the action; will be prefixed with the specified namespace, and the suffixed with the state
 * of the promise. If not speified, `property` will be used instead
 * @param promise the promise. Mandatory
 * @returns a new action
 */
export const createPromiseAction = ({parameter, actionName = `RESOLVE_${parameter}`, promise} = {}) => {
    if (!actionName) {
        throw new Error({msg: 'action name can not be empty'});
    }
    actionName = actionName.toUpperCase();
    return {
        type: `${NAMESPACE}_${actionName}`,
        meta: {
            property: parameter
        },
        payload: {
            promise: promise
        }
    };
};

/**
 * Function that creates a reducer for handling actions created with `createPromiseAction`.
 * Optionally, this function may take 3 reducers for handling the 3 states of a promise: pending, fulfilled and rejected.
 * Otherwise, the default reducers will be used instead.
 *
 * If the action specified a `meta.property`, an object with the following structure:
 * ```
 *      meta.property
 *          pending: `true` if the promise is still being resolved
 *          rejected: `true` if the promise was rejected
 *          fulfilled: `true`if the promise was fulfilled
 *          data: value with which the promise was resolved
 * ```
 */
export const promiseReducer =
    ({pendingReducer = handlePendingReducer, fulfilledReducer = handleFulfilledReducer, rejectedReducer = handleRejectedReducer} = {}) =>
        (state = {}, action) => {
            var actionProps = decodeAction(action);
            if (actionProps) {
                // fetch the property where the response will be stored
                // if no property was specified, then store nothing
                const propertyName = action.meta && action.meta.property;
                if (propertyName) {
                    if (actionProps.type === PENDING) {
                        return pendingReducer(state, action);
                    } else if (actionProps.type === FULFILLED) {
                        return fulfilledReducer(state, action);
                        ;
                    } else if (actionProps.type === REJECTED) {
                        return rejectedReducer(state, action);
                        ;
                    }
                }
            }
            return state;
        };

/**
 * Default reducer for handling PENDING actions
 */
function handlePendingReducer(state, action) {
    return Object.assign({}, state, {
        [action.meta.property]: {
            pending: true,
            error: false,
            ready: false
        }
    });
}

/**
 * Default reducer for handling FULFILLED actions
 */
function handleFulfilledReducer(state, action) {
    return Object.assign({}, state, {
        [action.meta.property]: {
            pending: false,
            error: false,
            ready: true,
            data: action.payload
        }
    });
}

/**
 * Default reducer for handling PENDING actions
 */
function handleRejectedReducer(state, action) {
    return Object.assign({}, state, {
        [action.meta.property]: {
            pending: false,
            ready: false,
            error: true
        }
    });
}

/**
 * Parse the action and decompose into its relevant parts
 * @param   {Object}   action [[Description]]
 * @returns {[[Type]]} [[Description]]
 */
function decodeAction(action) {
    if (action && action.type) {
        var match = ACTION_TYPE_REGEX.exec(action.type);
        if (match) {
            return {
                type: match[2],
                entity: match[1]
            }
        }
    }
}
