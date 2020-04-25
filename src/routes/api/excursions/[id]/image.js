"use strict";

import crypto from "crypto";
import { toInt } from "/helpers/converters";
import { writeFile } from "/helpers/promisified";

export async function post( req, res ){
  const id = toInt( req.params.id );

  if( id === null || id < 1 )
    return res.error( 9 );

  const { file } = req;

  if( file === undefined )
    return res.error( 13 );

  const { originalname, buffer, size } = file;

  if( ( size / Math.pow( 2, 20 ) ) >= 1 )
    return res.error( 14 );

  const ext = originalname.slice( originalname.lastIndexOf( "." ) + 1, originalname.length );

  if( ![ "png", "jpg", "jpeg" ].includes( ext ) )
    return res.error( 15 );

  const time = ( new Date() ).getTime();
  const seed = crypto.randomBytes( 5 ).toString( "hex" );
  const hash = crypto.createHash( "sha512" );

  hash.update( `${id}${originalname}${size}${time}${seed}` );

  const path = `img/excursions/${hash.digest( "hex" )}.${ext}`;

  // #fix переделать нормально
  const transaction = await req.database.pool.connect();

  await transaction.query( "begin" );

  const { id: id_ } = ( await transaction.query(
    `update excursions
    set image_url = $1
    where id = $2
    returning id`,
    [ path, id ]
  ) ).rows[0];

  if( id_ !== id )
    await transaction.query( "rollback" );
  else{
    await writeFile( `static/${path}`, buffer );
    await transaction.query( "commit" );
  }

  await transaction.release();

  res.success();
}
