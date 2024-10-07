/* eslint-disable */
expect.extend({
  jsonMatching(actual: any, expected: any) {
    const pass = this.equals(JSON.parse(actual), expected);

    expected.toString = function (this: any) {
      return JSON.stringify(this);
    }.bind(expected);

    return {
      pass,
      message: () => `expected ${actual} to equal ${expected} when parsed as JSON`,
    };
  },
});

declare global {
  namespace jest {
    interface Expect {
      jsonMatching(expected: any): any;
    }
  }
}

export {};
