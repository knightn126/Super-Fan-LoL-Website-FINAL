// ============================================
// CONSTANTS & CONFIGURATION
// ============================================
const CANVAS_CONFIG = {
  GNAR_Y_OFFSET: 200,
  GNAR_WIDTH: 80,
  GNAR_HEIGHT: 80,
  DUMMY_X_OFFSET: 250,
  DUMMY_Y_OFFSET: 230,
  DUMMY_WIDTH: 60,
  DUMMY_HEIGHT: 100,
  GROUND_Y_OFFSET: 70,
  HOP_DISTANCE_OFFSET: 20,
};

const ANIMATION_CONFIG = {
  PROJECTILE_FRAME_RATE: 16,
  DAMAGE_NUMBER_FADE_RATE: 0.015,
  DAMAGE_NUMBER_RISE_SPEED: 2,
  COOLDOWN_UPDATE_INTERVAL: 100,
  HOP_DURATION_MINI: 400,
  HOP_DURATION_MEGA: 500,
  HOP_HEIGHT_MINI: 80,
  HOP_HEIGHT_MEGA: 100,
  BOUNCE_DURATION: 300,
};

const PROJECTILE_CONFIG = {
  BOOMERANG_SPEED: 10,
  BOOMERANG_SIZE: 8,
  BOOMERANG_COLOR: "#4169E1",
  BOULDER_SPEED: 6,
  BOULDER_SIZE: 20,
  BOULDER_COLOR: "#8B4513",
};

// ============================================
// DOM ELEMENT REFERENCES
// ============================================
const elements = {
  gnar: document.getElementById("gnar"),
  qAbility: document.getElementById("qAbility"),
  wAbility: document.getElementById("wAbility"),
  eAbility: document.getElementById("eAbility"),
  qImage: document.querySelector(".q img"),
  wImage: document.querySelector(".w img"),
  eImage: document.querySelector(".e img"),
  rImage: document.querySelector(".r img"),
  canvas: document.getElementById("gameCanvas"),
  allItems: document.querySelectorAll(".item"),
  inventorySlots: document.querySelectorAll(".inventory-slot"),
};

const ctx = elements.canvas.getContext("2d");

// ============================================
// GAME DATA
// ============================================
const gnarBaseStats = {
  baseAD: 59,
  baseHP: 580,
  baseArmor: 33,
  baseMR: 32,
  baseAS: 0.625,
  abilities: {
    miniQ: {
      name: "Boomerang Throw",
      baseDamage: [5, 45, 85, 125, 165],
      cooldown: 8,
      adScaling: 1.15,
      description: "Throws a boomerang",
    },
    miniW: {
      name: "Hyper",
      baseDamage: [10, 20, 30, 40, 50],
      cooldown: 5,
      adScaling: 1.0,
      msBonus: [30, 35, 40, 45, 50],
      description: "Gain movement speed",
    },
    miniE: {
      name: "Hop",
      baseDamage: [50, 85, 120, 155, 190],
      cooldown: 10,
      adScaling: 0.06,
      description: "Hop to a location",
    },
    megaQ: {
      name: "Boulder Toss",
      baseDamage: [25, 70, 115, 160, 205],
      cooldown: 7,
      adScaling: 1.2,
      description: "Throws a boulder",
    },
    megaW: {
      name: "Wallop",
      baseDamage: [25, 45, 65, 85, 105],
      cooldown: 5,
      adScaling: 1.0,
      description: "Stun nearby enemies",
    },
    megaE: {
      name: "Crunch",
      baseDamage: [50, 85, 120, 155, 190],
      cooldown: 10,
      adScaling: 0.06,
      description: "Jump and slow",
    },
  },
};

const itemStats = {
  "stride.png": { ad: 40, hp: 450, attackSpeed: 25 },
  "Gage.png": { hp: 400 },
  "boots.png": { armor: 40 },
  "sheild.png": { armor: 75, hp: 350 },
  "Spirit.png": { mr: 50, hp: 400, ah: 10 },
  "cleaver.png": { ad: 40, hp: 400, ah: 20 },
};

