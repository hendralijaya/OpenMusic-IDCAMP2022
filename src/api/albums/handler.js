const autoBind = require('auto-bind');
const { successResponse } = require('../../utils/responses');

class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;
    const albumId = await this._service.addAlbum({ name, year });

    return successResponse(h, {
      responseData: { albumId },
      responseMessage: 'Album berhasil ditambahkan',
      responseCode: 201,
    });
  }

  async getAlbumByIdHandler(request, h) {
    const { id } = request.params;
    let album = await this._service.getAlbumById(id);
    album = await this._service.getSongByAlbumId(album) === null ? album : await this._service.getSongByAlbumId(album);
    return successResponse(h, {
      responseData: {
        album,
      },
    });
  }

  async putAlbumByIdHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;
    const { id } = request.params;
    await this._service.editAlbumById(id, { name, year });
    return successResponse(h, { responseMessage: 'Album berhasil diperbarui', responseCode: 200 });
  }

  async deleteAlbumByIdHandler(request, h) {
    const { id } = request.params;
    await this._service.deleteAlbumById(id);
    return successResponse(h, { responseMessage: 'Album berhasil dihapus', responseCode: 200 });
  }
}

module.exports = AlbumsHandler;
