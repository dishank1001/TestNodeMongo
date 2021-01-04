const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String
 },
  invitationCode:{
    type: String
  },
  createdAt: { 
      type: Date, 
      expires: '1440m',
      default: Date.now }
});

const SecretCodes = mongoose.model('SecretCodes', UserSchema);

module.exports = SecretCodes;