const itemData = {
  "stride.png": {
    name: "Stridebreaker",
    stats: "+40 Attack Damage<br>+25% Attack Speed<br>+450 Health",
    passive:
      "<strong>UNIQUE - CLEAVE:</strong> Basic attacks on-hit deal (40% AD / 20% AD) physical damage to other enemies in a 350 radius centered around the target.",
    active:
      "<strong>ACTIVE - BREAKING SHOCKWAVE:</strong> Deal 80% AD physical damage to enemies in a 450 radius centered around you and slow them by 35% for 3 seconds. For each champion hit, gain 35% bonus movement speed decaying over 3 seconds. Can move while casting (15 second cooldown).",
  },
  "Gage.png": {
    name: "Sterak's Gage",
    stats: "+400 Health<br>+20% Tenacity",
    passive:
      "<strong>UNIQUE - THE CLAWS THAT CATCH:</strong> Gain bonus attack damage equal to 45% base AD.<br><br><strong>UNIQUE - LIFELINE:</strong> If you would take damage that would reduce you below 30% of your maximum health, you first gain a shield that absorbs damage equal to 60% of bonus health which decays over 4.5 seconds (90 second cooldown).",
  },
  "boots.png": {
    name: "Plated Steelcaps",
    stats: "+40 Armor<br>+50 Movement Speed",
    passive:
      "<strong>UNIQUE - PLATING:</strong> Reduces all incoming basic damage by 10% (excluding from turret attacks).<br><br><strong>UNIQUE - NOXIAN ENDURANCE:</strong> Taking physical damage from champions grants you a shield that absorbs 10-120 (based on level) (+ 4% maximum health) physical damage for 4 seconds (15 second cooldown).",
  },
  "sheild.png": {
    name: "Randuin's Omen",
    stats: "+75 Armor<br>+350 Health",
    passive:
      "<strong>UNIQUE - RESILIENCE:</strong> Reduces incoming damage from critical strikes by 30%.",
    active:
      "<strong>ACTIVE - HUMILITY:</strong> Unleash a shockwave around you that slows nearby enemies by 70% for 2 seconds (90 second cooldown; 500 range).",
  },
  "Spirit.png": {
    name: "Spirit Visage",
    stats:
      "+10 Ability Haste<br>+50 Magic Resistance<br>+400 Health<br>+100% Base Health Regeneration",
    passive:
      "<strong>UNIQUE - BOUNDLESS VITALITY:</strong> Increases all healing and shielding received as well as health regeneration by 25%.",
  },
  "cleaver.png": {
    name: "Black Cleaver",
    stats: "+40 Attack Damage<br>+20 Ability Haste<br>+400 Health",
    passive:
      "<strong>UNIQUE - CARVE:</strong> Dealing physical damage to an enemy champion applies a stack of Carve for 6 seconds, stacking up to 5 times. Each stack inflicts 6% armor reduction, up to 30% at 5 stacks.<br><br><strong>UNIQUE - FERVOR:</strong> Dealing physical damage grants you 20 bonus movement speed for 2 seconds.",
  },
};

// ============================================
// GAME STATE
// ============================================
let abilityLevels = { q: 1, w: 1, e: 1 };
let inventory = { slot1: null, slot2: null, slot3: null };
let abilityCooldowns = {
  q: { ready: true, timeLeft: 0 },
  w: { ready: true, timeLeft: 0 },
  e: { ready: true, timeLeft: 0 },
  r: { ready: true, timeLeft: 0 },
};

let gameGnar = {
  x: 150,
  y: 0,
  width: CANVAS_CONFIG.GNAR_WIDTH,
  height: CANVAS_CONFIG.GNAR_HEIGHT,
  facingRight: true,
};

let testDummy = {
  x: 0,
  y: 0,
  width: CANVAS_CONFIG.DUMMY_WIDTH,
  height: CANVAS_CONFIG.DUMMY_HEIGHT,
  hp: 1000,
  maxHp: 1000,
};

let projectiles = [];
let damageNumbers = [];
let gnarImage = new Image();
let dummyImage = new Image();
let imagesLoaded = 0;

// ============================================
// TOOLTIP POPUP SYSTEM
// ============================================
const popup = document.createElement("div");
popup.style.cssText = `
  position: absolute;
  background-color: white;
  border: 2px solid black;
  padding: 10px;
  border-radius: 5px;
  display: none;
  z-index: 1000;
  max-width: 300px;
  pointer-events: none;
`;
document.body.appendChild(popup);

// ============================================
// UTILITY FUNCTIONS
// ============================================
function isMegaGnar() {
  return elements.gnar.src.includes("gnar-mega.png");
}

