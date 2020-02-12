export default class{
  constructor( fetch_ ){
    // #fix добавить возможность определять базовый путь
    this.baseUrl = "";
    this.schemas = {
      json: async response => await response.json(),
      default: async response => await response.text()
    };

    // #fix сделать нормальный способ передавать свой fetch
    if( fetch_ === undefined )
      this.fetch = fetch;
    else
      this.fetch = fetch_;
    

    // #fix добавить тип FormData
  }

  makeUrl( url ){
    if( url[0] === "/" ) return this.baseUrl + url.slice( 1, url.length );

    return this.baseUrl + url;
  }

  makeParams( options, level ){
    if( options === undefined || options === null ) return "";
    if( typeof options === "string" ) return "?" + options;
    if( typeof options === "object" ){
      if( options.length !== undefined ) return "?" + options.join( "&" );
      if( level === undefined ) return this.makeParams( options.params, 1 );

      const serialized = [];

      for( let key in options )
        if( typeof options[ key ] === "object" ) serialized.push( `${key}=${options[ key ].join( "," )}` );
        else if( options[ key ] === "" ) serialized.push( key );
        else serialized.push( `${key}=${options[ key ]}` );

      return "?" + serialized.join( "&" );
    }

    return "";
  }

  async serialize( response, schema ){
    const cloned = response.clone();

    try{
      // #fix переделать на любую схему
      if( this.schemas[ schema ] ) return await this.schemas[ schema ]( response );
    }
    catch( error ){}

    if( response.body.locked ) response = cloned;

    return await this.schemas.default( response );
  }

  async send( url, body, options, method ){
    const params = this.makeParams( options );

    url = this.makeUrl( url );

    if( typeof options === "object" && options.length === undefined ){
      if( options.params ) delete options.params;
    }
    else options = {};

    options.method = method;

    if( method === "POST" || method === "PUT" ){
      // #fix переделать на любую другую схему
      options.headers = {
        "Content-Type": "application/json"
      };
      options.body = JSON.stringify( body );
    }

    const response = await this.fetch( url + params, options );

    if( !response.ok ) return response;

    // #fix добавить redirect

    // #fix другой обработчик
    return await this.serialize( response, "json" );
  }

  async get( url, options ){
    return await this.send( url, null, options, "GET" );
  }

  async post( url, body, options ){
    return await this.send( url, body, options, "POST" );
  }

  async put( url, body, options ){
    return await this.send( url, body, options, "PUT" );
  }

  async del( url, options ){
    return await this.send( url, null, options, "DELETE" );
  }
}
