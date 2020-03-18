"use strict";

import Foundation from "./helpers/foundation";

export default class extends Foundation{
  constructor( modules ){
    super( modules, "Compiliations" );
  }

  async create( client, url, actionIds ){
    url = url.toLowerCase();

    const id = ( await client.query(
      `insert into compiliations( url, action_ids )
      values( $1, $2::int[] )
      returning id`,
      [ url, actionIds ]
    ) ).rows[0].id;

    return id;
  }

  async get( locale ){
    const rows = ( await super.query(
      `select c.id, c.url, c.image_url, ct.name
      from
        compiliations as c,
        compiliations_translates as ct
      where
        ct.locale = $1 and
        c.id = ct.compiliation_id`,
      [ locale ]
    ) ).rows;

    return super.success( 0, rows );
  }

  async filter( locale, companionIds, subjectIds, dateStart, dateEnd ){
    let filters = [];
    const params = [ locale ];
    let i = 2;

    if( Array.isArray( companionIds ) ){
      filters.push( `cc.companion_id = any( $${i++} )` );
      params.push( companionIds );
    }

    if( Array.isArray( subjectIds ) ){
      filters.push( `cs.subject_id = any( $${i++} )` );
      params.push( subjectIds );
    }

    if( typeof dateStart === "string" && dateStart !== "" ){
      filters.push( `cd.date_start is null or cd.date_start >= $${i++}` );
      params.push( dateStart );
    }

    if( typeof dateEnd === "string" && dateEnd !== "" ){
      filters.push( `cd.date_end is null or cd.date_end >= $${i++}` );
      params.push( dateEnd );
    }

    if( filters.length === 0 ) filters = "";
    else filters = `(${filters.join( " or " )}) and`;

    const rows = ( await super.query(
      `select c.id, c.url, c.image_url
      from
        compiliations as c
        left join compiliations_companions as cc
        on c.id = cc.compiliation_id
        left join compiliations_subjects as cs
        on c.id = cs.compiliation_id
        left join compiliation_dates as cd
        on c.id = cd.compiliation_id,
        compiliations_translates as ct
      where
        ct.locale = $1 and
        ${filters}
        c.id = ct.compiliation_id
      group by c.id, c.url, c.image_url`,
      params
    ) ).rows;

    return super.success( 0, rows );
  }

  async getByUrl( locale, url ){
    url = url.toLowerCase();

    const transaction = await super.transaction();
    const promises = [];

    const main = ( await transaction.query(
      `select c.*, ct.title, ct.name, ct.tagline, ct.description
      from
        compiliations as c,
        compiliations_translates as ct
      where
        ct.locale = $1 and
        c.url = $2 and
        c.id = ct.compiliation_id`,
      [ locale, url ]
    ) ).rows[0];

    if( main === undefined )
      return null;

    promises.push( ( async () => {
      main.dates = ( await transaction.query(
        `select id, date_start, date_end, time_start, time_end, days
        from compiliation_dates
        where compiliation_id = $1`,
        [ main.id ]
      ) ).rows;
    } )() );

    promises.push( ( async () => {
      main.actions = [];

      for( let actionId of main.action_ids ){
        main.actions.push( ( await this.modules.actions.getOne( false, actionId, locale ) ).data );
      }
    } )() );

    await Promise.all( promises );
    await transaction.end();

    delete main.action_ids;

    return main;
  }

  // #fix
  async edit(){
    //
  }
}
