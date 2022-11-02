const autoBind = require('auto-bind');
const { successResponse } = require('../../utils/responses');

class ExportsHandler {
  constructor(producerService, playlistsService, validator) {
    this._producerService = producerService;
    this._playlistsService = playlistsService;
    this._validator = validator;

    autoBind(this);
  }

  async postExportPlaylistsHandler(request, h) {
    this._validator.validateExportSongsPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const { playlistId } = request.params;
    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    const message = {
      playlistId,
      targetEmail: request.payload.targetEmail,
    };
    await this._producerService.sendMessage('export:playlists', JSON.stringify(message));
    const response = successResponse(h, {
      responseMessage: 'Permintaan Anda sedang kami proses',
      responseCode: 201,
    });
    return response;
  }
}

module.exports = ExportsHandler;
