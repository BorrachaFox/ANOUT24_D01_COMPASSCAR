module.exports = function ValidationError(details) {
  this.name = 'ValidationError';
  this.status = 400;
  this.details = details || 'Invalid data';
};
