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

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist Id")
    }

    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(400, "playlist does not exist")
    }
    if (!(playlist.owner.toString() === req.user._id.toString())) {
        throw new ApiError(400, "Playlist owner and user id does not match")
    }

    const deletePlaylist = await Playlist.findByIdAndDelete(playlistId)

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Playlist Deleted Successfully")
        )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body


    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist id")
    }

    if (!(name || description)) {
        throw new ApiError(400, "At least one field should be updated among name, Description")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(400, "Playlist does not exist")
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(400, "playlist id and User id does not match")
    }

    const UpdatedFields = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                ...(name && { name }),
                ...(description && { description }),
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

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}