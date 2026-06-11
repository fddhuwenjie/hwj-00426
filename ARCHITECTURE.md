# 3D 太空射击游戏 — 架构文档

## 1）架构总览

### 模块依赖关系图（ASCII）

```
                              ┌─────────────────────────────────────────────────┐
                              │                   App.tsx                       │
                              │  根组件：根据 gameState 切换屏幕，管理菜单导航    │
                              │              src/App.tsx                        │
                              └──────────┬──────────────────┬──────────────────┘
                                         │                  │
                         ┌───────────────┘                  └───────────────┐
                         │ gameState                                         │ gameState
                         ▼                                                   ▼
          ┌──────────────────────────┐                      ┌──────────────────────────┐
          │   StartScreen.tsx       │                      │  GameOverScreen.tsx      │
          │  开始界面，显示操作说明   │                      │  游戏结束，显示分数/重开   │
          │  src/components/        │                      │  src/components/         │
          │    StartScreen.tsx      │                      │    GameOverScreen.tsx     │
          └──────────┬──────────────┘                      └──────────────────────────┘
                     │ onShowAchievements/onShowLeaderboard            │ resetGame/setGameState
                     ▼                                                  │
      ┌───────────────────────────┐    ┌───────────────────────────┐   │
      │ AchievementsScreen.tsx    │    │  LeaderboardScreen.tsx    │   │
      │ 成就列表界面              │    │  排行榜界面               │   │
      │ src/components/           │    │  src/components/          │   │
      │   AchievementsScreen.tsx  │    │    LeaderboardScreen.tsx  │   │
      └───────────────────────────┘    └───────────────────────────┘   │
                                                                      │
         ┌────────────────────────────────────────────────────────────┘
         │ gameState === 'playing' || 'gameover'
         ▼
  ┌──────────────────────────────────────────────────────────────────────────┐
  │                            Game.tsx                                      │
  │  游戏主组件：初始化 Three.js 场景，驱动 requestAnimationFrame 主循环       │
  │  协调所有游戏子系统的创建、更新与销毁                                      │
  │                       src/components/Game.tsx                            │
  └──┬──────┬──────┬──────┬──────┬──────┬──────┬────────────────────────────┘
     │      │      │      │      │      │      │
     ▼      ▼      ▼      ▼      ▼      ▼      ▼
 ┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐┌──────────┐┌────────────────┐
 │Player││Enemy ││Bullet││PowerUp││Parti ││Wave      ││Collision       │
 │Ship  ││Facto ││Manag ││Manag  ││cleSys││Manager   ││Detector        │
 │      ││ry    ││er    ││er     ││tem   ││          ││                │
 └──┬───┘└──┬───┘└──┬───┘└──┬───┘└──┬───┘└────┬─────┘└───────┬────────┘
    │       │       │       │       │         │              │
    │       │       │       │       │         │              │
    │  玩家飞船   敌人工厂  子弹管理  道具管理  粒子系统  波次管理     碰撞检测
    │  移动/渲染  创建/更新 创建/更新 创建/收集 爆炸/星空  波次状态机   球体碰撞判定
    │  src/game/  src/game/ src/game/ src/game/ src/game/  src/game/    src/game/
    │  PlayerShip Enemy.ts  Bullet.ts PowerUp.ts Particle   WaveManager Collision
    │  .ts                 .ts       .ts       System.ts   .ts         Detector.ts
    │                                                             .ts
    └──────────────────────────┬───────────────────────────────────┘
                               │ 所有子系统通过 useGameStore 同步状态
                               ▼
                ┌──────────────────────────────────────┐
                │          useGameStore (Zustand)       │
                │  全局状态管理：玩家/分数/波次/成就/道具  │
                │  src/store/useGameStore.ts            │
                └──────────────┬───────────────────────┘
                               │ 状态变更驱动 UI 重渲染
              ┌────────────────┼─────────────────────────┐
              ▼                ▼                         ▼
   ┌──────────────┐  ┌──────────────┐          ┌──────────────┐
   │   HUD.tsx    │  │  Minimap.tsx │          │ WeaponPanel  │
   │  主HUD：血量 │  │  小地图：敌  │          │  武器面板：  │
   │  /分数/波次  │  │  人/道具位置 │          │  切换/冷却   │
   │  src/comp/   │  │  src/comp/   │          │  src/comp/   │
   │  HUD.tsx     │  │  Minimap.tsx │          │  WeaponPanel │
   └──┬───┬───┬──┘  └──────────────┘          └──────────────┘
      │   │   │
      ▼   ▼   ▼
 ┌────────┐┌──────────┐┌──────────────┐┌──────────────┐
 │Energy  ││Screen    ││Achievement   ││  Screen      │
 │Bar.tsx ││EffectLay ││Toasts.tsx    ││  EffectLayer │
 │能量条  ││er.tsx    ││成就弹窗通知  ││  屏幕特效    │
 │src/comp││屏幕特效  ││src/comp/     ││  src/comp/   │
 │/Energy ││src/comp/ ││Achievement   ││  ScreenEffect│
 │Bar.tsx ││ScreenEff ││Toasts.tsx    ││  Layer.tsx   │
 └────────┘│ectLayer  │└──────────────┘└──────────────┘
           │.tsx      │
           └──────────┘

  ┌──────────────────────────────────────┐
  │         utils/storage.ts             │
  │  localStorage 持久化：高分/成就/排行  │
  │  src/utils/storage.ts                │
  └──────────────────────────────────────┘
         ▲         ▲          ▲
         │         │          │
    useGameStore  useGameStore  useGameStore
    (高分存取)    (成就存取)    (排行榜存取)
```

