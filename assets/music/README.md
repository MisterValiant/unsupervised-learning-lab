# Lab Radio music

Audio files live here. `../../js/music-playlists.js` is the shared catalogue;
titles match the supplied filenames (without .mp3), plus the existing Nekket 5.
Each visit shuffles a copy of all tracks using Fisher–Yates. The queue repeats
only after its last song. Previous/Next traverse this same order. Selecting or
skipping while paused never assigns an audio src. Play and advancing during
playback fetch only the current track into a temporary local Blob, so forward
and backward seeking work without relying on server byte-range support. Old
track Blobs are released and pending downloads are cancelled when skipped. No autoplay or media preloading.
Vesper loads the common player on every learning page. The player starts
collapsed at 30% volume, and sound feedback respects the site sound toggle.
