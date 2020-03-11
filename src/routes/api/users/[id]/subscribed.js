import { toInt } from "/helpers/converters";

export async function get( req, res ){
  const id = toInt( req.params.id );

  if( id === null || id < 1 )
    return res.error( 9 );

  const { locale, userId, role } = req.session;

  if( role !== "admin" && id !== userId )
    return res.error( 12 );

  res.json( await req.database.users.getSubscribedActions( id, locale ) );
}
