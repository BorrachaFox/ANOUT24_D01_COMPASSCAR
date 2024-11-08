module.exports = function NotFoundError(message) {
  this.name = 'NotFoundError';
  this.status = 404;
  this.message = message || 'The requested resource was not found';
};
