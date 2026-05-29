import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet

    const { content } = req.body

    if (!content) {
        throw new ApiError(400, "Content does not exist")
    }

    const CreateTweet = await Tweet.create(
        {
            content,
            owner: req.user._id
        }
    )

    return res
        .status(200)
        .json(
            new ApiResponse(200, CreateTweet, "Tweet added successfully")
        )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets

    const { userId } = req.params
    //TODO: get user playlists

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid userId")
    }

    const FindTweet = await Tweet.find(
        {
            owner: userId
        }
    )

    return res
        .status(200)
        .json(
            new ApiResponse(200, FindTweet, "Tweets fetched successfully")
        )

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet

    const { tweetId } = req.params
    const { content } = req.body
    //TODO: update playlist


    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id")
    }

    if (!content) {
        throw new ApiError(400, "Content not available")
    }

    const tweet = await Tweet.findById(tweetId)

    if (!tweet) {
        throw new ApiError(400, "tweet does not exist")
    }

    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(400, "tweet id and User id does not match")
    }

    const UpdatedFields = await Tweet.findByIdAndUpdate(
        tweetId,
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
            new ApiResponse(200, UpdatedFields, "Update successfull")
        )
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet

    const { tweetId } = req.params

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet Id")
    }

    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new ApiError(400, "tweet does not exist")
    }
    if (!(tweet.owner.toString() === req.user._id.toString())) {
        throw new ApiError(400, "Tweet owner and user id does not match")
    }

    const DeleteTweet = await Tweet.findByIdAndDelete(tweetId)

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Tweet Deleted Successfully")
        )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}