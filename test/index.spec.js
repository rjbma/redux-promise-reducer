import { assert } from 'chai';
import { createPromiseAction } from '../src/index.js';

describe('createPromiseAction', function() {
  
  it('should build default action type from property', function() {
    const action = createPromiseAction({parameter: 'propname'});
    assert.equal('RPR_RESOLVE_PROPNAME', action.type);
  });
  
});