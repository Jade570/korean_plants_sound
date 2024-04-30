function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

document.getElementById("play").addEventListener("click", async () => {
  await Tone.start();
  playSynth();
});

document.getElementById("record").addEventListener("click", async () => {
  await Tone.start();
  recordSynth();
});

document.getElementById("stop").addEventListener("click", async () => {
  stopSynth();
  resetSynth();
});

const mutationBox = document.getElementById("mutationbox");

document.getElementById("mutation").addEventListener("input", async (event) => {
  mutationBox.textContent = event.target.value;
});

mutationBox.textContent = document.getElementById("mutation").value;

const GRID_SIDE = 600;
const svgns = "http://www.w3.org/2000/svg";
const SVG = document.getElementById("grid");

const drawMatrix = (svg) => {
  const squareSide = GRID_SIDE / 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const square = document.createElementNS(svgns, "rect");

      square.setAttribute("x", i * squareSide);
      square.setAttribute("y", j * squareSide);
      square.setAttribute("width", squareSide);
      square.setAttribute("height", squareSide);
      square.setAttribute("fill-opacity", "0");
      square.setAttribute("stroke", "#000000");

      SVG.appendChild(square);

      const text = document.createElementNS(svgns, "text");

      text.setAttribute("x", i * squareSide + squareSide / 2);
      text.setAttribute("y", j * squareSide + squareSide / 2);
      text.setAttribute("width", squareSide / 2);
      text.setAttribute("height", squareSide / 2);
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("dominant-baseline", "middle");
      text.style["user-select"] = "none";
      text.textContent = `${i + 1}-${j + 1}`;

      SVG.appendChild(text);
    }
  }
};

drawMatrix();

const drawTree = (svg, x, y) => {
  const treeRad = 15;
  const treeColor = "#00AA00";
  const treeOutline = "#005500";

  const circle = document.createElementNS(svgns, "circle");

  circle.setAttribute("cx", x);
  circle.setAttribute("cy", y);
  circle.setAttribute("r", treeRad);
  circle.setAttribute("fill", treeColor);
  circle.setAttribute("stroke", treeOutline);
  circle.setAttribute("stroke-width", 3);
  circle.classList.add("tree");

  circle.addEventListener("click", (evt) => {
    // self-destruct button!
    SVG.removeChild(circle);
    evt.stopPropagation();
  });

  SVG.appendChild(circle);
}

SVG.addEventListener("click", (evt) => {
  drawTree(SVG, evt.offsetX, evt.offsetY);

  // TODO: start playing music!
});

let RUNNING = [];
let CURRENT_SEQUENCE = null;
let DISPLAY_REPEAT_ID = null;

let mode = [
  [0, 2, 4, 6, 8, 10],
  [0, 1, 3, 4, 6, 7, 9, 10],
  [0, 2, 3, 4, 6, 7, 8, 10, 11],
  [0, 1, 2, 5, 6, 7, 8, 11],
  [0, 1, 5, 6, 7, 11],
  [0, 2, 4, 5, 6, 8, 10, 11],
  [0, 1, 2, 3, 5, 6, 7, 8, 10, 11],
];

let dna =
  "TAAAGCTAGTGTCGGATTCAAAGCTGGTGTTAAAGATTACAGATTAACTTATTATACTCCTGAATATCAGACCAAAGATACGGATATCTTGGCGGCATTCCGAGTAACTCCTCAACCTGGGGTGCCGCCCGAGGAAGCGGGAGCAGCAGTAGCTGCTGAATCTTCCACCGGTACATGGACCACTGTTTGGACCGATGGACTTACCAGTCTTGATCGTTACAAAGGGCGATGCTATGACATCGAGCCCGTTGCTGGAGAGGAAAGTCAATTTATTGCCTATGTAGCTTACCCCTTAGACCTTTTCGAAGAAGGTTCTGTTACTAACTTGTTCACTTCCATTGTAGGTAATGTATTTGGATTCAAGGCCCTACGGGCTTTACGTTTGGAAGATTTGCGGATTCCCCCTGCTTATTCCAAAACTTTTCAAGGTCCACCTCATGGTATCCAAGTTGAAAGAGATAAATTGAACAAATATGGCCGTCCTTTGTTGGGATGTACTATCAAACCAAAATTGGGTCTATCGGCTAAGAACTATGGTAGAGCAGTTTACGAATGTCTTCGTGGTGGACTCGATTTTACCAAGGATGATGAGAACGTAAATTCCCAACCATTCATGCGCTGGAGAGATCGTTTTGTCTTTTGTGCGGAAGCAATTAATAAGGCTCAGGCTGAGACGGGTGAAATTAAAGGACATTACTTGAAT";
