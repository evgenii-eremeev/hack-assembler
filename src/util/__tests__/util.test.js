const { lines } = require('../util');

describe('util', function() {
  describe('lines', function() {
    it('should split string to lines by \\n', function() {
      const data = '123456789\nabcdefgh\n!@#$%^&*()';
      expect([...lines(data)]).toEqual(data.split('\n'));
    });
    it('should split string to lines by \\r\\n', function() {
      const data = '123456789\nabcdefgh\n!@#$%^&*()';
      expect([...lines(data)]).toEqual(data.split(/\r?\n/));
    });
  });
});
