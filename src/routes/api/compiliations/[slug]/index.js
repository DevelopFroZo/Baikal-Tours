"use strict";

import fetch from "node-fetch";
import Translator from "/helpers/translator/index";
import yandexEngineBuilder from "/helpers/translator/engines/yandex";
import { toInt } from "/helpers/converters";
import { unlink } from "/helpers/promisified";

export {
  get,
  put,
  del
};

async function get( req, res ){
  const { slug: url } = req.params;

  if( typeof url !== "string" || url === "" )
    return res.error( 16 );

  const compiliation = await req.database.compiliations.getByUrl( req.session.locale, url );

  if( compiliation === null )
    return res.error( 16 );

  res.success( 0, compiliation );
}

async function put( {
  params: { slug },
  body: {
    url,
    actions,
    title,
    name,
    tagline,
    description,
    dates,
    locations,
    subjects
  },
  database: {
    pool,
    compiliations,
    compiliationsActions,
    compiliationsLocations,
    compiliationsSubjects,
    compiliationDates,
    compiliationsTranslates
  }
}, res ){
  const id = toInt( slug );

  if( id === null || id < 1 )
    return res.error( 9 );

  const { rowCount } = await pool.query(
    `select 1
    from compiliations
    where id = $1`,
    [ id ]
  );

  if( rowCount === 0 )
    return res.error( 9 );

  const yandexEngine = yandexEngineBuilder( process.env.YANDEX_TRANSLATE_API_KEY, fetch );
  const translator = new Translator( yandexEngine );
  let translated = {};

  const q = ( locale, field, value ) => {
    if( !( locale in translated ) )
      translated[ locale ] = {};

    translated[ locale ][ field ] = value;
  };

  if( actions !== null && typeof actions === "object" && Array.isArray( actions ) )
    actions.forEach( action => {
      if( action.description.autoTranslate === true )
        translator.add( `action${action.id}`, action.description.text, action.description.locale, action.description.toLocales );
    } );

  if( typeof title === "object" ){
    q( title.locale, "title", title.text );

    if( title.autoTranslate === true )
      translator.add( "title", title.text, title.locale, title.toLocales );
  }

  if( typeof name === "object" ){
    q( name.locale, "name", name.text );

    if( name.autoTranslate === true )
      translator.add( "name", name.text, name.locale, name.toLocales );
  }

  if( typeof tagline === "object" ){
    q( tagline.locale, "tagline", tagline.text );

    if( tagline.autoTranslate === true )
      translator.add( "tagline", tagline.text, tagline.locale, tagline.toLocales );
  }

  if( typeof description === "object" ){
    q( description.locale, "description", description.text );

    if( description.autoTranslate === true )
      translator.add( "description", description.text, description.locale, description.toLocales );
  }

  await translator.translate();
  translator.transform();

  for( let key in translator.transformed )
    if( translated[ key ] !== undefined )
      translated[ key ] = { ...translated[ key ], ...translator.transformed[ key ] };
    else
      translated[ key ] = translator.transformed[ key ];

  const transaction = await pool.connect();

  await transaction.query( "begin" );

  if( actions !== null && typeof actions === "object" && Array.isArray( actions ) )
    for( let action of actions ){
      await compiliationsActions.editOrUpdate( transaction, id, action.id, action.description.locale, action.description.text );

      if( action.description.autoTranslate === true ){
        const key = `action${action.id}`;

        for( let locale_ in translator.translated[ key ] )
          await compiliationsActions.editOrUpdate( transaction, id, action.id, locale_, translator.translated[ key ][ locale_ ] );
      }
    }

  if( Array.isArray( locations ) )
    for( let location of locations )
      await compiliationsLocations.edit( transaction, id, location.oldLocationId, location.newLocationId );

  if( Array.isArray( subjects ) )
    for( let subject of subjects )
      await compiliationsSubjects.edit( transaction, id, subject.oldSubjectId, subject.newSubjectId );

  if( Array.isArray( dates ) )
    for( let date of dates )
      await compiliationDates.edit( transaction, date );

  for( let key in translated )
    await compiliationsTranslates.editOrUpdate( transaction, id, key, translated[ key ] );

  if( typeof url === "string" && url !== "" ){
    const result = await compiliations.edit( transaction, url_, url );

    if( result !== true ){
      await transaction.query( "rollback" );
      transaction.release();

      return res.json( result );
    }
  }

  await transaction.query( "commit" );
  transaction.release();

  res.success();
}

async function del( {
  params: { slug },
  database: { pool, compiliations }
}, res ){
  const id = toInt( slug );

  if( id === null || id < 1 )
    return res.error( 9 );

  const result = await compiliations.delete( pool, id );

  if( result === false )
    return res.error( 9 );

  if( result !== null && !result.startsWith( "http" ) )
    await unlink( `static/${result}` );

  return res.success();
}
