import dicts from "/helpers/i18n/dicts/index";

export async function put( req, res ){
  const locale = dicts[ req.params.locale ];

  if( locale )
    req.session.locale = req.params.locale;
  else
    return res.error( 11 );

  res.success();
}
