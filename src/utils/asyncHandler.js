const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((error) => next(error))
    }
}



export { asyncHandler }


//                                     2nd Method of making a wrapper

// Higher Order Function

// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await (req, res, next)
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }