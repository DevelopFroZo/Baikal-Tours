"use strict";

import Foundation from "./helpers/foundation";

export default class extends Foundation{
  constructor( modules ){
    super( modules, "Companions" );
  }

  async create( data ){
    const transaction = await super.transaction();
    const promises = [];

    for( let locale in data )
      promises.push( transaction.query(
        `insert into companions( id, name, locale )
        values( (
          select max( id ) + 1
          from companions
          where locale = $1
        ), $2, $1 )`,
        [ locale, data[ locale ] ]
      ) );

    await Promise.all( promises );
    await transaction.end();

    return super.success();
  }

  async getAll( locale ){
    const rows = ( await super.query(
      `select id, name
      from companions
      where locale = $1
      order by id`,
      [ locale ]
    ) ).rows;

    return super.success( 0, rows );
  }
}
