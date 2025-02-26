let isMuted = false;

const correctSounds = [
  '/sounds/correct.wav',
  '/sounds/correctcat1.mp3',
  '/sounds/correctcat2.mp3',
  '/sounds/correctcat3.mp3'
];

const resultSounds = {
  perfect: '/sounds/perfect.mp3',
  applause: '/sounds/applause.mp3'
};

export const toggleMute = () => {
  isMuted = !isMuted;
  return isMuted;
};

export const getMuteStatus = () => isMuted;

type SoundType = boolean | 'perfect' | 'applause';

export const playSound = (type: SoundType) => {
  if (isMuted) return;
  
  const audio = new Audio();
  audio.volume = 0.5; // 50% volume

  if (type === true) {
    // Play random correct sound
    const randomIndex = Math.floor(Math.random() * correctSounds.length);
    audio.src = correctSounds[randomIndex];
  } else if (type === false) {
    // Play incorrect sound
    audio.src = '/sounds/incorrect.wav';
  } else {
    // Play result sound
    audio.src = resultSounds[type];
  }

  audio.play().catch(error => {
    console.error('Error playing sound:', error);
  });
}; 