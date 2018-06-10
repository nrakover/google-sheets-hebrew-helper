var ENDPOINT = "https://us-central1-playground-201415.cloudfunctions.net/pealim-scraper";

function translateAndConjugate(englishInfinitive) {
  const cache = CacheService.getScriptCache();
  const cacheKey = "ENGLISH:" + englishInfinitive;
  const cachedResponse = cache.get(cacheKey);
  if (cachedResponse) {
    console.log("Found cached response for: " + cacheKey);
    return JSON.parse(cachedResponse);
  } else {
    const hebrewInfinitive = LanguageApp.translate(englishInfinitive, "en", "he");
    const table = _conjugate(hebrewInfinitive, true);
    
    // cache result
    cache.put(cacheKey, JSON.stringify(table));
    return table;
  }
}

function conjugate(hebrewInfinitive) {
  return _conjugate(hebrewInfinitive, false)
}

function _conjugate(hebrewInfinitive, printInfinitive) {
  const cache = CacheService.getScriptCache();
  const cacheKey = "HEBREW:" + hebrewInfinitive + "-INF:" + printInfinitive;
  const cachedResponse = cache.get(cacheKey);
  if (cachedResponse) {
    console.log("Found cached response for: " + cacheKey);
    return JSON.parse(cachedResponse);
  } else {
    const table = _doConjugate(hebrewInfinitive, printInfinitive);
    // cache result
    cache.put(cacheKey, JSON.stringify(table));
    return table;
  }
}

function _doConjugate(hebrewInfinitive, printInfinitive) {
  console.log("Invoking endpoint for: " + hebrewInfinitive);
  const body = {'query': hebrewInfinitive};
  const options = {
    'method' : 'post',
    'contentType': 'application/json',
    'payload' : JSON.stringify(body)
  };
  const response = UrlFetchApp.fetch(ENDPOINT, options);
  const responseText = response.getContentText();
  const conjugations = JSON.parse(responseText);
  console.log(conjugations);
  
  const present = [[]];
  _appendConjugationToArray(present, conjugations.present.masculineSingular)
  _appendConjugationToArray(present, conjugations.present.feminineSingular)
  _appendConjugationToArray(present, conjugations.present.masculinePlural)
  _appendConjugationToArray(present, conjugations.present.femininePlural)
  
  const past1st = [[]];
  _appendConjugationToArray(past1st, conjugations.past.firstPersonSingular)
  _appendConjugationToArray(past1st, conjugations.past.firstPersonPlural)
  
  const past2nd = [[]];
  _appendConjugationToArray(past2nd, conjugations.past.secondPersonMasculineSingular)
  _appendConjugationToArray(past2nd, conjugations.past.secondPersonFeminineSingular)
  _appendConjugationToArray(past2nd, conjugations.past.secondPersonMasculinePlural)
  _appendConjugationToArray(past2nd, conjugations.past.secondPersonFemininePlural)
  
  const past3rd = [[]];
  _appendConjugationToArray(past3rd, conjugations.past.thirdPersonMasculineSingular)
  _appendConjugationToArray(past3rd, conjugations.past.thirdPersonFeminineSingular)
  _appendConjugationToArray(past3rd, conjugations.past.thirdPersonPlural)
  
  const future1st = [[]];
  _appendConjugationToArray(future1st, conjugations.future.firstPersonSingular)
  _appendConjugationToArray(future1st, conjugations.future.firstPersonPlural)
  
  const future2nd = [[]];
  _appendConjugationToArray(future2nd, conjugations.future.secondPersonMasculineSingular)
  _appendConjugationToArray(future2nd, conjugations.future.secondPersonFeminineSingular)
  _appendConjugationToArray(future2nd, conjugations.future.secondPersonMasculinePlural)
  
  const future3rd = [[]];
  _appendConjugationToArray(future3rd, conjugations.future.thirdPersonMasculineSingular)
  _appendConjugationToArray(future3rd, conjugations.future.thirdPersonFeminineSingular)
  _appendConjugationToArray(future3rd, conjugations.future.thirdPersonMasculinePlural)
  
  const infinitive = [];
  if (printInfinitive) {
    infinitive.push([])
    _appendConjugationToArray(infinitive, conjugations.infinitive)
  }      
  
  return infinitive
  .concat(present).concat([[]])
  .concat(past1st).concat(past2nd).concat(past3rd).concat([[]])
  .concat(future1st).concat(future2nd).concat(future3rd);
}

function _appendConjugationToArray(arr, c) {
  arr[0].push(c.hebrew);
  //arr[1].push(c.transliteration);
}
