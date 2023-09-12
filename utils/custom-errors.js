class CustomError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = 'fail';
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends CustomError {
  constructor(message = 'Not Found') {
    super(message, 404);
  }
}

class BadRequestError extends CustomError {
  constructor(message = 'Bad Request') {
    super(message, 400);
  }
}

class UnathorizedError extends CustomError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

class ForbiddenError extends CustomError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

class ConflictError extends CustomError {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}

class InternalServerError extends CustomError {
  constructor(message = 'Internal Server Error') {
    super(message, 500);
  }
}

const generateCustomErrorStack = (stack) => {
  const lines = stack.split('\n');
  const [stackErrorMessage, ...fileLines] = lines.map((line) => line.trim());
  const customStackArray = [
    stackErrorMessage,
    ...fileLines.filter(
      (line) => line.startsWith('at file') || line.includes('file:')
    ),
  ];
  return customStackArray;
};

export {
  CustomError,
  NotFoundError,
  BadRequestError,
  UnathorizedError,
  ForbiddenError,
  ConflictError,
  InternalServerError,
  generateCustomErrorStack,
};
