import { Loader } from '@googlemaps/js-api-loader';

// Create a singleton loader instance
export const mapsLoader = new Loader({
  apiKey: 'AIzaSyDegTMOQb7OngcabEx7jnRhVdBKtjs9ezw',
  version: 'weekly',
  libraries: ['places', 'marker']
});