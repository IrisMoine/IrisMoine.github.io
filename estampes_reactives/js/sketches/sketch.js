const imgDirectory = "./rsrc/";

const words = [];
const LAYERS = [];
// const layers = [];

let CADRE = { //unique class

    setup() {
        this.weight = 50;
        this.zIndex = 10;

        addToLayer(this, this.zIndex);
    },

    draw() {

        push();
        noFill();
        strokeWeight(this.weight);
        stroke(255);
        rect(0, 0, width, height);

        pop();

    }

}


//if offsetX = [] -> random position x
const PARAMS = {
    "pot": { zIndex: 10, variation: 1, zoom: [0.5, 1], offsetX: [], offsetY: [0.1, 0.4, 0.8] }, //adds also a images property later (images = [])
    "paille": { zIndex: 40, variation: 1, zoom: [0.4, 1], offsetX: [], offsetY: [0.1, 0.3] },
    "papyrus": { zIndex: 0, variation: 1, zoom: [0.3, 1], offsetX: [], offsetY: [0.5, 0.6] },
    "erable": { zIndex: 200, variation: 1, zoom: [0.1, 1], offsetX: [], offsetY: [0.5, 0.3] },
    "nuage": { zIndex: 0, variation: 3, zoom: [0.3, 0.4], offsetX: [], offsetY: [0.8, 1] },
    "cascade": { zIndex: 30, variation: 2, zoom: [0.6, 1], offsetX: [], offsetY: [0.5, 0.7] },
    "montagnes": { zIndex: 5, variation: 1, zoom: [0.2, 0.7], offsetX: [], offsetY: [0.1, 0.7] },
    "eventail": { zIndex: 100, variation: 2, zoom: [0.1, 0.4], offsetX: [], offsetY: [0.1, 0.6] },
    "pin": { zIndex: 20, variation: 2, zoom: [0.5, 1], offsetX: [0, 1], offsetY: [] },
}

const homonyms = {
    "pau": "pot",
    "po": "pot",
    "faux": "pot",
    "peau": "pot",
    "papirus": "papyrus",
    "cassade": "cascade",
    "taille": "paille",
    "montagne": "montagnes",
}

let volSmooth = 0;
let vol = 0;
let gain = 10; //augmenter le volume du micro, tu peux regler avec keypress
let offsetMic = 60; //décalage dans le temps, 100: la valeur du micro 100 frames dans le passé
let showGain = false;

let mic;
let volumes = [];


