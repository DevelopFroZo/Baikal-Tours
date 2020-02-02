"use strict";

// Errors: 3, 4
export async function post( req, res ){
  // #fix проверки на корректность данных
  const result = await req.database.auth.signin(
    req.body.phoneOrEmail,
    req.body.password
  );

  if( !result.ok ) return res.json( result );

  // #fix добавить роль
  req.session.userId = result.data;
  req.session.isLogged = true;

  res.success();
}