function calculateTotalStats() {
  const stats = {
    ad: gnarBaseStats.baseAD,
    hp: gnarBaseStats.baseHP,
    armor: gnarBaseStats.baseArmor,
    mr: gnarBaseStats.baseMR,
    ah: 0,
    attackSpeed: 0,
  };

  for (const slot in inventory) {
    const item = inventory[slot];
    if (item && itemStats[item]) {
      const itemStat = itemStats[item];
      stats.ad += itemStat.ad || 0;
      stats.hp += itemStat.hp || 0;
      stats.armor += itemStat.armor || 0;
      stats.mr += itemStat.mr || 0;
      stats.ah += itemStat.ah || 0;
      stats.attackSpeed += itemStat.attackSpeed || 0;
    }
  }

  return stats;
}

function calculateAbilityCooldown(baseCooldown, abilityHaste) {
  return (baseCooldown / (1 + abilityHaste / 100)).toFixed(1);
}

function calculateAbilityDamage(ability, level, totalAD) {
  const abilityData = gnarBaseStats.abilities[ability];
  const baseDamage = abilityData.baseDamage[level - 1];
  const scalingDamage = totalAD * abilityData.adScaling;
  return Math.round(baseDamage + scalingDamage);
}

function updateStats() {
  const stats = calculateTotalStats();

  document.getElementById("statAD").textContent = Math.round(stats.ad);
  document.getElementById("statHP").textContent = stats.hp;
  document.getElementById("statArmor").textContent = stats.armor;
  document.getElementById("statMR").textContent = stats.mr;
  document.getElementById("statAH").textContent = stats.ah;
  document.getElementById("statAS").textContent = stats.attackSpeed + "%";

  updateAbilityTooltips(stats);
}

function showDamage(damage, x, y) {
  damageNumbers.push({
    value: Math.round(damage),
    x: x || testDummy.x + testDummy.width / 2,
    y: y || testDummy.y + testDummy.height / 2,
    opacity: 1,
  });
}

// ============================================
// GNAR TRANSFORMATION
// ============================================
function evolve() {
  if (isMegaGnar()) {
    elements.gnar.src = "images/gnar-norm.png";
    elements.qAbility.src = "images/boomerang.png";
    elements.wAbility.src = "images/hyper.png";
    elements.eAbility.src = "images/hop.png";
    gnarImage.src = "images/gnar-norm.png";
  } else {
    elements.gnar.src = "images/gnar-mega.png";
    elements.qAbility.src = "images/bulder.png";
    elements.wAbility.src = "images/wallop.png";
    elements.eAbility.src = "images/crunch.png";
    gnarImage.src = "images/gnar-mega.png";
  }

  updateStats();
}

// ============================================
// TOOLTIP SYSTEM
// ============================================
function updateAbilityTooltips(stats) {
  const isMega = isMegaGnar();

  // Q Tooltip
  if (elements.qImage.hoverHandler) {
    elements.qImage.removeEventListener(
      "mouseenter",
      elements.qImage.hoverHandler
    );
  }
  elements.qImage.hoverHandler = function (event) {
    const abilityKey = isMega ? "megaQ" : "miniQ";
    const damage = calculateAbilityDamage(
      abilityKey,
      abilityLevels.q,
      stats.ad
    );
    const cooldown = calculateAbilityCooldown(
      gnarBaseStats.abilities[abilityKey].cooldown,
      stats.ah
    );

    popup.textContent = isMega
      ? `Q - Boulder Toss: ${damage} damage | ${cooldown}s cooldown`
      : `Q - Boomerang Throw: ${damage} damage | ${cooldown}s cooldown`;

    showPopup(event);
  };
  elements.qImage.addEventListener("mouseenter", elements.qImage.hoverHandler);

  // W Tooltip
  if (elements.wImage.hoverHandler) {
    elements.wImage.removeEventListener(
      "mouseenter",
      elements.wImage.hoverHandler
    );
  }
  elements.wImage.hoverHandler = function (event) {
    const abilityKey = isMega ? "megaW" : "miniW";
    const damage = calculateAbilityDamage(
      abilityKey,
      abilityLevels.w,
      stats.ad
    );
    const cooldown = calculateAbilityCooldown(
      gnarBaseStats.abilities[abilityKey].cooldown,
      stats.ah
    );

    if (isMega) {
      popup.textContent = `W - Wallop: ${damage} damage | ${cooldown}s cooldown`;
    } else {
      const msBonus =
        gnarBaseStats.abilities.miniW.msBonus[abilityLevels.w - 1];
      popup.textContent = `W - Hyper: ${damage} damage | ${cooldown}s cooldown | +${msBonus}% MS`;
    }

    showPopup(event);
  };
  elements.wImage.addEventListener("mouseenter", elements.wImage.hoverHandler);

  // E Tooltip
  if (elements.eImage.hoverHandler) {
    elements.eImage.removeEventListener(
      "mouseenter",
      elements.eImage.hoverHandler
    );
  }
  elements.eImage.hoverHandler = function (event) {
    const abilityKey = isMega ? "megaE" : "miniE";
    const damage = calculateAbilityDamage(
      abilityKey,
      abilityLevels.e,
      stats.ad
    );
    const cooldown = calculateAbilityCooldown(
      gnarBaseStats.abilities[abilityKey].cooldown,
      stats.ah
    );

    popup.textContent = isMega
      ? `E - Crunch: ${damage} damage | ${cooldown}s cooldown`
      : `E - Hop: ${damage} damage | ${cooldown}s cooldown`;

    showPopup(event);
  };
  elements.eImage.addEventListener("mouseenter", elements.eImage.hoverHandler);

  [elements.qImage, elements.wImage, elements.eImage].forEach((img) => {
    img.addEventListener("mouseleave", hidePopup);
  });
}

