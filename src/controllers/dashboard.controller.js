import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {

    const TotalVideos = await Video.countDocuments({ owner: req.user._id })

    const TotalLikes = await Like.countDocuments({ likedBy: req.user._id })

    const TotalSubscribers = await Subscription.countDocuments({ channel: req.user._id })

    const TotalViews = await Video.aggregate([
        { $match: { owner: req.user._id } },
        { $group: { _id: null, totalviews: { $sum: "$views" } } }
    ])

    return res
        .status(200)
        .json(
            new ApiResponse(200, {
                totalviews: TotalViews[0]?.totalviews || 0,
                totalLikes: TotalLikes,
                totalSubscribers: TotalSubscribers,
                totalVideos: TotalVideos
            }, "Stats fetched successfully")
        )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    const ChannelVideos = await Video.find({
        owner: req.user._id
    })

    return res
        .status(200)
        .json(
            new ApiResponse(200, ChannelVideos, "Channel videos fetched successfully")
        )
})

export {
    getChannelStats,
    getChannelVideos
}