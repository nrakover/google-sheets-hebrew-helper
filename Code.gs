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
 * @param {Bool} asRow [Optional] If true, output will be a row, otherwise a table.
 * @return {String[]} The Hebrew conjugations.
 * @customfunction
 */
function translateAndConjugate(englishInfinitive, asRow) {
  const cache = CacheService.getScriptCache();
  const cacheKey = "ENGLISH:" + englishInfinitive;
  const cachedResponse = cache.get(cacheKey);
  var hebrewInfinitive;
  if (cachedResponse) {
    console.log("Found cached response for: " + cacheKey);
    hebrewInfinitive = cachedResponse;
  } else {
    hebrewInfinitive = LanguageApp.translate(englishInfinitive, "en", "he");    
    // cache result
    cache.put(cacheKey, hebrewInfinitive);
  }

  return conjugate_(hebrewInfinitive, {printInfinitive: true, asTable: !asRow});
}

/**
 * A function that takes a Hebrew verb in infinitive form and outputs
 * a table of its conjugations.
 *
 * @param {String} hebrewInfinitive The Hebrew verb in infinitive form.
 * @param {Bool} asRow [Optional] If true, output will be a row, otherwise a table.
 * @return {String[]} The Hebrew conjugations.
 * @customfunction
 */
function conjugate(hebrewInfinitive, asRow) {
  return conjugate_(hebrewInfinitive, {printInfinitive: false, asTable: !asRow})
}

function conjugate_(hebrewInfinitive, options) {
  const cache = CacheService.getScriptCache();
  const cacheKey = "HEBREW:" + hebrewInfinitive;
  const cachedResponse = cache.get(cacheKey);
  var conjugations;
  if (cachedResponse) {
    console.log("Found cached response for: " + cacheKey);
    conjugations = JSON.parse(cachedResponse);
  } else {
    conjugations = doConjugate_(hebrewInfinitive);
    // cache result
    cache.put(cacheKey, JSON.stringify(conjugations));
  }

  if (options.asTable) {
    return asTable_(conjugations, options.printInfinitive);
  } else {
    return asRow_(conjugations, options.printInfinitive);
  }
}

function doConjugate_(hebrewInfinitive) {
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
  
  return conjugations;
}

function asRow_(conjugations, printInfinitive) {
  const row = [];
  // infinitive
  if (printInfinitive) {
    appendConjugationToArray_(row, conjugations.infinitive)
  }

  // present
  appendConjugationToArray_(row, conjugations.present.masculineSingular)
  appendConjugationToArray_(row, conjugations.present.feminineSingular)
  appendConjugationToArray_(row, conjugations.present.masculinePlural)
  appendConjugationToArray_(row, conjugations.present.femininePlural)

  // past
  appendConjugationToArray_(row, conjugations.past.firstPersonSingular)
  appendConjugationToArray_(row, conjugations.past.firstPersonPlural)
  
  appendConjugationToArray_(row, conjugations.past.secondPersonMasculineSingular)
  appendConjugationToArray_(row, conjugations.past.secondPersonFeminineSingular)
  appendConjugationToArray_(row, conjugations.past.secondPersonMasculinePlural)
  appendConjugationToArray_(row, conjugations.past.secondPersonFemininePlural)
  
  appendConjugationToArray_(row, conjugations.past.thirdPersonMasculineSingular)
  appendConjugationToArray_(row, conjugations.past.thirdPersonFeminineSingular)
  appendConjugationToArray_(row, conjugations.past.thirdPersonPlural)

  // future
  appendConjugationToArray_(row, conjugations.future.firstPersonSingular)
  appendConjugationToArray_(row, conjugations.future.firstPersonPlural)
  
  appendConjugationToArray_(row, conjugations.future.secondPersonMasculineSingular)
  appendConjugationToArray_(row, conjugations.future.secondPersonFeminineSingular)
  appendConjugationToArray_(row, conjugations.future.secondPersonMasculinePlural)
  
  appendConjugationToArray_(row, conjugations.future.thirdPersonMasculineSingular)
  appendConjugationToArray_(row, conjugations.future.thirdPersonFeminineSingular)
  appendConjugationToArray_(row, conjugations.future.thirdPersonMasculinePlural)

  return [row];
}

function asTable_(conjugations, printInfinitive) {
  const present = [[]];
  appendConjugationToInnerArray_(present, conjugations.present.masculineSingular)
  appendConjugationToInnerArray_(present, conjugations.present.feminineSingular)
  appendConjugationToInnerArray_(present, conjugations.present.masculinePlural)
  appendConjugationToInnerArray_(present, conjugations.present.femininePlural)
  
  const past1st = [[]];
  appendConjugationToInnerArray_(past1st, conjugations.past.firstPersonSingular)
  appendConjugationToInnerArray_(past1st, conjugations.past.firstPersonPlural)
  
  const past2nd = [[]];
  appendConjugationToInnerArray_(past2nd, conjugations.past.secondPersonMasculineSingular)
  appendConjugationToInnerArray_(past2nd, conjugations.past.secondPersonFeminineSingular)
  appendConjugationToInnerArray_(past2nd, conjugations.past.secondPersonMasculinePlural)
  appendConjugationToInnerArray_(past2nd, conjugations.past.secondPersonFemininePlural)
  
  const past3rd = [[]];
  appendConjugationToInnerArray_(past3rd, conjugations.past.thirdPersonMasculineSingular)
  appendConjugationToInnerArray_(past3rd, conjugations.past.thirdPersonFeminineSingular)
  appendConjugationToInnerArray_(past3rd, conjugations.past.thirdPersonPlural)
  
  const future1st = [[]];
  appendConjugationToInnerArray_(future1st, conjugations.future.firstPersonSingular)
  appendConjugationToInnerArray_(future1st, conjugations.future.firstPersonPlural)
  
  const future2nd = [[]];
  appendConjugationToInnerArray_(future2nd, conjugations.future.secondPersonMasculineSingular)
  appendConjugationToInnerArray_(future2nd, conjugations.future.secondPersonFeminineSingular)
  appendConjugationToInnerArray_(future2nd, conjugations.future.secondPersonMasculinePlural)
  
  const future3rd = [[]];
  appendConjugationToInnerArray_(future3rd, conjugations.future.thirdPersonMasculineSingular)
  appendConjugationToInnerArray_(future3rd, conjugations.future.thirdPersonFeminineSingular)
  appendConjugationToInnerArray_(future3rd, conjugations.future.thirdPersonMasculinePlural)
  
  const infinitive = [];
  if (printInfinitive) {
    infinitive.push([])
    appendConjugationToInnerArray_(infinitive, conjugations.infinitive)
  }      
  
  return infinitive
  .concat(present).concat([[]])
  .concat(past1st).concat(past2nd).concat(past3rd).concat([[]])
  .concat(future1st).concat(future2nd).concat(future3rd);
}

function appendConjugationToArray_(arr, c) {
  arr.push(c.hebrew);
  //arr[1].push(c.transliteration);
}

function appendConjugationToInnerArray_(arr, c) {
  arr[0].push(c.hebrew);
  //arr[1].push(c.transliteration);
}
