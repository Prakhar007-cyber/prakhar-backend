import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"
import mongoose from "mongoose"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    // User home page pe aya -> sabhi videos dikhao
    // User ne "javascript tutorial" search kiya -> filtered videos dikhao
    // kisi channel ka page khula -> sirf user ki videos dikhao
    // videos ko latest pehle ya oldest pehle sort karna
    // page1, page2.. pagination ke saath load karna 

    const matchStage = {}
    if (query) {
        matchStage.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ]
    }
    if (userId) {
        if (!isValidObjectId(userId)) throw new ApiError(400, "Invalid userId")
        matchStage.owner = new mongoose.Types.ObjectId(userId)
    }

    const pipeline = [
        { $match: matchStage },
        {
            $sort: {
                [sortBy || "createdAt"]: sortType === "asc" ? 1 : -1
            }
        }
    ]

    const paginate = Video.aggregate(pipeline)
    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    }
    const result = await Video.aggregatePaginate(paginate, options)

    return res
        .status(200)
        .json(
            new ApiResponse(200, result, "Videos fetched successfully")
        )
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video

    //    Jab koi user YouTube pe video upload karta hai:

    // Title deta hai
    // Description deta hai
    // Video file upload karta hai
    // Thumbnail upload karta hai

    if (!(title && description)) {
        throw new ApiError(400, "Title or description should not be empty")
    }

    const VideoFilePath = req.files?.videoFile?.[0]?.path
    const ThumbnailFilePath = req.files?.thumbnail?.[0]?.path

    if (!(VideoFilePath && ThumbnailFilePath)) {
        throw new ApiError(400, "Files are not attached")
    }

    const video = await uploadOnCloudinary(VideoFilePath)
    const thumbnail = await uploadOnCloudinary(ThumbnailFilePath)

    if (!(video && thumbnail)) {
        throw new ApiError(400, "video and thumbnail is required")
    }

    const VideoUploaded = await Video.create({
        title,
        description,
        videoFile: video.url,
        thumbnail: thumbnail.url,
        duration: video.duration,
        owner: req.user._id
    })

    return res
        .status(200)
        .json(
            new ApiResponse(200, VideoUploaded, "Video and thumbnail successfully uploaded")
        )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    // Home Page Pe Video Dikhi
    // user ne click kiya
    // us video ka page khula
    // poori video + details dikhi
    //   video ka view +1
    //   watchHistory mein add hogi video
    //   Owner ki details bhi aaengi video mein

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video id")
    }

    const VideoPipeline = [
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullname: 1,
                            avatar: 1,
                        }
                    }
                ]
            }
        }

    ]

    const Views = await Video.findByIdAndUpdate(
        videoId,
        {
            $inc: { views: 1 }
        },
        { new: true }
    )

    const UpdatedHistory = await User.findByIdAndUpdate(
        req.user._id,
        {
            $addToSet: { watchHistory: videoId }
        }
    )

    const video = await Video.aggregate(VideoPipeline)

    if (!video[0]) {
        throw new ApiError(400, "Video does not exist")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, video[0], "Video fetched successfully")
        )

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

    //     Jab user apni uploaded video edit karta hai:

    // Title change karna
    // Description change karna
    // Thumbnail change karna

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video id")
    }

    const { title, description } = req.body
    const thumbnail = req.file?.path

    if (!(title || description || thumbnail)) {
        throw new ApiError(400, "At least one field should be updated among Title, Description, Thumbnail")
    }

    const video = await Video.findById(videoId)

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(400, "Owner id and User id does not match")
    }

    let newThumbnail
    if (thumbnail) {
        newThumbnail = await uploadOnCloudinary(thumbnail)
        if (!newThumbnail) {
            throw new ApiError(400, "Thumbnail upload failed")
        }
    }

    const UpdatedFields = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                ...(title && { title }),
                ...(description && { description }),
                ...(newThumbnail && { thumbnail: newThumbnail.url })
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

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    // Video database se delete karni hai
    // Cloudinary se bhi delete karni hai — dono jagah se!
    // Sirf owner delete kar sakta hai

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(400, "Video does not exist")
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(400, "Owner id and User id does not match")
    }

    const DeleteVideo = await Video.findByIdAndDelete(videoId)
    const DeleteFromCloudinary = await deleteFromCloudinary(video.videoFile)

    if (!DeleteVideo) {
        throw new ApiError(400, "Video not deleted")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Video deleted successfully")
        )

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    // YouTube pe jab tum video ko Private ya Public karte ho —
    // wahi kaam karta hai yeh controller!

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(400, "Video does not exist")
    }
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(400, "Owner id and User id does not match")
    }

    const Publish = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished: !video.isPublished
            }
        },
        {new: true}
    )
    return res
    .status(200)
    .json(
        new ApiResponse(200,Publish,"Publish status toggled successfully")
    )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}