function showPopup(event) {
  popup.style.display = "block";
  popup.style.left =
    Math.min(event.pageX + 10, window.innerWidth - popup.offsetWidth - 20) +
    "px";
  popup.style.top =
    Math.min(event.pageY + 10, window.innerHeight - popup.offsetHeight - 20) +
    "px";
}

function hidePopup() {
  popup.style.display = "none";
}

elements.rImage.addEventListener("mouseenter", function (event) {
  popup.textContent =
    "R - GNAR!!!: Gnar pushes all enemies across the map a short distance!";
  showPopup(event);
});
elements.rImage.addEventListener("mouseleave", hidePopup);

// ============================================
// ITEM MODAL SYSTEM
// ============================================
const itemModal = document.createElement("div");
itemModal.className = "item-modal";
itemModal.innerHTML = `
  <div class="item-modal-content">
    <span class="close-modal">&times;</span>
    <div class="item-modal-header">
      <img class="item-modal-image" src="" alt="Item">
      <h2 class="item-modal-title"></h2>
    </div>
    <div class="item-modal-stats"></div>
    <div class="item-modal-passive"></div>
  </div>
`;
document.body.appendChild(itemModal);

elements.allItems.forEach(function (item) {
  item.addEventListener("click", function () {
    const imgSrc = item.src.split("/").pop();
    const data = itemData[imgSrc];

    if (data) {
      itemModal.querySelector(".item-modal-image").src = item.src;
      itemModal.querySelector(".item-modal-title").textContent = data.name;
      itemModal.querySelector(".item-modal-stats").innerHTML = data.stats;

      let passiveText = data.passive;
      if (data.active) {
        passiveText += "<br><br>" + data.active;
      }
      itemModal.querySelector(".item-modal-passive").innerHTML = passiveText;
      itemModal.style.display = "flex";
    }
  });
});

itemModal.querySelector(".close-modal").addEventListener("click", function () {
  itemModal.style.display = "none";
});

itemModal.addEventListener("click", function (e) {
  if (e.target === itemModal) {
    itemModal.style.display = "none";
  }
});

// ============================================
// INVENTORY SYSTEM
// ============================================
const validItems = [
  "stride.png",
  "Gage.png",
  "boots.png",
  "sheild.png",
  "Spirit.png",
  "cleaver.png",
];

elements.allItems.forEach(function (item) {
  item.setAttribute("draggable", "true");
  item.addEventListener("dragstart", function (e) {
    e.dataTransfer.setData("text/plain", item.src);
  });
});

elements.inventorySlots.forEach(function (slot) {
  slot.addEventListener("dragover", function (e) {
    e.preventDefault();
    slot.classList.add("drag-over");
  });

  slot.addEventListener("dragleave", function () {
    slot.classList.remove("drag-over");
  });

  slot.addEventListener("drop", function (e) {
    e.preventDefault();
    slot.classList.remove("drag-over");

    const imgSrc = e.dataTransfer.getData("text/plain");
    const filename = imgSrc.split("/").pop();
    const slotNum = slot.getAttribute("data-slot");

    if (!validItems.includes(filename)) {
      alert("You can only add items to inventory!");
      return;
    }

    for (const invSlot in inventory) {
      if (inventory[invSlot] === filename) {
        alert("You already have this item in your inventory!");
        return;
      }
    }

    const existingImg = slot.querySelector("img");
    if (existingImg) {
      existingImg.remove();
    }

    const newImg = document.createElement("img");
    newImg.src = imgSrc;
    newImg.alt = filename;
    slot.appendChild(newImg);
    slot.classList.add("filled");

    inventory["slot" + slotNum] = filename;
    updateStats();
  });

  slot.addEventListener("contextmenu", function (e) {
    e.preventDefault();
    const img = slot.querySelector("img");
    if (img) {
      img.remove();
      slot.classList.remove("filled");
      const slotNum = slot.getAttribute("data-slot");
      inventory["slot" + slotNum] = null;
      updateStats();
    }
  });
});

