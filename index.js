"use strict";

var rhMock = {};
module.exports = rhMock;

rhMock.skipQueriesInList = [ "skip", "take", "rhcurrentpage", "search" ];

var apiRoot = "";

rhMock.setApiRoot = function ( _apiRoot )
{
    apiRoot = _apiRoot;

    if( !apiRoot )
    {
        return;
    }

    var portAndPath = apiRoot.split( "://" )[ 1 ].split( ":" )[ 1 ];
    if( !portAndPath )
    {
        return;
    }

    rhMock.apiPort = portAndPath.split( "/" )[ 0 ] || "";
};

rhMock.$httpBackend = null;

rhMock.create = function ( path, types, list )
{
    if( !rhMock.$httpBackend )
    {
        throw new Error( "$httpBackend must be set" );
    }

    if( types.indexOf( "GET" ) !== -1 )
    {
        rhMock.$httpBackend.whenRoute( "GET", apiRoot + path )
            .respond( rhMock.createList( list ) );
    }

    if( types.indexOf( "POST" ) !== -1 )
    {
        rhMock.$httpBackend.whenRoute( "POST", apiRoot + path )
            .respond( rhMock.createPost( list ) );
    }

    if( types.indexOf( "PUT" ) !== -1 )
    {
        rhMock.$httpBackend.whenRoute( "PUT", apiRoot + path )
            .respond( rhMock.createPut( list ) );
    }

    if( types.indexOf( "DELETE" ) !== -1 )
    {
        rhMock.$httpBackend.whenRoute( "DELETE", apiRoot + path )
            .respond( rhMock.createDelete( list ) );
    }
};

rhMock.createList = function ( list )
{
    return function ( method, url, requestData, headers, params )
    {
        var skip = Number( params.skip ) || 0;
        var take = Number( params.take ) || 1000;
        var page = Number( skip / take + 1 ) || 1;

        var data = angular.copy( list );

        Object.keys( params ).forEach( key => {
            if( rhMock.skipQueriesInList.indexOf( key ) !== -1 || key === rhMock.apiPort )
            {
                return;
            }
            data = data.filter( item => item[ key ] && item[ key ].toString() === params[ key ].toString() );
        } );

        var dataPage = data.slice( skip, skip + take );

        return [ 200, {
            pageCount: Math.ceil( data.length / take ),
            currentPage: page,
            nextPage: page === 1,
            results: dataPage,
            next: page === 1 } ];
    };
};

rhMock.createPost = function ( list )
{
    return function ( method, url, requestData )
    {
        var newItem = angular.fromJson( requestData );
        var lastId = list[ list.length - 1 ] ? list[ list.length - 1 ].id : 99;
        newItem.id = lastId + 1;
        list.push( newItem );

        return [ 201, newItem ];
    };
};

rhMock.createPut = function ( list )
{
    return function ( method, url, requestData )
    {
        var updatedItem = angular.fromJson( requestData );
        for( var i = 0; i < list.length; i++ )
        {
            if( list[ i ].id === Number( updatedItem.id ) )
            {
                list[ i ] = updatedItem;
                break;
            }
        }
        return [ 200, updatedItem ];
    };
};

rhMock.createDelete = function ( list )
{
    return function ( method, url, requestData, headers, params )
    {
        for( var i = 0; i < list.length; i++ )
        {
            if( list[ i ].id === Number( params.id ) )
            {
                list.splice( i, 1 );
                break;
            }
        }

        return [
            204,
            null,
            { someHeader: "value" }
        ];
    };
};
