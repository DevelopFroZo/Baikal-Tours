"use strict";

export {
  create,
  getAll,
  edit
};

async function create( client, name, id ){
  let n0, n1, n2;
  let insertParams;

  if( id === null ){
    const { rows: [ { n0: tmp } ] } = await client.query(
      `select coalesce( max( n0 ), 0 ) + 1 as n0
      from locations2`
    );

    insertParams = [ tmp, 0, 0, name ];
  } else {
    const { rows: [ row ] } = await client.query(
      `select n0 as n0_, n1 as n1_, n2 as n2_
      from locations2
      where id = $1`,
      [ id ]
    );

    if( row === undefined )
      return `Invalid ID (${id})`;

    const { n0_, n1_, n2_ } = row;
    let where = "";
    let searchParams = [];
    let index;

    if( n2_ !== 0 ){
      where = "where n0 = $1 and n1 = $2";
      searchParams = [ n0_, n1_ ];
      insertParams = [ n0_, n1_ ];
      index = 2;
    }
    else if( n1_ !== 0 ){
      where = "where n0 = $1";
      searchParams = [ n0_ ];
      insertParams = [ n0_, 0, 0 ];
      index = 1;
    } else {
      insertParams = [ 0, 0, 0 ];
      index = 0;
    }

    const { rows: [ { q } ] } = await client.query(
      `select max( n${index} ) + 1 as q
      from locations2
      ${where}`,
      searchParams
    );

    insertParams[ index ] = q;
    insertParams.push( name );
  }

  const { rows: [ row ] } = await client.query(
    `insert into locations2( n0, n1, n2, name )
    values( $1, $2, $3, $4 )
    returning id, n0, n1, n2`,
    insertParams
  );

  return row;
}

async function getAll( client ){
  const { rows } = await client.query(
    `select *
    from locations2
    order by n0, n1, n2`
  );

  return rows;
}

async function edit( client, id, name ){
  const { rowCount } = await client.query(
    `update locations2
    set name = $1
    where id = $2`,
    [ name, id ]
  );

  if( rowCount === 0 )
    return `Invalid ID (${id})`;

  return true;
}
