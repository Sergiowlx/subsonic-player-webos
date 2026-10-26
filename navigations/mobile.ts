import type { NavigationItem } from './types';

export const MOBILE_NAVIGATION: NavigationItem[] = [
  {
    icon: ICONS.discover,
    title: 'Browse',
    to: {
      name: ROUTE_NAMES.index,
    },
  },
  {
    icon: ICONS.album,
    title: 'Albums',
    to: {
      name: ROUTE_NAMES.albums,
      params: {
        [ROUTE_PARAM_KEYS.albums.sortBy]: ROUTE_ALBUMS_SORT_BY_PARAMS['A-Z'],
      },
    },
  },
  {
    icon: ICONS.artist,
    title: 'Artists',
    to: {
      name: ROUTE_NAMES.artists,
    },
  },
  {
    icon: ICONS.playlist,
    title: 'Playlists',
    to: {
      name: ROUTE_NAMES.playlists,
    },
  },
  {
    icon: ICONS.folder,
    title: 'Library',
    to: {
      name: ROUTE_NAMES.files,
    },
  },
  {
    icon: ICONS.queue,
    title: 'Queue',
    to: {
      name: ROUTE_NAMES.queue,
    },
  },
];
