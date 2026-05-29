import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    const TotalVideos = Video.countDocuments({owner: req.user._id})

    const TotalLikes = Like.countDocuments({owner: req.user._id})

    const TotalSubscribers = Subscription.countDocuments({owner: req.user._id})

    const TotalViews = Video.aggregate([
        {$match: {owner: req.user._id}},
        {$group: {_id: null, totalviews: {$sum: "$views"}}}
    ])
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
})

export {
    getChannelStats, 
    getChannelVideos
    }