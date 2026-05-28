import mongoose, { isValidObjectId } from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"


const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query


    // Kon sa user ne comment kiya → username, avatar
    // Kab kiya → timestamp
    // Pagination → 10 comments per page


    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video Id")
    }

    const pipeline = [
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "commentOwner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        }
    ]

    const paginate = Comment.aggregate(pipeline)
    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    }
    const result = await Comment.aggregatePaginate(paginate, options)

    return res
        .status(200)
        .json(
            new ApiResponse(200, result, "Comments fetched successfully")
        )

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video

    const { videoId } = req.params
    const { content } = req.body

    if (!(isValidObjectId(videoId) && content)) {
        throw new ApiError(400, "Invalid videoId and content")
    }

    const CreateComment = await Comment.create(
        {
            content,
            video: videoId,
            owner: req.user._id
        }
    )

    return res
        .status(200)
        .json(
            new ApiResponse(200, CreateComment, "Comment added successfully")
        )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment

    const { commentId } = req.params
    const { content } = req.body

    if (!(isValidObjectId(commentId) && content)) {
        throw new ApiError(400, "Invalid comment id and content")
    }

    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(400, "Comment does not exist")
    }
    if (!(comment.owner.toString() === req.user._id.toString())) {
        throw new ApiError(400, "Comment owner and user id does not match")
    }
    const UpdatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content: content
            }
        },
        { new: true }
    )

    return res
        .status(200)
        .json(
            new ApiResponse(200, UpdatedComment, "Comment Updated Successfully")
        )



})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment

    const { commentId } = req.params

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment Id")
    }

    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(400, "Comment does not exist")
    }
    if (!(comment.owner.toString() === req.user._id.toString())) {
        throw new ApiError(400, "Comment owner and user id does not match")
    }

    const DeleteComment = await Comment.findByIdAndDelete(commentId)

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Comment Deleted Successfully")
    )

})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}