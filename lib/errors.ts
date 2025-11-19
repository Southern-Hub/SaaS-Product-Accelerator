export class AppError extends Error {
    message: string;
    statusCode: number;
    code?: string;

    constructor(message: string, statusCode: number = 500, code?: string) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        this.code = code;
        this.name = 'AppError';
    }
}

export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, 400, 'VALIDATION_ERROR');
    }
}

export class ScrapingError extends AppError {
    constructor(message: string) {
        super(message, 502, 'SCRAPING_ERROR');
    }
}
