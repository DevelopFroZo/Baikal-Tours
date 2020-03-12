import { toInt } from "/helpers/converters";

export async function get( req, res ){
  const id = toInt( req.params.id );

  if( id === null || id < 1 )
    return res.error( 9 );

  const { userId, role } = req.session;

  if( role !== "admin" && id !== userId )
    return res.error( 12 );

  res.json( await req.database.users.getById( id ) );
}

export async function put( req, res ){
  const id = toInt( req.params.id );

  if( id === null || id < 1 )
    return res.error( 9 );

  const { userId, role } = req.session;

  if( role !== "admin" ){
    if( id !== userId )
      return res.error( 12 );

    delete req.body.role;
  }

  const result = await req.database.users.edit( id, req.body );

  if( id === userId ){
    if( req.body.role )
      req.session.role = req.body.role;

    if( req.body.name )
      req.session.name = req.body.name;

    if( req.body.email )
      req.session.email = req.body.email;
  }

  res.success();
}

export async function del( req, res ){
  const id = toInt( req.params.id );

  if( id === null || id < 1 )
    return res.error( 9 );

  res.json( await req.database.users.del( id ) );
}
