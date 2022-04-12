const axios = require("axios").default;
const xmlJs = require("xml-js");
const cheerio = require("cheerio");
const crypto = require('crypto')

function getHash(string){
  return crypto.createHash('md5').update(string).digest("hex");
}

function getHostName(url){
  const urlObject = new URL(url);
  const hostName = urlObject.hostname;
  return (hostName || url).replace('www.','');
}

function getCategory(article){
  let {title}= article;

  title = title.toLowerCase();

  if(title.includes('show hn:')){
    return 'Show HN'
  }

  if(title.includes('ask hn:')){
    return 'Show HN'
  }

  if(title.includes(' is hiring')){
    return 'Jobs'
  }

  return 'Article';
}

/**
 * @param  {string} xml
 * @return {parsed_xml}
 */
function parseXml(xml) {
  const options = { compact: true, ignoreComment: true, alwaysChildren: true };
  return xmlJs.xml2js(xml, options);
}

/**
 * @param  {string} data
 * @return {Articles} list of article of this form
 {
    "title": "How and why Daily is using Rust for our WebRTC APIs",
    "description": "\n<p>Article URL: <a href=\"https://www.daily.co/blog/how-and-why-daily-is-using-rust-for-our-webrtc-apis/\">https://www.daily.co/blog/how-and-why-daily-is-using-rust-for-our-webrtc-apis/</a></p>\n<p>Comments URL: <a href=\"https://news.ycombinator.com/item?id=30990297\">https://news.ycombinator.com/item?id=30990297</a></p>\n<p>Points: 120</p>\n<p># Comments: 23</p>\n",
    "pubDate": "Mon, 11 Apr 2022 15:39:49 +0000",
    "link": "https://www.daily.co/blog/how-and-why-daily-is-using-rust-for-our-webrtc-apis/",
    "dc:creator": "vr000m",
    "comments": "https://news.ycombinator.com/item?id=30990297",
    "guid": "https://news.ycombinator.com/item?id=30990297"
  }
 */
function parseArticles(data) {
  const parsed = parseXml(data);
  const items = parsed.rss.channel.item;
  const res = [];

  for (const item of items) {
    const article = {};
    for (const field of Object.keys(item)) {
      article[field] = item[field]["_cdata"] || item[field]["_text"];
    }

    // here we will parse and load up the description
    const { description } = article;
    const $elem = cheerio.load(description);


    res.push({
      title: article.title,
      description: article.description,
      articleUrl: article.link,
      commentUrl: article.comments,
      point: parseInt($elem(`p:contains('Points: ')`).text().replace(`Points: `, "")),
      comment: parseInt($elem(`p:contains('# Comments: ')`).text().replace(`# Comments: `, "")),
      id: getHash(article.guid),
      source: getHostName(article.link),
      creator: article['dc:creator'],
      date: article.pubDate,
      category: getCategory(article),
    });
  }

  return res;
}

/**
 * @param  {string} url from https://hnrss.github.io/
 * @return {Article}
 */
function getArticleFromHn(url) {
  return axios.get(url).then((response) => {
    // handle success
    const { data } = response;
    const articles = parseArticles(data);
    return articles;
  });
}

module.exports = async () => {
  return [
    ... await getArticleFromHn(`https://hnrss.org/frontpage`),
    ... await getArticleFromHn(`https://hnrss.org/newest`),
    ... await getArticleFromHn(`https://hnrss.org/newest?points=100`),
    ... await getArticleFromHn(`https://hnrss.org/newest?points=50`),
    ... await getArticleFromHn(`https://hnrss.org/jobs`),
  ]
}
