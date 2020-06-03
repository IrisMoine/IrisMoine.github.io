var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

var recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
recognition.maxAlternatives = 1;
recognition.lang = "fr-FR";
//
//
//
recognition.start();
//

console.log('Ready to hear you.');
// document.onclick = function() {
//   recognition.start();
//   console.log('Ready to receive a color command.');
// }
//

// recognition.onresult = function(event) {
//   let lastChunk = event.results[event.results.length - 1];

//   if(!lastChunk.isFinal)
//     return;

//   let words = lastChunk[0].transcript.split(" ");

//   for (let word of words) {
//     receive(word);
//   }
// }

let TEMP_WORDS = [];

recognition.onresult = function(event) {
  const lastChunk = event.results[event.results.length - 1];
  const words = lastChunk[0].transcript.split(" ");

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if(TEMP_WORDS[i]) {
      TEMP_WORDS[i].rename(word);
    } else {
      TEMP_WORDS.push(receive(word));
    }
  }

  if(lastChunk.isFinal)
    TEMP_WORDS.length = 0;
    
}

recognition.onend = function() {
  recognition.start();
}