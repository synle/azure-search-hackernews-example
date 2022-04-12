# azure-search-hackernews-example

```
export COSMOS_ENDPOINT='SOME_URI'
export COSMOS_PRIM_KEY='SOME_PRIMARY_KEY'
```


## URLs
- https://github.com/jj09/azsearch.js
- https://azsearchstore.azurewebsites.net/azsearchgenerator/index.html
- https://docs.microsoft.com/en-us/rest/api/searchservice/get-index

## CURL to get the Index JSON
```bash
curl --location --request GET 'https://[service name].search.windows.net/indexes/[index name]?api-version=2021-04-30-Preview' \
--header 'Content-Type: application/json' \
--header 'api-key: [your admin key]'
```

- Use this link to fix up CORS for Azure Search. https://clemenssiebler.com/azure-search-cors-configuration/

Basically it involves making the PUT call with updated cors params. Below is a sample one

```
...
corsOptions": {
  "allowedOrigins":["http://localhost:8080"]
}
...
```

## Search App
![image](https://user-images.githubusercontent.com/3792401/162995390-56ce15af-ef50-4d12-8dfa-d362887fc94f.png)
