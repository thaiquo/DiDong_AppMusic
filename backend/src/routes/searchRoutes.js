import express from "express";
import Song from "../models/Song.js";
import Artist from "../models/Artist.js";
import Playlist from "../models/Playlist.js";

const router = express.Router();

// 🔍 SEARCH tổng hợp: bài hát, nghệ sĩ, playlist
router.get("/", async (req, res) => {
  const q = req.query.q?.trim();
  if (!q) return res.json({ songs: [], artists: [], playlists: [] });

  try {
    const [songs, artists, playlists] = await Promise.all([
      // 🎵 Tìm bài hát
      Song.aggregate([
        {
          $search: {
            index: "song_search",
            text: {
              query: q,
              path: ["title", "artist"],
              fuzzy: { maxEdits: 2 },
            },
          },
        },
        { $limit: 10 },
        {
          $project: {
            _id: 1,
            title: 1,
            artist: 1,
            thumbnail: 1,
            audioUrl: 1, // ✅ giữ link nhạc
            score: { $meta: "searchScore" },
          },
        },
        { $sort: { score: -1 } },
      ]),

      // 👨‍🎤 Tìm nghệ sĩ
      Artist.aggregate([
        {
          $search: {
            index: "artist_search",
            text: {
              query: q,
              path: ["name", "country"],
              fuzzy: { maxEdits: 2 },
            },
          },
        },
        { $limit: 10 },
        {
          $project: {
            _id: 1,
            name: 1,
            avatar: 1,
            country: 1,
            score: { $meta: "searchScore" },
          },
        },
        { $sort: { score: -1 } },
      ]),

      // 🎧 Tìm playlist
      Playlist.aggregate([
        {
          $search: {
            index: "playlist_search",
            text: {
              query: q,
              path: ["title", "description"],
              fuzzy: { maxEdits: 2 },
            },
          },
        },
        { $limit: 10 },
        {
          $project: {
            _id: 1,
            title: 1,
            coverImage: 1,
            description: 1,
            score: { $meta: "searchScore" },
          },
        },
        { $sort: { score: -1 } },
      ]),
    ]);

    res.json({ songs, artists, playlists });
  } catch (err) {
    console.error("❌ Search error:", err);
    res.status(500).json({ message: "Search failed" });
  }
});

export default router;
