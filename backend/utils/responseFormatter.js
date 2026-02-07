export const successResponse = (res, code = 200, message = 'Success', data = null) => {
    res.status(code).json({
        code,
        message,
        data,
    })
}

export const errorResponse = (res, code = 500, message = 'Internal Server Error', error = null) => {
    res.status(code).json({
        code,
        message,
        data: null,
        error
    })
}