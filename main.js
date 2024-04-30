function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

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

      svg.appendChild(square);

      const text = document.createElementNS(svgns, "text");

      text.setAttribute("x", i * squareSide + squareSide / 2);
      text.setAttribute("y", j * squareSide + squareSide / 2);
      text.setAttribute("width", squareSide / 2);
      text.setAttribute("height", squareSide / 2);
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("dominant-baseline", "middle");
      text.style["user-select"] = "none";
      text.textContent = `${i + 1}-${j + 1}`;

      svg.appendChild(text);
    }
  }
};

drawMatrix(SVG);

const TREE_COLOR = [0x00, 0xAA, 0x00];

const clampColor = (rgb) => {
  const [r, g, b] = rgb;

  const clampChannel = (val) => {
    if (val < 0) {
      return 0;
    }

    if (val > 255) {
      return 255;
    }

    return Math.floor(val);
  }

  return [clampChannel(r), clampChannel(g), clampChannel(b)];
};

const randomizeColor = (sigma, rgb) => {
  const [r, g, b] = rgb;

  const newR = r + gaussianRandom(0, sigma);
  const newG = g + gaussianRandom(0, sigma);
  const newB = b + gaussianRandom(0, sigma);

  return clampColor([newR, newG, newB]);
};

// Standard Normal variate using Box-Muller transform.
// From https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve
const gaussianRandom = (mean = 0, stdev = 1) => {
  const u = 1 - Math.random(); // Converting [0,1) to (0,1]
  const v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  // Transform to the desired mean and standard deviation:
  return z * stdev + mean;
}

const rgbToHex = (rgb) => {
  const chanToHex = (val) => {
    const h = val.toString(16);
    if (h.length == 1) {
      return "0" + h;
    } else {
      return h;
    }
  };

  const [r, g, b] = rgb;
  return `#${chanToHex(r)}${chanToHex(g)}${chanToHex(b)}`;
};

const drawTree = (svg, x, y) => {
  const treeRad = 15;

  const treeColor = randomizeColor(Number(mutationBox.textContent) / 2, TREE_COLOR);
  const treeOutline = "#005500";

  const circle = document.createElementNS(svgns, "circle");

  circle.setAttribute("cx", x);
  circle.setAttribute("cy", y);
  circle.setAttribute("r", treeRad);
  circle.setAttribute("fill", rgbToHex(treeColor));
  circle.setAttribute("stroke", treeOutline);
  circle.setAttribute("stroke-width", 3);
  circle.classList.add("tree");

  svg.appendChild(circle);

  return circle;
};

const killTree = (svg, tree, voice) => {
  svg.removeChild(tree);

  // turn off the tree's music
  voice.synth.disconnect();
  voice.song.cancel();
};

const showMutation = (tree) => {
  const treeMutateColor = "#AA0000";
  const treeMutateOutline = "#550000";
  const treeOutline = "#005500";

  const treeColor = tree.getAttribute("fill");

  tree.setAttribute("fill", treeMutateColor);
  tree.setAttribute("stroke", treeMutateOutline);

  setTimeout(() => {
    tree.setAttribute("fill", treeColor);
    tree.setAttribute("stroke", treeOutline);
  }, 250);
};

SVG.addEventListener("click", (evt) => {
  const x = evt.offsetX;
  const y = evt.offsetY;
  const quadX = Math.floor(x / (GRID_SIDE / 3)) + 1;
  const quadY = Math.floor(y / (GRID_SIDE / 3)) + 1;

  const tree = drawTree(SVG, x, y);

  const voice = newVoice(quadX, quadY, x, y, tree);

  tree.addEventListener("click", (evt) => {
    killTree(SVG, tree, voice);
    evt.stopPropagation();
  });
});

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
  "200235566565567787777788776674110013321431213567888676657558677667677767777767778999999888788888899998999999999988888888887576678777545535676676567777888777887776657777766566676667534676678777688778874202312213311220023556656556778777";
