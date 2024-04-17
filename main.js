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

const firSynth = new Tone.FMSynth().toDestination();
Tone.Transport.bpm.value = 75;
firSynth.set({
  volume: -1,
  harmonicity: 1.00006,
  oscillator: { highFrequency: 2000, high: -20, type: "fattriangle15" },
});

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
    let note =
      scaleNum % mode[curMode].length >= 0
        ? startNote +
          12 * Math.floor(scaleNum / mode[curMode].length) +
          (scaleNum % mode[curMode].length)
        : startNote +
          12 * Math.floor(scaleNum / mode[curMode].length) +
          mode[curMode].length +
          (scaleNum % mode[curMode].length);

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

// play
let song = new Tone.Sequence((time, value) => {
  if (value.env) {
    firSynth.set({
      envelope: value.env,
      modulationIndex: value.modulation,
      harmonicity: value.modulation,
    });
  }
  firSynth.triggerAttackRelease(value.note, 1, time, value.vel);
}, seq).start(0);

let repeatTime = 0;
let codonTime = 0;

Tone.Transport.scheduleRepeat((time) => {
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

function playSynth() {
  Tone.Transport.start();
}

const recorder = new Tone.Recorder();

let recordSynth = () => {
  firSynth.chain(recorder);
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
