const autoBind = require('auto-bind');
const { successResponse } = require('../../utils/responses');

class UploadsHandler {
  constructor(storageService, albumsService, validator) {
    this._storageService = storageService;
    this._albumsService = albumsService;
    this._validator = validator;

    autoBind(this);
  }

  async postUploadImageHandler(request, h) {
    const { cover } = request.payload;
    this._validator.validateImageHeaders(cover.hapi.headers);
    const filename = await this._storageService.writeFile(cover, cover.hapi);
    const albumId = request.params.id;
    const album = await this._albumsService.getAlbumById(albumId);
    if (album.coverUrl) {
      await this._storageService.deleteFile(album.coverUrl);
    }
    await this._albumsService.editCoverAlbumById(albumId, filename);
    const response = successResponse(h, {
      responseMessage: 'Sampul berhasil diunggah',
      responseCode: 201,
    });
    return response;
  }
}

module.exports = UploadsHandler;
