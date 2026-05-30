import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel Id")
    }

    const channel = await User.findById(channelId)

    if (!channel) {
        throw new ApiError(400, "Channel does not exist")
    }
    const subscribe = await Subscription.findOne(
        {
            subscriber: req.user._id,
            channel: channelId
        }
    )

    if (subscribe) {
        await Subscription.deleteOne({
            subscriber: req.user._id,
            channel: channelId
        })
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200, {}, "Unsubscribed successfully"
                )
            )
    } else {
        await Subscription.create(
            {
                subscriber: req.user._id,
                channel: channelId
            }
        )
        return res
            .status(200)
            .json(
                new ApiResponse(200, {}, "Subscribed Successfully")
            )
    }
})

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channerl Id")
    }

    const FindSubsribers = await Subscription.find(
        {
            channel: channelId
        }
    )

    const subscriberCount = FindSubsribers.length

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { subscribers: FindSubsribers, count: subscriberCount },
                "Subscribers Counted Successfully"
            )
        )

})

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber Id")
    }

    const SubscribedChannels = await Subscription.find(
        {
            subscriber: subscriberId
        }
    )

    return res
        .status(200)
        .json(
            new ApiResponse(200, SubscribedChannels, "Channels fetched successfully")
        )
})

// Simple difference

// getUserChannelSubscribers → channel ki field se dhundha → kaun subscribe kiya
// getSubscribedChannels     → subscriber ki field se dhundha → kisne subscribe kiya

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}