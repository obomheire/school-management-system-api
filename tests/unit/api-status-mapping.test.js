const ApiHandler = require('../../managers/api/Api.manager');

describe('ApiHandler error/status mapping', () => {
  const api = new ApiHandler({
    config: {},
    cortex: { sub: jest.fn() },
    cache: {},
    managers: {},
    mwsRepo: {},
    prop: 'httpExposed',
  });

  it('maps authentication errors to 401', () => {
    expect(api._deriveStatusCodeFromErrors(['Authentication required'])).toBe(401);
  });

  it('maps access errors to 403', () => {
    expect(api._deriveStatusCodeFromErrors(['Access denied'])).toBe(403);
  });

  it('maps not found errors to 404', () => {
    expect(api._deriveStatusCodeFromErrors(['School not found'])).toBe(404);
  });

  it('maps conflict errors to 409', () => {
    expect(api._deriveStatusCodeFromErrors(['Student ID already exists'])).toBe(409);
  });

  it('maps validation errors to 422', () => {
    expect(api._deriveStatusCodeFromErrors(['School ID is required'])).toBe(422);
  });
});
