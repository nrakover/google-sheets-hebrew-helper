function onOpen(e) {
  // no-op
}

function onInstall(e) {
  // no-op
}

/**
 * A function that takes an English verb in infinitive form and outputs
 * a table of its Hebrew conjugations.
 *
 * @param {String} englishInfinitive The English verb in infinitive form.
 * @return {String[]} The Hebrew conjugations.
 * @customfunction
 */
function translateAndConjugate(englishInfinitive) {
  const cache = CacheService.getScriptCache();
  const cacheKey = "ENGLISH:" + englishInfinitive;
  const cachedResponse = cache.get(cacheKey);
  if (cachedResponse) {
    console.log("Found cached response for: " + cacheKey);
    return JSON.parse(cachedResponse);
  } else {
    const hebrewInfinitive = LanguageApp.translate(englishInfinitive, "en", "he");
    const table = conjugate_(hebrewInfinitive, true);
    
    // cache result
    cache.put(cacheKey, JSON.stringify(table));
    return table;
  }
}

/**
 * A function that takes a Hebrew verb in infinitive form and outputs
 * a table of its conjugations.
 *
 * @param {String} hebrewInfinitive The Hebrew verb in infinitive form.
 * @return {String[]} The Hebrew conjugations.
 * @customfunction
 */
function conjugate(hebrewInfinitive) {
  return conjugate_(hebrewInfinitive, false)
}

function conjugate_(hebrewInfinitive, printInfinitive) {
  const cache = CacheService.getScriptCache();
  const cacheKey = "HEBREW:" + hebrewInfinitive + "-INF:" + printInfinitive;
  const cachedResponse = cache.get(cacheKey);
  if (cachedResponse) {
    console.log("Found cached response for: " + cacheKey);
    return JSON.parse(cachedResponse);
  } else {
    const table = doConjugate_(hebrewInfinitive, printInfinitive);
    // cache result
    cache.put(cacheKey, JSON.stringify(table));
    return table;
  }
}

function doConjugate_(hebrewInfinitive, printInfinitive) {
  console.log("Invoking endpoint for: " + hebrewInfinitive);
  const body = {'query': hebrewInfinitive};
  const options = {
    'method' : 'post',
    'contentType': 'application/json',
    'payload' : JSON.stringify(body)
  };
  const url = PropertiesService.getScriptProperties().getProperty("ENDPOINT");
  const response = UrlFetchApp.fetch(url, options);
  const responseText = response.getContentText();
  const conjugations = JSON.parse(responseText);
  console.log(conjugations);
  
  const present = [[]];
  appendConjugationToArray_(present, conjugations.present.masculineSingular)
  appendConjugationToArray_(present, conjugations.present.feminineSingular)
  appendConjugationToArray_(present, conjugations.present.masculinePlural)
  appendConjugationToArray_(present, conjugations.present.femininePlural)
  
  const past1st = [[]];
  appendConjugationToArray_(past1st, conjugations.past.firstPersonSingular)
  appendConjugationToArray_(past1st, conjugations.past.firstPersonPlural)
  
  const past2nd = [[]];
  appendConjugationToArray_(past2nd, conjugations.past.secondPersonMasculineSingular)
  appendConjugationToArray_(past2nd, conjugations.past.secondPersonFeminineSingular)
  appendConjugationToArray_(past2nd, conjugations.past.secondPersonMasculinePlural)
  appendConjugationToArray_(past2nd, conjugations.past.secondPersonFemininePlural)
  
  const past3rd = [[]];
  appendConjugationToArray_(past3rd, conjugations.past.thirdPersonMasculineSingular)
  appendConjugationToArray_(past3rd, conjugations.past.thirdPersonFeminineSingular)
  appendConjugationToArray_(past3rd, conjugations.past.thirdPersonPlural)
  
  const future1st = [[]];
  appendConjugationToArray_(future1st, conjugations.future.firstPersonSingular)
  appendConjugationToArray_(future1st, conjugations.future.firstPersonPlural)
  
  const future2nd = [[]];
  appendConjugationToArray_(future2nd, conjugations.future.secondPersonMasculineSingular)
  appendConjugationToArray_(future2nd, conjugations.future.secondPersonFeminineSingular)
  appendConjugationToArray_(future2nd, conjugations.future.secondPersonMasculinePlural)
  
  const future3rd = [[]];
  appendConjugationToArray_(future3rd, conjugations.future.thirdPersonMasculineSingular)
  appendConjugationToArray_(future3rd, conjugations.future.thirdPersonFeminineSingular)
  appendConjugationToArray_(future3rd, conjugations.future.thirdPersonMasculinePlural)
  
  const infinitive = [];
  if (printInfinitive) {
    infinitive.push([])
    appendConjugationToArray_(infinitive, conjugations.infinitive)
  }      
  
  return infinitive
  .concat(present).concat([[]])
  .concat(past1st).concat(past2nd).concat(past3rd).concat([[]])
  .concat(future1st).concat(future2nd).concat(future3rd);
}

function appendConjugationToArray_(arr, c) {
  arr[0].push(c.hebrew);
  //arr[1].push(c.transliteration);
}
