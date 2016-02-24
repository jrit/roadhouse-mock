# roadhouse-mock

A set of factories to create simple mock handlers for CRUD data in Angular.

## Basic Example Setup

The most concise way to create mock handlers is like so

```js
// A bunch of boilerplate up here so you are still in control
require( "angular-mocks" );
var rhMock = require( "roadhouse-mock" );
var data = {
    list: [ { key: "value 1" }, { key: "value2" } ],
    otherList: require( "./stuff" )
};

angular.module( "e2e-mocks", [ "ngMockE2E" ] )
.run( [ "$httpBackend", "APIRoot",
    function ( $httpBackend, APIRoot )
    {
        rhMock.setApiRoot( APIRoot );
        rhMock.$httpBackend = $httpBackend;

        // These are the lines where it gets good
        rhMock.create( "list", [ "GET", "POST" ], data.list );
        rhMock.create( "list/:itemId", [ "PUT", "DELETE" ], data.list );
        rhMock.create( "other-list", [ "GET" ], data.otherList );
    } ] );

angular.module( "App" ).requires.push( "e2e-mocks" );
```


## Long-Form Example Setup

`create( path, methods, list )` sets up handlers with the methods used below, which you can also use directly, if you like.

```js
//... Just like before the `run` block above ...
.run( [ "$httpBackend", "APIRoot",
    function ( $httpBackend, APIRoot )
    {
        rhMock.setApiRoot( APIRoot );
        // rhMock doesn't need to know $httpBackend when used like this

        // GET a list
        $httpBackend.whenRoute( "GET", APIRoot + "list" )
            .respond( rhMock.createList( data.list ) );

        // POST to a list
        $httpBackend.whenRoute( "POST", APIRoot + "list" )
            .respond( rhMock.createPost( data.list ) );

        // PUT to a list
        $httpBackend.whenRoute( "PUT", APIRoot + "list" )
            .respond( rhMock.createPut( data.list ) );

        // DELETE from a list
        $httpBackend.whenRoute( "DELETE", APIRoot + "list" )
            .respond( rhMock.createDelete( data.list ) );

        // you can still use any typical handlers as well
        $httpBackend.whenRoute( "GET", APIRoot + "/other-list" )
            .respond( function ( method, url, data )
            {
                data = JSON.parse( data );
                if( data.email === userObj.email )
                {
                    return [ 200, data.otherList ];
                }
                return [ 401 ];
            } );
    }
] );
angular.module( "App" ).requires.push( "e2e-mocks" );
```

## Additional Options

### *skipQueriesInList*, default `[ "skip", "take", "offset", "limit", "page", "rhcurrentpage", "search" ]`

An array of params that will be ignored when filtering paged responses.


### *skipParamName*, default `"skip"`

The parameter that the paged response will use to skip a number of items from the available list.


### *takeParamName*, default `"take"`

The parameter that the paged response will use to take a number of items from the available list.
