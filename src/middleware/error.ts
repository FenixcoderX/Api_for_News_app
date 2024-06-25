interface CustomError extends Error {
    statusCode: number;
  }
  
  /**
   * Creates a custom error object with the specified status code and message
   * @param statusCode - The status code of the error
   * @param message - The error message
   * @returns A custom error object
   */
  export const errorHandler = (statusCode: number, message: string): CustomError => {
    const error: CustomError = new Error() as CustomError;
    error.statusCode = statusCode;
    error.message = message;
    return error;
  };
  