// ============================================
// CANVAS SETUP
// ============================================
function resizeCanvas() {
  elements.canvas.width = elements.canvas.offsetWidth;
  elements.canvas.height = elements.canvas.offsetHeight;

  gameGnar.y = elements.canvas.height - CANVAS_CONFIG.GNAR_Y_OFFSET;
  testDummy.x = elements.canvas.width - CANVAS_CONFIG.DUMMY_X_OFFSET;
  testDummy.y = elements.canvas.height - CANVAS_CONFIG.DUMMY_Y_OFFSET;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// ============================================
// ABILITY CASTING
// ============================================
function castQ() {
  if (!abilityCooldowns.q.ready) return;

  const stats = calculateTotalStats();
  const isMega = isMegaGnar();
  const abilityKey = isMega ? "megaQ" : "miniQ";
  const damage = calculateAbilityDamage(abilityKey, abilityLevels.q, stats.ad);
  const cooldown = parseFloat(
    calculateAbilityCooldown(
      gnarBaseStats.abilities[abilityKey].cooldown,
      stats.ah
    )
  );

  const projectile = {
    x: gameGnar.x + gameGnar.width,
    y: gameGnar.y + gameGnar.height / 2,
    speedY: 0,
    damage: damage,
  };

  if (isMega) {
    projectile.speedX = PROJECTILE_CONFIG.BOULDER_SPEED;
    projectile.size = PROJECTILE_CONFIG.BOULDER_SIZE;
    projectile.color = PROJECTILE_CONFIG.BOULDER_COLOR;
    projectile.type = "boulder";
  } else {
    projectile.speedX = PROJECTILE_CONFIG.BOOMERANG_SPEED;
    projectile.size = PROJECTILE_CONFIG.BOOMERANG_SIZE;
    projectile.color = PROJECTILE_CONFIG.BOOMERANG_COLOR;
    projectile.type = "boomerang";
  }

  projectiles.push(projectile);
  startCooldown("q", cooldown);
}

function castW() {
  if (!abilityCooldowns.w.ready) return;

  const stats = calculateTotalStats();
  const isMega = isMegaGnar();
  const abilityKey = isMega ? "megaW" : "miniW";
  const damage = calculateAbilityDamage(abilityKey, abilityLevels.w, stats.ad);
  const cooldown = parseFloat(
    calculateAbilityCooldown(
      gnarBaseStats.abilities[abilityKey].cooldown,
      stats.ah
    )
  );

  if (isMega) {
    const slamRadius = 120;
    let currentRadius = 0;

    const slamAnimation = setInterval(function () {
      currentRadius += 15;

      ctx.save();
      ctx.fillStyle = "rgba(255, 215, 0, 0.4)";
      ctx.strokeStyle = "rgba(255, 165, 0, 0.8)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(
        gameGnar.x + gameGnar.width / 2,
        gameGnar.y + gameGnar.height,
        currentRadius,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      if (currentRadius >= slamRadius) {
        clearInterval(slamAnimation);

        const distanceToDummy = Math.abs(
          testDummy.x + testDummy.width / 2 - (gameGnar.x + gameGnar.width / 2)
        );
        if (distanceToDummy <= slamRadius) {
          testDummy.hp = Math.max(0, testDummy.hp - damage);
          showDamage(damage);
        }
      }
    }, 50);
  } else {
    let sparkleCount = 0;
    const sparkleInterval = setInterval(function () {
      sparkleCount++;
      ctx.strokeStyle = "rgba(100, 200, 255, 0.6)";
      ctx.lineWidth = 3;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(gameGnar.x - 20 - i * 10, gameGnar.y + 20 + i * 20);
        ctx.lineTo(gameGnar.x - 5 - i * 10, gameGnar.y + 20 + i * 20);
        ctx.stroke();
      }
      if (sparkleCount >= 10) clearInterval(sparkleInterval);
    }, 100);
  }

  startCooldown("w", cooldown);
}

