let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let ChatRoom = new Schema({
    chatroom_title: String,
    sender: String,
    receiver: String,
    chat_list: Array,
    last_date: {type: Date, default: Date.now }
})

module.exports = mongoose.model('chatroom', ChatRoom);