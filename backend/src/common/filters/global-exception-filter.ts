import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import ApiResponse from '../responses/ApiResponse';
import ApiError from '../responses/ApiError';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();

   

        let status: number;
        let message: string;
        let errors: string[] = [];

        if (exception instanceof ApiError) {
            status = exception.statusCode;
            message = exception.message;
            errors = Array.isArray(exception.errors) 
                ? exception.errors 
                : Object.values(exception.errors || {});
        } else if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse() as any;
            
            message = exceptionResponse.message || exception.message;
            errors = Array.isArray(exceptionResponse.errors) 
                ? exceptionResponse.errors 
                : Array.isArray(exceptionResponse.message)
                    ? exceptionResponse.message
                    : [message];
        } else {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            message = 'Internal Server Error';
            errors = [(exception as Error)?.message || 'An unexpected error occurred'];
            this.logger.error('Unhandled exception:', exception);
        }

        const apiError = new ApiError(status, message, errors);
        const apiResponse = new ApiResponse(null, apiError);

        response.status(status).json(apiResponse);
    }
}
