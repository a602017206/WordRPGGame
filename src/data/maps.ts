import type { GameMap, NPC, Quest } from '../types'

/**
 * 地图数据
 */
export const MAPS: GameMap[] = [
  {
    id: 'map_forest_1',
    name: '迷雾森林',
    description: '被古老魔法笼罩的神秘森林，栖息着各种奇幻生物',
    theme: 'forest',
    difficulty: 'easy',
    icon: '🌲',
    requiredLevel: 1,
    requiredQuests: [],
    bossId: 'enemy_ancient_treant',
    npcs: [
      {
        id: 'npc_forest_elder',
        name: '森林长老',
        description: '守护森林的智慧长者',
        type: 'quest_giver',
        icon: '👴',
        dialogues: [
          '欢迎来到迷雾森林，年轻的冒险者。',
          '这片森林中隐藏着许多秘密，小心那些潜伏的危险。',
          '如果你能帮我解决一个问题，我会给你丰厚的奖励。'
        ],
        quests: ['quest_kill_goblins', 'quest_collect_herbs']
      }
    ],
    monsters: ['enemy_goblin', 'enemy_wolf', 'enemy_spider'],
    rewards: {
      experience: 100,
      gold: 50,
      items: [
        { itemId: 'item_health_potion', quantity: 3 },
        { itemId: 'item_magic_stone', quantity: 1 }
      ]
    }
  },
  {
    id: 'map_desert_1',
    name: '炽热沙漠',
    description: '无边无际的沙漠，烈日炎炎，沙尘暴频繁',
    theme: 'desert',
    difficulty: 'medium',
    icon: '🏜️',
    requiredLevel: 5,
    requiredQuests: ['quest_kill_goblins'],
    bossId: 'enemy_desert_scorpion_king',
    npcs: [
      {
        id: 'npc_desert_merchant',
        name: '沙漠商人',
        description: '在沙漠中游走的神秘商人',
        type: 'merchant',
        icon: '👳',
        dialogues: [
          '欢迎来到沙漠，这里可不比森林安全。',
          '我这里有各种稀有物品，用你的金币来交换吧。',
          '小心沙漠中的流沙，那可是致命的陷阱。'
        ],
        quests: ['quest_collect_sand_crystals']
      }
    ],
    monsters: ['enemy_sand_scorpion', 'enemy_desert_bandit', 'enemy_mummy'],
    rewards: {
      experience: 250,
      gold: 120,
      items: [
        { itemId: 'item_magic_potion', quantity: 2 },
        { itemId: 'item_diamond', quantity: 1 }
      ]
    }
  },
  {
    id: 'map_mountain_1',
    name: '冰封山脉',
    description: '高耸入云的雪山，寒风刺骨，危机四伏',
    theme: 'ice',
    difficulty: 'hard',
    icon: '🏔️',
    requiredLevel: 10,
    requiredQuests: ['quest_collect_sand_crystals'],
    bossId: 'enemy_ice_dragon',
    npcs: [
      {
        id: 'npc_mountain_hermit',
        name: '雪山隐士',
        description: '在山顶修行多年的神秘隐士',
        type: 'trainer',
        icon: '🧘',
        dialogues: [
          '你能到达这里，说明你有一定的实力。',
          '山顶的冰龙是这片区域的霸主，小心应对。',
          '如果你能击败它，我会传授你一些战斗技巧。'
        ],
        quests: ['quest_defeat_ice_dragon']
      }
    ],
    monsters: ['enemy_ice_wolf', 'enemy_snow_golem', 'enemy_frost_elemental'],
    rewards: {
      experience: 500,
      gold: 250,
      items: [
        { itemId: 'item_skill_crystal', quantity: 1 },
        { itemId: 'item_legendary_weapon', quantity: 1 }
      ]
    }
  }
]

/**
 * NPC数据
 */
export const NPCS: NPC[] = [
  {
    id: 'npc_forest_elder',
    name: '森林长老',
    description: '守护森林的智慧长者',
    type: 'quest_giver',
    icon: '👴',
    dialogues: [
      '欢迎来到迷雾森林，年轻的冒险者。',
      '这片森林中隐藏着许多秘密，小心那些潜伏的危险。',
      '如果你能帮我解决一个问题，我会给你丰厚的奖励。'
    ],
    quests: ['quest_kill_goblins', 'quest_collect_herbs']
  },
  {
    id: 'npc_desert_merchant',
    name: '沙漠商人',
    description: '在沙漠中游走的神秘商人',
    type: 'merchant',
    icon: '👳',
    dialogues: [
      '欢迎来到沙漠，这里可不比森林安全。',
      '我这里有各种稀有物品，用你的金币来交换吧。',
      '小心沙漠中的流沙，那可是致命的陷阱。'
    ],
    quests: ['quest_collect_sand_crystals']
  },
  {
    id: 'npc_mountain_hermit',
    name: '雪山隐士',
    description: '在山顶修行多年的神秘隐士',
    type: 'trainer',
    icon: '🧘',
    dialogues: [
      '你能到达这里，说明你有一定的实力。',
      '山顶的冰龙是这片区域的霸主，小心应对。',
      '如果你能击败它，我会传授你一些战斗技巧。'
    ],
    quests: ['quest_defeat_ice_dragon']
  }
]

/**
 * 任务数据
 */
export const QUESTS: Quest[] = [
  {
    id: 'quest_kill_goblins',
    name: '清除哥布林',
    description: '森林中出现了大量哥布林，威胁着村民的安全',
    type: 'kill',
    objectives: [
      {
        type: 'kill',
        targetId: 'enemy_goblin',
        quantity: 10,
        description: '击败10只哥布林'
      }
    ],
    rewards: {
      experience: 50,
      gold: 30,
      items: [
        { itemId: 'item_health_potion', quantity: 2 }
      ]
    },
    requiredLevel: 1,
    requiredQuests: []
  },
  {
    id: 'quest_collect_herbs',
    name: '采集草药',
    description: '森林长老需要一些稀有草药来制作药剂',
    type: 'collect',
    objectives: [
      {
        type: 'collect',
        targetId: 'item_moonlight_herb',
        quantity: 5,
        description: '收集5株月光草'
      }
    ],
    rewards: {
      experience: 30,
      gold: 20,
      items: [
        { itemId: 'item_magic_potion', quantity: 1 }
      ]
    },
    requiredLevel: 1,
    requiredQuests: []
  },
  {
    id: 'quest_collect_sand_crystals',
    name: '收集沙晶',
    description: '沙漠商人需要沙晶来制作魔法道具',
    type: 'collect',
    objectives: [
      {
        type: 'collect',
        targetId: 'item_sand_crystal',
        quantity: 8,
        description: '收集8个沙晶'
      }
    ],
    rewards: {
      experience: 100,
      gold: 60,
      items: [
        { itemId: 'item_diamond', quantity: 2 }
      ]
    },
    requiredLevel: 5,
    requiredQuests: ['quest_kill_goblins']
  },
  {
    id: 'quest_defeat_ice_dragon',
    name: '击败冰龙',
    description: '雪山隐士请求你击败威胁山脉的冰龙',
    type: 'boss',
    objectives: [
      {
        type: 'boss',
        targetId: 'enemy_ice_dragon',
        quantity: 1,
        description: '击败冰龙'
      }
    ],
    rewards: {
      experience: 300,
      gold: 150,
      items: [
        { itemId: 'item_skill_crystal', quantity: 1 },
        { itemId: 'item_legendary_weapon', quantity: 1 }
      ]
    },
    requiredLevel: 10,
    requiredQuests: ['quest_collect_sand_crystals']
  }
]