### 数据流向总结

| 数据流向 | 方向 | 说明 |
|---------|------|------|
| Game.tsx → useGameStore | 写入 | 每帧通过 `addScore`/`updatePlayer`/`setWave` 等 action 同步游戏状态到 store |
| useGameStore → HUD/Minimap/WeaponPanel/EnergyBar | 读取 | UI 组件通过 `useGameStore()` 订阅状态，Zustand 自动触发重渲染 |
| Game.tsx → PlayerShip/EnemyFactory/BulletManager/... | 调用 | Game.tsx 持有各子系统实例的 ref，在主循环中调用其 `update()` 方法 |
| CollisionDetector ← Game.tsx | 静态调用 | `CollisionDetector` 为纯静态工具类，由 Game.tsx 在碰撞阶段调用 |
| WaveManager → Game.tsx | 返回结果 | `waveManager.update(now)` 返回 `{shouldSpawn, enemyType, isWaveComplete, isBreakComplete}` |
| useGameStore → storage.ts | 读写 | 成就解锁/高分/排行榜通过 localStorage 持久化 |
| App.tsx → useGameStore | 读写 | `gameState` 驱动屏幕切换，`menuScreen` 驱动子菜单切换 |

### 各模块职责与文件路径

| 模块 | 职责 | 文件路径 |
|------|------|---------|
| App.tsx | 根组件，根据 gameState 切换 Start/Playing/GameOver/成就/排行榜屏幕 | src/App.tsx |
| Game.tsx | 游戏主组件，初始化 Three.js 场景并驱动 requestAnimationFrame 主循环 | src/components/Game.tsx |
| PlayerShip | 玩家飞船：处理键盘/鼠标输入，更新位置与旋转，提供射击位置和碰撞半径 | src/game/PlayerShip.ts |
| EnemyFactory | 敌人工厂：创建/更新/伤害/移除敌人，管理敌人 3D 网格与行为 | src/game/Enemy.ts |
| BulletManager | 子弹管理器：创建玩家子弹/散射弹/导弹/敌人子弹，更新子弹物理与导弹追踪 | src/game/Bullet.ts |
| PowerUpManager | 道具管理器：创建/更新/收集/移除道具，判断掉落概率与随机类型 | src/game/PowerUp.ts |
| ParticleSystem | 粒子系统：创建爆炸特效粒子，管理星空背景，更新粒子生命周期 | src/game/ParticleSystem.ts |
| WaveManager | 波次管理器：控制波次状态机（战斗→间歇→下一波），计算敌人生成与难度递增 | src/game/WaveManager.ts |
| CollisionDetector | 碰撞检测器：纯静态工具类，提供球体碰撞检测方法 | src/game/CollisionDetector.ts |
| useGameStore | Zustand 全局状态：玩家/分数/波次/成就/排行榜/小地图数据 | src/store/useGameStore.ts |
| HUD | 主抬头显示：血量、分数、波次信息、增益状态、操作提示 | src/components/HUD.tsx |
| StartScreen | 开始界面：标题、开始按钮、操作说明、道具说明 | src/components/StartScreen.tsx |
| GameOverScreen | 游戏结束界面：最终分数、波次、最高分、重玩/返回主菜单 | src/components/GameOverScreen.tsx |
| WeaponPanel | 武器面板：显示当前武器、切换快捷键、导弹冷却状态 | src/components/WeaponPanel.tsx |
| Minimap | 小地图：以玩家为中心显示敌人/道具位置，屏幕边缘指示器 | src/components/Minimap.tsx |
| EnergyBar | 能量条：显示终极技能能量进度，满能量时提示按 Q 释放 | src/components/EnergyBar.tsx |
| AchievementToasts | 成就弹窗：解锁成就时显示动画通知，3 秒后自动消失 | src/components/AchievementToasts.tsx |
| ScreenEffectLayer | 屏幕特效层：闪白/红光警告/Boss 警告等全屏视觉效果 | src/components/ScreenEffectLayer.tsx |
| AchievementsScreen | 成就界面：展示所有成就的解锁状态和详情 | src/components/AchievementsScreen.tsx |
| LeaderboardScreen | 排行榜界面：展示 Top 10 历史分数记录 | src/components/LeaderboardScreen.tsx |
| storage.ts | 持久化工具：localStorage 读写高分/成就/排行榜/总击杀 | src/utils/storage.ts |
| config.ts | 游戏配置常量：速度/伤害/冷却/波次/敌人属性/成就定义 | src/game/config.ts |
| types.ts | TypeScript 类型定义：所有游戏数据接口与类型 | src/game/types.ts |

