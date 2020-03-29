module.exports = ( apiKey, fetch, options ) => {
  let format = "plain";

  if( typeof options === "object" && !Array.isArray( options ) ){
    const { format: format_ } = options;

    if( [ "plain", "html" ].includes( format_ ) )
      format = format_;
  }

  return async ( texts, direction ) => {
    texts = texts.join( "&text=" );

    const URL =
      "https://translate.yandex.net/api/v1.5/tr.json/translate" +
      `?key=${apiKey}` +
      `&lang=${direction}` +
      `&format=${format}` +
      `&text=${texts}`;

    return ( await fetch( URL ) ).json();
  }
}
