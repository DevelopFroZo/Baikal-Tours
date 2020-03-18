"use strict";

export async function get( req, res ){
  const { slug: url } = req.params;
  const compiliation = await req.database.compiliations.getByUrl( req.session.locale, url );

  if( compiliation === null )
    return res.error( 16 );

  res.success( 0, compiliation );
}

// #fix добавить изменение
export async function put( req, res ){
  //
}

// #fix добавить удаление
export async function del( req, res ){
  //
}
