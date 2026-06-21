class AppError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.status = statusCode;

        Error.captureStackTrace(this, this.constructor);
    }
}

export default AppError;