---

## 2）游戏循环与帧更新机制

### 主循环入口

Game.tsx 中通过 `useEffect`（依赖 `gameState`）在 `gameState === 'playing'` 时启动 `requestAnimationFrame` 主循环：

```
animationFrameRef.current = requestAnimationFrame(animate);
```

当 `gameState` 不为 `'playing'` 时，`animate` 函数内部检查并停止递归调用：

```
if (useGameStore.getState().gameState === 'playing') {
    animationFrameRef.current = requestAnimationFrame(animate);
}
```

### 每帧更新顺序

`animate(currentTime: number)` 函数中，各子系统的更新严格按照以下顺序执行：

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Step 1: 时间与特效过期检查                                                    │
│   - deltaTime = (currentTime - lastTime) / 16.67  (未直接使用)               │
│   - lastTime = currentTime                                                   │
│   - 检查 screenEffect 是否过期 → setScreenEffect(null)                       │
│   - 检查 fireRateBoost 是否过期 → updatePlayer({fireRateBoost: false})       │
│   - 检查 scatterBoost 是否过期 → updatePlayer({scatterBoost: false})         │
│                                                                              │
│   函数: setScreenEffect(), updatePlayer()                                    │
│   参数: effect.startTime + effect.duration vs now                            │
├──────────────────────────────────────────────────────────────────────────────┤
│ Step 2: 玩家输入处理 + 物理更新                                               │
│   - playerShip.update(keysRef.current, mouseRef.current.x, mouseRef.current.y)│
│     → 读取键盘 Set 和鼠标坐标，计算位移 dx/dy                                 │
│     → position.clamp(-BOUNDARY, +BOUNDARY)                                   │
│     → rotation.lerp(targetRotation, 0.1)                                     │
│     → mesh.position/rotation 同步                                             │
│   - 相机跟随: camera.position.lerp(targetCameraPos, 0.05)                    │
│   - 屏幕震动: shakeOffset 叠加到相机位置                                      │
│   - 射击处理: isShootingRef + cooldown → createPlayerBullet/createScatterBullets│
│                                                                              │
│   函数: PlayerShip.update(keys, mouseX, mouseY)                              │
│   参数: keys=Set<string>, mouseX/y=归一化鼠标坐标 [-1,1]                     │
├──────────────────────────────────────────────────────────────────────────────┤
│ Step 3: 波次管理 + 敌人生成                                                   │
│   - waveManager.update(now) → {shouldSpawn, enemyType, isWaveComplete,       │
│     isBreakComplete}                                                         │
│   - isBreakComplete → registerWaveComplete() → startWave(nextWave)           │
│   - isWaveComplete → startBreak() → 清除敌方子弹                              │
│   - shouldSpawn → enemyFactory.createEnemy(enemyType, wave)                  │
│   - Boss 特殊处理: setBossWarning + screenEffect + shake                     │
│   - setWaveTimer(waveManager.getRemainingTimeInWave(now))                    │
│                                                                              │
│   函数: WaveManager.update(now), EnemyFactory.createEnemy(type, wave)        │
│   参数: now=Date.now(), type=EnemyType, wave=number                          │
├──────────────────────────────────────────────────────────────────────────────┤
│ Step 4: 敌人更新 + 敌人射击                                                   │
│   - 遍历 enemiesRef.current:                                                 │
│     - enemyFactory.updateEnemy(enemy, playerShip.position)                   │
│       → position.add(velocity) + 向玩家微偏移 + mesh同步 + lookAt            │
│       → 超出 z>5 返回 true(应移除)                                           │
│     - enemyFactory.shouldShoot(enemy, now)                                   │
│       → bulletManager.createEnemyBullet(enemy.pos, playerShip.pos)           │
│   - 移除越界敌人                                                              │
│                                                                              │
│   函数: EnemyFactory.updateEnemy(enemy, playerPos),                           │
│         EnemyFactory.shouldShoot(enemy, now)                                 │
│   参数: enemy=EnemyData, playerPos=Vector3, now=number                       │
├──────────────────────────────────────────────────────────────────────────────┤
│ Step 5: 子弹更新（含导弹追踪）                                                 │
│   - bulletManager.update(enemiesRef.current)                                 │
│     → 遍历所有子弹: position.add(velocity)                                    │
│     → 导弹特殊逻辑: 寻找目标 → 计算追踪方向 → velocity.lerp                  │
│     → 导弹尾焰粒子: spawnMissileTrail + updateTrailParticles                 │
│     → 越界检测 → removeBullet                                                │
│                                                                              │
│   函数: BulletManager.update(enemies)                                        │
│   参数: enemies=EnemyData[]                                                  │
├──────────────────────────────────────────────────────────────────────────────┤
│ Step 6: 道具更新 + 收集检测                                                    │
│   - powerUpManager.update(playerShip.position) → collectedPowerUp | null     │
│     → 道具旋转动画 + z轴漂移 + 距离检测(distance < 2)                        │
│   - 收集后: handlePowerUpCollection() → 更新玩家状态                          │
│   - registerPowerUpCollected(type)                                           │
│   - particleSystem.createExplosion(position, 0x00ff00, 15)                   │
│                                                                              │
│   函数: PowerUpManager.update(playerPos)                                     │
│   参数: playerPos=Vector3                                                    │
├──────────────────────────────────────────────────────────────────────────────┤
│ Step 7: 粒子系统更新                                                          │
│   - particleSystem.update()                                                  │
│     → 粒子: position.add(velocity), life--, opacity/scale 衰减, 移除死亡粒子  │
│     → 星空: rotation.z += 0.0002, z轴漂移(循环)                              │
│                                                                              │
│   函数: ParticleSystem.update()                                              │
│   参数: 无                                                                   │
├──────────────────────────────────────────────────────────────────────────────┤
│ Step 8: 碰撞检测                                                              │
│   8a. 玩家子弹 vs 敌人:                                                       │
│     - 遍历 bullets (isPlayerBullet) × enemies                                │
│     - CollisionDetector.checkBulletEnemyCollision(bullet, enemy)             │
│     - 命中 → damage(enemy, bullet.damage) → 击杀则爆炸+加分+掉落+成就        │
│     - 移除子弹（导弹命中也移除）                                               │
│                                                                              │
│   8b. 敌人子弹 vs 玩家:                                                       │
│     - 遍历 bullets (!isPlayerBullet)                                         │
│     - CollisionDetector.checkBulletPlayerCollision(bullet, playerPos, radius)│
│     - 命中 → handlePlayerHit() → 护盾/扣血/游戏结束                          │
│                                                                              │
│   8c. 敌人 vs 玩家（撞击）:                                                    │
│     - 遍历 enemies                                                           │
│     - CollisionDetector.checkEnemyPlayerCollision(enemy, playerPos, radius)  │
│     - 碰撞 → 爆炸 + handlePlayerHit() + 移除敌人                              │
│                                                                              │
│   函数: CollisionDetector.checkBulletEnemyCollision(bullet, enemy)           │
│         CollisionDetector.checkBulletPlayerCollision(bullet, pos, radius)    │
│         CollisionDetector.checkEnemyPlayerCollision(enemy, pos, radius)      │
│   参数: bullet=BulletData, enemy=EnemyData, pos=Vector3, radius=number      │
├──────────────────────────────────────────────────────────────────────────────┤
│ Step 9: 状态同步（小地图数据）                                                  │
│   - 构建小地图敌人数据: mmEnemies = [{id, x, y, type}]                       │
│   - 构建小地图道具数据: mmPowerUps = [{id, x, y, type}]                      │
│   - 构建屏幕边缘指示器: indicators = [{id, angle, isBoss}]                    │
│   - updateMinimapData(playerX, playerY, mmEnemies, mmPowerUps, indicators)  │
│                                                                              │
│   函数: useGameStore.updateMinimapData()                                     │
│   参数: playerX/Y=number, enemies/powerUps/indicators 数组                   │
├──────────────────────────────────────────────────────────────────────────────┤
│ Step 10: 渲染                                                                 │
│   - renderer.render(scene, camera)                                           │
│   - 递归 requestAnimationFrame(animate) (仅当 gameState === 'playing')       │
│                                                                              │
│   函数: THREE.WebGLRenderer.render(scene, camera)                            │
└──────────────────────────────────────────────────────────────────────────────┘
```

### WaveManager 波次状态机

WaveManager 内部维护两个核心状态变量：`isBreak`（是否在间歇期）和隐含的"战斗中"状态（`!isBreak && enemiesSpawned < totalEnemiesThisWave`）。

```
                         startWave(n)
                              │
                              ▼
                    ┌───────────────────┐
                    │    战斗状态        │
                    │  (isBreak = false) │
                    │                    │
                    │  - 按间隔生成敌人   │
                    │  - 累计 enemiesSpawned│
                    │  - 倒计时 WAVE_DURATION│
                    └─────┬───────┬─────┘
                          │       │
          waveElapsed >   │       │  enemiesSpawned >=
          WAVE_DURATION   │       │  totalEnemiesThisWave
                          │       │ 且 waveElapsed > WAVE_DURATION
                          ▼       │
                    ┌─────────────┐│
                    │ 波次完成     ││
                    │(isWaveComplete││
                    │  = true)     ││
                    └──────┬──────┘│
                           │       │
              startBreak() │       │
                           ▼       │
                    ┌───────────────────┐
                    │    间歇状态        │
                    │  (isBreak = true)  │
                    │                    │
                    │  - 倒计时           │◄─── Game.tsx 在此时
                    │    WAVE_BREAK_     │     清除所有敌方子弹
                    │    DURATION        │
                    │  (5000ms)          │
                    └──────┬────────────┘
                           │
          now - breakStartTime >
          WAVE_BREAK_DURATION
                           │
                           ▼
                    ┌───────────────────┐
                    │  间歇结束          │
                    │(isBreakComplete    │
                    │  = true)           │
                    └──────┬────────────┘
                           │
          Game.tsx 处理:    │
          registerWaveComplete()
          startWave(n+1)   │
                           ▼
                    ┌───────────────────┐
                    │  下一波战斗        │
                    │  wave = n + 1      │
                    │  敌人数 = 5+(n)*2  │
                    │  生成间隔递减       │
                    └───────────────────┘