let secondary =
  "LLLLHHHLEEEEEEEEEELLLLEEEELLLLLLLLLLEEELLLLLLLLEEHHHHHHHHHHLLLLHHHHHHHHHHHHHLLLLLLEEEEEELLLLHLHHHHEEEEEEEEEEEEELLLLLLLLLLLLLLLLEHLLLLLLLLLLLLLLHHHHHHHHLLHHHHLLHLLHHHHHHLLLLLHHHHHHLLLLLLLLLEEELLLLEEEEELLLLLLLLLEEELLLLLLHHHLEEEEEEEEEELL";
let reliability =
  "982023007536667760776110221226887630000158887631017999988620230201127662001034898147885257750003302212103579996088886411106785000026777775675326787287602222202021788860166120012431688743540123532268871677742405324998202300753666776077";

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

const newDnaSequence = (dna, mutateChance, codonBounds) => {
  const nucleotides = ['G', 'T', 'A', 'C'];
  let newDna = "";
  let dnaMutated = [];

  for (let i = 0; i < dna.length; i++) {
    const sourceNucleotide = dna[i];
    let newNucleotide = sourceNucleotide;
    let mutate = false;

    if (Math.random() < mutateChance) {
      newNucleotide = nucleotides[getRandomInt(4)];
      mutate = true;
    }

    newDna += newNucleotide;
    dnaMutated.push(mutate);
  }

  let newCodons = [];
  let codonsMutated = [];

  for (let i = 0; i < newDna.length; i += 3) {
    let dnaSeq = dna.substring(i, i + 3);
    let seqMutated = dnaMutated.slice(i, i + 3);

    let codon = dnaToCodon[dnaSeq];
    newCodons += codon;

    const codonMutated = seqMutated.includes(true);
    codonsMutated.push(codonMutated);
  }

  return {
    dna: newDna,
    codon: newCodons,
    dnaMutated,
    codonsMutated,
    flexibility: flexibility.substring(codonBounds[0], codonBounds[1]),
    secondary: secondary.substring(codonBounds[0], codonBounds[1]),
    reliability: reliability.substring(codonBounds[0], codonBounds[1]),
  };
};

Tone.Transport.bpm.value = 75;