function castE() {
  if (!abilityCooldowns.e.ready) return;

  const stats = calculateTotalStats();
  const isMega = isMegaGnar();
  const abilityKey = isMega ? "megaE" : "miniE";
  const damage = calculateAbilityDamage(abilityKey, abilityLevels.e, stats.ad);
  const cooldown = parseFloat(
    calculateAbilityCooldown(
      gnarBaseStats.abilities[abilityKey].cooldown,
      stats.ah
    )
  );

  const originalX = gameGnar.x;
  const hopDistance =
    testDummy.x -
    gameGnar.x -
    gameGnar.width -
    CANVAS_CONFIG.HOP_DISTANCE_OFFSET;
  const hopDuration = isMega
    ? ANIMATION_CONFIG.HOP_DURATION_MEGA
    : ANIMATION_CONFIG.HOP_DURATION_MINI;
  const maxHeight = isMega
    ? ANIMATION_CONFIG.HOP_HEIGHT_MEGA
    : ANIMATION_CONFIG.HOP_HEIGHT_MINI;
  const startTime = Date.now();

  const hopAnimation = setInterval(function () {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / hopDuration, 1);

    if (progress >= 1) {
      clearInterval(hopAnimation);

      testDummy.hp = Math.max(0, testDummy.hp - damage);
      showDamage(damage);

      if (isMega) {
        let crackFrames = 0;
        const crackAnimation = setInterval(function () {
          crackFrames++;
          ctx.strokeStyle = `rgba(100, 100, 100, ${1 - crackFrames / 10})`;
          ctx.lineWidth = 3;

          for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            ctx.beginPath();
            ctx.moveTo(
              gameGnar.x + gameGnar.width / 2,
              gameGnar.y + gameGnar.height
            );
            ctx.lineTo(
              gameGnar.x + gameGnar.width / 2 + Math.cos(angle) * 60,
              gameGnar.y + gameGnar.height + Math.sin(angle) * 20
            );
            ctx.stroke();
          }

          if (crackFrames >= 10) clearInterval(crackAnimation);
        }, 50);
      }

      setTimeout(
        function () {
          const bounceStartTime = Date.now();
          const bounceAnimation = setInterval(function () {
            const bounceElapsed = Date.now() - bounceStartTime;
            const bounceProgress = Math.min(
              bounceElapsed / ANIMATION_CONFIG.BOUNCE_DURATION,
              1
            );

            if (bounceProgress >= 1) {
              gameGnar.x = originalX;
              clearInterval(bounceAnimation);
            } else {
              const easeProgress = 1 - Math.pow(1 - bounceProgress, 3);
              gameGnar.x = gameGnar.x - (hopDistance * easeProgress) / 30;
            }
          }, ANIMATION_CONFIG.PROJECTILE_FRAME_RATE);
        },
        isMega ? 300 : 200
      );
    } else {
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      gameGnar.x = originalX + hopDistance * easeProgress;
      const arcProgress = Math.sin(progress * Math.PI);
      gameGnar.y =
        elements.canvas.height -
        CANVAS_CONFIG.GNAR_Y_OFFSET -
        maxHeight * arcProgress;
    }
  }, ANIMATION_CONFIG.PROJECTILE_FRAME_RATE);

  startCooldown("e", cooldown);
}

function castR() {
  if (!abilityCooldowns.r.ready) return;
  if (!isMegaGnar()) return; // R only works in Mega form

  const stats = calculateTotalStats();

  // GNAR!!! pushes enemies back
  const pushDistance = 150;
  const originalDummyX = testDummy.x;
  const pushDuration = 500;
  const startTime = Date.now();

  // Create shockwave effect
  let shockwaveRadius = 0;
  const maxShockwaveRadius = 200;

  const shockwaveAnimation = setInterval(function () {
    shockwaveRadius += 20;

    ctx.save();
    ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
    ctx.strokeStyle = "rgba(255, 100, 0, 0.9)";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(
      gameGnar.x + gameGnar.width / 2,
      gameGnar.y + gameGnar.height / 2,
      shockwaveRadius,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    if (shockwaveRadius >= maxShockwaveRadius) {
      clearInterval(shockwaveAnimation);
    }
  }, 30);

  // Push dummy animation
  const pushAnimation = setInterval(function () {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / pushDuration, 1);

    if (progress >= 1) {
      clearInterval(pushAnimation);

      // Bounce back
      setTimeout(function () {
        const bounceStartTime = Date.now();
        const bounceDuration = 400;

        const bounceAnimation = setInterval(function () {
          const bounceElapsed = Date.now() - bounceStartTime;
          const bounceProgress = Math.min(bounceElapsed / bounceDuration, 1);

          if (bounceProgress >= 1) {
            testDummy.x = originalDummyX;
            clearInterval(bounceAnimation);
          } else {
            const easeProgress = 1 - Math.pow(1 - bounceProgress, 2);
            testDummy.x = testDummy.x - (pushDistance * easeProgress) / 20;
          }
        }, 16);
      }, 200);
    } else {
      const easeProgress = Math.pow(progress, 2);
      testDummy.x = originalDummyX + pushDistance * easeProgress;
    }
  }, 16);

  startCooldown("r", 90); // 90 second cooldown for ult
}

