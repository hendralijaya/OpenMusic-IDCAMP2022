const Joi = require('joi');

const PostPlaylistPayloadSchema = Joi.object({
  name: Joi.string(),
});

const PostPlaylistSongsPayloadSchema = Joi.object({
  songId: Joi.string().required(),
});

const DeletePlaylistSongsPayloadSchema = Joi.object({
  songId: Joi.string().required(),
});

module.exports = {
  PostPlaylistPayloadSchema,
  PostPlaylistSongsPayloadSchema,
  DeletePlaylistSongsPayloadSchema,
};