let codon =
  " S CRIQSWC RLQINLLYS ISDQRYGYLGGIPSNSSTWGAARGSGSSSSC IFHRYMDHCLDRWTYQS SLQRAML HRARCWRGKSIYCLCSLPLRPFRRRFCY LVHFHCR CIWIQGPTGFTFGRFADSPCLFQNFSRSTSWYPS KR IEQIWPSFVGMYYQTKIGSIG ELW SSLRMSSWWTRFYQG  ERKFPTIHALERSFCLLCGSN  GSG DG N RTLLE";
let flexibility =
  "2002355665655677877777887766741100133214312135678886766575586776676777677777677789999998887888888999989999999999888888888875766787775455356766765677778887778877766577777665666766675346766787776887788742023122133112";
let secondary =
  "LLLLHHHLEEEEEEEEEELLLLEEEELLLLLLLLLLEEELLLLLLLLEEHHHHHHHHHHLLLLHHHHHHHHHHHHHLLLLLLEEEEEELLLLHLHHHHEEEEEEEEEEEEELLLLLLLLLLLLLLLLEHLLLLLLLLLLLLLLHHHHHHHHLLHHHHLLHLLHHHHHHLLLLLHHHHHHLLLLLLLLLEEELLLLEEEEELLLLLLLLLEEELL";
let reliability =
  "9820230075366677607761102212268876300001588876310179999886202302011276620010348981478852577500033022121035799960888864111067850000267777756753267872876022222020217888601661200124316887435401235322688716777424053249";

const buildDnaDict = (dna, codon) => {
  let dnaToCodon = {};

  for (let i = 0; i < dna.length; i += 3) {
    const seq = dna.substring(i, i + 3);
    const cod = codon.charAt(Math.floor(i / 3));
    dnaToCodon[seq] = cod;
  }

  return dnaToCodon;
};

const dnaToCodon = buildDnaDict(dna, codon);

const newDnaSequence = (mutateChance) => {
  const nucleotides = ['G', 'T', 'A', 'C'];
  let newDna = "";

  for (let i = 0; i < dna.length; i++) {
    const sourceNucleotide = dna[i];
    let newNucleotide = sourceNucleotide;

    if (Math.random() < mutateChance) {
      newNucleotide = nucleotides[getRandomInt(4)];
    }

    newDna += newNucleotide;
  }

  let newCodons = [];
  for (let i = 0; i < newDna.length; i += 3) {
    let dnaSeq = dna.substring(i, i + 3);
    let codon = dnaToCodon[dnaSeq];
    newCodons += codon;
  }

  return {
    dna: newDna,
    codon: newCodons,
    flexibility: flexibility,
    secondary: secondary,
    reliability: reliability,
  };
};

Tone.Transport.bpm.value = 75;

