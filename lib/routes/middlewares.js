/*
 * @description express middleware that only allows ajax requests
 */
let xmlHttpRequestOnly = (req, res, next) => {
    if(req.xhr){
        next();
        return;
    }
    res.status(404).json({
        success: false,
        error: 'Use ajax requests only'
    });
};

/*
 * @description validates user request this function  allows you to pass parameters to a middleware
 * @param mapping array
 * @param type String specifies where to look body or query
 * @return express middleware
 */

let validateRequest = (mapping, remove_others=true, type) => {
    return (req, res, next) => {
        let request = null;
        switch(type){
        case 'query':
            request = req.query;
            break;
        default:
            request = req.body;
        }

        let errors = {success: true, err: {}};
        let request_only_fields = {};
        for(let i in mapping){
            let j = mapping[i];
            if(request[j] == null || request[j] == ''){
                errors.success = false;
                errors.err[j] = {};
                errors.err[j]['message'] = j + ' must not be empty.';
            }
            else{
                request_only_fields[j] = request[j].trim();
            }
        }

        if(errors.success == false){
            res.status(200).json(errors);
        }
        else{
            if(remove_others){
                switch(type){
                case 'query':
                    req.query = request_only_fields;
                    break;
                default:
                    req.body = request_only_fields;
                }
            }
            next();
        }
    };
};

let validateAmount = (req, res, next) => {
    if(req.body.amount < 0){
        return res.status(200).json({
            success: false,
            err: { message: 'Amount must be greater than 0' }
        });
    }
    next();
};

module.exports = {
    xmlHttpRequestOnly,
    validateRequest,
    validateAmount
};
