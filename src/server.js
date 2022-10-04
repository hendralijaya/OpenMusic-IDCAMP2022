require('dotenv').config();
const Hapi = require('@hapi/hapi');
const albums = require('./api/albums');
const songs = require('./api/songs');
const ClientError = require('./exceptions/ClientError');
const AlbumsService = require('./services/postgres/AlbumsService');
const SongsService = require('./services/postgres/SongsService');
const AlbumsValidator = require('./validator/albums');
const SongsValidator = require('./validator/songs');
const { failResponse, errorResponse } = require('./utils/responses/index');

const init = async () => {
  const albumsService = new AlbumsService();
  const songsService = new SongsService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([{
    plugin: albums,
    options: {
      service: albumsService,
      validator: AlbumsValidator,
    },
  },
  {
    plugin: songs,
    options: {
      service: songsService,
      validator: SongsValidator,
    },
  },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;
    if (response instanceof ClientError) {
      return failResponse(h, response);
    } if (response instanceof Error) {
      console.log(response);
      return errorResponse(h);
    }
    return response.continue || response;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
