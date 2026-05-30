import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
import mongoose from "mongoose"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    // toggleVideoLike ka kaam 
    // User ne video like kiya → Like database mein add karo
    // User ne phir se click kiya → Like remove karo


    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video Id")
    }

    const AlreadyLiked = await Like.findOne(
        {
            video: videoId,
            likedBy: req.user._id
        }
    )

    if (AlreadyLiked) {
        await Like.deleteOne({
            video: videoId,
            likedBy: req.user._id
        })
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Video unliked successfully"))
    } else {
        await Like.create({
            video: videoId,
            likedBy: req.user._id
        })
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Video liked successfully"))
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment Id")
    }

    const AlreadyLiked = await Like.findOne(
        {
            comment: commentId,
            likedBy: req.user._id
        }
    )

    if (AlreadyLiked) {
        await Like.deleteOne({
            comment: commentId,
            likedBy: req.user._id
        })
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Comment unliked successfully"))
    } else {
        await Like.create({
            comment: commentId,
            likedBy: req.user._id
        })
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Comment liked successfully"))
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet Id")
    }

    const AlreadyLiked = await Like.findOne(
        {
            tweet: tweetId,
            likedBy: req.user._id
        }
    )

    if (AlreadyLiked) {
        await Like.deleteOne({
            tweet: tweetId,
            likedBy: req.user._id
        })
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Tweet unliked successfully"))
    } else {
        await Like.create({
            tweet: tweetId,
            likedBy: req.user._id
        })
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Tweet liked successfully"))
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {

    // Iska kaam — user ne jo saari videos like ki hain woh fetch karna

    const pipeline = [
        {
            $match: {
                likedBy: req.user._id
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video",
                pipeline: [
                    {
                        $project: {
                            title: 1,
                            thumbnail: 1,
                            owner: 1,
                            views: 1,
                            duration: 1
                        }
                    }
                ]
            }
        }
    ]

    const LikedVideos = await Like.aggregate(pipeline)

    return res
        .status(200)
        .json(
            new ApiResponse(200, LikedVideos, "Liked Videos fetched Successfully")
        )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}