```

**状态转移图（ASCII）：**

```
                      startWave(n)
                          │
                          ▼
               ┌─────────────────────┐
               │                     │
               │   战斗 (FIGHTING)   │──── waveElapsed > 30000ms ───┐
               │                     │                               │
               │  · 生成敌人          │                               │
               │  · enemiesSpawned++ │                               │
               │  · 倒计时30s         │                               │
               │                     │                               │
               └─────────────────────┘                               │
                          │                                          │
                          │ isWaveComplete = true                    │
                          │ → Game.tsx 调用 startBreak()             │
                          │ → 清除敌方子弹                            │
                          ▼                                          │
               ┌─────────────────────┐                               │
               │                     │                               │
               │  间歇 (BREAK)       │◄──────────────────────────────┘
               │                     │     (同一路径：战斗时间到→间歇)
               │  · 倒计时5s          │
               │  · 无敌人生成         │
               │  · isBreak = true    │
               │                     │
               └─────────┬───────────┘
                         │
                         │ breakElapsed > 5000ms
                         │ isBreakComplete = true
                         │ → Game.tsx 调用:
                         │   registerWaveComplete()
                         │   startWave(n+1)
                         ▼
               ┌─────────────────────┐
               │                     │
               │  下一波 (NEXT WAVE)  │─────► 回到 战斗 (FIGHTING)
               │                     │
               │  · wave += 1        │
               │  · 敌人数递增        │
               │  · 难度提升          │
               │                     │
               └─────────────────────┘
