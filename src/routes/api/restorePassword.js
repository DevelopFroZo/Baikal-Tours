"use strict";

import { toInt } from "/helpers/converters";

export {
  get
};

// #fix переделать на email
async function get( {
  session,
  query: { userId: userId_ },
  database: { auth },
  mail,
  _
}, res ){
  const { isLogged, role, userId } = session;

  if( !isLogged ) return res.json( {
    ok: false,
    message: "Unauthorized"
  } );

  const userId__ = toInt( userId_ );

  if( !Number.isInteger( userId__ ) || userId__ < 1 )
    return res.error( 13 );

  if( role !== "admin" && userId !== userId__ )
    return res.error( 12 );

  const result = await auth.restorePassword( userId__ );

  if( result !== null && typeof result === "object" && !Array.isArray( result ) && "errors" in result )
    return res.json( result );

  session.isLogged = false;
  session.name = "";
  session.surname = "";
  session.email = "";
  session.userId = 0;
  session.role = "user";

  mail.send(
    result.email,
    // #fix нормальная тема
    _( "email.confirm_password.subject" ),
    // #fix нормальный текст
    result.password
  );

  res.success();
}
