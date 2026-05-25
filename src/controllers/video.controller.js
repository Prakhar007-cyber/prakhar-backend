import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"


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

    if(!(video && thumbnail)){
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
        new ApiResponse(200,VideoUploaded, "Video and thumbnail successfully uploaded")
    )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}