import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"



const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body

    //TODO: create playlist

    if (!(name && description)) {
        throw new ApiError(400, "Name and description invalid")
    }

    const PlaylistCreate = await Playlist.create(
        {
            name,
            description,
            owner: req.user._id
        }
    )

    return res
        .status(200)
        .json(
            new ApiResponse(200, PlaylistCreate, "Playlist created successfully")
        )

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    //TODO: get user playlists

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid userId")
    }

    const FindPlaylist = await Playlist.find(
        {
            owner: userId
        }
    )

    return res
        .status(200)
        .json(
            new ApiResponse(200, FindPlaylist, "Playlists fetched successfully")
        )

})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    //TODO: get playlist by id

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlistId")
    }

    const pipeline = [
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "VideosDetails",
                pipeline: [
                    {
                        $project: {
                            videoId: 1,
                            title: 1,
                            description: 1,
                        }
                    }
                ]
            }
        }
    ]

    const PlaylistPipeline = await Playlist.aggregate(pipeline)

    if (!PlaylistPipeline[0]) {
        throw new ApiError(400, "Playlist does not exist")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                PlaylistPipeline[0],
                "Playlist fetched successfully"
            )
        )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    if (!(isValidObjectId(playlistId) && isValidObjectId(videoId))) {
        throw new ApiError(400, "Invalid video Id and Playlist Id")
    }

    const AddVideoInPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $push: {
                videos: videoId
            }
        },
        { new: true }
    )

    return res
        .status(200)
        .json(
            new ApiResponse(200, AddVideoInPlaylist, "Video added to playlist successfully")
        )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    // TODO: remove video from playlist

    if (!(isValidObjectId(playlistId) && isValidObjectId(videoId))) {
        throw new ApiError(400, "Invalid video Id and Playlist Id")
    }

    const RemoveVideoInPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: {
                videos: videoId
            }
        },
        { new: true }
    )

    return res
        .status(200)
        .json(
            new ApiResponse(200, RemoveVideoInPlaylist, "Video removed from playlist successfully")
        )

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    //TODO: update playlist
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}