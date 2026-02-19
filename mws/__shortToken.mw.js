const extractToken = require('./_common/extractToken');

module.exports = ({ meta, config, managers }) =>{
    return ({req, res, next})=>{
        const token = extractToken(req.headers);
        if(!token){
            return managers.responseDispatcher.dispatch(res, {ok: false, code:401, errors: 'missing token'});
        }
        let decoded = null;
        try {
            decoded = managers.token.verifyShortToken({token});
            if(!decoded){
                return managers.responseDispatcher.dispatch(res, {ok: false, code:401, errors: 'unauthorized'});
            };
        } catch(err){
            return managers.responseDispatcher.dispatch(res, {ok: false, code:401, errors: 'unauthorized'});
        }
        next(decoded);
    }
}
