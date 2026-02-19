module.exports = class ResponseDispatcher {
    constructor(){
        this.key = "responseDispatcher";
    }
    dispatch(res, {ok, data, code, errors, message, msg}){
        let statusCode = code? code: (ok==true)?200:400;
        const normalizedErrors = Array.isArray(errors)
            ? errors
            : (errors ? [errors] : []);
        return res.status(statusCode).send({
            ok: ok || false,
            data: data || {},
            errors: normalizedErrors,
            message: msg || message ||'',
        });
    }
}