function preload() {
    for (let word in PARAMS) {
        loadAndSetImage(word);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function loadAndSetImage(name) {

    let parameters = PARAMS[name];
    parameters.images = [];

    for (let i = 0; i < parameters.variation; i++) {
        let pathName = imgDirectory + name + "_" + i + ".png";

        loadImage(pathName, function(img) {
            // if (!parameters.image)
            parameters.images.push(img);
        });

    }


}

function keyPressed() {
    let way = 0;
    let increment = 0.1;

    if (keyCode === UP_ARROW) {
      way = increment;
    } else if (keyCode === DOWN_ARROW) {
      way = -increment;
    }

    changeVolumeByIncrement(way);
  }

let gainTimeOut;
function changeVolumeByIncrement(value) {
    gain +=value;

    showGain = true;
    clearTimeout(gainTimeOut);

    gainTimeOut = setTimeout(function() {
        showGain = false;
    }, 1000);
} 
//
function setup() {
    createCanvas(windowWidth, windowHeight);
    mic = new p5.AudioIn();
    mic.start();


    imageMode(CENTER);
    // console.log(mic);
    //

    const micButton = createButton('Enable Microphone');
    micButton.center();

    micButton.mouseClicked(() => {
        getAudioContext().resume().then(() => {
            mic.start();
            micButton.hide();
            console.log('Recording Audio');
        }).catch((e) => {});
    });

    CADRE.setup();

}
//
function draw() {
    background(0);

    volumes.push(mic.getLevel() * gain);
    if(volumes.length > offsetMic)
        vol = volumes.shift();

    // volSmooth += (vol - volSmooth) / 50;
    // //console.log("vol: " + vol);
    // var y = map(vol, 0, 0.25, 0, height);
    // var ySmooth = map(volSmooth, 0, 0.25, 0, height);
    // //stroke(0);
    // //line(0, y, width, y);
    // //stroke(255, 255, 255);
    // //line(0, ySmooth, width, ySmooth);
    // //
    textAlign(CENTER, CENTER);
    color(255, 255, 255);

    for (let layer of LAYERS) {
        if (layer) {
            for (let elem of layer) {
                elem.draw();
            }
        }

    }

    drawGain();
}

function drawGain() {
    if(!showGain)
     return;

    push();
    noStroke();
    fill('red');

    let w = gain*(width*0.02);
    rect(0,0, w, 10);
    textAlign(LEFT, TOP)
    text(gain, w+10, 0);
    pop();
}

function receive(sentence) {

    let word = new Word(sentence, vol);
    return word;
}

function addToLayer(elem, zIndex) {
    let layer = LAYERS[zIndex] = LAYERS[zIndex] || [];
    layer.push(elem);
}

function mousePressed() {
    // receive('pin');
}

class Word {
    constructor(_sentence, _vol) {
        this.sentence = this.normalize(_sentence);
        var words = _sentence.split(" ");
        var randomWord = floor(random(0, words.length));
        //console.log(randomWord);
        this.selectedWord = words[randomWord];

        let margin = 200;
        // console.log(randomWord + " / " + this.selectedWord);
        this.x = random();
        this.y = random();
        this.vol = constrain(_vol, 0, 1);
        this.size = map(_vol, 0, 1, 0.1, 0.8);
        this.color = color(0);

        this.buildImage();
    }

    draw() {

        if (this.img) {
            push();
            // blendMode(SCREEN);
            translate(this.x * width, this.y * height);
            scale(this.size);
            image(this.img, 0, 0);
            pop();

        } else {
            // fill(this.color);
            // textSize(this.size);
            // text(this.sentence, this.x * width, this.y * height);
        }
    }

    normalize(word) {
        //remove accent: é -> e, ê -> e
        let normalizedWord = word.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        //no uppercase: Hello -> hello
        normalizedWord = normalizedWord.toLowerCase();

        if (homonyms[word]) {
            return homonyms[word];
        } else {

            return normalizedWord;
        }

        // return homonyms[word] ? homonyms[word] : normalizedWord;

    }

    rename(_word) {

        let word = this.normalize(_word);

        if(word === this.sentence)
            return;

        this.sentence = word;
        this.buildImage();
    }

    buildImage() {

        let word = this.sentence;

        if (!(word in PARAMS))
            return;

        // let randomIndex = round(random(0,PARAMS[word].images.length -1));
        let images = PARAMS[word].images;
        let randomIndex = floor(random(0, images.length));

        this.img = images[randomIndex];

        // console.log(this.img);

        let offsetX = random();
        let offsetsX = PARAMS[word].offsetX;
        if (offsetsX.length > 0)
            offsetX = offsetsX[floor(random(0, offsetsX.length))];

        this.x = (1 - offsetX) + random(-0.1, 0.1); // add variation to offset Y


        let offsetY = random();
        let offsetsY = PARAMS[word].offsetY;
        if (offsetsY.length > 0)
            offsetY = offsetsY[floor(random(0, offsetsY.length))];

        this.y = (1 - offsetY) + random(-0.1, 0.1); // add variation to offset Y

        let zoom = PARAMS[word].zoom;
        this.size = lerp(zoom[0], zoom[1], this.vol);

        console.log(this.size);

        this.zIndex = PARAMS[word].zIndex;

        if (this.img) {
            addToLayer(this, this.zIndex);
        }
    }
}