const buildEventSequences = (dnaSeq) => {
  let { dna, codon, dnaMutated, reliability, secondary, flexibility } = dnaSeq;

  let seq = [];
  let stopCodonIdx = [0];
  let characterIdx = -1;
  //figure out which DNA to skip
  for (let i = 0; i < codon.length; i++) {
    if (codon[i] == " ") {
      stopCodonIdx.push(i);
    }
  }
  stopCodonIdx.push(codon.length - 1);
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
                mutated: dnaMutated[j],
              },
              {
                note: Tone.Midi(note),
                vel: (1 + reliability[characterIdx]) / 11,
                env: envelopes[secondary[characterIdx]],
                modulation: (10 - flexibility[characterIdx]) / 5,
                mutated: dnaMutated[j],
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
                mutated: dnaMutated[j],
              },
              null,
              {
                note: Tone.Midi(note),
                vel: (1 + reliability[characterIdx]) / 11,
                env: envelopes[secondary[characterIdx]],
                modulation: (10 - flexibility[characterIdx]) / 5,
                mutated: dnaMutated[j],
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
                mutated: dnaMutated[j],
              },
              {
                note: Tone.Midi(note),
                vel: (1 + reliability[characterIdx]) / 11,
                env: envelopes[secondary[characterIdx]],
                modulation: (10 - flexibility[characterIdx]) / 5,
                mutated: dnaMutated[j],
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
              mutated: dnaMutated[j],
            },
            {
              note: Tone.Midi(note),
              vel: (1 + reliability[characterIdx]) / 11,
              env: envelopes[secondary[characterIdx]],
              modulation: (10 - flexibility[characterIdx]) / 5,
              mutated: dnaMutated[j],
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
                mutated: dnaMutated[j],
              },
              {
                note: Tone.Midi(note),
                vel: (1 + reliability[characterIdx]) / 11,
                env: envelopes[secondary[characterIdx]],
                modulation: (10 - flexibility[characterIdx]) / 5,
                mutated: dnaMutated[j],
              },
              null,
              {
                note: Tone.Midi(note),
                vel: (1 + reliability[characterIdx]) / 11,
                env: envelopes[secondary[characterIdx]],
                modulation: (10 - flexibility[characterIdx]) / 5,
                mutated: dnaMutated[j],
              },
            ]);
          } else if (j % 3 == 1) {
            seq.push(
              {
                note: Tone.Midi(note),
                vel: (1 + reliability[characterIdx]) / 11,
                env: envelopes[secondary[characterIdx]],
                modulation: (10 - flexibility[characterIdx]) / 5,
                mutated: dnaMutated[j],
              },
              null,
              null,
              {
                note: Tone.Midi(note),
                vel: (1 + reliability[characterIdx]) / 11,
                env: envelopes[secondary[characterIdx]],
                modulation: (10 - flexibility[characterIdx]) / 5,
                mutated: dnaMutated[j],
              }
            );
          } else {
            seq.push([
              {
                note: Tone.Midi(note),
                vel: (1 + reliability[characterIdx]) / 11,
                env: envelopes[secondary[characterIdx]],
                modulation: (10 - flexibility[characterIdx]) / 5,
                mutated: dnaMutated[j],
              },
              null,
              {
                note: Tone.Midi(note),
                vel: (1 + reliability[characterIdx]) / 11,
                env: envelopes[secondary[characterIdx]],
                modulation: (10 - flexibility[characterIdx]) / 5,
                mutated: dnaMutated[j],
              },
              {
                note: Tone.Midi(note),
                vel: (1 + reliability[characterIdx]) / 11,
                env: envelopes[secondary[characterIdx]],
                modulation: (10 - flexibility[characterIdx]) / 5,
                mutated: dnaMutated[j],
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
            mutated: dnaMutated[j],
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

const buildToneSequence = (seq, synth, tree) => {
  return new Tone.Sequence((time, value) => {
    if (value.env) {
      synth.set({
        volume: value.mutated == true ? -5 : -1,
        envelope: value.env,
        modulationIndex: value.modulation,
        harmonicity: value.modulation,
        oscillator: { type: value.mutated == true ? "fatsquare" : "triangle15" }
      });
    }
    synth.triggerAttackRelease(value.note, 1, time, value.vel);

    if (value.mutated === true) {
      showMutation(tree);
    }
  }, seq);
};

function prepareNewVoice(quadX, quadY, xCoord, yCoord, tree) {
  const panAmt = xCoord / GRID_SIDE * 2 - 1;
  const panner = new Tone.Panner(panAmt).toDestination();

  // TODO: vary some synth parameters based on xCoord and yCoord?
  const firSynth = new Tone.FMSynth().connect(panner);
  firSynth.set({
    volume: -1,
    harmonicity: 1.00006,
    oscillator: { highFrequency: 2000, high: -20, type: "fattriangle15" },
  });

  // segment dna based on quadrat
  const quadIdx = quadX + quadY * 3 - 4;
  const numCodons = codon.length;
  const codonBounds = [quadIdx * numCodons / 9, (quadIdx + 1) * numCodons / 9];

  const dnaSegment = dna.substring(codonBounds[0] * 3, codonBounds[1] * 3);

  const dnaSeq = newDnaSequence(dnaSegment, Number(mutationBox.textContent) / 100, codonBounds);
  const eventSeq = buildEventSequences(dnaSeq);
  const song = buildToneSequence(eventSeq.seq, firSynth, tree);
  song.start(0);

  const voice = { synth: firSynth, song };
  return voice;
}

function newVoice(quadX, quadY, xCoord, yCoord, tree) {
  const voice = prepareNewVoice(quadX, quadY, xCoord, yCoord, tree);
  Tone.Transport.start();
  return voice;
}

let recordSynth = () => {
  const recorder = new Tone.Recorder();
  firSynth.chain(recorder);
  prepareNewVoice();
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

const stopOneVoice = (voice) => {
  voice.synth.disconnect();
  voice.song.cancel();
}
