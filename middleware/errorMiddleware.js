// DEFAULT ERROR HANDLER IS HTML PAGE


// ERROR FOR ROUTES DOES NOT EXIST
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);    
}


// ADD ERR OR ERROR AS FIRST PARAMETER ON CUSTOM ERROR. EXPRESS WILL KNOW THIS IS CUSTOM ERROR WHEN PUT ERR AS A FIRST PARAMETER
// ERROR FOR HANDLING ERRORS IN ROUTES
const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;

    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        statusCode = 404;
        message = 'Resource not found';
    }

    res.status(statusCode).json({
        message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
}

export { notFound, errorHandler };