```

---

## 3）关键算法解析

### 算法一：碰撞检测算法（CollisionDetector）

**所在文件**：src/game/CollisionDetector.ts

**实现原理**：

CollisionDetector 采用**球体碰撞检测（Sphere Collision）**作为所有碰撞判定的基础。每个游戏实体（子弹、敌人、玩家）都被抽象为一个包围球（Bounding Sphere），碰撞判定转化为两个球心距离与半径之和的比较。

**碰撞体类型与半径分配**：

| 实体 | 碰撞体 | 半径 |
|------|--------|------|
| 玩家子弹（laser/scatter） | 球体 | 0.5 |
| 敌人子弹 | 球体 | 0.3 |
| 玩家飞船 | 球体 | 1.2（由 `getBoundingRadius()` 返回） |
| small 敌人 | 球体 | 0.8 |
| medium 敌人 | 球体 | 1.2 |
| boss 敌人 | 球体 | 2.5 |

**优化策略**：

1. **球体碰撞的 O(1) 判定**：相比 AABB 或 OBB，球体碰撞只需一次距离计算和一次比较，计算量最小
2. **early-return 优化**：`checkBulletPlayerCollision` 中，如果 `bullet.isPlayerBullet` 为 true，立即返回 false，跳过不相关的碰撞对
3. **外层循环的倒序遍历**：Game.tsx 中的碰撞循环采用 `for (i = length - 1; i >= 0; i--)`，当需要 splice 移除元素时不会影响未遍历的索引
4. **break 跳出内层**：玩家子弹命中敌人后立即 `break`，避免一颗子弹同时命中多个敌人（导弹除外，但导弹也在命中后移除）

**伪代码**：

```
FUNCTION checkSphereCollision(pos1, radius1, pos2, radius2):
    distance = pos1.distanceTo(pos2)     // 三维欧氏距离
    RETURN distance < (radius1 + radius2) // 两球相交即碰撞

