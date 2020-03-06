"use strict";

import Translator from "/helpers/translator/index";

export async function post( req, res ){
  let translated = {};

  translated[ req.body.locale ] = req.body.name;

  if( req.body.autoTranslate === true ){
    const translator = new Translator( process.env.YANDEX_TRANSLATE_API_KEY );

    translator.add( "name", req.body.name, req.body.locale, req.body.toLocales );
    await translator.translate();

    translated = { ...translated, ...translator.translated.name };
  }

  res.json( await req.database.companions.create( translated ) );
}

export async function get( req, res ){
  const role = req.session.role;
  let locale = req.session.locale;

  if( role === "admin" && req.body.locale ) locale = req.body.locale;

  res.json( await req.database.companions.getAll( locale ) );
}
