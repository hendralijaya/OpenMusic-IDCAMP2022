const autoBind = require('auto-bind');
const { successResponse } = require('../../utils/responses');

class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postSongHandler({ payload }, h) {
    this._validator.validateSongPayload(payload);
    const songId = await this._service.addSong(payload);
    return successResponse(h, {
      responseData: { songId },
      responseMessage: 'Lagu berhasil ditambahkan',
      responseCode: 201,
    });
  }

  async getSongsHandler(request, h) {
    const { title, performer } = request.query;
    const songs = await this._service.getSongs({ title, performer });
    return successResponse(h, {
      responseData: { songs },
    });
  }

  async getSongByIdHandler(request, h) {
    const { id } = request.params;
    const song = await this._service.getSongById(id);
    return successResponse(h, {
      responseData: { song },
    });
  }

  async putSongByIdHandler(request, h) {
    this._validator.validateSongPayload(request.payload);
    const { id } = request.params;
    const {
      title, year, genre, performer, duration, albumId,
    } = request.payload;
    await this._service.editSongById(id, {
      title, year, genre, performer, duration, albumId,
    });
    return successResponse(h, {
      responseMessage: 'Lagu berhasil diperbarui',
    });
  }

  async deleteSongByIdHandler(request, h) {
    const { id } = request.params;
    await this._service.deleteSongById(id);

    return successResponse(h, {
      responseMessage: 'Lagu berhasil dihapus',
    });
  }
}

module.exports = SongsHandler;
