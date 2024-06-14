class ErrorHandler extends Error{
    constructor(public message:string, public statuCode:number){
        super(message)
        this.statuCode = statuCode
    }
}

export default ErrorHandler