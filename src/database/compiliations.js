"use strict";

import Foundation from "./helpers/foundation";

export default class extends Foundation{
  constructor( modules ){
    super( modules, "Compiliations" );
  }

  async create( client, url ){
    url = url.toLowerCase();

    const id = ( await client.query(
      `insert into compiliations( url )
      values( $1 )
      returning id`,
      [ url ]
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

  async filter( locale, locationIds, subjectIds, dateStart, dateEnd ){
    let filters = [];
    const params = [ locale ];
    let i = 2;

    if( Array.isArray( locationIds ) ){
      filters.push( `cl.location_id = any( $${i++} )` );
      params.push( locationIds );
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
      `select c.id, c.url, c.image_url, ct.name
      from
        compiliations as c
        left join compiliations_locations as cl
        on c.id = cl.compiliation_id
        left join compiliations_subjects as cs
        on c.id = cs.compiliation_id
        left join compiliation_dates as cd
        on c.id = cd.compiliation_id,
        compiliations_translates as ct
      where
        ct.locale = $1 and
        ${filters}
        c.id = ct.compiliation_id
      group by c.id, ct.name`,
      params
    ) ).rows;

    return super.success( 0, rows );
  }

  async getByUrl( locale, url ){
    url = url.toLowerCase();

    const transaction = await super.transaction();

    const main = ( await transaction.query(
      `select
        c.*, ct.title, ct.name, ct.tagline, ct.description,
        array_agg( ca.action_id ) as action_ids
      from
        compiliations as c,
        compiliations_translates as ct,
        compiliations_actions as ca
      where
        ct.locale = $1 and
        c.url = $2 and
        ca.locale = ct.locale and
        c.id = ct.compiliation_id and
        c.id = ca.compiliation_id
      group by c.id, c.url, c.image_url, ct.title, ct.name, ct.tagline, ct.description`,
      [ locale, url ]
    ) ).rows[0];

    if( main === undefined )
      return null;

    main.dates = ( await transaction.query(
      `select id, date_start, date_end, time_start, time_end, days
      from compiliation_dates
      where compiliation_id = $1`,
      [ main.id ]
    ) ).rows;

    main.actions = [];

    for( let actionId of main.action_ids ){
      const { data } = await this.modules.actions.getOne( false, actionId, locale );

      if( data === undefined ) continue;

      data.compiliationDescription = ( await transaction.query(
        `select description
        from compiliations_actions
        where
          compiliation_id = $1 and
          action_id = $2 and
          locale = $3`,
        [ main.id, actionId, locale ]
      ) ).rows[0].description;
      main.actions.push( data );
    }

    await transaction.end();

    delete main.action_ids;

    if( main.actions.length === 0 )
      return null;

    return main;
  }

  async edit( client, oldUrl, newUrl ){
    try{
      await client.query(
        `update compiliations
        set url = $1
        where url = $2`,
        [ newUrl, oldUrl ]
      );
    } catch( e ) {
      if( e.code === "23505" )
        return { errors: [ `Compiliation with same url (${newUrl}) already exists` ] };

      throw e;
    }

    return true;
  }

  async delete( client, id ){
    const { rows: [ row ] } = await client.query(
      `delete from compiliations
      where id = $1
      returning image_url`,
      [ id ]
    );

    if( row === undefined )
      return false;

    return row.image_url;
  }
}