const buildEventSequences = (dnaSeq) => {
  let { dna, codon, reliability, secondary, flexibility } = dnaSeq;

  let seq = [];
  let stopCodonIdx = [];
  let characterIdx = -1;
  //figure out which DNA to skip
  for (let i = 0; i < codon.length; i++) {
    if (codon[i] == " ") {
      stopCodonIdx.push(i);
    }
  }
  console.log(stopCodonIdx);

  for (let stopCodon = 0; stopCodon < stopCodonIdx.length - 1; stopCodon++) {
    // if there is stopCodon, put 3 rests
    seq.push(null);
    seq.push(null);
    seq.push(null);
    let curMode = getRandomInt(7);
    // console.log(
    //   (stopCodonIdx[stopCodon] + 1) * 3,
    //   stopCodonIdx[stopCodon + 1] * 3
    // );

    let startNote = 0;
    let scaleNum = 0;
    let envelopes = {
      H: { attack: "32n", decay: "64n", sustain: 0.6, release: "32n" },
      E: { attack: "128t", decay: "32n", sustain: 0, release: "128t" },
      L: { attack: "2n", decay: "4n", sustain: 0.9, release: "2n" },
    };

    switch (codon[stopCodon] + 1) {
      case "M":
        // start with c 60
        startNote = 60;
        break;
      case "V":
        //start with eb 63
        startNote = 63;
        break;
      case "L":
        //start with F# 66
        startNote = 66;
        break;
      default:
        // start with a 69
        startNote = 69;
        break;
    }
    // go by DNA
    for (
      let j = (stopCodonIdx[stopCodon] + 1) * 3;
      j < stopCodonIdx[stopCodon + 1] * 3;
      j++
    ) {
      // starting of the codon
      if (j % 3 == 0) {
        characterIdx++;
      }

      switch (dna[j]) {
        case "A":
          scaleNum -= 1;
          break;
        case "T":
          scaleNum += 3;
          break;
        case "G":
          scaleNum -= 2;
          break;
        case "C":
          break;
      }
      // console.log(scaleNum, curMode, mode[curMode].length);
      let note = (scaleNum % mode[curMode].length >= 0)
        ? (startNote + 12 * Math.floor(scaleNum / mode[curMode].length)
          + (scaleNum % mode[curMode].length))
        : (startNote + 12 * Math.floor(scaleNum / mode[curMode].length)
          + mode[curMode].length + (scaleNum % mode[curMode].length));

      switch (dna[j]) {
        case "A":
          if (j % 3 == 0) {
            seq.push([
              {
                note: Tone.Midi(note),
                vel: (1 + reliability[characterIdx]) / 11,
                env: envelopes[secondary[characterIdx]],
                modulation: (10 - flexibility[characterIdx]) / 5,
              },
              {
                note: Tone.Midi(note),
                vel: (1 + reliability[characterIdx]) / 11,
                env: envelopes[secondary[characterIdx]],
                modulation: (10 - flexibility[characterIdx]) / 5,
              },
              null,
            ]);
          } else if (j % 3 == 1) {
            seq.push([
              {
                note: Tone.Midi(note),
                vel: (1 + reliability[characterIdx]) / 11,
                env: envelopes[secondary[characterIdx]],
                modulation: (10 - flexibility[characterIdx]) / 5,
              },
              null,
              {
                note: Tone.Midi(note),
                vel: (1 + reliability[characterIdx]) / 11,
                env: envelopes[secondary[characterIdx]],
                modulation: (10 - flexibility[characterIdx]) / 5,
              },
            ]);
          } else {
            seq.push([
              null,
              {
                note: Tone.Midi(note),
                vel: (1 + reliability[characterIdx]) / 11,
                env: envelopes[secondary[characterIdx]],
                modulation: (10 - flexibility[characterIdx]) / 5,
              },
              {
                note: Tone.Midi(note),
                vel: (1 + reliability[characterIdx]) / 11,
                env: envelopes[secondary[characterIdx]],
                modulation: (10 - flexibility[characterIdx]) / 5,
              },
            ]);
          }
          break;
        case "T":
          seq.push([
            {
              note: Tone.Midi(note),
              vel: (1 + reliability[characterIdx]) / 11,
              env: envelopes[secondary[characterIdx]],
              modulation: (10 - flexibility[characterIdx]) / 5,
            },
            {
              note: Tone.Midi(note),
              vel: (1 + reliability[characterIdx]) / 11,
              env: envelopes[secondary[characterIdx]],
              modulation: (10 - flexibility[characterIdx]) / 5,
            },
          ]);
          break;
        case "G":
          if (j % 3 == 0) {
            seq.push([
              {
                note: Tone.Midi(note),
                vel: (1 + reliability[characterIdx]) / 11,
                env: envelopes[secondary[characterIdx]],
                modulation: (10 - flexibility[characterIdx]) / 5,
              },
              {
                note: Tone.Midi(note),
                vel: (1 + reliability[characterIdx]) / 11,
                env: envelopes[secondary[characterIdx]],
                modulation: (10 - flexibility[characterIdx]) / 5,
              },
              null,
              {
                note: Tone.Midi(note),
                vel: (1 + reliability[characterIdx]) / 11,
                env: envelopes[secondary[characterIdx]],
                modulation: (10 - flexibility[characterIdx]) / 5,
              },
            ]);
          } else if (j % 3 == 1) {
            seq.push(
              {
                note: Tone.Midi(note),
                vel: (1 + reliability[characterIdx]) / 11,
                env: envelopes[secondary[characterIdx]],
                modulation: (10 - flexibility[characterIdx]) / 5,
              },
              null,
              null,
              {
                note: Tone.Midi(note),
                vel: (1 + reliability[characterIdx]) / 11,
                env: envelopes[secondary[characterIdx]],
                modulation: (10 - flexibility[characterIdx]) / 5,
              }
            );
          } else {
            seq.push([
              {
                note: Tone.Midi(note),
                vel: (1 + reliability[characterIdx]) / 11,
                env: envelopes[secondary[characterIdx]],
                modulation: (10 - flexibility[characterIdx]) / 5,
              },
              null,
              {
                note: Tone.Midi(note),
                vel: (1 + reliability[characterIdx]) / 11,
                env: envelopes[secondary[characterIdx]],
                modulation: (10 - flexibility[characterIdx]) / 5,
              },
              {
                note: Tone.Midi(note),
                vel: (1 + reliability[characterIdx]) / 11,
                env: envelopes[secondary[characterIdx]],
                modulation: (10 - flexibility[characterIdx]) / 5,
              },
            ]);
          }
          break;
        case "C":
          seq.push({
            note: Tone.Midi(note),
            vel: (1 + reliability[characterIdx]) / 11,
            env: envelopes[secondary[characterIdx]],
            modulation: (10 - flexibility[characterIdx]) / 5,
          });
          break;
      }
    }
  }
  console.log(seq);

  return {
    seq, stopCodonIdx, characterIdx
  };
};

