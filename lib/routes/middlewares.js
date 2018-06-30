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
                request_only_fields[j] = request[j];
            }
        }

        if(errors.success == false){
            errors.status = 400;
            res.status(errors.status).json(errors);
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

/*
 * @description validates user amount
 * @param res object
 * @param req object
 * @param nexr function
 */
let validateAmount = (req, res, next) => {
    if(req.body.amount < 0){
        return res.status(400).json({
            success: false,
            status: 400,
            err: { message: 'Amount must be greater than 0' }
        });
    }
    next();
};

module.exports = {
    validateRequest,
    validateAmount,
};
