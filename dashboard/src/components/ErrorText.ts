import { CarError, DashColors } from "../utils/dash-types";
import Logger from "electron-log";

export class ErrorHandler {
    private errorContainer: JQuery<HTMLElement>;
    private errorTextContainer: JQuery<HTMLElement>;

    /**
     * Takes in both the actual HTML elements and sets them as an class instance
     * variable. These values should be collected through JQuery
     * @param errorContainer 
     * @param errorTextContainer 
     */
    constructor(errorContainer: JQuery<HTMLElement>, errorTextContainer: JQuery<HTMLElement>) {
        this.errorContainer = errorContainer;
        this.errorTextContainer = errorTextContainer;
    }

    /**
     * Sets the error text on the car given the following specifications of the
     * error.
     * @NOTE if an expire time is NOT set, the msg will persist until explicitly
     * changed or disableError() is invoked
     * @param error {CarError} - A description of the error, see types for specifics
     */
    setError(error: CarError) : void {
        // set the text 
        this.errorTextContainer.html(error.msg);
        // Log the error
        Logger.error(`Car Error: ${error.msg}, Status: ${error.status ?? "None"}`);

        // set any of the optional arguments
        // setting color, default is red
        this.errorTextContainer.css('color', error.color ?? DashColors.RED);

        // check if we need this is a persistent error
        if(error.expire) {
            // disable the message after error.expire milliseconds,
            // so JS 'this' is wack and isnt bound to the caller of setTimeout
            // so thats why im making this a lambda
            setTimeout(() => this.disableError(), error.expire);
        }

        // finally make the error visible
        this.errorContainer.addClass('visible');
    }

    /**
     * Disables the current error displayed on the dash
     */
    disableError() : void {
        this.errorContainer.removeClass('visible');
    }

    
}