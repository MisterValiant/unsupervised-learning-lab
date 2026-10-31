/* Keep the audio document alive while the learning document changes. */
(() => {
 if (window.parent !== window || !/^https?:$/.test(location.protocol)) return;
 const page = location.pathname.split('/').pop() || 'index.html';
 const allowed = ['index.html','week1.html','week2.html','week2-original.html','week3.html'];
 if (!allowed.includes(page)) return;
 location.replace(new URL('radio-shell.html#' + encodeURIComponent(page + location.search + location.hash), location.href));
})();
