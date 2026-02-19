const ResponseDispatcher = require('../../managers/response_dispatcher/ResponseDispatcher.manager');

describe('ResponseDispatcher', () => {
  it('normalizes string errors into array', () => {
    const dispatcher = new ResponseDispatcher();
    const send = jest.fn();
    const status = jest.fn().mockReturnValue({ send });

    dispatcher.dispatch({ status }, { ok: false, code: 401, errors: 'unauthorized' });

    expect(status).toHaveBeenCalledWith(401);
    expect(send).toHaveBeenCalledWith({
      ok: false,
      data: {},
      errors: ['unauthorized'],
      message: '',
    });
  });
});
