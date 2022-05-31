
const validateSchema = (schema) => (req, res, next) => {
    const { error, value } = schema.validate({ ...req.body, ...req.params, ...req.query })

    if(error){
        return error.details.forEach(e => {
            res.status(400).json({ message: e.message.replace(/['"]/g, '') })
        });
    }
    next()
}

module.exports = validateSchema