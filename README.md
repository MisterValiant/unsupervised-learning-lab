# Unsupervised Learning Lab — GitHub Pages export

This is the full website snapshot from 16 October 2026, including Week 1,
Week 2, the original Week 2 backup, JupyterLite notebooks, images, code and
all 15 music tracks. No server installation or build step is required.

## Publish using GitHub Desktop (recommended)

1. Extract this ZIP on your computer.
2. Create a public GitHub repository, for example unsupervised-learning-lab.
3. In GitHub Desktop, clone that repository onto your computer.
4. Copy ALL extracted contents into the repository folder. index.html must
   be directly inside the repository, alongside assets/, css/, js/, notebook/
   and .nojekyll. Do not upload the ZIP itself or put everything inside an
   extra enclosing folder. Make sure the .nojekyll file is copied too.
5. In GitHub Desktop, commit the changes to main, then Push origin.
6. On GitHub, open Settings > Pages. Under Build and deployment, choose
   Deploy from a branch, then main and / (root). Click Save.
7. Wait for deployment and open the URL GitHub provides, usually:
   https://YOUR-USERNAME.github.io/unsupervised-learning-lab/

GitHub's browser upload accepts at most 100 files at once. This full website
has more than 500 files because it includes JupyterLite, so GitHub Desktop
avoids uploading many separate batches.

## What is included

- index.html: homepage with Beta badge.
- week1.html and week2.html: the current lessons and browser notebooks.
- week2-original.html: retained original K-means page.
- assets/music/: all 15 tracks; names and shared shuffled queue are configured
  in js/music-playlists.js. Tracks download only after playback is requested.
- notebook/: the full browser notebook application and both lab notebooks.
- .nojekyll: disables Jekyll processing so supporting notebook files survive.

## After publishing

Check the homepage, both weeks, notebook launch and a cell execution, PDF
export, music Play/Next/Previous and forward/backward seeking on the GitHub URL.
The browser notebook needs an internet connection to load Python/packages.
Open the hosted HTTPS URL; do not test by double-clicking index.html locally.

Each student works in their own browser; edits do not change the source
notebooks for other students. Students should download their work to keep it.
Browser storage on the old and new domains is separate, so save existing work
before moving between the two copies of the website.

This is an independent export. Later changes to the current hosted site do
not automatically update GitHub Pages; copy a fresh export into your repository,
commit and push to update it. Keep the same directory structure.

Export source commit: d904d197121f7619f027ee6309c4f7fc09fc5d56
