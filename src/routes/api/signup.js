"use strict";

export async function post( req, res ){
  let result;

  if( req.query.action === "start" ){
    // #fix проверки на корректность данных
    result = await req.database.auth.signup(
      req.body.name,
      req.body.surname,
      req.body.phone,
      req.body.email
    );

    if( !result.ok ) return res.json( result );

    req.mail.send(
      req.body.email,
      // #fix нормальная тема
      "Пароль",
      // #fix нормальный текст
      result.data
    );

    return res.success();
  }
  else if( req.query.action === "confirm" ){
    // #fix проверки на корректность данных
    // #fix redirect на /api/signin
    result = await req.database.auth.signin(
      req.body.phoneOrEmail,
      req.body.password
    );

    if( !result.ok ) return res.json( result );

    // #fix добавить роль
    req.session.userId = result.data.id;
    req.session.email = result.data.email;
    req.session.isLogged = true;

    return res.success();
  }

  res.error( 5 );
}
