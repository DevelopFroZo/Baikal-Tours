"use strict";

const fetch = require( "node-fetch" );

module.exports = class{
  constructor( apiKey ){
    this.apiKey = apiKey;
    this.directions = {};
    this.translated = {};
  }

  // #fix добавлять через объект со свойствами или через объект с объектами
  add( key, text, fromLocale, toLocales ){
    if( typeof toLocales === "string" )
      toLocales = [ toLocales ];

    text = encodeURIComponent( text );

    toLocales.forEach( toLocale => {
      const directionKey = `${fromLocale}-${toLocale}`;

      if( this.directions[ directionKey ] === undefined )
        this.directions[ directionKey ] = {
          keys: [],
          sources: []
        };

      const direction = this.directions[ directionKey ];

      direction.keys.push( key );
      direction.sources.push( text );
    } );

    return this;
  }

  async translate(){
    if( Object.keys( this.directions ).length === 0 )
      return;

    const promises = [];
    let responses;
    let i = 0;

    for( let directionKey in this.directions ){
      const direction = this.directions[ directionKey ];
      const texts = direction.sources.join( "&text=" );
      // #fix кастомный движок перевода
      const URL =
        "https://translate.yandex.net/api/v1.5/tr.json/translate" +
        `?key=${this.apiKey}` +
        `&lang=${directionKey}` +
        `&text=${texts}`;

      promises.push( fetch( URL ) );
    }

    responses = await Promise.all( promises );
    responses = await Promise.all( responses.map( response => response.json() ) );
    i = 0;

    for( let direction in this.directions ){
      const keys = this.directions[ direction ].keys;
      const toLocale = direction.split( "-" )[1];
      const texts = responses[ i++ ].text;

      keys.forEach( ( key, j ) => {
        if( this.translated[ key ] === undefined ) this.translated[ key ] = {};

        const translated = this.translated[ key ];

        translated[ toLocale ] = texts[j];
      } );
    }
  }

  transform(){
    this.transformed = {};

    for( let key in this.translated )
      for( let locale in this.translated[ key ] ){
        if( this.transformed[ locale ] === undefined )
          this.transformed[ locale ] = {};

        this.transformed[ locale ][ key ] = this.translated[ key ][ locale ];
      }
  }
}
