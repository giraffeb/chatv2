module.exports = function(){
    let mongoose = require('mongoose');
    
    
    let db = mongoose.connection;

    db.once('open', function(){
        console.log('db connect');
    })
    
    mongoose.connect('mongodb://localhost:/chatv2',{useNewUrlParser: true});
    return db;
}