FUNCTION checkBulletEnemyCollision(bullet, enemy):
    bulletRadius = bullet.isPlayerBullet ? 0.5 : 0.3
    enemyRadius  = enemy.type == 'boss'   ? 2.5
                 : enemy.type == 'medium' ? 1.2
                 :                          0.8
    RETURN checkSphereCollision(bullet.position, bulletRadius,
                                enemy.position, enemyRadius)

FUNCTION checkBulletPlayerCollision(bullet, playerPos, playerRadius):
    IF bullet.isPlayerBullet:
        RETURN false                       // 玩家子弹不碰撞玩家
    bulletRadius = 0.3
    RETURN checkSphereCollision(bullet.position, bulletRadius,
                                playerPos, playerRadius)

FUNCTION checkEnemyPlayerCollision(enemy, playerPos, playerRadius):
    enemyRadius = enemy.type == 'boss'   ? 2.5
                : enemy.type == 'medium' ? 1.2
                :                          0.8
    RETURN checkSphereCollision(enemy.position, enemyRadius,
                                playerPos, playerRadius)
```

---

### 算法二：导弹追踪算法（Missile Tracking）

**所在文件**：src/game/Bullet.ts（BulletManager.update 方法，第 277-313 行）

**实现原理**：

导弹追踪采用**比例导引法（Proportional Navigation）的简化版本**，核心思想是在每帧将导弹的当前速度向量向"期望方向"（指向目标的方向）进行插值（lerp），插值系数 `MISSILE_TRACKING_STRENGTH = 0.05` 即为转向速率限制。

**目标选择策略**：

1. **初始锁定**：导弹创建时（`createMissile`），遍历所有存活敌人，选择距离最近的敌人作为初始目标，记录其 `targetId`
2. **持续追踪**：每帧 update 时，优先查找 `targetId` 对应的敌人是否仍存活
3. **目标丢失重锁**：若原目标已不存在（被击杀/移除），重新遍历所有敌人选择最近的作为新目标，并更新 `targetId`
4. **无目标直飞**：若场上无敌人，导弹保持当前速度方向直飞

**转向速率限制**：

通过 `velocity.lerp(desiredDir × MISSILE_SPEED, MISSILE_TRACKING_STRENGTH)` 实现：
- `lerp` 系数为 0.05，意味着每帧只将当前速度的 5% 向期望方向调整
- 这使得导弹不会瞬间转向目标，而是呈现平滑的弧线追踪轨迹
- 追踪强度越大（接近 1），导弹越灵活；越小（接近 0），导弹越"迟钝"

**伪代码**：

```
FUNCTION updateMissile(bullet, enemies):
    // Step 1: 目标选择
    target = NULL
    
    IF bullet.targetId != NULL:
        target = enemies.find(e => e.id == bullet.targetId)
    
    IF target == NULL:  // 原目标丢失，重新锁定最近敌人
        minDist = INFINITY
        FOR EACH enemy IN enemies:
            d = bullet.position.distanceTo(enemy.position)
            IF d < minDist:
                minDist = d
                target = enemy
        IF target != NULL:
            bullet.targetId = target.id  // 更新锁定目标
    
    // Step 2: 计算期望方向并插值（转向速率限制）
    IF target != NULL:
        desiredDirection = (target.position - bullet.position).normalize()
        desiredVelocity  = desiredDirection × MISSILE_SPEED  // = 0.5
        bullet.velocity.lerp(desiredVelocity, 0.05)          // 每帧5%偏转
    
    // Step 3: 更新位置与朝向
    bullet.position.add(bullet.velocity)
    bullet.mesh.lookAt(bullet.position + bullet.velocity.normalize())
    
    // Step 4: 生成尾焰粒子
    spawnMissileTrail(bullet)     // 每帧生成2个粒子
    updateTrailParticles(bullet)  // 更新已有粒子的生命与透明度
