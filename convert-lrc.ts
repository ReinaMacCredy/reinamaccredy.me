// LRC to JavaScript Converter Tool
// Usage: bun convert-lrc.ts

interface LyricLine {
  text: string;
  startTime: number;
  endTime: number;
}

function convertLRCToJS(lrcText: string): LyricLine[] {
  const lines = lrcText.split('\n');
  const lyrics: LyricLine[] = [];
  
  lines.forEach((line, index) => {
    // Match LRC format: [mm:ss.xx]text
    const match = line.match(/^\[(\d{2}):(\d{2}\.\d{2})\](.+)$/);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseFloat(match[2]);
      const text = match[3].trim();
      const startTime = minutes * 60 + seconds;
      
      // Calculate endTime from next lyric
      let endTime = startTime + 4; // Default 4 seconds
      
      // Look for next timing
      for (let i = index + 1; i < lines.length; i++) {
        const nextMatch = lines[i].match(/^\[(\d{2}):(\d{2}\.\d{2})\]/);
        if (nextMatch) {
          const nextMinutes = parseInt(nextMatch[1], 10);
          const nextSeconds = parseFloat(nextMatch[2]);
          endTime = nextMinutes * 60 + nextSeconds;
          break;
        }
      }
      
      lyrics.push({
        text: text,
        startTime: startTime,
        endTime: endTime
      });
    }
  });
  
  return lyrics;
}

// Instructions:
console.log('Instructions for use:');
console.log('1. Open this file in your editor');
console.log('2. Replace the placeholder below with your LRC data');
console.log('3. Run: bun convert-lrc.ts');
console.log('4. Copy the output to terminal_core.ts\n');

// REPLACE THIS WITH YOUR LRC DATA:
const lrcData = `[00:00.00]Hope Is The Thing With Feathers
[00:07.00]Chevy/HOYO - MIX/Robin
[00:14.09]We rise together as our destiny unfolds
[00:20.85]We face the darkness and our trials are yet untold
[00:28.75]Through the shadows of despair
[00:32.31]Oh, in silence, hopes we share, woah-woah
[00:37.33]To chase our dreams that we've declared
[00:43.43]We glimpse, through our eyes
[00:47.31]Yet fools, blind our sights
[00:50.83]Can't make what they say
[00:54.35]We'll find our way, we'll find our way
[00:59.00]Heads up! The wheels are spinning
[01:02.79]Across the plains, in valleys deep
[01:06.55]To dawn, the wheels that sing
[01:10.31]An unending dream!
[01:13.98]Heads up! Thе tracks are running
[01:18.13]Across the plains, wherе shadows hide
[01:21.72]We run, we stride, woah-oh
[01:28.86]In the face of fear and plight
[01:32.92]And yet we hold our ground, woah
[01:37.57]In life we stand and strive
[01:40.47]Our victory is found
[01:43.40]And the storms we've weathered through
[01:46.84]And we hope in the light of truth, woah-oh
[01:52.45]To break free from chains and come anew
[01:59.11]Heads up! The wheels are spinning
[02:03.00]Across the plains, in valleys deep
[02:07.04]To dawn, the wheels that sing
[02:10.86]An unending dream!
[02:13.98]Heads up! The tracks are running
[02:17.84]Across the plains, where shadows hide
[02:21.80]We run, we stride, woah-woah-oh
[02:29.13](Woah, woah, woah, woah)
[02:36.38](Woah, woah, woah, woah)
[02:43.87]Woah, woah, woah, woah
[02:51.94]Woah, woah, woah, woah
[02:59.13]Heads up! A steady rhythm
[03:03.28]A destination that's ever near
[03:06.70]It comes! Stride to our kingdom
[03:10.61]And see the light of day
[03:14.03]Heads up! The wheels are singing
[03:18.03]The whispers and secrets they'd keep
[03:21.92]To hope! We bound, woah-oh
[03:29.70]Break free, we chased our dreams, beneath the starry night
[03:37.13]In the face of god, we rose, as one
`;

// Convert and output
const convertedLyrics = convertLRCToJS(lrcData);

console.log('const sampleLyrics = [');
convertedLyrics.forEach((lyric, index) => {
  const comma = index === convertedLyrics.length - 1 ? '' : ',';
  const escapedText = lyric.text.replace(/"/g, '\\"');
  console.log(`  { text: "${escapedText}", startTime: ${lyric.startTime}, endTime: ${lyric.endTime} }${comma}`);
});
console.log('];');

console.log(`\n// Total: ${convertedLyrics.length} lines`);
console.log(`// Duration: ${Math.max(...convertedLyrics.map(l => l.endTime))} seconds`);


