const autoBind = require('auto-bind');
const { successResponse } = require('../../utils/responses');

class CollaborationsHandler {
  constructor(collaborationsService, playlistsService, usersService, validator) {
    this._collaborationsService = collaborationsService;
    this._playlistsService = playlistsService;
    this._usersService = usersService;
    this._validator = validator;

    autoBind(this);
  }

  async postCollaborationHandler(request, h) {
    this._validator.validateCollaborationPayload(request.payload);
    const { playlistId, userId } = request.payload;
    const { id: credentialId } = request.auth.credentials;
    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    await this._usersService.findUserById(userId);
    const collaborationId = await this._collaborationsService.addCollaboration(playlistId, userId);
    const response = successResponse(h, {
      responseData: { collaborationId },
      responseMessage: 'Kolaborasi berhasil ditambahkan',
      responseCode: 201,
    });
    return response;
  }

  async deleteCollaborationHandler(request, h) {
    this._validator.validateCollaborationPayload(request.payload);
    const { playlistId, userId } = request.payload;
    const { id: credentialId } = request.auth.credentials;
    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    await this._usersService.findUserById(userId);
    await this._collaborationsService.deleteCollaboration(playlistId, userId);
    return successResponse(h, {
      responseMessage: 'Kolaborasi berhasil dihapus',
    });
  }
}

module.exports = CollaborationsHandler;