```

**导弹创建时的初始锁定伪代码**（createMissile）：

```
FUNCTION createMissile(position, enemies):
    targetEnemy = NULL
    minDist = INFINITY
    FOR EACH enemy IN enemies:
        dist = position.distanceTo(enemy.position)
        IF dist < minDist:
            minDist = dist
            targetEnemy = enemy
    
    bullet.targetId = targetEnemy?.id   // 绑定最近目标ID
    bullet.velocity = Vector3(0, 0, -1) × MISSILE_SPEED  // 初始向前飞行
```

---

### 算法三：敌人生成算法（WaveManager）

**所在文件**：src/game/WaveManager.ts

**实现原理**：

WaveManager 通过三个维度的参数递增来控制波次难度：

1. **敌人总数递增**：`totalEnemies = 5 + (wave - 1) × 2`
2. **生成间隔递减**：`interval = max(500, 2000 - (wave - 1) × 100)` ms
3. **敌人类型权重变化**：波次3起中等敌人出现概率30%，每5波最后一个敌人必定为Boss

**难度递增计算**：

| 波次 | 敌人总数 | 生成间隔(ms) | 中等敌人概率 | Boss出现 |
|------|---------|-------------|------------|---------|
| 1 | 5 | 2000 | 0% | 否 |
| 2 | 7 | 1900 | 0% | 否 |
| 3 | 9 | 1800 | 30% | 否 |
| 4 | 11 | 1700 | 30% | 否 |
| 5 | 13 | 1600 | 30% | 是（最后一个） |
| 6 | 15 | 1500 | 30% | 否 |
| ... | ... | ... | ... | ... |
| 10 | 23 | 1100 | 30% | 是（最后一个） |

此外，EnemyFactory.createEnemy 中还有额外的难度缩放：
- `speedMultiplier = 1 + (wave - 1) × 0.1`：敌人速度随波次增加10%
- `fireRate / speedMultiplier`：敌人射击间隔随波次缩短

**伪代码**：

```
FUNCTION calculateTotalEnemies(wave):
    RETURN 5 + (wave - 1) × 2

