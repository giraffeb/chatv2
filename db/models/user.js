let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let userSchema = new Schema({
    user_id: String,
    password: String,
    friend_list: Array,
    reg_date: {type: Date, default: Date.now }
});

module.exports = mongoose.model('user', userSchema);