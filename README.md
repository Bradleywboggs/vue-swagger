# vue-swagger
vue-swagger is an implementation of an OpenAPi (Swagger)
documentation user interface using Vue.js, Vuex and Vuetify. 

It is intended for API's that are  
[JSON-API](https://jsonapi.org/) compliant and for API definitions compliant with [OpenApi 3](https://swagger.io/specification/). 
If you're not seeking compliance with these specs, you're not going to enjoy your experience with vue-swagger.

###The Dream

The end goal is to be able to:
* Install/clone (not sure yet how it will be distributed) vue-swagger
* Use the `VueSwag` component in an existing Vue app, passing a uri to an api-definition yaml as a prop:
* `<vue-swag
swagger-yaml="http://uri.to.your.yaml"></vue-swag>`
* run `npm run install`
* run `npm run serve`, and then BAM, a full featured API documentation site appears.

##The Current Reality
Where it stands: As developer you can start this project as a standalone application using the steps provided below:
* Clone the repo
* Provide a URI to your yaml as prop
* run `npm run install`
* run `npm run serve`, and then...a semi-functional, not-quite complete api documentation site appears 
(as long as your definition corresponds to vue-swagger's strong opinions about complying with JSON-API).
 You'll see much of your API described, including paths, parameters, and request urls, versioning, and schemas. 
And provided you don't have security set up on your api, you should be able to try your
basic GET requests and see the results right out of the box. 


TODOS:
* Set up the project to use Security schemes in OpenApi api definitions to enable 'Try it Now' for auth-required api's
* Vuex is a dependency, so we need to find a way to generalize or easily customize the `store.js`
  file to meet the needs of anyone's application
* Complete filling in local query params per JSON API spec, and fill in the `store.js` file accordingly
* Create a robust sample yaml that makes vue-swagger's opinions very clear
* Set up vue-swagger specific error handling in the code to clearly and kindly guide developers to comply with vue-swagger's
aforementioned opinions.

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```
### For your first test Run
After the app is running to see the example api site, copy and paste your 
'Network' url as described in your terminal:

`App running at: ...
Network: http://some.IP.Address:somePortNumber`
And paste it in as your uri for the `swagger-yaml` prop. The end result would look like this:
* `<vue-swag swagger-yaml="http://some.IP.Address:somePortNumber/openapi.yaml"> </vue-swag>`

The site will then use the sample `openapi.yaml` file located in the public directory.
### Compiles and minifies for production
```
npm run build
```

### Run your tests
```
npm run test
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
