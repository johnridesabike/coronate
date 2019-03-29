var ghpages = require('gh-pages');

ghpages.publish(
  'build',
  { message: 'Auto-generated commit' },
  function(err) {
    if (err) throw err;
  }
);