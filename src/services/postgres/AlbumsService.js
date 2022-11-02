const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { albumModel } = require('../../utils/model');

class AlbumsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO albums VALUES($1,$2,$3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };
    const result = await (await this._pool.query(query));
    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }
    return result.rows.map(albumModel)[0];
  }

  async getSongByAlbumId(album) {
    const query = {
      text: `SELECT songs.id, songs.title, songs.year, songs.genre, songs.performer, songs.duration FROM songs LEFT JOIN albums ON songs.album_id = albums.id 
      WHERE songs.album_id = $1 OR albums.id = $1 GROUP BY songs.id`,
      values: [album.id],
    };
    const resultSongs = await this._pool.query(query);
    if (!resultSongs.rows.length) {
      return null;
    }
    const result = {
      id: album.id,
      name: album.name,
      year: album.year,
      songs: resultSongs.rows,
    };
    return result;
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1,  year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }

  async editCoverAlbumById(id, coverUrl) {
    const query = {
      text: 'UPDATE albums SET cover = $1 WHERE id = $2 RETURNING id',
      values: [coverUrl, id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async getAlbumsLikesById(albumId) {
    try {
      const result = await this._cacheService.get(`like-albums:${albumId}`);
      return {
        likes: JSON.parse(result),
        cache: true,
      };
    } catch (error) {
      const query = {
        text: 'SELECT * FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };
      const result = await this._pool.query(query);
      await this._cacheService.set(`like-albums:${albumId}`, JSON.stringify(result.rows.length));
      return {
        likes: result.rows.length,
        cache: false,
      };
    }
  }

  async addAlbumLikesById(userId, albumId) {
    const id = `user_album_likes-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1,$2,$3) RETURNING id',
      values: [id, userId, albumId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError('Gagal menambahkan like');
    }
    await this._cacheService.delete(`like-albums:${albumId}`);
    return result.rows[0].id;
  }

  async deleteAlbumLikesById(userId, albumId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError('Gagal menghapus like');
    }
    await this._cacheService.delete(`like-albums:${albumId}`);
    return result.rows[0].id;
  }

  async checkAlbumAlreadyLiked(userId, albumId) {
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };
    const result = await this._pool.query(query);
    return result.rows.length;
  }
}

module.exports = AlbumsService;
