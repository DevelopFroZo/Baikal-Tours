"use strict";

import { toInt } from "/helpers/converters";
import fillers from "/mail_service/fillers/index";
import { getTemplate, getTemplateTexts } from "/mail_service/index";
import i18n from "/helpers/i18n/index";

// Errors: 9, 10
export async function get( req, res ){
  const slug = req.params.id;

  if( typeof slug !== "string" || slug === "" )
    return res.error( 9 );

  const role = req.session.role;
  let locale = req.session.locale;
  let allStatuses = false;

  if( role === "admin" ){
    if( req.query.locale ) locale = req.query.locale;

    allStatuses = true;
  }

  res.json( await req.database.actions.getOneBySlug( allStatuses, slug, locale ) );
}

export async function put( req, res ){
  const id = toInt( req.params.id );

  if( id === null || id < 1 )
    return res.error( 9 );

  let { organizer_ids } = req.body;
  let addedOrganizers = [];
  let removedOrganizers = [];

  if( organizer_ids !== undefined ){
    const { rows: [ row ] } = await req.database.pool.query(
      `select organizer_ids as organizer_ids2
      from actions
      where id = $1`,
      [ id ]
    );

    if( row === undefined ) return res.error( 9 );

    const organizer_ids2 = row.organizer_ids2 ? row.organizer_ids2 : [];

    organizer_ids = organizer_ids ? organizer_ids : [];
    addedOrganizers = organizer_ids.filter( id => !organizer_ids2.includes( id ) );
    removedOrganizers = organizer_ids2.filter( id => !organizer_ids.includes( id ) );
  }

  await req.database.actions.edit( id, req.body );

  if( addedOrganizers.length > 0 || removedOrganizers.length > 0 ){
    let { rows: users } = await req.database.pool.query(
      `select id, email, locale
      from users
      where id = any( $1 )`,
      [ [ ...addedOrganizers, ...removedOrganizers ] ]
    );

    if( users.length === 0 ) return res.success();

    const locales = users.reduce( ( res, { id, locale } ) => {
      if( addedOrganizers.includes( id ) ){
        if( !res.added.includes( locale ) )
          res.added.push( locale );
      }
      else if( !res.removed.includes( locale ) )
        res.removed.push( locale );

      if( !res.all.includes( locale ) )
        res.all.push( locale );

      return res;
    }, { all: [], added: [], removed: [] } );

    users = users.reduce( ( res, { id, email, locale } ) => {
      res[ id ] = { email, locale };

      return res;
    }, {} );

    const action_names = ( await req.database.pool.query(
      `select locale, name
      from actions_translates
      where
        locale = any( $1 ) and
        action_id = $2`,
      [ locales.all, id ]
    ) ).rows.reduce( ( res, { locale, name } ) => {
      res[ locale ] = name;

      return res;
    }, {} );

    // #fix добавить письма на добавление в организаторы

    if( removedOrganizers.length > 0 ){
      const templateName = "removeFromOrganizers";
      // #fix проверка
      const filler = fillers[ templateName ];
      // #fix проверка
      const template = await getTemplate( templateName );
      // #fix проверка
      const texts = await getTemplateTexts( req.database.pool, [ locales.removed ], templateName );

      const mails = locales.removed.reduce( ( res, locale ) => {
        res[ locale ] = filler( template, texts[ locale ], {
          event: action_names[ locale ],
          domain: process.env.SELF_URL
        } );

        return res;
      }, {} );

      for( const id of removedOrganizers ){
        const { email, locale } = users[ id ];

        req.mail.send(
          email,
          i18n( locale )( "action.remove_from_organizers" ),
          "",
          mails[ locale ]
        );
      }
    }
  }

  res.success();
}
