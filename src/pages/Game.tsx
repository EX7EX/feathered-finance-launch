
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { GamepadIcon, Trophy, Coins } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Game entities
interface Chicken {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  direction: number;
}

interface Bullet {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

interface GameState {
  score: number;
  level: number;
  lives: number;
  gameActive: boolean;
  highScore: number;
}

const Game = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    level: 1,
    lives: 3,
    gameActive: false,
    highScore: 0
  });
  
  const [gameStatus, setGameStatus] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const { toast } = useToast();
  
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth < 768 ? window.innerWidth - 40 : 600,
    height: 400
  });
  
  const [rewards, setRewards] = useState([
    { level: 1, tokens: 5, status: 'locked' },
    { level: 3, tokens: 10, status: 'locked' },
    { level: 5, tokens: 25, status: 'locked' },
    { level: 10, tokens: 50, status: 'locked' },
  ]);
  
  // Game loop handling
  useEffect(() => {
    if (!gameState.gameActive || !canvasRef.current) return;
    
    let animationFrameId: number;
    let lastRender = 0;
    
    // Player spaceship
    const player = {
      x: screenSize.width / 2 - 25,
      y: screenSize.height - 60,
      width: 50,
      height: 50,
      speed: 8,
      movingLeft: false,
      movingRight: false
    };
    
    // Game entities
    const chickens: Chicken[] = [];
    const bullets: Bullet[] = [];
    
    // Initialize chickens
    const initChickens = () => {
      for (let i = 0; i < 5 + gameState.level; i++) {
        chickens.push({
          x: Math.random() * (screenSize.width - 40),
          y: Math.random() * 150,
          width: 40,
          height: 40,
          speed: 1 + Math.random() * gameState.level * 0.5,
          direction: Math.random() > 0.5 ? 1 : -1
        });
      }
    };
    
    // Event listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') player.movingLeft = true;
      if (e.key === 'ArrowRight' || e.key === 'd') player.movingRight = true;
      if (e.key === ' ' || e.key === 'ArrowUp') fireBullet();
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') player.movingLeft = false;
      if (e.key === 'ArrowRight' || e.key === 'd') player.movingRight = false;
    };
    
    // Add touch controls for mobile
    const handleTouchControls = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Left side touch moves left, right side touch moves right
      canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const canvasRect = canvas.getBoundingClientRect();
        if (touch.clientX - canvasRect.left < canvas.width / 2) {
          player.movingLeft = true;
          player.movingRight = false;
        } else {
          player.movingRight = true;
          player.movingLeft = false;
        }
      });
      
      // Stop movement on touch end
      canvas.addEventListener('touchend', () => {
        player.movingLeft = false;
        player.movingRight = false;
      });
      
      // Touch in upper half fires bullet
      canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const canvasRect = canvas.getBoundingClientRect();
        if (touch.clientY - canvasRect.top < canvas.height / 2) {
          fireBullet();
        }
      });
      
      return () => {
        canvas.removeEventListener('touchstart', () => {});
        canvas.removeEventListener('touchend', () => {});
      };
    };
    
    // Fire bullet from player
    const fireBullet = () => {
      bullets.push({
        x: player.x + player.width / 2 - 2.5,
        y: player.y,
        width: 5,
        height: 10,
        speed: 7
      });
    };
    
    // Check collision between two objects
    const checkCollision = (obj1: { x: number, y: number, width: number, height: number }, 
                          obj2: { x: number, y: number, width: number, height: number }) => {
      return (
        obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj2.height &&
        obj1.y + obj1.height > obj2.y
      );
    };
    
    // Draw game elements
    const draw = (ctx: CanvasRenderingContext2D) => {
      // Clear canvas
      ctx.clearRect(0, 0, screenSize.width, screenSize.height);
      
      // Draw player
      ctx.fillStyle = '#644DFF';
      ctx.beginPath();
      ctx.moveTo(player.x + player.width / 2, player.y);
      ctx.lineTo(player.x + player.width, player.y + player.height);
      ctx.lineTo(player.x, player.y + player.height);
      ctx.closePath();
      ctx.fill();
      
      // Draw chickens
      ctx.fillStyle = '#F6465D';
      chickens.forEach(chicken => {
        ctx.beginPath();
        ctx.arc(chicken.x + chicken.width / 2, chicken.y + chicken.height / 2, chicken.width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw chicken face
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(chicken.x + chicken.width / 2 - 8, chicken.y + chicken.height / 2 - 5, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(chicken.x + chicken.width / 2 + 8, chicken.y + chicken.height / 2 - 5, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw beak
        ctx.fillStyle = 'orange';
        ctx.beginPath();
        ctx.moveTo(chicken.x + chicken.width / 2, chicken.y + chicken.height / 2 + 5);
        ctx.lineTo(chicken.x + chicken.width / 2 - 5, chicken.y + chicken.height / 2 + 15);
        ctx.lineTo(chicken.x + chicken.width / 2 + 5, chicken.y + chicken.height / 2 + 15);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#F6465D';  // Reset color for next chicken
      });
      
      // Draw bullets
      ctx.fillStyle = '#33FFE0';
      bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
      });
    };
    
    // Update game state
    const update = () => {
      // Update player position
      if (player.movingLeft) player.x = Math.max(0, player.x - player.speed);
      if (player.movingRight) player.x = Math.min(screenSize.width - player.width, player.x + player.speed);
      
      // Update chicken positions
      chickens.forEach(chicken => {
        chicken.x += chicken.speed * chicken.direction;
        
        // Bounce off walls
        if (chicken.x <= 0 || chicken.x + chicken.width >= screenSize.width) {
          chicken.direction *= -1;
          chicken.y += 20; // Move down when bouncing
        }
        
        // Check if chicken reached bottom
        if (chicken.y + chicken.height >= player.y) {
          // Player loses a life
          setGameState(prev => {
            const newLives = prev.lives - 1;
            if (newLives <= 0) {
              setGameStatus('gameover');
              return { ...prev, lives: 0, gameActive: false };
            }
            return { ...prev, lives: newLives };
          });
          
          // Remove all chickens that reached bottom
          const index = chickens.indexOf(chicken);
          if (index > -1) {
            chickens.splice(index, 1);
          }
        }
      });
      
      // Update bullet positions
      for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= bullets[i].speed;
        
        // Remove bullet if it goes off screen
        if (bullets[i].y < 0) {
          bullets.splice(i, 1);
          continue;
        }
        
        // Check collisions with chickens
        for (let j = chickens.length - 1; j >= 0; j--) {
          if (checkCollision(bullets[i], chickens[j])) {
            // Update score
            setGameState(prev => {
              const newScore = prev.score + 10;
              
              // Check for level up
              if (newScore % 100 === 0) {
                toast({
                  title: "Level Up!",
                  description: `You've reached level ${prev.level + 1}!`,
                });
                
                // Check for rewards
                for (let k = 0; k < rewards.length; k++) {
                  if (rewards[k].level === prev.level + 1 && rewards[k].status === 'locked') {
                    setRewards(prevRewards => {
                      const newRewards = [...prevRewards];
                      newRewards[k].status = 'unlocked';
                      return newRewards;
                    });
                    
                    toast({
                      title: "Reward Unlocked!",
                      description: `You've earned ${rewards[k].tokens} tokens!`,
                    });
                    
                    break;
                  }
                }
                
                return { 
                  ...prev, 
                  score: newScore, 
                  level: prev.level + 1,
                  highScore: Math.max(prev.highScore, newScore)
                };
              }
              
              return { 
                ...prev, 
                score: newScore,
                highScore: Math.max(prev.highScore, newScore)
              };
            });
            
            // Remove chicken and bullet
            chickens.splice(j, 1);
            bullets.splice(i, 1);
            break;
          }
        }
      }
      
      // Check if all chickens are eliminated
      if (chickens.length === 0) {
        initChickens();
      }
    };
    
    // Game loop
    const gameLoop = (timestamp: number) => {
      if (!canvasRef.current) return;
      
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;
      
      // Calculate delta time
      const deltaTime = timestamp - lastRender;
      lastRender = timestamp;
      
      // Update game state
      update();
      
      // Draw game
      draw(ctx);
      
      // Continue loop
      animationFrameId = requestAnimationFrame(gameLoop);
    };
    
    // Initialize game
    initChickens();
    handleTouchControls();
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    lastRender = performance.now();
    animationFrameId = requestAnimationFrame(gameLoop);
    
    // Clean up
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameState.gameActive, screenSize, gameState.level]);
  
  // Update screen size on window resize
  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth < 768 ? window.innerWidth - 40 : 600,
        height: 400
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const startGame = () => {
    setGameState({
      score: 0,
      level: 1,
      lives: 3,
      gameActive: true,
      highScore: gameState.highScore
    });
    setGameStatus('playing');
  };
  
  const restartGame = () => {
    startGame();
  };

  return (
    <div className="container mx-auto">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <GamepadIcon className="h-6 w-6 mr-2 text-crypto-purple" /> Chicken Invaders
          </h1>
          <p className="text-gray-400">Play and earn tokens while having fun!</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card className="bg-crypto-card border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle>Game Arena</CardTitle>
                <CardDescription>
                  {gameStatus === 'menu' && "Press Start to play"}
                  {gameStatus === 'playing' && `Level: ${gameState.level} - Lives: ${gameState.lives}`}
                  {gameStatus === 'gameover' && "Game Over"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="relative">
                  {gameStatus === 'menu' && (
                    <div className="absolute inset-0 flex items-center justify-center flex-col bg-crypto-dark/80 z-10 rounded-lg">
                      <h2 className="text-2xl font-bold mb-4 text-gradient">Chicken Invaders</h2>
                      <Button 
                        size="lg" 
                        className="bg-crypto-purple hover:bg-crypto-purple/90"
                        onClick={startGame}
                      >
                        Start Game
                      </Button>
                      <p className="mt-4 text-sm text-gray-400">Use arrow keys or touch controls to play</p>
                    </div>
                  )}
                  
                  {gameStatus === 'gameover' && (
                    <div className="absolute inset-0 flex items-center justify-center flex-col bg-crypto-dark/80 z-10 rounded-lg">
                      <h2 className="text-2xl font-bold mb-2">Game Over</h2>
                      <p className="mb-1">Score: {gameState.score}</p>
                      <p className="mb-4">High Score: {gameState.highScore}</p>
                      <Button 
                        className="bg-crypto-purple hover:bg-crypto-purple/90"
                        onClick={restartGame}
                      >
                        Play Again
                      </Button>
                    </div>
                  )}
                  
                  <canvas
                    ref={canvasRef}
                    width={screenSize.width}
                    height={screenSize.height}
                    className="bg-crypto-dark rounded-lg border border-gray-800"
                  />
                  
                  {gameStatus === 'playing' && (
                    <div className="absolute top-4 left-4 flex gap-2">
                      <div className="bg-crypto-dark/80 px-2 py-1 rounded-md text-sm">
                        Score: {gameState.score}
                      </div>
                      <div className="bg-crypto-dark/80 px-2 py-1 rounded-md text-sm">
                        Level: {gameState.level}
                      </div>
                    </div>
                  )}
                  
                  {gameStatus === 'playing' && (
                    <div className="absolute top-4 right-4">
                      <div className="bg-crypto-dark/80 px-2 py-1 rounded-md text-sm flex items-center">
                        Lives: 
                        <div className="flex ml-1">
                          {[...Array(gameState.lives)].map((_, i) => (
                            <div key={i} className="w-3 h-3 bg-crypto-red rounded-full ml-1"></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              
              {gameStatus === 'playing' && (
                <CardFooter className="flex justify-between">
                  <p className="text-sm text-gray-400">Controls: Arrow keys or touch screen</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-gray-700"
                    onClick={() => {
                      setGameState(prev => ({ ...prev, gameActive: false }));
                      setGameStatus('menu');
                    }}
                  >
                    Pause Game
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
          
          <div className="flex flex-col gap-6">
            <Card className="bg-crypto-card border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-crypto-purple" /> Rewards
                </CardTitle>
                <CardDescription>Earn tokens by playing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {rewards.map((reward, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className={`h-8 w-8 rounded-full ${reward.status === 'unlocked' ? 'bg-crypto-purple' : 'bg-gray-800'} flex items-center justify-center text-sm font-medium`}>
                        {reward.level}
                      </div>
                      <div>
                        <p className="font-medium">Level {reward.level}</p>
                        <p className="text-xs text-gray-400">Earn {reward.tokens} tokens</p>
                      </div>
                    </div>
                    <div>
                      {reward.status === 'unlocked' ? (
                        <div className="flex items-center text-crypto-purple text-sm font-medium">
                          <Coins className="h-4 w-4 mr-1" /> {reward.tokens}
                        </div>
                      ) : (
                        <div className="text-gray-500 text-sm">Locked</div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button 
                  variant="ghost" 
                  className="w-full text-crypto-purple hover:bg-crypto-purple/10"
                  onClick={() => toast({
                    title: "Rewards System",
                    description: "This is a demo. In a real app, these tokens could be used for trading or discounts.",
                  })}
                >
                  About Rewards
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="bg-crypto-card border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle>How to Play</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <p className="font-medium">Movement:</p>
                  <p className="text-gray-400">Use arrow keys or touch the left/right side of the screen to move.</p>
                </div>
                <div>
                  <p className="font-medium">Shooting:</p>
                  <p className="text-gray-400">Press space bar, up arrow or touch the upper half of the screen to shoot.</p>
                </div>
                <div>
                  <p className="font-medium">Objective:</p>
                  <p className="text-gray-400">Shoot as many chickens as you can before they reach the bottom.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
