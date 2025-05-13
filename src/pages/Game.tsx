
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { GamepadIcon, Trophy, Coins, Star, Egg, EggFried, CircleCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { toast } from "@/components/ui/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/lib/auth-utils";

// Game entities
interface Chicken {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  direction: number;
  type: 'normal' | 'golden' | 'boss';
  health: number;
  points: number;
}

interface PowerUp {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'rapidFire' | 'shield' | 'bomb';
  duration: number;
  active: boolean;
}

interface Bullet {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  power: number;
}

interface Explosion {
  x: number;
  y: number;
  size: number;
  frame: number;
  maxFrames: number;
}

interface GameState {
  score: number;
  level: number;
  lives: number;
  gameActive: boolean;
  highScore: number;
  totalPebls: number;
  combo: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  requirement: number;
  currentProgress: number;
  completed: boolean;
  peblReward: number;
  icon: React.ReactNode;
}

const Game = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { user } = useAuth();
  
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    level: 1,
    lives: 3,
    gameActive: false,
    highScore: 0,
    totalPebls: 0,
    combo: 0
  });
  
  const [gameStatus, setGameStatus] = useState<'menu' | 'playing' | 'paused' | 'gameover'>('menu');
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [activePowerUps, setActivePowerUps] = useState<{
    rapidFire: boolean;
    shield: boolean;
    bomb: boolean;
  }>({
    rapidFire: false,
    shield: false,
    bomb: false
  });
  
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth < 768 ? window.innerWidth - 40 : 600,
    height: 400
  });
  
  const [rewards, setRewards] = useState([
    { level: 1, tokens: 5, status: 'locked' },
    { level: 3, tokens: 10, status: 'locked' },
    { level: 5, tokens: 25, status: 'locked' },
    { level: 10, tokens: 50, status: 'locked' },
    { level: 15, tokens: 100, status: 'locked' },
  ]);
  
  const [achievements, setAchievements] = useState<Achievement[]>([
    { 
      id: 'first-blood', 
      name: 'First Blood', 
      description: 'Defeat your first chicken', 
      requirement: 1, 
      currentProgress: 0, 
      completed: false, 
      peblReward: 1,
      icon: <Egg className="h-6 w-6 text-crypto-purple" />
    },
    { 
      id: 'sharpshooter', 
      name: 'Sharpshooter', 
      description: 'Achieve 90% hit accuracy', 
      requirement: 90, 
      currentProgress: 0, 
      completed: false, 
      peblReward: 10,
      icon: <Star className="h-6 w-6 text-amber-500" />
    },
    { 
      id: 'chicken-dominator', 
      name: 'Chicken Dominator', 
      description: 'Defeat 100 chickens total', 
      requirement: 100, 
      currentProgress: 0, 
      completed: false, 
      peblReward: 25,
      icon: <EggFried className="h-6 w-6 text-amber-500" />
    },
    { 
      id: 'survivor', 
      name: 'Survivor', 
      description: 'Reach level 10 without losing a life', 
      requirement: 10, 
      currentProgress: 0, 
      completed: false, 
      peblReward: 50,
      icon: <Trophy className="h-6 w-6 text-yellow-500" />
    }
  ]);
  
  // Game metrics
  const [metrics, setMetrics] = useState({
    shotsFired: 0,
    shotsHit: 0,
    chickensDefeated: 0,
    powerUpsCollected: 0,
    timePlayedSeconds: 0,
    longestCombo: 0
  });
  
  // Game loop handling
  useEffect(() => {
    if (!gameState.gameActive || !canvasRef.current || gameStatus !== 'playing') return;
    
    let animationFrameId: number;
    let lastRender = 0;
    let comboTimer = 0;
    let gameTimer = 0;
    
    // Player spaceship
    const player = {
      x: screenSize.width / 2 - 25,
      y: screenSize.height - 60,
      width: 50,
      height: 50,
      speed: 8,
      movingLeft: false,
      movingRight: false,
      shielded: false,
      powerUps: {
        rapidFire: { active: false, timer: 0, duration: 5000 },
        shield: { active: false, timer: 0, duration: 10000 },
        bomb: { active: false, timer: 0, duration: 0 }
      },
      fireCooldown: 0,
      fireRate: 500, // ms between shots
      invincible: false,
      invincibleTimer: 0
    };
    
    // Game entities
    const chickens: Chicken[] = [];
    const bullets: Bullet[] = [];
    const explosions: Explosion[] = [];
    const powerUpItems: PowerUp[] = [];
    
    // Initialize chickens
    const initChickens = () => {
      chickens.length = 0; // Clear existing chickens
      
      const baseCount = 5 + Math.min(10, gameState.level); // Cap at 15 chickens max
      const goldenCount = Math.floor(gameState.level / 3); // Every 3 levels, add a golden chicken
      const bossCount = gameState.level % 5 === 0 ? 1 : 0; // Every 5 levels, add a boss
      
      // Add normal chickens
      for (let i = 0; i < baseCount; i++) {
        chickens.push({
          x: Math.random() * (screenSize.width - 40),
          y: Math.random() * 120,
          width: 40,
          height: 40,
          speed: 1 + Math.random() * (gameState.level * 0.3),
          direction: Math.random() > 0.5 ? 1 : -1,
          type: 'normal',
          health: 1,
          points: 10
        });
      }
      
      // Add golden chickens (worth more points)
      for (let i = 0; i < goldenCount; i++) {
        chickens.push({
          x: Math.random() * (screenSize.width - 50),
          y: Math.random() * 100,
          width: 50,
          height: 50,
          speed: 1.5 + Math.random() * (gameState.level * 0.3),
          direction: Math.random() > 0.5 ? 1 : -1,
          type: 'golden',
          health: 2,
          points: 30
        });
      }
      
      // Add boss chicken
      if (bossCount > 0) {
        chickens.push({
          x: screenSize.width / 2 - 40,
          y: 50,
          width: 80,
          height: 80,
          speed: 2,
          direction: 1,
          type: 'boss',
          health: 5 + gameState.level,
          points: 100
        });
      }
    };
    
    // Event listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') player.movingLeft = true;
      if (e.key === 'ArrowRight' || e.key === 'd') player.movingRight = true;
      if (e.key === ' ' || e.key === 'ArrowUp') fireBullet();
      
      // Pause game with P or Esc
      if (e.key === 'p' || e.key === 'Escape') {
        setGameStatus(prev => prev === 'playing' ? 'paused' : 'playing');
        setGameState(prev => ({
          ...prev,
          gameActive: prev.gameActive ? false : true
        }));
      }
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
        if (touch.clientX - canvasRect.left < canvas.width / 3) {
          player.movingLeft = true;
          player.movingRight = false;
        } else if (touch.clientX - canvasRect.left > canvas.width * 2/3) {
          player.movingRight = true;
          player.movingLeft = false;
        } else {
          // Middle area shoots
          fireBullet();
        }
      });
      
      // Stop movement on touch end
      canvas.addEventListener('touchend', () => {
        player.movingLeft = false;
        player.movingRight = false;
      });
      
      return () => {
        canvas.removeEventListener('touchstart', () => {});
        canvas.removeEventListener('touchend', () => {});
      };
    };
    
    // Fire bullet from player
    const fireBullet = () => {
      // Check cooldown
      if (player.fireCooldown > 0) return;
      
      const bulletSpeed = 7;
      const bulletPower = 1;
      const bulletWidth = 5;
      const bulletHeight = 10;
      
      // Adjust fire rate for rapid fire powerup
      player.fireCooldown = player.powerUps.rapidFire.active ? 200 : 500;
      
      // Update shots fired metric
      setMetrics(prev => ({
        ...prev,
        shotsFired: prev.shotsFired + 1
      }));
      
      // Create bullet(s)
      if (player.powerUps.rapidFire.active) {
        // Triple shot for rapid fire
        bullets.push({
          x: player.x + player.width / 2 - 10,
          y: player.y,
          width: bulletWidth,
          height: bulletHeight,
          speed: bulletSpeed,
          power: bulletPower
        });
        bullets.push({
          x: player.x + player.width / 2 - 2.5,
          y: player.y,
          width: bulletWidth,
          height: bulletHeight,
          speed: bulletSpeed,
          power: bulletPower
        });
        bullets.push({
          x: player.x + player.width / 2 + 5,
          y: player.y,
          width: bulletWidth,
          height: bulletHeight,
          speed: bulletSpeed,
          power: bulletPower
        });
      } else {
        // Single shot
        bullets.push({
          x: player.x + player.width / 2 - 2.5,
          y: player.y,
          width: bulletWidth,
          height: bulletHeight,
          speed: bulletSpeed,
          power: bulletPower
        });
      }
    };
    
    // Create powerup with random type
    const createPowerUp = (x: number, y: number) => {
      const types: ('rapidFire' | 'shield' | 'bomb')[] = ['rapidFire', 'shield', 'bomb'];
      const randomType = types[Math.floor(Math.random() * types.length)];
      
      powerUpItems.push({
        x,
        y,
        width: 30,
        height: 30,
        type: randomType,
        duration: randomType === 'rapidFire' ? 5000 : randomType === 'shield' ? 10000 : 0,
        active: false
      });
    };
    
    // Activate powerup
    const activatePowerUp = (type: 'rapidFire' | 'shield' | 'bomb') => {
      player.powerUps[type].active = true;
      player.powerUps[type].timer = player.powerUps[type].duration;
      
      setActivePowerUps(prev => ({
        ...prev,
        [type]: true
      }));
      
      // For bomb powerup, clear all chickens on screen
      if (type === 'bomb') {
        chickens.forEach(chicken => {
          // Create explosion at chicken position
          explosions.push({
            x: chicken.x + chicken.width / 2,
            y: chicken.y + chicken.height / 2,
            size: 50,
            frame: 0,
            maxFrames: 10
          });
          
          // Update score based on chicken points
          setGameState(prev => ({
            ...prev,
            score: prev.score + chicken.points
          }));
          
          // Update metrics
          setMetrics(prev => ({
            ...prev,
            chickensDefeated: prev.chickensDefeated + 1
          }));
        });
        
        // Clear all chickens
        chickens.length = 0;
        
        toast({
          title: "BOOM!",
          description: "All chickens eliminated!",
        });
      } else {
        toast({
          title: `Power Up Activated!`,
          description: type === 'rapidFire' ? 
            "Rapid fire enabled for 5 seconds!" : 
            "Shield activated for 10 seconds!",
        });
      }
      
      // Update metrics
      setMetrics(prev => ({
        ...prev,
        powerUpsCollected: prev.powerUpsCollected + 1
      }));
    };
    
    // Create explosion
    const createExplosion = (x: number, y: number, size: number) => {
      explosions.push({
        x,
        y,
        size,
        frame: 0,
        maxFrames: 10
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
      
      // Draw starfield background
      drawStarfield(ctx);
      
      // Draw player
      ctx.save();
      
      // Flash player if invincible
      if (player.invincible && Math.floor(Date.now() / 100) % 2 === 0) {
        ctx.globalAlpha = 0.5;
      }
      
      // Draw shield if active
      if (player.powerUps.shield.active) {
        ctx.beginPath();
        ctx.arc(player.x + player.width / 2, player.y + player.height / 2, player.width / 1.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(102, 77, 255, 0.3)';
        ctx.fill();
      }
      
      // Draw player spaceship
      ctx.fillStyle = '#644DFF';
      ctx.beginPath();
      ctx.moveTo(player.x + player.width / 2, player.y);
      ctx.lineTo(player.x + player.width, player.y + player.height);
      ctx.lineTo(player.x, player.y + player.height);
      ctx.closePath();
      ctx.fill();
      
      // Draw engine glow
      ctx.fillStyle = 'rgba(255, 165, 0, 0.8)';
      ctx.beginPath();
      ctx.moveTo(player.x + player.width / 2, player.y + player.height);
      ctx.lineTo(player.x + player.width / 3, player.y + player.height + 10);
      ctx.lineTo(player.x + player.width * 2/3, player.y + player.height + 10);
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();
      
      // Draw chickens
      chickens.forEach(chicken => {
        ctx.save();
        
        if (chicken.type === 'normal') {
          ctx.fillStyle = '#F6465D';
        } else if (chicken.type === 'golden') {
          ctx.fillStyle = '#FFDF00';
        } else { // boss
          ctx.fillStyle = '#F97316'; // Orange
        }
        
        // Draw chicken body
        ctx.beginPath();
        ctx.arc(chicken.x + chicken.width / 2, chicken.y + chicken.height / 2, chicken.width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw chicken face
        ctx.fillStyle = 'white';
        const eyeSize = chicken.width / 8;
        ctx.beginPath();
        ctx.arc(chicken.x + chicken.width / 2 - chicken.width / 4, chicken.y + chicken.height / 2 - chicken.height / 8, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(chicken.x + chicken.width / 2 + chicken.width / 4, chicken.y + chicken.height / 2 - chicken.height / 8, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw pupils
        ctx.fillStyle = 'black';
        const pupilSize = eyeSize / 2;
        ctx.beginPath();
        ctx.arc(chicken.x + chicken.width / 2 - chicken.width / 4, chicken.y + chicken.height / 2 - chicken.height / 8, pupilSize, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(chicken.x + chicken.width / 2 + chicken.width / 4, chicken.y + chicken.height / 2 - chicken.height / 8, pupilSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw beak
        ctx.fillStyle = 'orange';
        ctx.beginPath();
        ctx.moveTo(chicken.x + chicken.width / 2, chicken.y + chicken.height / 2 + chicken.height / 8);
        ctx.lineTo(chicken.x + chicken.width / 2 - chicken.width / 6, chicken.y + chicken.height / 2 + chicken.height / 3);
        ctx.lineTo(chicken.x + chicken.width / 2 + chicken.width / 6, chicken.y + chicken.height / 2 + chicken.height / 3);
        ctx.closePath();
        ctx.fill();
        
        // Draw health bar for bosses
        if (chicken.type === 'boss') {
          const healthBarWidth = chicken.width;
          const healthBarHeight = 5;
          const healthPercentage = chicken.health / (5 + gameState.level);
          
          // Background
          ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.fillRect(
            chicken.x, 
            chicken.y - 10, 
            healthBarWidth, 
            healthBarHeight
          );
          
          // Health remaining
          ctx.fillStyle = healthPercentage > 0.5 ? '#25CD9C' : healthPercentage > 0.2 ? '#FFDF00' : '#F6465D';
          ctx.fillRect(
            chicken.x, 
            chicken.y - 10, 
            healthBarWidth * healthPercentage, 
            healthBarHeight
          );
        }
        
        ctx.restore();
      });
      
      // Draw bullets
      ctx.fillStyle = '#33FFE0';
      bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
      });
      
      // Draw powerups
      powerUpItems.forEach(powerUp => {
        ctx.save();
        
        if (powerUp.type === 'rapidFire') {
          ctx.fillStyle = '#33FFE0'; // Teal
        } else if (powerUp.type === 'shield') {
          ctx.fillStyle = '#644DFF'; // Purple
        } else { // bomb
          ctx.fillStyle = '#F6465D'; // Red
        }
        
        // Draw powerup shape
        ctx.beginPath();
        ctx.arc(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2, powerUp.width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw icon based on type
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `${powerUp.width / 2}px Arial`;
        
        if (powerUp.type === 'rapidFire') {
          ctx.fillText('R', powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2);
        } else if (powerUp.type === 'shield') {
          ctx.fillText('S', powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2);
        } else { // bomb
          ctx.fillText('B', powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2);
        }
        
        ctx.restore();
      });
      
      // Draw explosions
      explosions.forEach(explosion => {
        ctx.save();
        const gradient = ctx.createRadialGradient(
          explosion.x, explosion.y, 0,
          explosion.x, explosion.y, explosion.size * (1 - explosion.frame / explosion.maxFrames)
        );
        
        gradient.addColorStop(0, `rgba(255, 165, 0, ${1 - explosion.frame / explosion.maxFrames})`);
        gradient.addColorStop(0.5, `rgba(255, 0, 0, ${0.8 - explosion.frame / explosion.maxFrames})`);
        gradient.addColorStop(1, `rgba(255, 0, 0, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(
          explosion.x, explosion.y, 
          explosion.size * (1 - explosion.frame / (explosion.maxFrames * 2)), 
          0, Math.PI * 2
        );
        ctx.fill();
        ctx.restore();
      });
      
      // Draw combo counter if active
      if (gameState.combo > 1) {
        ctx.save();
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Combo x${gameState.combo}`, screenSize.width / 2, 50);
        ctx.restore();
      }
    };
    
    // Draw starfield background with parallax effect
    const drawStarfield = (ctx: CanvasRenderingContext2D) => {
      ctx.fillStyle = '#0D1117';
      ctx.fillRect(0, 0, screenSize.width, screenSize.height);
      
      // Generate stars based on time
      const time = Date.now() / 1000;
      const starCount = 50;
      
      for (let i = 0; i < starCount; i++) {
        // Create deterministic but "random" star positions
        const x = ((i * 17 + time * 20) % screenSize.width + screenSize.width) % screenSize.width;
        const y = (((i * 23 + time * 10) % screenSize.height) + screenSize.height) % screenSize.height;
        const size = (i % 3) + 1;
        
        // Star color based on size
        if (size === 1) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        } else if (size === 2) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        }
        
        ctx.fillRect(x, y, size, size);
      }
    };
    
    // Update game state
    const update = (deltaTime: number) => {
      // Update cooldowns
      if (player.fireCooldown > 0) {
        player.fireCooldown -= deltaTime;
      }
      
      // Update powerup timers
      Object.keys(player.powerUps).forEach(key => {
        const powerUpKey = key as keyof typeof player.powerUps;
        if (player.powerUps[powerUpKey].active && powerUpKey !== 'bomb') {
          player.powerUps[powerUpKey].timer -= deltaTime;
          
          // Deactivate if timer expired
          if (player.powerUps[powerUpKey].timer <= 0) {
            player.powerUps[powerUpKey].active = false;
            setActivePowerUps(prev => ({
              ...prev,
              [powerUpKey]: false
            }));
          }
        }
      });
      
      // Update invincibility timer
      if (player.invincible) {
        player.invincibleTimer -= deltaTime;
        if (player.invincibleTimer <= 0) {
          player.invincible = false;
        }
      }
      
      // Update combo timer
      if (gameState.combo > 0) {
        comboTimer -= deltaTime;
        if (comboTimer <= 0) {
          setGameState(prev => ({
            ...prev,
            combo: 0
          }));
        }
      }
      
      // Update game timer every second
      gameTimer += deltaTime;
      if (gameTimer >= 1000) {
        gameTimer = 0;
        setMetrics(prev => ({
          ...prev,
          timePlayedSeconds: prev.timePlayedSeconds + 1
        }));
      }
      
      // Update player position
      if (player.movingLeft) player.x = Math.max(0, player.x - player.speed);
      if (player.movingRight) player.x = Math.min(screenSize.width - player.width, player.x + player.speed);
      
      // Update chicken positions
      chickens.forEach(chicken => {
        chicken.x += chicken.speed * chicken.direction * (deltaTime / 16);
        
        // Bounce off walls
        if (chicken.x <= 0 || chicken.x + chicken.width >= screenSize.width) {
          chicken.direction *= -1;
          chicken.y += 20; // Move down when bouncing
        }
        
        // Chance for boss chickens to change direction randomly
        if (chicken.type === 'boss' && Math.random() < 0.01) {
          chicken.direction *= -1;
        }
        
        // Check if chicken reached bottom
        if (chicken.y + chicken.height >= player.y) {
          // Player loses a life if not invincible or shielded
          if (!player.invincible && !player.powerUps.shield.active) {
            setGameState(prev => {
              const newLives = prev.lives - 1;
              
              if (newLives <= 0) {
                setGameStatus('gameover');
                return { ...prev, lives: 0, gameActive: false };
              }
              
              // Make player invincible briefly after losing a life
              player.invincible = true;
              player.invincibleTimer = 3000; // 3 seconds of invincibility
              
              // Reset combo on hit
              return { ...prev, lives: newLives, combo: 0 };
            });
            
            // Create explosion
            createExplosion(player.x + player.width / 2, player.y + player.height / 2, 60);
          } else if (player.powerUps.shield.active) {
            // Shield blocks one hit
            player.powerUps.shield.active = false;
            player.powerUps.shield.timer = 0;
            
            setActivePowerUps(prev => ({
              ...prev,
              shield: false
            }));
            
            toast({
              title: "Shield Activated!",
              description: "Your shield protected you from damage.",
            });
          }
          
          // Remove chicken that reached bottom
          const index = chickens.indexOf(chicken);
          if (index > -1) {
            chickens.splice(index, 1);
          }
        }
      });
      
      // Update bullet positions
      for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= bullets[i].speed * (deltaTime / 16);
        
        // Remove bullet if it goes off screen
        if (bullets[i].y < 0) {
          bullets.splice(i, 1);
          continue;
        }
        
        // Check collisions with chickens
        for (let j = chickens.length - 1; j >= 0; j--) {
          if (checkCollision(bullets[i], chickens[j])) {
            // Reduce chicken health
            chickens[j].health -= bullets[i].power;
            
            // Update shots hit metric
            setMetrics(prev => ({
              ...prev,
              shotsHit: prev.shotsHit + 1
            }));
            
            // Update score if chicken is defeated
            if (chickens[j].health <= 0) {
              // Update score with combo multiplier
              const pointsEarned = chickens[j].points * (gameState.combo > 0 ? gameState.combo : 1);
              
              setGameState(prev => {
                const newScore = prev.score + pointsEarned;
                const newCombo = prev.combo + 1;
                const newHighScore = Math.max(prev.highScore, newScore);
                
                // Check for level up
                if (newScore >= prev.level * 100) {
                  // Check for rewards when leveling up
                  const newLevel = Math.floor(newScore / 100) + 1;
                  
                  toast({
                    title: "Level Up!",
                    description: `You've reached level ${newLevel}!`,
                  });
                  
                  // Check achievements for survivor
                  if (newLevel > prev.level && prev.lives === 3) {
                    setAchievements(prevAchievements => {
                      const newAchievements = [...prevAchievements];
                      const survivorAchievement = newAchievements.find(a => a.id === 'survivor');
                      
                      if (survivorAchievement && !survivorAchievement.completed) {
                        survivorAchievement.currentProgress = newLevel;
                        
                        if (survivorAchievement.currentProgress >= survivorAchievement.requirement) {
                          survivorAchievement.completed = true;
                          toast({
                            title: "Achievement Unlocked!",
                            description: `${survivorAchievement.name}: ${survivorAchievement.description}`,
                          });
                        }
                      }
                      
                      return newAchievements;
                    });
                  }
                  
                  return { 
                    ...prev,
                    score: newScore,
                    level: newLevel,
                    combo: newCombo,
                    highScore: newHighScore
                  };
                }
                
                return { 
                  ...prev, 
                  score: newScore,
                  combo: newCombo,
                  highScore: newHighScore
                };
              });
              
              // Reset combo timer
              comboTimer = 2000; // 2 seconds to maintain combo
              
              // Update metrics
              setMetrics(prev => {
                const newChickensDefeated = prev.chickensDefeated + 1;
                const newLongestCombo = Math.max(prev.longestCombo, gameState.combo + 1);
                
                // Check achievements
                setAchievements(prevAchievements => {
                  const newAchievements = [...prevAchievements];
                  
                  // First blood achievement
                  if (newChickensDefeated === 1) {
                    const firstBloodAchievement = newAchievements.find(a => a.id === 'first-blood');
                    if (firstBloodAchievement) {
                      firstBloodAchievement.currentProgress = 1;
                      firstBloodAchievement.completed = true;
                      
                      toast({
                        title: "Achievement Unlocked!",
                        description: `${firstBloodAchievement.name}: ${firstBloodAchievement.description}`,
                      });
                      
                      // Add PEBL reward
                      setGameState(gs => ({
                        ...gs,
                        totalPebls: gs.totalPebls + firstBloodAchievement.peblReward
                      }));
                    }
                  }
                  
                  // Chicken dominator achievement
                  const dominatorAchievement = newAchievements.find(a => a.id === 'chicken-dominator');
                  if (dominatorAchievement) {
                    dominatorAchievement.currentProgress = newChickensDefeated;
                    
                    if (dominatorAchievement.currentProgress >= dominatorAchievement.requirement && !dominatorAchievement.completed) {
                      dominatorAchievement.completed = true;
                      
                      toast({
                        title: "Achievement Unlocked!",
                        description: `${dominatorAchievement.name}: ${dominatorAchievement.description}`,
                      });
                      
                      // Add PEBL reward
                      setGameState(gs => ({
                        ...gs,
                        totalPebls: gs.totalPebls + dominatorAchievement.peblReward
                      }));
                    }
                  }
                  
                  // Sharpshooter achievement
                  const sharpshooterAchievement = newAchievements.find(a => a.id === 'sharpshooter');
                  if (sharpshooterAchievement && prev.shotsFired >= 10) {
                    const accuracy = (prev.shotsHit / prev.shotsFired) * 100;
                    sharpshooterAchievement.currentProgress = Math.round(accuracy);
                    
                    if (accuracy >= sharpshooterAchievement.requirement && !sharpshooterAchievement.completed) {
                      sharpshooterAchievement.completed = true;
                      
                      toast({
                        title: "Achievement Unlocked!",
                        description: `${sharpshooterAchievement.name}: ${sharpshooterAchievement.description}`,
                      });
                      
                      // Add PEBL reward
                      setGameState(gs => ({
                        ...gs,
                        totalPebls: gs.totalPebls + sharpshooterAchievement.peblReward
                      }));
                    }
                  }
                  
                  return newAchievements;
                });
                
                return {
                  ...prev,
                  chickensDefeated: newChickensDefeated,
                  longestCombo: newLongestCombo
                };
              });
              
              // Create explosion at chicken position
              createExplosion(
                chickens[j].x + chickens[j].width / 2, 
                chickens[j].y + chickens[j].height / 2, 
                chickens[j].type === 'boss' ? 80 : 40
              );
              
              // Random chance to drop powerup (higher chance for golden and boss chickens)
              const powerUpChance = chickens[j].type === 'normal' ? 0.1 : chickens[j].type === 'golden' ? 0.3 : 0.8;
              if (Math.random() < powerUpChance) {
                createPowerUp(
                  chickens[j].x + chickens[j].width / 2 - 15, 
                  chickens[j].y + chickens[j].height / 2 - 15
                );
              }
              
              // Remove defeated chicken
              chickens.splice(j, 1);
            }
            
            // Remove bullet after hit
            bullets.splice(i, 1);
            break;
          }
        }
      }
      
      // Update powerup positions and check collision with player
      for (let i = powerUpItems.length - 1; i >= 0; i--) {
        powerUpItems[i].y += 2;
        
        // Remove if off screen
        if (powerUpItems[i].y > screenSize.height) {
          powerUpItems.splice(i, 1);
          continue;
        }
        
        // Check for collision with player
        if (checkCollision(player, powerUpItems[i])) {
          activatePowerUp(powerUpItems[i].type);
          powerUpItems.splice(i, 1);
        }
      }
      
      // Update explosions
      for (let i = explosions.length - 1; i >= 0; i--) {
        explosions[i].frame++;
        if (explosions[i].frame >= explosions[i].maxFrames) {
          explosions.splice(i, 1);
        }
      }
      
      // Check if all chickens are eliminated
      if (chickens.length === 0) {
        // Add PEBLs for clearing a wave
        const peblsEarned = Math.ceil(gameState.level / 2);
        
        setGameState(prev => ({
          ...prev,
          totalPebls: prev.totalPebls + peblsEarned
        }));
        
        // Show message
        toast({
          title: "Wave Cleared!",
          description: `+${peblsEarned} PEBLs earned!`,
        });
        
        // Initialize new wave of chickens
        initChickens();
      }
    };
    
    // Game loop
    const gameLoop = (timestamp: number) => {
      if (!canvasRef.current || gameStatus !== 'playing') return;
      
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;
      
      // Calculate delta time
      const deltaTime = timestamp - lastRender;
      lastRender = timestamp;
      
      // Update game state
      update(deltaTime);
      
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
  }, [gameState.gameActive, screenSize, gameState.level, gameStatus]);
  
  // Update rewards when level changes
  useEffect(() => {
    if (gameState.level > 0) {
      setRewards(prevRewards => {
        const newRewards = [...prevRewards];
        for (let i = 0; i < newRewards.length; i++) {
          if (gameState.level >= newRewards[i].level && newRewards[i].status === 'locked') {
            newRewards[i].status = 'unlocked';
            
            // Add token rewards to total
            setGameState(prev => ({
              ...prev,
              totalPebls: prev.totalPebls + newRewards[i].tokens
            }));
            
            toast({
              title: "Level Reward Unlocked!",
              description: `You've earned ${newRewards[i].tokens} PEBLs for reaching level ${newRewards[i].level}!`,
            });
          }
        }
        return newRewards;
      });
    }
  }, [gameState.level]);
  
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
      highScore: gameState.highScore,
      totalPebls: gameState.totalPebls,
      combo: 0
    });
    setMetrics({
      shotsFired: 0,
      shotsHit: 0,
      chickensDefeated: 0,
      powerUpsCollected: 0,
      timePlayedSeconds: 0,
      longestCombo: 0
    });
    setActivePowerUps({
      rapidFire: false,
      shield: false,
      bomb: false
    });
    setGameStatus('playing');
  };
  
  const restartGame = () => {
    startGame();
  };

  const pauseGame = () => {
    setGameStatus('paused');
    setGameState(prev => ({
      ...prev,
      gameActive: false
    }));
  };

  const resumeGame = () => {
    setGameStatus('playing');
    setGameState(prev => ({
      ...prev,
      gameActive: true
    }));
  };
  
  // Calculate accuracy percentage
  const calculateAccuracy = () => {
    if (metrics.shotsFired === 0) return '0%';
    return Math.round((metrics.shotsHit / metrics.shotsFired) * 100) + '%';
  };

  return (
    <div className="container mx-auto">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <GamepadIcon className="h-6 w-6 mr-2 text-crypto-purple" /> Chicken Invaders
          </h1>
          <p className="text-gray-400">Play and earn PEBL tokens while defending against chicken invaders!</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card className="bg-crypto-card border-gray-800">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Game Arena</CardTitle>
                    <CardDescription>
                      {gameStatus === 'menu' && "Press Start to play"}
                      {gameStatus === 'playing' && `Level: ${gameState.level} - Lives: ${gameState.lives}`}
                      {gameStatus === 'paused' && "Game Paused"}
                      {gameStatus === 'gameover' && "Game Over"}
                    </CardDescription>
                  </div>
                  {(gameStatus === 'playing' || gameStatus === 'paused') && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center px-2 py-1 bg-crypto-purple/20 rounded text-sm">
                        <Coins className="h-4 w-4 mr-1 text-crypto-purple" />
                        <span>{gameState.totalPebls} PEBL</span>
                      </div>
                      <div className="flex items-center px-2 py-1 bg-crypto-purple/20 rounded text-sm">
                        <Trophy className="h-4 w-4 mr-1 text-amber-500" />
                        <span>{gameState.score}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="relative">
                  {gameStatus === 'menu' && (
                    <div className="absolute inset-0 flex items-center justify-center flex-col bg-crypto-dark/80 z-10 rounded-lg">
                      <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-crypto-purple to-crypto-teal bg-clip-text text-transparent">Chicken Invaders</h2>
                      <Button 
                        size="lg" 
                        className="bg-crypto-purple hover:bg-crypto-purple/90"
                        onClick={startGame}
                      >
                        Start Game
                      </Button>
                      <p className="mt-4 text-sm text-gray-400">Use arrow keys or touch controls to play</p>
                      {user ? (
                        <p className="mt-2 text-sm text-crypto-purple">Logged in as {user.email}</p>
                      ) : (
                        <p className="mt-2 text-sm text-gray-400">Log in to save your PEBL rewards</p>
                      )}
                    </div>
                  )}
                  
                  {gameStatus === 'paused' && (
                    <div className="absolute inset-0 flex items-center justify-center flex-col bg-crypto-dark/80 z-10 rounded-lg">
                      <h2 className="text-2xl font-bold mb-4">Game Paused</h2>
                      <Button 
                        className="bg-crypto-purple hover:bg-crypto-purple/90 mb-2"
                        onClick={resumeGame}
                      >
                        Resume Game
                      </Button>
                      <Button 
                        variant="outline"
                        className="border-gray-700"
                        onClick={() => setGameStatus('menu')}
                      >
                        Return to Menu
                      </Button>
                      <p className="mt-4 text-sm text-gray-400">Press ESC or P to resume</p>
                    </div>
                  )}
                  
                  {gameStatus === 'gameover' && (
                    <div className="absolute inset-0 flex items-center justify-center flex-col bg-crypto-dark/80 z-10 rounded-lg">
                      <h2 className="text-2xl font-bold mb-2">Game Over</h2>
                      <div className="mb-4 flex flex-col items-center">
                        <p className="mb-1">Score: {gameState.score}</p>
                        <p className="mb-1">High Score: {gameState.highScore}</p>
                        <p className="mb-1">Level Reached: {gameState.level}</p>
                        <p className="flex items-center text-crypto-purple">
                          <Coins className="h-4 w-4 mr-1" /> {gameState.totalPebls} PEBL Earned
                        </p>
                      </div>
                      <Button 
                        className="bg-crypto-purple hover:bg-crypto-purple/90 mb-2"
                        onClick={restartGame}
                      >
                        Play Again
                      </Button>
                      <Button 
                        variant="outline"
                        className="border-gray-700"
                        onClick={() => setGameStatus('menu')}
                      >
                        Return to Menu
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
                  
                  {gameStatus === 'playing' && activePowerUps && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                      {activePowerUps.rapidFire && (
                        <div className="bg-crypto-teal/80 px-2 py-1 rounded-full text-xs font-medium animate-pulse">
                          Rapid Fire
                        </div>
                      )}
                      {activePowerUps.shield && (
                        <div className="bg-crypto-purple/80 px-2 py-1 rounded-full text-xs font-medium animate-pulse">
                          Shield
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
              
              {gameStatus === 'playing' && (
                <CardFooter className="flex justify-between">
                  <p className="text-sm text-gray-400">Arrow keys to move, Space to shoot</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-gray-700"
                    onClick={pauseGame}
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
                  <Coins className="h-5 w-5 mr-2 text-crypto-purple" /> PEBL Rewards
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
                        <p className="text-xs text-gray-400">Earn {reward.tokens} PEBL</p>
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
              <CardFooter className="flex flex-col">
                <div className="w-full bg-gray-800 h-[1px] mb-4"></div>
                <div className="flex justify-between w-full items-center">
                  <p className="font-medium">Total PEBL:</p>
                  <p className="text-lg font-semibold text-crypto-purple flex items-center">
                    <Coins className="h-5 w-5 mr-1" /> {gameState.totalPebls}
                  </p>
                </div>
              </CardFooter>
            </Card>
            
            <Card className="bg-crypto-card border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-amber-500" /> Achievements
                </CardTitle>
                <CardDescription>Complete challenges to earn PEBL</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {achievements.map((achievement, i) => (
                  <TooltipProvider key={i}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-800/50 hover:bg-gray-800/80 transition-colors">
                          <div className={`h-10 w-10 rounded-lg ${achievement.completed ? 'bg-crypto-purple/20' : 'bg-gray-800'} flex items-center justify-center`}>
                            {achievement.icon}
                            {achievement.completed && (
                              <div className="absolute -bottom-1 -right-1 bg-crypto-purple rounded-full p-[1px]">
                                <CircleCheck className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <p className="font-medium">{achievement.name}</p>
                              <p className="text-xs text-crypto-purple">{achievement.peblReward} PEBL</p>
                            </div>
                            <div className="w-full mt-1">
                              <Progress 
                                value={(achievement.currentProgress / achievement.requirement) * 100} 
                                className="h-1" 
                              />
                            </div>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{achievement.description}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Progress: {achievement.currentProgress} / {achievement.requirement}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </CardContent>
            </Card>
            
            {(gameStatus === 'playing' || gameStatus === 'gameover') && (
              <Card className="bg-crypto-card border-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle>Game Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-800/50 p-2 rounded-lg">
                      <p className="text-gray-400 mb-1">Accuracy</p>
                      <p className="font-medium">{calculateAccuracy()}</p>
                    </div>
                    <div className="bg-gray-800/50 p-2 rounded-lg">
                      <p className="text-gray-400 mb-1">Chickens Defeated</p>
                      <p className="font-medium">{metrics.chickensDefeated}</p>
                    </div>
                    <div className="bg-gray-800/50 p-2 rounded-lg">
                      <p className="text-gray-400 mb-1">Power-ups Used</p>
                      <p className="font-medium">{metrics.powerUpsCollected}</p>
                    </div>
                    <div className="bg-gray-800/50 p-2 rounded-lg">
                      <p className="text-gray-400 mb-1">Longest Combo</p>
                      <p className="font-medium">x{metrics.longestCombo}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Card className="bg-crypto-card border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle>How to Play</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <p className="font-medium">Movement:</p>
                  <p className="text-gray-400">Use arrow keys or touch the sides of the screen to move.</p>
                </div>
                <div>
                  <p className="font-medium">Shooting:</p>
                  <p className="text-gray-400">Press space bar, up arrow or touch the middle of the screen to shoot.</p>
                </div>
                <div>
                  <p className="font-medium">Power-ups:</p>
                  <p className="text-gray-400">Collect power-ups dropped by defeated chickens to gain temporary advantages.</p>
                </div>
                <div>
                  <p className="font-medium">Objective:</p>
                  <p className="text-gray-400">Defeat all chickens in each wave to progress to the next level and earn PEBL rewards.</p>
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

