/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Terminal, Cpu, Database, Activity } from 'lucide-react';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const GAME_SPEED = 65;

const TRACKS = [
  { id: 1, title: 'SYS.INIT_01 // NEURAL_AWAKENING', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 2, title: 'MEM.LEAK_02 // DATA_CORRUPTION', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 3, title: 'CORE.DUMP_03 // SYSTEM_FAILURE', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
];

export default function App() {
  // Game State
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState({ x: 15, y: 5 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isStarted, setIsStarted] = useState(false);

  // Music State
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Refs for game loop to avoid dependency issues
  const directionRef = useRef(direction);
  const snakeRef = useRef(snake);

  useEffect(() => {
    directionRef.current = direction;
    snakeRef.current = snake;
  }, [direction, snake]);

  const generateFood = useCallback((currentSnake: {x: number, y: number}[]) => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
      // eslint-disable-next-line no-loop-func
      if (!currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
        break;
      }
    }
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setGameOver(false);
    setFood(generateFood(INITIAL_SNAKE));
    setIsStarted(true);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (!isStarted || gameOver) return;
      
      const { x, y } = directionRef.current;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (x !== -1) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStarted, gameOver]);

  useEffect(() => {
    if (!isStarted || gameOver) return;

    const moveSnake = () => {
      setSnake(prev => {
        const head = prev[0];
        const newHead = { 
          x: head.x + directionRef.current.x, 
          y: head.y + directionRef.current.y 
        };

        // Wall collision
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
          setGameOver(true);
          return prev;
        }

        // Self collision
        if (prev.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true);
          return prev;
        }

        const newSnake = [newHead, ...prev];

        // Food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => s + 10);
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const intervalId = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(intervalId);
  }, [isStarted, gameOver, food, generateFood]);

  // Audio Controls
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const nextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    setCurrentTrack((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [currentTrack, isPlaying]);

  const generateHex = () => Math.floor(Math.random() * 65535).toString(16).toUpperCase().padStart(4, '0');

  return (
    <div className="min-h-screen bg-black text-[#00ffff] font-mono flex flex-col items-center justify-center p-4 crt-flicker relative overflow-hidden screen-tear">
      <div className="static-noise"></div>
      <div className="scanlines"></div>
      
      {/* Header */}
      <header className="mb-8 text-center z-10 w-full max-w-6xl flex justify-between items-end border-b-4 border-[#ff00ff] pb-2">
        <div className="text-left">
          <h1 className="text-4xl md:text-6xl font-bold glitch-text tracking-tighter" data-text="SECTOR_7G">
            SECTOR_7G
          </h1>
          <p className="text-[#ff00ff] tracking-widest text-xs md:text-sm mt-1">
            &gt; OVERRIDE_ENGAGED // PROTOCOL: OMEGA
          </p>
        </div>
        <div className="text-right hidden md:block text-xs text-[#ff00ff]">
          <div>0x{generateHex()} : 0x{generateHex()}</div>
          <div>MEM_ADDR_FAULT</div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="flex flex-col lg:flex-row gap-8 z-10 w-full max-w-6xl items-start justify-center">
        
        {/* Left Panel: Stats & Info */}
        <div className="flex flex-col gap-6 w-full lg:w-72 order-2 lg:order-1">
          <div className="border-cyan-raw p-4 bg-black">
            <h2 className="text-[#ff00ff] text-2xl mb-4 border-b-2 border-[#ff00ff] pb-1 flex items-center gap-2 uppercase tracking-widest">
              <Activity size={24} className="text-[#00ffff]" />
              Telemetry
            </h2>
            <div className="space-y-6 text-center">
              <div>
                <div className="text-sm text-[#00ffff] mb-1 tracking-widest">CYCLES_COMPLETED</div>
                <div className="text-7xl text-white glitch-text inline-block" data-text={score.toString().padStart(4, '0')}>
                  {score.toString().padStart(4, '0')}
                </div>
              </div>
              <div className="flex justify-between text-xl border-t-2 border-[#ff00ff] pt-4">
                <span>MEM_ALLOC:</span>
                <span className="text-white">{snake.length * 16}B</span>
              </div>
              <div className="flex justify-between text-xl">
                <span>PTR_LOC:</span>
                <span className="text-white">0x{snake[0].x.toString(16).toUpperCase()}{snake[0].y.toString(16).toUpperCase()}</span>
              </div>
            </div>
          </div>

          <div className="border-magenta-raw p-4 bg-black">
            <h2 className="text-[#00ffff] text-2xl mb-4 border-b-2 border-[#00ffff] pb-1 flex items-center gap-2 uppercase tracking-widest">
              <Terminal size={24} className="text-[#ff00ff]" />
              Input_Seq
            </h2>
            <div className="grid grid-cols-2 gap-2 text-lg text-[#00ffff]">
              <div className="text-center p-2 border-2 border-[#00ffff] hover:bg-[#ff00ff] hover:text-black transition-none">[W] UP</div>
              <div className="text-center p-2 border-2 border-[#00ffff] hover:bg-[#ff00ff] hover:text-black transition-none">[S] DN</div>
              <div className="text-center p-2 border-2 border-[#00ffff] hover:bg-[#ff00ff] hover:text-black transition-none">[A] LT</div>
              <div className="text-center p-2 border-2 border-[#00ffff] hover:bg-[#ff00ff] hover:text-black transition-none">[D] RT</div>
            </div>
          </div>
        </div>

        {/* Center Panel: Game Board */}
        <div className="order-1 lg:order-2 relative">
          <div 
            className="border-cyan-raw bg-black relative"
            style={{ 
              width: `${GRID_SIZE * 20}px`, 
              height: `${GRID_SIZE * 20}px` 
            }}
          >
            {/* Grid Background */}
            <div className="absolute inset-0 opacity-30" style={{
              backgroundImage: 'linear-gradient(#ff00ff 1px, transparent 1px), linear-gradient(90deg, #ff00ff 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}></div>

            {/* Snake */}
            {snake.map((segment, index) => {
              const isHead = index === 0;
              const opacity = Math.max(0.2, 1 - (index / Math.max(snake.length, 1)));
              
              return (
                <div
                  key={`${segment.x}-${segment.y}-${index}`}
                  className={`absolute ${isHead ? 'snake-head' : 'snake-segment'}`}
                  style={{
                    width: '20px',
                    height: '20px',
                    left: `${segment.x * 20}px`,
                    top: `${segment.y * 20}px`,
                    opacity: opacity,
                    zIndex: isHead ? 10 : 5,
                  }}
                />
              );
            })}

            {/* Food */}
            <div
              className="absolute food-item"
              style={{
                width: '20px',
                height: '20px',
                left: `${food.x * 20}px`,
                top: `${food.y * 20}px`,
                zIndex: 8
              }}
            />

            {/* Overlays */}
            {!isStarted && !gameOver && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
                <button 
                  onClick={resetGame}
                  className="px-8 py-4 border-2 border-[#ff00ff] text-[#ff00ff] hover:bg-[#ff00ff] hover:text-black text-2xl uppercase tracking-widest cursor-pointer"
                >
                  &gt; EXECUTE
                </button>
              </div>
            )}

            {gameOver && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-20 border-4 border-[#ff00ff]">
                <h2 className="text-5xl text-[#ff00ff] mb-4 glitch-text" data-text="ERR_CODE: 0xDEAD">ERR_CODE: 0xDEAD</h2>
                <p className="text-white mb-8 text-2xl">CYCLES: {score}</p>
                <button 
                  onClick={resetGame}
                  className="px-8 py-4 border-2 border-[#00ffff] text-[#00ffff] hover:bg-[#00ffff] hover:text-black text-2xl uppercase tracking-widest cursor-pointer"
                >
                  &gt; RETRY_ALLOC
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Music Player */}
        <div className="flex flex-col gap-6 w-full lg:w-72 order-3">
          <div className="border-magenta-raw p-4 bg-black">
            <h2 className="text-[#00ffff] text-2xl mb-4 border-b-2 border-[#00ffff] pb-1 flex items-center gap-2 uppercase tracking-widest">
              <Database size={24} className="text-[#ff00ff]" />
              Audio_Stream
            </h2>
            
            <div className="mb-6">
              <div className="text-sm text-[#ff00ff] mb-1 tracking-widest">ACTIVE_NODE:</div>
              <div className="text-white text-lg truncate bg-[#ff00ff]/20 p-2 border border-[#ff00ff]" title={TRACKS[currentTrack].title}>
                {TRACKS[currentTrack].title}
              </div>
              {/* Visualizer */}
              <div className="flex items-end gap-1 h-12 mt-4 border-b-2 border-[#00ffff] pb-1">
                {[...Array(16)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-full bg-[#00ffff] ${isPlaying ? 'visualizer-bar' : 'h-[10%]'}`}
                    style={{
                      animationDelay: `${i * 0.05}s`,
                      animationDuration: `${0.2 + (i % 4) * 0.1}s`
                    }}
                  ></div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between bg-[#00ffff]/10 p-2 border border-[#00ffff]">
              <button onClick={prevTrack} className="p-2 text-[#00ffff] hover:text-[#ff00ff] hover:bg-black cursor-pointer neon-icon">
                <SkipBack size={32} />
              </button>
              <button 
                onClick={togglePlay} 
                className="p-2 text-black bg-[#00ffff] hover:bg-[#ff00ff] cursor-pointer"
              >
                {isPlaying ? <Pause size={32} /> : <Play size={32} />}
              </button>
              <button onClick={nextTrack} className="p-2 text-[#00ffff] hover:text-[#ff00ff] hover:bg-black cursor-pointer neon-icon">
                <SkipForward size={32} />
              </button>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button onClick={() => setIsMuted(!isMuted)} className="text-[#ff00ff] hover:text-[#00ffff] cursor-pointer neon-icon">
                {isMuted ? <VolumeX size={28} /> : <Volume2 size={28} />}
              </button>
              <div className="flex-1 h-4 border-2 border-[#ff00ff] bg-black relative">
                <div className="absolute top-0 left-0 h-full bg-[#ff00ff] w-3/4"></div>
              </div>
            </div>

            <audio 
              ref={audioRef}
              src={TRACKS[currentTrack].url}
              muted={isMuted}
              onEnded={nextTrack}
              loop={false}
            />
          </div>
          
          {/* Decorative Terminal Output */}
          <div className="border-cyan-raw p-4 bg-black text-xs text-[#00ffff] opacity-80 h-32 overflow-hidden flex flex-col justify-end">
            <div className="animate-pulse">
              <div>&gt; CONNECTING TO SECTOR_7G...</div>
              <div>&gt; BYPASSING FIREWALL... [OK]</div>
              <div>&gt; INJECTING AUDIO_STREAM... [OK]</div>
              <div>&gt; ALLOCATING MEMORY...</div>
              <div>&gt; AWAITING USER INPUT_</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
