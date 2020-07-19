"use strict";

export {
  createOne,
  getMany,
  getOne,
  editOne,
  removeOne
};

async function createOne( client, slug, translates ){
  let id;

  try{
    const { rows: [ { id } ] } = await client.query(
      `insert into filter_crosses( slug )
      values ( $1 )
      returning id`,
      [ slug ]
    );

    for( const locale in translates ){
      const { description, intro } = translates[ locale ];

      await client.query(
        `insert into filter_crosses_translates( filter_cross_id, locale, description, intro )
        values( $1, $2, $3, $4 )`,
        [ id, locale, description, intro ]
      );
    }

    return id;
  } catch( e ) {
    if( e.code === "23505" )
      return `Cross for slug (${slug}) already created`;

    throw e;
  }
}

async function getMany( client, locale ){
  let conditions = [];
  const params = [];

  if( locale !== false ){
    conditions.push( "locale = $1" );
    params.push( locale );
  }

  conditions = [ ...conditions, "fc.id = fct.filter_cross_id" ].join( " and " );

  const { rows } = await client.query(
    `select *
    from
    	filter_crosses as fc,
    	filter_crosses_translates as fct
    where ${conditions}`,
    params
  );

  return rows;
}

async function getOne( client, locale, slug ){
  let conditions = [];
  const params = [];
  let i = 1;

  if( locale !== false ){
    conditions.push( `locale = $${i++}` );
    params.push( locale );
  }

  conditions = [
    ...conditions,
    `fc.slug = $${i++}`,
    "fc.id = fct.filter_cross_id"
  ].join( " and " );
  params.push( slug );

  const { rows } = await client.query(
    `select *
    from
    	filter_crosses as fc,
    	filter_crosses_translates as fct
    where ${conditions}`,
    params
  );

  return rows;
}

async function editOne( client, id, slug, translates ){
  if( slug ){
    const { rowCount } = await client.query(
      `update filter_crosses
      set slug = $1
      where id = $2`,
      [ slug, id ]
    );

    if( rowCount === 0 )
      return `Invalid ID (${id})`;
  }

  for( const locale in translates ){
    const { description, intro } = translates[ locale ];
    const sets = [];
    const params = [ locale, id ];
    let i = 3;

    if( description ){
      sets.push( `description = $${i++}` );
      params.push( description );
    }

    if( intro ){
      sets.push( `intro = $${i++}` );
      params.push( intro );
    }

    if( sets.length > 0 ) await client.query(
      `update filter_crosses_translates
      set ${sets}
      where
        locale = $1 and
        filter_cross_id = $2`,
      params
    );
  }

  return true;
}

async function removeOne( client, id ){
  const { rowCount } = await client.query(
    `delete from filter_crosses
    where id = $1`,
    [ id ]
  );

  return rowCount === 1;
}
