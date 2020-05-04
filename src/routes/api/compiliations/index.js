"use strict";

import fetch from "node-fetch";
import Translator from "/helpers/translator/index";
import yandexEngineBuilder from "/helpers/translator/engines/yandex";
import { toIntArray } from "/helpers/converters";

export async function post( req, res ){
  const { file } = req;

  const { url, actions, title, name, tagline, description, dates } = req.body;
  let { locationIds, subjectIds } = req.body;

  if(
    typeof url !== "string" || url === "" ||
    !Array.isArray( actions ) ||
    typeof title !== "object" ||
    typeof name !== "object" ||
    typeof tagline !== "object" ||
    typeof description !== "object"
  ) return res.error( 13 );

  const yandexEngine = yandexEngineBuilder( process.env.YANDEX_TRANSLATE_API_KEY, fetch );
  const translator = new Translator( yandexEngine );
  let translated = {};

  const q = ( locale, field, value ) => {
    if( !( locale in translated ) )
      translated[ locale ] = {};

    translated[ locale ][ field ] = value;
  };

  actions.forEach( action => {
    if( action.description.autoTranslate === true )
      translator.add( `action${action.id}`, action.description.text, action.description.locale, action.description.toLocales );
  } );

  if( !Array.isArray( locationIds ) )
    locationIds = null;

  if( !Array.isArray( subjectIds ) )
    subjectIds = null;

  q( title.locale, "title", title.text );
  q( name.locale, "name", name.text );
  q( tagline.locale, "tagline", tagline.text );
  q( description.locale, "description", description.text );

  if( title.autoTranslate === true )
    translator.add( "title", title.text, title.locale, title.toLocales );

  if( name.autoTranslate === true )
    translator.add( "name", name.text, name.locale, name.toLocales );

  if( tagline.autoTranslate === true )
    translator.add( "tagline", tagline.text, tagline.locale, tagline.toLocales );

  if( description.autoTranslate === true )
    translator.add( "description", description.text, description.locale, description.toLocales );

  await translator.translate();
  translator.transform();

  for( let key in translator.transformed )
    if( translated[ key ] !== undefined )
      translated[ key ] = { ...translated[ key ], ...translator.transformed[ key ] };
    else
      translated[ key ] = translator.transformed[ key ];

  const transaction = await req.database.pool.connect();

  await transaction.query( "begin" );

  const id = await req.database.compiliations.create( transaction, url );

  for( let action of actions ){
    await req.database.compiliationsActions.create( transaction, id, action.id, action.description.locale, action.description.text );

    if( action.description.autoTranslate === true ){
      const key = `action${action.id}`;

      for( let locale_ in translator.translated[ key ] )
        await req.database.compiliationsActions.create( transaction, id, action.id, locale_, translator.translated[ key ][ locale_ ] );
    }
  }

  if( Array.isArray( locationIds ) )
    await req.database.compiliationsLocations.create( transaction, id, locationIds );

  if( Array.isArray( subjectIds ) )
    await req.database.compiliationsSubjects.create( transaction, id, subjectIds );

  if( Array.isArray( dates ) )
    await req.database.compiliationDates.create( transaction, id, dates );

  for( let key in translated )
    await req.database.compiliationsTranslates.create( transaction, id, key, translated[ key ] );

  await transaction.query( "commit" );
  await transaction.release();

  res.success( 0, id );
}

export async function get( req, res ){
  const { locale } = req.session;
  const { filter } = req.query;

  if( filter === undefined )
    return res.json( await req.database.compiliations.get( locale ) );

  const locationIds = toIntArray( req.query.locationIds );
  const subjectIds = toIntArray( req.query.subjectIds );
  const { dateStart, dateEnd } = req.query;

  res.json( await req.database.compiliations.filter( locale, locationIds, subjectIds, dateStart, dateEnd ) );
}
