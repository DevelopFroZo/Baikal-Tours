export async function get( req, res ){
  res.json( await req.database.companions.getAll() );
}
