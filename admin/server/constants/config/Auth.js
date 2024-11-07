const AuthType = {
    MIN: 1,
    BAD: 1,
    GOOD: 2,
    MAX: 2,
  };
  
  const AuthScore = {
    MIN_BAD: 1,
    MAX_BAD: 20,
    MIN_GOOD: 21,
    MAX_GOOD: 30,
    MAX_AUTH: 30,
    MIN_HUMAN: 31,
    MAX_HUMAN: 100,
  };
  
  module.exports = { AuthType, AuthScore };
  