const buildToneSequence = (seq, synth) => {
  return new Tone.Sequence((time, value) => {
    if (value.env) {
      synth.set({
        envelope: value.env,
        modulationIndex: value.modulation,
        harmonicity: value.modulation,
      });
    }
    synth.triggerAttackRelease(value.note, 1, time, value.vel);
  }, seq);
};

const scheduleDnaDisplay = (dna, codon) => {
  let repeatTime = 0;
  let codonTime = 0;

  return Tone.Transport.scheduleRepeat((time) => {
    document.getElementById("past_dna").innerHTML = dna.slice(0, repeatTime);
    document.getElementById("current_dna").innerHTML = dna[repeatTime];
    document.getElementById("future_dna").innerHTML = dna.slice(
      repeatTime + 1,
      dna.length
    );

    if (repeatTime % 3 === 0) {
      document.getElementById("past_codon").innerHTML = codon.slice(0, codonTime);
      document.getElementById("current_codon").innerHTML = codon[codonTime];
      document.getElementById("future_codon").innerHTML = codon.slice(
        codonTime + 1,
        codon.length
      );
      codonTime++;
    }
    repeatTime++;
  }, "8n");
};

function prepareSynthForPlay() {
  const panAmt = Math.random() * 2 - 1;
  const panner = new Tone.Panner(panAmt).toDestination();
  const firSynth = new Tone.FMSynth().connect(panner);
  firSynth.set({
    volume: -1,
    harmonicity: 1.00006,
    oscillator: { highFrequency: 2000, high: -20, type: "fattriangle15" },
  });

  const dnaSeq = newDnaSequence(Number(mutationBox.textContent) / 100);
  const eventSeq = buildEventSequences(dnaSeq);
  const song = buildToneSequence(eventSeq.seq, firSynth);
  song.start(0);

  let display = undefined;

  if (RUNNING.length == 0) {
    display = scheduleDnaDisplay(dnaSeq.dna, dnaSeq.codon);
  }

  RUNNING.push({ synth: firSynth, song, displayId: display });
}

function playSynth() {
  prepareSynthForPlay();
  Tone.Transport.start();
}

const recorder = new Tone.Recorder();

let recordSynth = () => {
  firSynth.chain(recorder);
  prepareSynthForPlay();
  Tone.Transport.start();
  recorder.start();
  setTimeout(async () => {
    // the recorded audio is returned as a blob
    const recording = await recorder.stop();
    // download the recording by creating an anchor element and blob url
    const url = URL.createObjectURL(recording);
    const anchor = document.createElement("a");
    anchor.download = "record.mp3";
    anchor.href = url;
    anchor.click();
  }, 180000);
};

const stopSynth = () => {
  Tone.Transport.stop();

  for (const running of RUNNING) {
    running.synth.disconnect();
    running.song.cancel();

    if (running.displayId) {
      Tone.Transport.clear(running.displayId);
    }
  }

  RUNNING = [];
}

const resetSynth = () => { };
