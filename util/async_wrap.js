module.exports = function(asyncFn){
    return (async function(req, res, next){
        return await asyncFn(req, res, next).catch(next);
    });
}