import React from 'react'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'am-lyrics': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        'song-title'?: string;
        'song-artist'?: string;
        'song-album'?: string;
        'song-duration'?: number;
        query?: string;
        isrc?: string;
        'highlight-color'?: string;
        'hover-background-color'?: string;
        autoscroll?: boolean | string;
        interpolate?: boolean | string;
        lang?: string;
        class?: string;
      }, HTMLElement>;
    }
  }
}