function startCooldown(ability, duration) {
  abilityCooldowns[ability].ready = false;
  abilityCooldowns[ability].timeLeft = duration;

  const abilityDiv = document.querySelector("." + ability);
  const cooldownOverlay = document.createElement("div");
  cooldownOverlay.className = "ability-cooldown";
  cooldownOverlay.textContent = duration.toFixed(1);
  abilityDiv.appendChild(cooldownOverlay);

  const interval = setInterval(function () {
    abilityCooldowns[ability].timeLeft -= 0.1;
    cooldownOverlay.textContent = abilityCooldowns[ability].timeLeft.toFixed(1);

    if (abilityCooldowns[ability].timeLeft <= 0) {
      abilityCooldowns[ability].ready = true;
      cooldownOverlay.remove();
      clearInterval(interval);
    }
  }, ANIMATION_CONFIG.COOLDOWN_UPDATE_INTERVAL);
}

// ============================================
// GAME LOOP
// ============================================
function gameLoop() {
  ctx.clearRect(0, 0, elements.canvas.width, elements.canvas.height);

  gameGnar.y = elements.canvas.height - CANVAS_CONFIG.GNAR_Y_OFFSET;
  testDummy.x = elements.canvas.width - CANVAS_CONFIG.DUMMY_X_OFFSET;
  testDummy.y = elements.canvas.height - CANVAS_CONFIG.DUMMY_Y_OFFSET;

  ctx.strokeStyle = "#555";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, elements.canvas.height - CANVAS_CONFIG.GROUND_Y_OFFSET);
  ctx.lineTo(
    elements.canvas.width,
    elements.canvas.height - CANVAS_CONFIG.GROUND_Y_OFFSET
  );
  ctx.stroke();

  ctx.save();
  if (!gameGnar.facingRight) {
    ctx.scale(-1, 1);
    ctx.drawImage(
      gnarImage,
      -gameGnar.x - gameGnar.width,
      gameGnar.y,
      gameGnar.width,
      gameGnar.height
    );
  } else {
    ctx.drawImage(
      gnarImage,
      gameGnar.x,
      gameGnar.y,
      gameGnar.width,
      gameGnar.height
    );
  }
  ctx.restore();

  ctx.fillStyle = "white";
  ctx.font = "bold 14px Arial";
  ctx.textAlign = "center";
  ctx.fillText(
    "Gnar",
    gameGnar.x + gameGnar.width / 2,
    gameGnar.y + gameGnar.height + 20
  );

  ctx.drawImage(
    dummyImage,
    testDummy.x,
    testDummy.y,
    testDummy.width,
    testDummy.height
  );
  ctx.fillText(
    "Test Dummy",
    testDummy.x + testDummy.width / 2,
    testDummy.y + testDummy.height + 20
  );

  const hpBarWidth = 100;
  const hpBarHeight = 12;
  const hpBarX = testDummy.x + (testDummy.width - hpBarWidth) / 2;
  const hpBarY = testDummy.y - 25;

  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(hpBarX - 2, hpBarY - 2, hpBarWidth + 4, hpBarHeight + 4);
  ctx.fillStyle = "#8B0000";
  ctx.fillRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);
  ctx.fillStyle = "#00FF00";
  const hpPercent = testDummy.hp / testDummy.maxHp;
  ctx.fillRect(hpBarX, hpBarY, hpBarWidth * hpPercent, hpBarHeight);

  ctx.fillStyle = "white";
  ctx.font = "bold 10px Arial";
  ctx.fillText(
    Math.round(testDummy.hp) + "/" + testDummy.maxHp,
    hpBarX + hpBarWidth / 2,
    hpBarY + 9
  );

  for (let i = projectiles.length - 1; i >= 0; i--) {
    const proj = projectiles[i];
    proj.x += proj.speedX;
    proj.y += proj.speedY;

    ctx.shadowBlur = 15;
    ctx.shadowColor = proj.color;
    ctx.fillStyle = proj.color;
    ctx.beginPath();
    ctx.arc(proj.x, proj.y, proj.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = proj.color + "80";
    ctx.beginPath();
    ctx.arc(proj.x - proj.speedX * 2, proj.y, proj.size * 0.7, 0, Math.PI * 2);
    ctx.fill();

    if (
      proj.x + proj.size > testDummy.x &&
      proj.x - proj.size < testDummy.x + testDummy.width &&
      proj.y + proj.size > testDummy.y &&
      proj.y - proj.size < testDummy.y + testDummy.height
    ) {
      testDummy.hp = Math.max(0, testDummy.hp - proj.damage);
      showDamage(proj.damage);

      for (let p = 0; p < 8; p++) {
        const angle = (Math.PI * 2 * p) / 8;
        ctx.fillStyle = proj.color + "60";
        ctx.beginPath();
        ctx.arc(
          proj.x + Math.cos(angle) * 20,
          proj.y + Math.sin(angle) * 20,
          5,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      projectiles.splice(i, 1);
    } else if (proj.x > elements.canvas.width + 50 || proj.x < -50) {
      projectiles.splice(i, 1);
    }
  }

  for (let i = damageNumbers.length - 1; i >= 0; i--) {
    const dmg = damageNumbers[i];
    dmg.y -= ANIMATION_CONFIG.DAMAGE_NUMBER_RISE_SPEED;
    dmg.opacity -= ANIMATION_CONFIG.DAMAGE_NUMBER_FADE_RATE;

    ctx.font = "bold 32px Arial";
    ctx.textAlign = "center";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 4;
    ctx.strokeText(dmg.value, dmg.x, dmg.y);
    ctx.fillStyle = `rgba(255, 68, 68, ${dmg.opacity})`;
    ctx.fillText(dmg.value, dmg.x, dmg.y);

    if (dmg.opacity <= 0) {
      damageNumbers.splice(i, 1);
    }
  }

  requestAnimationFrame(gameLoop);
}

// ============================================
// KEYBOARD & TOUCH CONTROLS
// ============================================
document.addEventListener("keydown", function (e) {
  const key = e.key.toLowerCase();

  if (key === "q") castQ();
  if (key === "w") castW();
  if (key === "e") castE();
  if (key === "r") castR();
  if (key === " ") {
    // Spacebar resets dummy
    e.preventDefault(); // Prevent page scroll
    testDummy.hp = testDummy.maxHp;
  }
});

// Add click/tap support for abilities
document.querySelector(".q").addEventListener("click", castQ);
document.querySelector(".w").addEventListener("click", castW);
document.querySelector(".e").addEventListener("click", castE);
document.querySelector(".r").addEventListener("click", castR);

// Add touch support for mobile (prevents double-firing)
["q", "w", "e", "r"].forEach((ability) => {
  const element = document.querySelector("." + ability);
  element.addEventListener("touchend", function (e) {
    e.preventDefault();
    if (ability === "q") castQ();
    if (ability === "w") castW();
    if (ability === "e") castE();
    if (ability === "r") castR();
  });
});

// Add click/tap support for abilities
document.querySelector(".q").addEventListener("click", castQ);
document.querySelector(".w").addEventListener("click", castW);
document.querySelector(".e").addEventListener("click", castE);

// Add touch support for mobile (prevents double-firing)
["q", "w", "e"].forEach((ability) => {
  const element = document.querySelector("." + ability);
  element.addEventListener("touchend", function (e) {
    e.preventDefault();
    if (ability === "q") castQ();
    if (ability === "w") castW();
    if (ability === "e") castE();
  });
});
// ============================================
// INITIALIZATION
// ============================================
gnarImage.onload = function () {
  imagesLoaded++;
  if (imagesLoaded === 2) {
    gameLoop();
    updateStats();
  }
};

dummyImage.onload = function () {
  imagesLoaded++;
  if (imagesLoaded === 2) {
    gameLoop();
    updateStats();
  }
};

gnarImage.src = "images/gnar-norm.png";
dummyImage.src = "images/test-dummy.png";
