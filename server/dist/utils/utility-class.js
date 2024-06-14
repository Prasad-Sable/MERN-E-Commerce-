class ErrorHandler extends Error {
    constructor(message, statuCode) {
        super(message);
        this.message = message;
        this.statuCode = statuCode;
        this.statuCode = statuCode;
    }
}
export default ErrorHandler;
