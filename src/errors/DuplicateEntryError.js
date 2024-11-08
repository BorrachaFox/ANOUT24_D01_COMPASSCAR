module.exports = function DuplicateEntryError(message) {
  this.name = 'DuplicateEntryError';
  this.status = 409;
  this.message = message || 'This entry already exists';
};