FUNCTION calculateSpawnInterval(wave):
    baseInterval = 2000     // 基础间隔 2 秒
    minInterval  = 500      // 最小间隔 0.5 秒
    reduction = (wave - 1) × 100
    RETURN max(minInterval, baseInterval - reduction)

FUNCTION getEnemyTypeToSpawn(wave, enemiesSpawned, totalEnemies):
    // Boss 规则：每5波的最后一个敌人必定为Boss
    IF wave % 5 == 0 AND enemiesSpawned == totalEnemies - 1:
        RETURN 'boss'
    
    // 中等敌人规则：波次3起，30%概率
    rand = random()  // [0, 1)
    IF wave >= 3 AND rand < 0.3:
        RETURN 'medium'
    
    // 默认小型敌人
    RETURN 'small'

FUNCTION update(now):
    // 间歇状态处理
    IF isBreak:
        IF now - breakStartTime > WAVE_BREAK_DURATION:
            RETURN {isBreakComplete: true}
        RETURN {}
    
    // 战斗时间到
    IF now - waveStartTime > WAVE_DURATION:
        RETURN {isWaveComplete: true}
    
    // 敌人生成
    IF enemiesSpawned < totalEnemiesThisWave:
        spawnInterval = calculateSpawnInterval(currentWave)
        IF now - lastSpawnTime > spawnInterval:
            enemyType = getEnemyTypeToSpawn(currentWave, enemiesSpawned, totalEnemiesThisWave)
            lastSpawnTime = now
            enemiesSpawned++
            RETURN {shouldSpawn: true, enemyType: enemyType}
    
    RETURN {}
```

**EnemyFactory.createEnemy 中的难度缩放伪代码**：

```
FUNCTION createEnemy(type, wave):
    config = ENEMY_CONFIGS[type]           // 基础属性
    speedMultiplier = 1 + (wave - 1) × 0.1 // 速度倍率
    
    enemy.hp = config.hp
    enemy.velocity = Vector3(0, 0, config.speed × speedMultiplier)
    enemy.fireRate = config.fireRate / speedMultiplier  // 射速加快
    
    // 随机生成位置（远离玩家视野前方）
    enemy.position.x = (random() - 0.5) × 20
    enemy.position.y = (random() - 0.5) × 12
    enemy.position.z = -FIELD_DEPTH - random() × 10
    
    RETURN enemy
```

---

## 附录：技术栈与关键依赖

| 技术 | 用途 |
|------|------|
| React 18 + TypeScript | UI 框架与类型安全 |
| Three.js | 3D 渲染引擎（场景/相机/光照/网格） |
| Zustand | 轻量级全局状态管理 |
| Tailwind CSS | 原子化 CSS 样式 |
| lucide-react | 图标库 |
| Vite | 构建工具 |
| localStorage | 客户端持久化存储 |
