const Database = require('./src/database');
const getArticles = require('./src/article');

async function _doWork(){
  const {client, database, container} = await Database.init();

  const articles = await getArticles();

  console.log(articles);
  // console.log(articles.map(r => r.title));

  for(const article of articles){
    try{
      const res = await container.items.create(article)
      console.log('Success', article.id, article.title)
    } catch(err){
      // normally will get code 409 (conflict - meaning data is already there)
      // console.log('Error', article.id, article.title)
    }
  }
}

_doWork();
