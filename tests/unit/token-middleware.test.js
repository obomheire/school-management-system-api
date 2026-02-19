const shortTokenMwBuilder = require('../../mws/__shortToken.mw');

describe('__shortToken middleware', () => {
  it('accepts Authorization Bearer token', () => {
    const verifyShortToken = jest.fn().mockReturnValue({ userId: 'user-1' });
    const dispatch = jest.fn();

    const mw = shortTokenMwBuilder({
      managers: {
        token: { verifyShortToken },
        responseDispatcher: { dispatch },
      },
    });

    const next = jest.fn();
    mw({
      req: { headers: { authorization: 'Bearer test-short-token' } },
      res: {},
      next,
    });

    expect(verifyShortToken).toHaveBeenCalledWith({ token: 'test-short-token' });
    expect(next).toHaveBeenCalledWith({ userId: 'user-1' });
    expect(dispatch).not.toHaveBeenCalled();
  });
});
