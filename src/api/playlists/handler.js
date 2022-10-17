const autoBind = require('auto-bind');
const { successResponse } = require('../../utils/responses');

class PlaylistsHandler {
  constructor(playlistsService, validator) {
    this._service = playlistsService;
    this._validator = validator;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePostPlaylistPayload(request.payload);
    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;
    const playlistId = await this._service.addPlaylist(name, credentialId);
    return successResponse(h, {
      responseData: { playlistId },
      responseMessage: 'Playlist berhasil ditambahkan',
      responseCode: 201,
    });
  }

  async getPlaylistsHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this._service.getPlaylists(credentialId);
    return successResponse(h, {
      responseData: { playlists },
    });
  }

  async getPlaylistSongsByIdHandler(request, h) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    const playlist = await this._service.getPlaylistById(playlistId);
    const data = await this._service.getSongsByPlaylistId(playlist);
    return successResponse(h, {
      responseData: { playlist: data },
    });
  }

  async postPlaylistSongByIdHandler(request, h) {
    this._validator.validatePostPlaylistSongsPayload(request.payload);
    const { id: playlistId } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;
    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    await this._service.addSongToPlaylist(playlistId, songId);
    await this._service.addPlaylistActivity(playlistId, songId, credentialId, 'add');
    return successResponse(h, {
      responseMessage: 'Lagu berhasil ditambahkan ke playlist',
      responseCode: 201,
    });
  }

  async deletePlaylistByIdHandler(request, h) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._service.verifyPlaylistOwner(playlistId, credentialId);
    await this._service.deletePlaylistById(playlistId);
    return successResponse(h, {
      responseMessage: 'Playlist berhasil dihapus',
    });
  }

  async deletePlaylistSongByIdHandler(request, h) {
    this._validator.validateDeletePlaylistSongsPayload(request.payload);
    const { id: playlistId } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;
    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    await this._service.deleteSongFromPlaylist(playlistId, songId);
    await this._service.addPlaylistActivity(playlistId, songId, credentialId, 'delete');
    return successResponse(h, {
      responseMessage: 'Lagu berhasil dihapus dari playlist',
    });
  }

  async getPlaylistActivitiesByIdHandler(request, h) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    const activities = await this._service.getPlaylistActivities(playlistId);
    return successResponse(h, {
      responseData: {
        playlistId,
        activities,
      },
    });
  }
}

module.exports = PlaylistsHandler;
