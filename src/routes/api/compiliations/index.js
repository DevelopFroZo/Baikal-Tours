"use strict";

import fetch from "node-fetch";
import Translator from "/helpers/translator/index";
import yandexEngineBuilder from "/helpers/translator/engines/yandex";
import { toIntArray } from "/helpers/converters";

export async function post( req, res ){
  const { file } = req;

  const { url, actionIds, companionIds, subjectIds, title, name, tagline, description, dates } = req.body;

  if(
    typeof url !== "string" || url === "" ||
    !Array.isArray( actionIds ) ||
    typeof title !== "object" ||
    typeof name !== "object" ||
    typeof tagline !== "object" ||
    typeof description !== "object"
  ) return res.error( 13 );

  const yandexEngine = yandexEngineBuilder( process.env.YANDEX_TRANSLATE_API_KEY, fetch );
  const translator = new Translator( yandexEngine );
  let translated = {};
  const promises = [];

  const q = ( locale, field, value ) => {
    if( !( locale in translated ) )
      translated[ locale ] = {};

    translated[ locale ][ field ] = value;
  };

  if( !Array.isArray( companionIds ) )
    companionIds = null;

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

  // #fix переделать нормально
  const transaction = await req.database.pool.connect();

  await transaction.query( "begin" );

  const id = await req.database.compiliations.create( transaction, url, actionIds );

  if( Array.isArray( companionIds ) )
    promises.push( req.database.compiliationsCompanions.create( transaction, id, companionIds ) );

  if( Array.isArray( subjectIds ) )
    promises.push( req.database.compiliationsSubjects.create( transaction, id, subjectIds ) );

  if( Array.isArray( dates ) )
    promises.push( req.database.compiliationDates.create( transaction, id, dates ) );

  promises.push( ( async () => {
    for( let key in translated )
      await req.database.compiliationsTranslates.create( transaction, id, key, translated[ key ] );
  } )() );

  await Promise.all( promises );
  await transaction.query( "commit" );
  await transaction.release();

  res.success();
}

export async function get( req, res ){
  const { locale } = req.session;
  const { filter } = req.query;

  if( filter === undefined )
    return res.json( await req.database.compiliations.get( locale ) );

  const companionIds = toIntArray( req.query.companionIds );
  const subjectIds = toIntArray( req.query.subjectIds );
  const { dateStart, dateEnd } = req.query;

  res.json( await req.database.compiliations.filter( locale, companionIds, subjectIds, dateStart, dateEnd ) );
}
