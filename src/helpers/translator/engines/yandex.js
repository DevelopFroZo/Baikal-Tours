module.exports = ( apiKey, fetch ) => {
  return async ( texts, direction ) => {
    texts = texts.join( "&text=" );

    const URL =
      "https://translate.yandex.net/api/v1.5/tr.json/translate" +
      `?key=${apiKey}` +
      `&lang=${direction}` +
      `&text=${texts}`;

    return ( await fetch( URL ) ).json();
  }
}
