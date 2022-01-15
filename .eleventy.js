const { DateTime } = require("luxon");
const fs = require("fs");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginNavigation = require("@11ty/eleventy-navigation");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const yaml = require("js-yaml");
const { timeStamp } = require('console');

module.exports = function (eleventyConfig) {
  // Add plugins
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(pluginSyntaxHighlight);
  eleventyConfig.addPlugin(pluginNavigation);

  // Add support for yaml data files
  eleventyConfig.addDataExtension("yaml", contents => yaml.load(contents));

  // https://www.11ty.dev/docs/data-deep-merge/
  eleventyConfig.setDataDeepMerge(true);

  // Alias `layout: post` to `layout: layouts/post.njk`
  eleventyConfig.addLayoutAlias("post", "layouts/post.njk");

  eleventyConfig.addFilter("readableDate", dateObj => {
    return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat("dd LLL yyyy");
  });

  // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
  eleventyConfig.addFilter('htmlDateString', (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat('yyyy-LL-dd');
  });

  // Get the first `n` elements of a collection.
  eleventyConfig.addFilter("head", (array, n) => {
    if (!Array.isArray(array) || array.length === 0) {
      return [];
    }
    if (n < 0) {
      return array.slice(n);
    }

    return array.slice(0, n);
  });

  // Return all elements that contain at least one tag
  eleventyConfig.addFilter("filterTags", (array, tags = []) => {
    if (!Array.isArray(array)) return array
    return array.filter(item => tags.some(tag => item.data.tags.includes(tag)))
  });

  // Return the smallest number argument
  eleventyConfig.addFilter("min", (...numbers) => {
    return Math.min.apply(null, numbers);
  });

  function filterTagList(tags) {
    return (tags || []).filter(tag => ["all", "nav", "post", "posts"].indexOf(tag) === -1);
  }

  eleventyConfig.addFilter("filterTagList", filterTagList)

  eleventyConfig.addFilter("stringify", o => Object.keys(o))

  // filters a collection by slug
  eleventyConfig.addFilter("getBySlug", function (collection, slug) {
    return collection.find(item => item.slug === slug);
  })

  // get a document attribute
  eleventyConfig.addFilter("jsonPath", function (obj, path) {
    return obj || obj[path];
  })

  // Create an array of all tags
  eleventyConfig.addCollection("tagList", function (collection) {
    let tagSet = new Set();
    collection.getAll().forEach(item => {
      (item.data.tags || []).forEach(tag => tagSet.add(tag));
      (item.data.timestamps || []).forEach(timestamp => (timestamp[3] || []).forEach(tag => tagSet.add(tag)))
    });
    collection.getAll().forEach(item => {
      (item.data.authors || []).forEach(tag => tagSet.add(tag));
    });

    return filterTagList([...tagSet]);
  });

  // Create an array of all authors
  eleventyConfig.addCollection("authorList", function (collection) {
    // console.log(collection);

    let authorSet = new Set();
    collection.getAll().forEach(item => {
      (item.data.authors || []).forEach(author => authorSet.add(author));
    });

    return Array.from(authorSet);
  });

  // Create an array of all authors
  eleventyConfig.addCollection("linksList", function (collection) {
    const links = collection.getAll()[0].data.links

    let linkSet = new Set();

    (links || []).forEach(link => {
      linkSet.add(link);
    });

    return Array.from(linkSet);
  });

  // Create an array of posts by topic
  eleventyConfig.addCollection("clipsList", function (collection) {
    let clipsSet = new Set();

    collection.getAll().forEach(item => {
      (item.data.timestamps || []).forEach(timestamp => {
        clipsSet.add({ data: { ...item.data, originalTitle: item.data.title, originalTags: item.data.tags, tags: timestamp[3] || item.data.tags, title: timestamp[2], start: timestamp[0] } })
      })
    });

    console.log(clipsSet.length);

    console.log('length =========>', collection.getAll()[0].data)
    console.log('length =========>', collection.getAll()[0].data.collections.all.length)
    console.log('length =========>', collection.getAll()[0].data.collections.posts.length)
    console.log('length =========>', collection.getAll()[0].data.links.length)
    console.log('length =========>', Array.from(clipsSet).length)
    console.log('length =========>', collection.getAll())

    return Array.from(clipsSet);
  });

  // Copy the `img` and `css` folders to the output
  eleventyConfig.addPassthroughCopy("img");
  eleventyConfig.addPassthroughCopy("css");

  // Customize Markdown library and settings:
  let markdownLibrary = markdownIt({
    html: true,
    breaks: true,
    linkify: true
  }).use(markdownItAnchor, {
    permalink: markdownItAnchor.permalink.ariaHidden({
      placement: "after",
      class: "direct-link",
      symbol: "#",
      level: [1, 2, 3, 4],
    }),
    slugify: eleventyConfig.getFilter("slug")
  });
  eleventyConfig.setLibrary("md", markdownLibrary);

  // Override Browsersync defaults (used only with --serve)
  eleventyConfig.setBrowserSyncConfig({
    callbacks: {
      ready: function (err, browserSync) {
        const content_404 = fs.readFileSync('_site/404.html');

        browserSync.addMiddleware("*", (req, res) => {
          // Provides the 404 content without redirect.
          res.writeHead(404, { "Content-Type": "text/html; charset=UTF-8" });
          res.write(content_404);
          res.end();
        });
      },
    },
    ui: false,
    ghostMode: false
  });

  return {
    // Control which files Eleventy will process
    // e.g.: *.md, *.njk, *.html, *.liquid
    templateFormats: [
      "md",
      "njk",
      "html",
      "liquid"
    ],

    // -----------------------------------------------------------------
    // If your site deploys to a subdirectory, change `pathPrefix`.
    // Don’t worry about leading and trailing slashes, we normalize these.

    // If you don’t have a subdirectory, use "" or "/" (they do the same thing)
    // This is only used for link URLs (it does not affect your file structure)
    // Best paired with the `url` filter: https://www.11ty.dev/docs/filters/url/

    // You can also pass this in on the command line using `--pathprefix`

    // Optional (default is shown)
    pathPrefix: "/",
    // -----------------------------------------------------------------

    // Pre-process *.md files with: (default: `liquid`)
    markdownTemplateEngine: "njk",

    // Pre-process *.html files with: (default: `liquid`)
    htmlTemplateEngine: "njk",

    // Opt-out of pre-processing global data JSON files: (default: `liquid`)
    dataTemplateEngine: false,

    // These are all optional (defaults are shown):
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site"
    }
  };
};
