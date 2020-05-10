"use strict";

import { createMap, mergeMultiple } from "/helpers/merger";

export {
  create,
  getAll,
  filter,
  getByUrl,
  edit,
  del
};

async function create( client, url, locationIds, subjectIds ){
  try{
    url = url.toLowerCase();

    const { rows: [ { id } ] } = await client.query(
      `insert into compiliations( url, location_ids, subject_ids )
      values( $1, $2, $3 )
      returning id`,
      [ url, locationIds, subjectIds ]
    );

    return id;
  } catch( e ) {
    if( e.code === "23505" )
      return null;

    throw e;
  }
}

async function getAll( client, locale ){
  const { rows } = await client.query(
    `select c.id, c.url, c.image_url, ct.name
    from
      compiliations as c,
      compiliations_translates as ct
    where
      ct.locale = $1 and
      c.id = ct.compiliation_id`,
    [ locale ]
  );

  return rows;
}

async function filter( client, locale, locationIds, subjectIds, dateStart, dateEnd ){
  let filters = [];
  const params = [ locale ];
  let i = 2;

  if( Array.isArray( locationIds ) ){
    filters.push( `c.location_ids && $${i++}` );
    params.push( locationIds );
  }

  if( Array.isArray( subjectIds ) ){
    filters.push( `c.subject_ids && $${i++}` );
    params.push( subjectIds );
  }

  if( typeof dateStart === "string" && dateStart !== "" ){
    filters.push( `$${i++} >= cd.date_start` );
    params.push( dateStart );
  }

  if( typeof dateEnd === "string" && dateEnd !== "" ){
    filters.push( `$${i++} <= cd.date_end` );
    params.push( dateEnd );
  }

  if( filters.length === 0 ) filters = "";
  else filters = `(${filters.join( " or " )}) and`;

  const { rows } = await client.query(
    `select c.id, c.url, c.image_url, ct.name
    from
      compiliations as c
      left join compiliation_dates as cd
      on c.id = cd.compiliation_id,
      compiliations_translates as ct
    where
      ct.locale = $1 and
      ${filters}
      c.id = ct.compiliation_id
    group by c.id, ct.name`,
    params
  );

  return rows;
}

async function getByUrl( client, locale, url ){
  url = url.toLowerCase();

  const { rows: [ main ] } = await client.query(
    `select
      c.*, ct.title, ct.name, ct.tagline, ct.description
    from
      compiliations as c,
      compiliations_translates as ct
    where
      ct.locale = $1 and
      c.url = $2 and
      c.id = ct.compiliation_id
    group by c.id, c.url, c.image_url, ct.title, ct.name, ct.tagline, ct.description`,
    [ locale, url ]
  );

  if( main === undefined )
    return `Invalid url (${url})`;

  main.actions = ( await client.query(
    `select
    	ca.action_id as id, ca.description,
    	at.name,
    	coalesce( min( ab.price ), 0 ) as price_min,
    	coalesce( max( ab.price ), 0 ) as price_max,
      null as locations,
      null as dates
    from
    	compiliations_actions as ca,
    	actions_translates as at
    	left join action_images as ai
    	on at.action_id = ai.action_id and ai.is_main = true
    	left join action_buyable as ab
    	on ab.action_id = at.action_id and ab.type = 'ticket'
    where
    	ca.locale = $1 and
    	at.locale = ca.locale and
    	ca.compiliation_id = $2 and
    	ca.action_id = at.action_id
    group by ca.action_id, ca.description, at.name`,
    [ locale, main.id ]
  ) ).rows;

  main.dates = ( await client.query(
    `select id, date_start, date_end, time_start, time_end, days
    from compiliation_dates
    where compiliation_id = $1`,
    [ main.id ]
  ) ).rows;

  const map = createMap( main.actions, "id" );
  const actionIds = Object.keys( map );

  const locations = ( await client.query(
    `select
    	al.action_id, al.address,
    	l.name
    from
    	actions_locations as al,
    	locations as l
    where
    	l.locale = $1 and
    	al.action_id = any( $2 ) and
    	al.location_id = l.id`,
    [ locale, actionIds ]
  ) ).rows;

  const dates = ( await client.query(
    `select action_id, date_start, date_end, time_start, time_end, days
    from action_dates
    where
    	action_id = any( $1 )`,
    [ actionIds ]
  ) ).rows;

  mergeMultiple( main.actions, locations, "action_id", "locations", { map, remove: true } );
  mergeMultiple( main.actions, dates, "action_id", "dates", { map, remove: true } );

  return main;
}

async function edit( client, id, url, locationIds, subjectIds ){
  let sets = [];
  const params = [ id ];
  let i = 2;

  if( url !== null ){
    sets.push( `url = $${i++}` );
    params.push( url );
  }

  if( locationIds !== null ){
    sets.push( `location_ids = $${i++}` );
    params.push( locationIds );
  }

  if( subjectIds !== null ){
    sets.push( `subject_ids = $${i++}` );
    params.push( subjectIds );
  }

  if( sets.length > 0 ) try{
    const { rowCount } = await client.query(
      `update compiliations
      set ${sets}
      where id = $1`,
      params
    );

    if( rowCount !== 1 )
      return `Invalid ID (${id})`;

    return true;
  } catch( e ) {
    if( e.code === "23505" )
      return `Url (${url}) already exists`;

    throw e;
  }

  return true;
}

async function del( client, id ){
  const { rows: [ row ] } = await client.query(
    `delete from compiliations
    where id = $1
    returning image_url`,
    [ id ]
  );

  if( row === undefined )
    return { errors: [ `Invalid ID (${id})` ] };

  return row.image_url;
}
